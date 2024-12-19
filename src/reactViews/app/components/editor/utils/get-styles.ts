import { SupportedThemes } from 'components/editor/editor.types';

export const getPlayButtonStyles = (theme: SupportedThemes) => {
  const baseClass = 'flex rounded-full fill-on-success-decoration p-0.5 hover:fill-primary active:fill-on-success-decoration';
  switch (theme) {
    case 'vs-light': {
      return `${baseClass} bg-background active:bg-on-background-decoration`;
    }
    default: {
      return `${baseClass} text-on-background-alternate active:bg-on-background-alternate`;
    }
  }
};

export const getEditorStyles = (theme: SupportedThemes) => {
  const baseClass = 'flex h-full w-full flex-col rounded border pb-2.5 pt-3.5';
  switch (theme) {
    case 'vs-light': {
      return {
        className: `${baseClass} border-on-background-decoration bg-background`,
        style: { backgroundColor: '#fffffe' },
      };
    }
    default: {
      return {
        className: `${baseClass} border-on-background bg-on-background`,
        style: { borderColor: '#1e1e1e1e', backgroundColor: '#1e1e1e' },
      };
    }
  }
};
