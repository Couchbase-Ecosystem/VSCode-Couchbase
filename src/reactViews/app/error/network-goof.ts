import { createGoof } from 'error/goof';
import { NetworkGoof } from './goof.interfaces';

const GOOF_TYPE = 'NetworkGoof';

type Options = {
  message: string;
  datadogId?: string | null;
  errorType: string;
  statusCode: number;
};

export const createNetworkGoof = ({ message, errorType, statusCode, datadogId = '' }: Options): NetworkGoof => {
  const defaultGoof = createGoof({ type: GOOF_TYPE, message, data: { errorType } });
  return {
    ...defaultGoof,
    datadogId,
    name: GOOF_TYPE,
    statusCode,
  };
};
