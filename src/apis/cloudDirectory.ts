import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import { setBearerToken } from './bearerToken';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';
import { ForgotPasswordUser } from '../models/ForgotPasswordUser';

/**
 * Remove profile
 * @param id number
 * @returns string
 */
export const cloudDirectoryProfileRemove = async (id: number) => {
  const bearerToken = await setBearerToken();
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/cloud_directory/remove/${id}`;
  const response = await fetch(`${url}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((result) => result)
    .catch((error) => {
      throw error;
    });

  if (response.status === 204) {
    return 'User and profile were deleted';
  }

  if (response.status === 400) {
    throw new ApiError(400, 'Invalid access to app ID.');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  } else if (response.status === 403) {
    throw new ApiError(403, 'Insufficient permissions.');
  }
};

export const cloudDirectoryForgotPassword = async (username: string, locale : string) : Promise<ForgotPasswordUser> => {
  const bearerToken = await setBearerToken();
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/cloud_directory/forgot_password?language=${locale}`;

  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    body: JSON.stringify({ user: username }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((result) => result)
    .catch((error) => {
      throw error;
    });

  const json = await response.json();
  if (response.status === 200) {
    return json;
  }

  if (response.status === 400) {
    throw new ApiError(400, 'The request body is missing or invalid');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  } else if (response.status === 403) {
    throw new ApiError(403, 'Insufficient permissions.');
  } else if (response.status === 409) {
    throw new ApiError(409, 'User account not verified.');
  }
  return json.then(Promise.reject.bind(Promise));
};
