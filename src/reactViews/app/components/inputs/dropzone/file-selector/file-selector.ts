import type { FileArray, FileValue, FileWithPath } from 'components/inputs/dropzone/dropzone.types';
import { addPathToFile } from 'components/inputs/dropzone/file-selector/file';

const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  '.DS_Store', // macOs
  'Thumbs.db', // Windows
];

/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
 *
 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle objects can also be passed as an arg
 * and a list of File objects will be returned.
 *
 * @param event
 */
function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null;
}

function isDataTransfer(value: unknown): value is DataTransfer {
  return isObject(value);
}

function isChangeEvent(value: unknown): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}

function getInputFiles({ target }: Event) {
  return Array.from((target as HTMLInputElement).files ?? []).map((file) => addPathToFile(file));
}

function noIgnoredFiles(files: FileWithPath[]) {
  return files.filter((file) => FILES_TO_IGNORE.indexOf(file.name) === -1);
}

function fromDataTransferItem(item: DataTransferItem) {
  const file = item.getAsFile();
  if (!file) {
    return Promise.reject(new Error(`${item} is not a File`));
  }
  const fileWithPath = addPathToFile(file);
  return Promise.resolve(fileWithPath);
}

function readEntries(
  entries: Promise<FileValue[]>[],
  reader: FileSystemDirectoryReader,
  resolve: (value: FileArray[] | PromiseLike<FileArray[]>) => void,
  reject: (reason?: any) => void
) {
  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
  reader.readEntries(
    async (batch: FileSystemEntry[]) => {
      if (!batch.length) {
        // Done reading directory
        try {
          const files = await Promise.all(entries);
          resolve(files);
        } catch (error) {
          reject(error);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const items = Promise.all(batch.map(fromEntry));
        entries.push(items);

        // Continue reading
        readEntries(entries, reader, resolve, reject);
      }
    },
    (error) => {
      reject(error);
    }
  );
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
function fromDirEntry(entry: FileSystemDirectoryEntry) {
  const reader = entry.createReader();
  return new Promise<FileArray[]>((resolve, reject) => {
    const entries: Promise<FileValue[]>[] = [];
    readEntries(entries, reader, resolve, reject);
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
async function fromFileEntry(entry: FileSystemFileEntry) {
  return new Promise<FileWithPath>((resolve, reject) => {
    entry.file(
      (file: FileWithPath) => {
        const fileWithPath = addPathToFile(file, entry.fullPath);
        resolve(fileWithPath);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
async function fromEntry(entry: FileSystemEntry) {
  return entry.isDirectory ? fromDirEntry(entry as FileSystemDirectoryEntry) : fromFileEntry(entry as FileSystemFileEntry);
}

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
function toFilePromises(item: DataTransferItem) {
  if (typeof item.webkitGetAsEntry !== 'function') {
    return fromDataTransferItem(item);
  }

  const entry = item.webkitGetAsEntry();

  // Safari supports dropping an image node from a different window and can be retrieved using
  // the DataTransferItem.getAsFile() API
  // NOTE: FileSystemEntry.file() throws if trying to get the file
  if (entry && entry.isDirectory) {
    return fromEntry(entry);
  }

  return fromDataTransferItem(item);
}

function flatten(items: FileValue[]): FileWithPath[] {
  return items.reduce((acc: FileWithPath[], files: FileValue) => {
    if (Array.isArray(files)) {
      return [...acc, ...flatten(files as FileValue[])];
    }
    return [...acc, files as FileWithPath];
  }, []);
}

// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
async function getFsHandleFiles(handles: FileSystemFileHandle[]) {
  const files = await Promise.all(handles.map((handle) => handle.getFile()));
  return files.map((file) => addPathToFile(file));
}

async function getDataTransferFiles(dataTransfer: DataTransfer) {
  if (dataTransfer.items) {
    const items = Array.from(dataTransfer.items).filter((item) => item.kind === 'file');
    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
    // only 'dragstart' and 'drop' has access to the data (source node)

    const files = await Promise.all(items.map(toFilePromises));
    return noIgnoredFiles(flatten(files));
  }

  return noIgnoredFiles(Array.from(dataTransfer.files).map((file) => addPathToFile(file)));
}

export async function getFilesFromEvent(event: Event | FileSystemFileHandle[]): Promise<FileWithPath[]> {
  if (isObject<DragEvent>(event) && isDataTransfer(event.dataTransfer)) {
    return getDataTransferFiles(event.dataTransfer);
  }
  if (isChangeEvent(event)) {
    return getInputFiles(event);
  }
  if (Array.isArray(event) && event.every((item) => 'getFile' in item && typeof item.getFile === 'function')) {
    return getFsHandleFiles(event);
  }
  return [];
}

// Infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
