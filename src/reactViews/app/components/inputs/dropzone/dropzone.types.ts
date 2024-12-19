export interface FileWithPath extends File {
  readonly path?: string;
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
  dataTransfer?: {
    types: unknown;
    dropEffect: string;
  };
  isPropagationStopped?: Function;
  keyCode?: number;
}

export type FileRejectionsType = {
  file: FileWithPath | DataTransferItem | File;
  errors: (
    | boolean
    | {
        code: string;
        message: string;
      }
    | null
  )[];
}[];

export type FileArray = Array<FileValue>;
export type FileValue = FileWithPath | FileArray[];
