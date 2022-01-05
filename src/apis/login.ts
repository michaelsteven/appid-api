import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
  APPID_CLIENT_ID,
  APPID_SECRET,
} from '../helpers/env';

export const login = async (username: string, password: string, locale: string) => {
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/oauth/v4/${APPID_API_TENANT_ID}/token`;
  const base64Creds = Buffer.from(`${APPID_CLIENT_ID}:${APPID_SECRET}`).toString('base64');

  const options = {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'password',
      username: username,
      password: password,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${base64Creds}`,
      'Accept-Language': locale,
    },
  };

  const response = await fetch(`${url}${path}`, options)
    .then((result) => result)
    .catch((error) => {
      const failed = new ApiError(500, 'Error:'.concat(JSON.stringify(error)));
      throw failed;
    });

  if (response.status === 200) {
    return await response.json();
  }

  if (response.status === 400) {
    throw new ApiError(400, 'Login Failed');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  }
};
