/* eslint-disable no-param-reassign */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Goof } from 'error/goof.interfaces';
import { parseNetworkGoof } from 'error/parse-network-goof';
import { debugLog } from 'utils/debug';
import { isProductionEnvironment } from 'utils/env';

type ErrorHandler = (goof: Goof) => void;
type ErrorHandlers = Record<number, ErrorHandler>;
type RequestConfig = Omit<AxiosRequestConfig, 'method' | 'url'>;

const errorHandlers: ErrorHandlers = {
  500: () => {
    if (isProductionEnvironment()) {
      // @TODO: capture sentry exception
      // captureException(goof)
    }
  },
};
const httpClient = axios.create({
  baseURL: process.env.CP_API_URL,
  maxRedirects: 0,
});

function handleError(error: AxiosError) {
  return parseNetworkGoof(error).then((goof: Goof) => {
    let errorHandler: ErrorHandler | null = null;

    if (error.response?.status) {
      errorHandler = errorHandlers[error.response.status];
    }

    debugLog(`/sync/Request.handleError() handling ${error.status} response`);

    if (errorHandler) {
      errorHandler(goof);
    }

    throw goof;
  });
}

function request<T>(config: AxiosRequestConfig) {
  return httpClient
    .request<T>(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return handleError(error);
    });
}

export function setBaseUrl(baseUrl: string) {
  httpClient.defaults.baseURL = baseUrl;
}

export function setAuthToken(authToken: string | null) {
  httpClient.defaults.headers.common.Authorization = authToken;
}

export function addErrorHandler(statusCode: number, errHandlerFunc: ErrorHandler) {
  debugLog(`/sync/Request.addHandler() Adding handler for status code '${statusCode}'`);
  Object.assign(errorHandlers, { statusCode: errHandlerFunc });
}

export function getRequest<T>(url: string, config?: RequestConfig) {
  return request<T>({ method: 'GET', url, ...config });
}

export function putRequest<T>(url: string, config?: RequestConfig) {
  return request<T>({ method: 'PUT', url, ...config });
}

export function postRequest<T>(url: string, config?: RequestConfig) {
  return request<T>({ method: 'POST', url, ...config });
}

export function patchRequest<T>(url: string, config?: RequestConfig) {
  return request<T>({ method: 'PATCH', url, ...config });
}

export function deleteRequest<T>(url: string, config?: RequestConfig) {
  return request<T>({ method: 'DELETE', url, ...config });
}
