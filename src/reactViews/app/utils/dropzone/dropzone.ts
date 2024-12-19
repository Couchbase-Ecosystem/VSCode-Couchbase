import type { FileWithPath, HTMLInputEvent } from 'components/inputs/dropzone/dropzone.types';

function accepts(file: File, acceptedFiles: string[] | string) {
  const acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');
  const mimeType = (file.type || '').toLowerCase();
  const baseMimeType = mimeType.replace(/\/.*$/, '');

  return acceptedFilesArray.some((type: string) => {
    const validType = type.trim().toLowerCase();
    if (validType.endsWith('/*')) {
      // This is something like a image/* mime type
      return baseMimeType === validType.replace(/\/.*$/, '');
    }
    return mimeType === validType;
  });
}

// Error codes
const FILE_INVALID_TYPE = 'file-invalid-type';
const FILE_TOO_LARGE = 'file-too-large';
const FILE_TOO_SMALL = 'file-too-small';
const TOO_MANY_FILES = 'too-many-files';

// File Errors
const getInvalidTypeRejectionErr = (accept: string | string[]) => {
  const modifiedAccept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
  const messageSuffix = Array.isArray(modifiedAccept) ? `one of ${modifiedAccept.join(', ')}` : modifiedAccept;
  return {
    code: FILE_INVALID_TYPE,
    message: `File type must be ${messageSuffix}`,
  };
};

const getTooLargeRejectionErr = (maxSize: number) => {
  return {
    code: FILE_TOO_LARGE,
    message: `File is larger than ${maxSize} bytes`,
  };
};

const getTooSmallRejectionErr = (minSize: number) => {
  return {
    code: FILE_TOO_SMALL,
    message: `File is smaller than ${minSize} bytes`,
  };
};

export const TOO_MANY_FILES_REJECTION = {
  code: TOO_MANY_FILES,
  message: 'Too many files',
};

// Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
// that MIME type will always be accepted
export function fileAccepted(file: FileWithPath, accept: string | string[]) {
  const isAcceptable = file.type === 'application/x-moz-file' || accepts(file, accept);
  const error = isAcceptable ? null : getInvalidTypeRejectionErr(accept);
  return [isAcceptable, error];
}

export function fileMatchSize({ size: fileSize }: FileWithPath, minSize: number, maxSize: number) {
  if (fileSize) {
    if (fileSize > maxSize) {
      return [false, getTooLargeRejectionErr(maxSize)];
    }
    if (fileSize < minSize) {
      return [false, getTooSmallRejectionErr(minSize)];
    }
  }
  return [true, null];
}

export function isEvtWithFiles(event: HTMLInputEvent) {
  if (!event.dataTransfer) {
    return !!event.target && !!event.target.files;
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
  return Array.prototype.some.call(event.dataTransfer.types, (type) => type === 'Files' || type === 'application/x-moz-file');
}

export function isEdge(userAgent = window.navigator.userAgent) {
  return userAgent.indexOf('Edge/') !== -1;
}
