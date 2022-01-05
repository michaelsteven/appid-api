import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import { setBearerToken } from './bearerToken';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';

export const userProfile = async (profileId: number) => {
  const bearerToken = await setBearerToken();
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/users/${profileId}/profile`;
  const response = await fetch(`${url}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  }).then((result) => result)
    .catch((error) => {
      throw error;
    });

  if (response.status === 200 || response.status === 201) {
    return await response.json();
  }

  if (response.status === 400) {
    throw new ApiError(400, 'Invalid access to app ID.');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  } else if (response.status === 403) {
    throw new ApiError(403, 'Insufficient permissions.');
  } else if (response.status === 404) {
    throw new ApiError(404, 'User not found.');
  } else if (response.status === 500) {
    throw new ApiError(500, 'App ID server error.');
  }
};
