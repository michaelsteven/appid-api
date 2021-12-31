import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';

export const login = async (username: string, password: string, redirectUri: string) => {
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/oauth/v4/${APPID_API_TENANT_ID}/token`;

  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'password',
      username: username,
      password: password,
      redirect_uri: redirectUri,
    }),
  })
    .then((result) => result)
    .catch((error) => {
      const failed = new ApiError(500, 'Error:'.concat(JSON.stringify(error)));
      throw failed;
    });

  if (response.status === 201) {
    const json = await response.json();
    return json;
  }

  if (response.status === 400) {
    throw new ApiError(400, 'Invalid access to app ID.');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  }
};
