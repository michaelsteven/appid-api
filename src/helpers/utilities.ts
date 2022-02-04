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

export const awaitFetch = async (url: string, options: any): Promise<any> => {
  const response = await fetch(url, options).then((result) => result);
  return handleResponse(response);
};

export const handleResponse = (response: Response):Promise<any> => {
  if (response.ok) {
    if (response.status !== 204) {
      return response.json();
    } else {
      return Promise.resolve();
    }
  }
  throw new ApiError(response.status, response.statusText);
};
