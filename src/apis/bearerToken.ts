import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import { isJSON } from '../helpers/utilities';
import {
  IBMCLOUD_API_KEY,
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
