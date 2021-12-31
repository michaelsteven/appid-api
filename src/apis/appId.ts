import fetch from 'cross-fetch';
import { User } from '../models/user';
import { ApiError } from '../helpers/errors';
import { isJSON } from '../helpers/utilities';
import {
  IBMCLOUD_API_KEY,
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';

export const setBearerToken = async () => {
  const result = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: `grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=${IBMCLOUD_API_KEY}`,
  })
    .then((result) => result)
    .catch((error) => {
      throw error;
    });

  if (result.status === 200) {
    const accessToken = await result.json();
    return accessToken;
  }

  if (result.status === 400 || result.status === 500) {
    if (isJSON(result)) {
      const failed = await result.json();
      throw failed;
    } else {
      console.log(result);
      throw new ApiError(500, 'Service Unavailable');
    }
  }
};

export const cloudDirectorySignUp = async (user: User) => {
  const bearerToken = await setBearerToken();
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/cloud_directory/sign_up`;
  const query = '?shouldCreateProfile=true&language=en';

  const response = await fetch(`${url}${path}${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      ...user,
    }),
  })
    .then((result) => result)
    .catch((error) => {
      const failed = new ApiError(500, 'Error:'.concat(JSON.stringify(error)));
      throw failed;
    });

  if (response.status === 201) {
    const user = await response.json();
    return user;
  }

  if (response.status === 400) {
    throw new ApiError(400, 'Invalid access to app ID.');
  } else if (response.status === 401) {
    throw new ApiError(401, 'The user is unauthorized.');
  } else if (response.status === 403) {
    throw new ApiError(403, 'Insufficient permissions.');
  } else if (response.status === 409) {
    throw new ApiError(409, 'The email address already exist');
  }
};

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
  })
    .then((result) => result)
    .catch((error) => {
      throw error;
    });

  if (response.status === 200 || response.status === 201) {
    const user = await response.json();
    return user;
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

module.exports = {
  cloudDirectorySignUp,
  cloudDirectoryProfileRemove,
  userProfile,
  setBearerToken,
};
