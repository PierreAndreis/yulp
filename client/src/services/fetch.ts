import { QueryFunctionContext } from 'react-query';
import { useTokenStorage } from './Auth';

export default async function authorizedRequest(url: string, opts: RequestInit = {}) {
  const sessionToken = useTokenStorage.getState().token;
  const patchedOpts = {
    ...opts,
    headers: {
      Authorization: typeof sessionToken === 'string' ? `Bearer ${sessionToken}` : '',
      'Content-Type': opts.body ? 'application/json' : 'text/html',
      ...(opts.headers || {}),
    },
  };

  return fetch(url, patchedOpts);
}

export type ErrorMessage = {
  error: string;
  message: string;
  statusCode: string;
};

// Typeguard to check if response is error
export function isError<T>(response: T | ErrorMessage): response is ErrorMessage {
  return typeof (response as ErrorMessage).error !== 'undefined';
}

export const parse = async (response: Response) => {
  const body = await response.json();

  if (response.status === 401) {
    useTokenStorage.getState().setToken(null);
  }

  if (isError(body)) {
    throw body;
  }

  return body;
};
