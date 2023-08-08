import { useId } from 'react';
import { clsx } from 'clsx';
import { Icon } from 'components/icon';
import type { FileRejectionsType, FileWithPath, HTMLInputEvent } from 'components/inputs/dropzone/dropzone.types';
import { useDragAndDrop } from 'hooks/use-drag-and-drop/use-drag-and-drop';

type DropzoneProps = {
  accept: string | string[];
  disabled?: boolean;
  maxSize?: number;
  minSize?: number;
  multiple?: boolean;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  noKeyboard?: boolean;
  noDrag?: boolean;
  name?: string;
  bigCloudIcon?: boolean;
  className?: string;
  onDragEnter?: (event: HTMLInputEvent) => void;
  onDragOver?: (event: HTMLInputEvent) => void;
  onDragLeave?: (event: HTMLInputEvent) => void;
  onDrop?: (acceptedFiles: FileWithPath[], rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
  onDropAccepted?: (acceptedFiles: FileWithPath[], event: HTMLInputEvent) => void;
  onDropRejected?: (rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
  onFileDialogCancel?: () => void;
};

export function Dropzone({
  accept,
  disabled = false,
  maxSize = Infinity,
  minSize = 0,
  multiple = false,
  preventDropOnDocument = true,
  noClick = false,
  noKeyboard = false,
  noDrag = false,
  name = '',
  bigCloudIcon = false,
  className,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onDropAccepted,
  onDropRejected,
  onFileDialogCancel,
}: DropzoneProps) {
  const {
    isDraggedOver,
    rootRef,
    inputRef,
    onKeyDown,
    onClick,
    handleOnDragEnter,
    handleOnDragOver,
    handleOnDragLeave,
    handleOnDrop,
    composeHandler,
    composeDragHandler,
    composeKeyboardHandler,
  } = useDragAndDrop({
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    disabled,
    maxSize,
    minSize,
    noKeyboard,
    noDrag,
    preventDropOnDocument,
    noClick,
    multiple,
    accept,
  });

  const id = useId();

  return (
    <div
      role="button"
      ref={rootRef}
      tabIndex={0}
      className={clsx(
        'flex flex-col items-center rounded-md border px-6 pt-9 pb-7 text-on-background',
        isDraggedOver ? 'border-primary bg-information' : 'border-on-background-decoration',
        { 'cursor-default': noClick },
        className
      )}
      onKeyDown={composeKeyboardHandler(onKeyDown)}
      onClick={composeHandler(onClick)}
      onDragEnter={composeDragHandler(handleOnDragEnter)}
      onDragOver={composeDragHandler(handleOnDragOver)}
      onDragLeave={composeDragHandler(handleOnDragLeave)}
      onDrop={composeDragHandler(handleOnDrop)}
    >
      <div className="text-base">
        <label
          htmlFor={`file-upload-input-${id}`}
          className={clsx(
            'relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover',
            { 'bg-information': isDraggedOver }
          )}
        >
          <div className="flex fill-primary justify-center">
            {bigCloudIcon ? <Icon size="big-cloud-dropzone" name="cloud-arrow-up" /> : <Icon size="xxxlarge" name="upload" />}
          </div>
          <input
            id={noClick ? `file-upload-input-${id}` : ''}
            accept={typeof accept === 'string' ? accept : accept.join(',')}
            multiple={multiple}
            type="file"
            name={name}
            autoComplete="off"
            tabIndex={-1}
            onChange={handleOnDrop}
            ref={inputRef}
            className="hidden"
          />
          <span>Choose a file</span>
        </label>
        <span className="pl-1 text-base">or drag and drop to select a file.</span>
      </div>
    </div>
  );
}
