import { AxiosError } from 'axios';
import { createNetworkGoof } from 'error/network-goof';
import { createProxyGoof } from 'error/proxy-goof';
import { debugLog, errorLog } from 'utils/debug';
import { Goof } from './goof.interfaces';

const DEFAULT_MESSAGE = 'An unknown network error occurred';
export const PARSE_FAIL_MESSAGE = 'Unable to parse error as a goof';
export const DEFAULT_ERROR_TYPE = 'UNKNOWN_ERROR';
const DATADOG_HEADER = 'vnd-cloud-couchbase-com-request-id';

type InternalNetworkGoof = {
  message: string;
  errorType: string;
};

const isRecord = (data: unknown): data is Record<string, unknown> => {
  return typeof data === 'object';
};

const isNetworkGoof = (data: unknown): data is InternalNetworkGoof => {
  if (!isRecord(data)) {
    return false;
  }

  if (typeof data.message !== 'string') {
    return false;
  }

  if (typeof data.errorType !== 'string') {
    return false;
  }

  return true;
};

export const parseNetworkGoof = async (error: AxiosError): Promise<Goof> => {
  debugLog('/error/parseNetworkGoof firing', error);

  // if we have a 401 error from an endpoint other than the proxy
  // without a body, handle it before we try and decode JSON
  if (
    error.response?.status === 401 &&
    !error.request.bodyUsed &&
    !error.request.responseURL.includes('/proxy/') &&
    !error.request.responseURL.includes('/sessions')
  ) {
    debugLog('/error/parseNetworkGoof handling 401 unauthorized without response body', error);
    const err = createNetworkGoof({
      message: 'Unauthorized',
      errorType: 'Unauthorized',
      statusCode: 401,
    });
    return err;
  }

  try {
    // 404 errors occur if the user asks for a non-existent document. With 404, response.json is empty.
    const result = error.response?.data;

    if (result && isNetworkGoof(result)) {
      debugLog('/error/parseNetworkGoof parsed NetworkGoof', error);

      return createNetworkGoof({
        message: result.message,
        datadogId: error.response?.headers[DATADOG_HEADER],
        errorType: result.errorType,
        statusCode: error.response?.status!,
      });
    }
    if (error.request.responseURL.includes('/proxy/')) {
      debugLog('/error/parseNetworkGoof parsed ProxyGoof', error);

      return createProxyGoof({
        response: result ?? (error.response?.data as any),
        statusCode: error.status!,
        datadogId: error.response?.headers[DATADOG_HEADER],
      });
    }

    debugLog('/error/parseNetworkGoof unable to parse response as a goof', error);

    return createNetworkGoof({
      message: PARSE_FAIL_MESSAGE,
      datadogId: error.response?.headers[DATADOG_HEADER],
      errorType: DEFAULT_ERROR_TYPE,
      statusCode: error.status!,
    });
  } catch (err) {
    errorLog('/error/parseNetworkGoof try/catch caught error handling goof; logging response, error, and requestId', error, err);

    return createNetworkGoof({
      message: DEFAULT_MESSAGE,
      datadogId: error.response?.headers[DATADOG_HEADER],
      errorType: DEFAULT_ERROR_TYPE,
      statusCode: error.status!,
    });
  }
};
