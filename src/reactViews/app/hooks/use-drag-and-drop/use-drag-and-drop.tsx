import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileRejectionsType, FileWithPath, HTMLInputEvent } from 'components/inputs/dropzone/dropzone.types';
import { getFilesFromEvent } from 'components/inputs/dropzone/file-selector/file-selector';
import { fileAccepted, fileMatchSize, isEdge, isEvtWithFiles, TOO_MANY_FILES_REJECTION } from 'utils/dropzone/dropzone';

export type UseDragAndDropProps = {
  onDragEnter?: (event: HTMLInputEvent) => void;
  onDragOver?: (event: HTMLInputEvent) => void;
  onDragLeave?: (event: HTMLInputEvent) => void;
  onDrop?: (acceptedFiles: FileWithPath[], rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
  onDropAccepted?: (acceptedFiles: FileWithPath[], event: HTMLInputEvent) => void;
  onDropRejected?: (rejectedFiles: FileRejectionsType, event: HTMLInputEvent) => void;
  onFileDialogCancel?: () => void;
  disabled?: boolean;
  maxSize?: number;
  minSize?: number;
  noKeyboard?: boolean;
  noDrag?: boolean;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  multiple?: boolean;
  accept: string | string[];
};

const ON_WINDOW_FOCUS_THRESHOLD = 300;

export const useDragAndDrop = ({
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onDropAccepted,
  onDropRejected,
  onFileDialogCancel,
  disabled = false,
  maxSize = Infinity,
  minSize = 0,
  multiple = true,
  preventDropOnDocument = true,
  noClick = false,
  noKeyboard = false,
  noDrag = false,
  accept,
}: UseDragAndDropProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileDialogActiveRef = useRef(false);
  const windowFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragTargetsRef = useRef<(EventTarget & HTMLInputElement)[]>([]);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  function resetState() {
    fileDialogActiveRef.current = false;
    dragTargetsRef.current = [];
  }

  // callback for opening the file dialog programmatically
  function openFileDialog() {
    fileDialogActiveRef.current = true;
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  // Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
  function onKeyDown(originalEvent: React.KeyboardEvent<HTMLDivElement>) {
    const { nativeEvent: event } = originalEvent;
    // Ignore keyboard events bubbling up the DOM tree
    if (!rootRef.current || !rootRef.current.isEqualNode(event.target as Node)) {
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      openFileDialog();
    }
  }

  // Cb to open the file dialog when click occurs on the dropzone
  function onClick() {
    if (noClick) {
      return;
    }
    // In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
    // to ensure React can handle state changes
    // See: https://github.com/react-dropzone/react-dropzone/issues/450
    if (isEdge()) {
      setTimeout(openFileDialog, 0);
    } else {
      openFileDialog();
    }
  }

  function handleOnDragEnter(originalEvent: React.DragEvent<HTMLDivElement>) {
    const event = originalEvent as unknown as HTMLInputEvent;
    event.preventDefault();
    setIsDraggedOver(true);

    dragTargetsRef.current = [...dragTargetsRef.current, event.target];

    if (isEvtWithFiles(event) && onDragEnter) {
      Promise.resolve(getFilesFromEvent(event)).then(() => {
        onDragEnter(event);
      });
    }
  }

  function handleOnDragOver(originalEvent: React.DragEvent<HTMLDivElement>) {
    const event = originalEvent as unknown as HTMLInputEvent;

    event.preventDefault();
    setIsDraggedOver(true);

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }

    if (isEvtWithFiles(event) && onDragOver) {
      onDragOver(event);
    }
  }

  function handleOnDragLeave(originalEvent: React.DragEvent<HTMLDivElement>) {
    const event = originalEvent as unknown as HTMLInputEvent;
    event.preventDefault();
    setIsDraggedOver(false);

    // Only deactivate once the dropzone and all children have been left
    const targets = dragTargetsRef.current.filter((target) => rootRef.current && rootRef.current.contains(target));
    // Make sure to remove a target present multiple times only once
    // (Firefox may fire dragenter/dragleave multiple times on the same element)
    const targetIdx = targets.indexOf(event.target);
    if (targetIdx !== -1) {
      targets.splice(targetIdx, 1);
    }
    dragTargetsRef.current = targets;
    if (targets.length > 0) {
      return;
    }

    if (isEvtWithFiles(event) && onDragLeave) {
      onDragLeave(event);
    }
  }

  function handleOnDrop<T>(originalEvent: React.DragEvent<T> | React.ChangeEvent<T>) {
    const event = originalEvent.nativeEvent as HTMLInputEvent;
    event.preventDefault();
    setIsDraggedOver(false);

    dragTargetsRef.current = [];

    if (isEvtWithFiles(event)) {
      Promise.resolve(getFilesFromEvent(event)).then((files) => {
        const acceptedFiles: FileWithPath[] = [];
        const fileRejections: FileRejectionsType = [];

        if (onDrop && disabled) {
          acceptedFiles.forEach((file) => {
            fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
          });
          return;
        }

        files.forEach((file) => {
          const [accepted, acceptError] = fileAccepted(file, accept);
          const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
          if (accepted && sizeMatch) {
            acceptedFiles.push(file);
          } else {
            const errors = [acceptError, sizeError].filter((error) => error);
            fileRejections.push({ file, errors });
          }
        });

        if (!multiple && acceptedFiles.length > 1) {
          // Reject everything and empty accepted files
          acceptedFiles.forEach((file) => {
            fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
          });
          acceptedFiles.splice(0);
        }
        if (onDrop) {
          onDrop(acceptedFiles, fileRejections, event);
        }

        if (fileRejections.length > 0 && onDropRejected) {
          onDropRejected(fileRejections, event);
        }

        if (acceptedFiles.length > 0 && onDropAccepted) {
          onDropAccepted(acceptedFiles, event);
        }
      });
    }
    resetState();
  }

  function composeHandler<T>(callback: T) {
    return disabled ? undefined : callback;
  }

  function composeKeyboardHandler(callback: (originalEvent: React.KeyboardEvent<HTMLDivElement>) => void) {
    return noKeyboard ? undefined : composeHandler(callback);
  }

  function composeDragHandler(callback: (event: React.DragEvent<HTMLDivElement>) => void) {
    return noDrag ? undefined : composeHandler(callback);
  }

  // allow the entire document to be a drag target
  const onDocumentDragOver = useCallback(
    (event: DragEvent) => {
      if (preventDropOnDocument) {
        event.preventDefault();
      }
    },
    [preventDropOnDocument]
  );

  const onDocumentDrop = useCallback(
    (event: DragEvent) => {
      if (
        !preventDropOnDocument &&
        rootRef.current &&
        event.target &&
        rootRef.current.contains((event as unknown as HTMLInputEvent).target)
      ) {
        // If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
        return;
      }
      event.preventDefault();
      dragTargetsRef.current = [];
    },
    [preventDropOnDocument]
  );

  // Update file dialog active state when the window is focused on
  const onWindowFocus = useCallback(() => {
    // Execute the timeout only if the file dialog is opened in the browser
    if (fileDialogActiveRef.current) {
      windowFocusTimeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          const { files } = inputRef.current;

          if (onFileDialogCancel && !files?.length) {
            fileDialogActiveRef.current = false;
            onFileDialogCancel();
          }
        }
      }, ON_WINDOW_FOCUS_THRESHOLD);
    }
  }, [fileDialogActiveRef, onFileDialogCancel]);

  useEffect(() => {
    window.addEventListener('focus', onWindowFocus);

    return () => {
      if (windowFocusTimeoutRef.current) {
        clearTimeout(windowFocusTimeoutRef.current);
      }
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [onWindowFocus]);

  useEffect(() => {
    window.addEventListener('dragover', onDocumentDragOver);

    return () => {
      window.removeEventListener('dragover', onDocumentDragOver);
    };
  }, [onDocumentDragOver]);

  useEffect(() => {
    window.addEventListener('drop', onDocumentDrop);

    return () => {
      window.removeEventListener('drop', onDocumentDrop);
    };
  }, [onDocumentDrop]);

  return {
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
  };
};
