export interface Goof<T = unknown> extends Error {
  message: string;
  type: string;
  data?: T;
  name: string;
}
export interface NetworkGoof extends Goof {
  datadogId: string | null;
  statusCode: number;
  name: string;
}

export interface ProxyResponse extends Response {
  error?: string;
}
export interface ProxyGoof extends Goof {
  datadogId: string;
  response: ProxyResponse;
  statusCode: number;
}
