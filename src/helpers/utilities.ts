import fetch from 'cross-fetch';
import { ApiError } from './errors';

export const isJSON = (str: any) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const awaitFetch = async (url: string, options: any) => {
  const response = await fetch(url, options).then((result) => result);
  return handleResponse(response);
};

export const handleResponse = async (response: Response) => {
  if (response.ok) {
    const json = await response.json();
    return json;
  }
  throw new ApiError(response.status, response.statusText);
};
