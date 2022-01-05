import { ApiError } from './errors';

export const isJSON = (str: any) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const handleResponse = async (response: Response) => {
  if (response.ok) {
    const json = await response.json();
    return json;
  }
  throw new ApiError(response.status, response.statusText);
};
