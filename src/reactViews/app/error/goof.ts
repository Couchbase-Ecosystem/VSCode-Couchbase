import { Goof } from './goof.interfaces';

type Options = {
  message: string;
  type: string;
  data?: unknown;
  name?: string;
};

export function createGoof({ message, type, data }: Options): Goof {
  return {
    message,
    type,
    data,
    name: 'Goof',
  };
}
