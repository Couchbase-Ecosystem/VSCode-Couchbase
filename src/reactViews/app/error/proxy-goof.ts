import { createGoof } from 'error/goof';
import { ProxyGoof, ProxyResponse } from './goof.interfaces';

const GOOF_TYPE = 'ProxyGoof';

type Options = {
  datadogId?: string | null;
  statusCode: number;
  response: ProxyResponse;
};

export const createProxyGoof = ({ response, datadogId, statusCode }: Options): ProxyGoof => {
  let error = 'Error making network request.';

  // Sometimes we have an error message from the server in this structure:
  // response.error: rest_create_index: error creating index: newIndex, err: manager_api: cannot create index because an index with the same name already exists: newIndex
  if (response.error) {
    const groups = response.error.match(/.*err: manager_api:(.*)$/);
    if (groups) {
      const [, errorFromGroups] = groups;
      error = errorFromGroups;
    }
  }

  const defaultGoof = createGoof({ type: GOOF_TYPE, message: error });

  return {
    ...defaultGoof,
    datadogId: datadogId ?? '',
    name: GOOF_TYPE,
    response,
    statusCode,
  };
};
