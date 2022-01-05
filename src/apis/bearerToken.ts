import fetch from 'cross-fetch';
import { ApiError } from '../helpers/errors';
import { isJSON } from '../helpers/utilities';
import { IBMCLOUD_API_KEY } from '../helpers/env';

export const setBearerToken = async () => {
  const options = {
    method: 'POST',
    body: `grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=${IBMCLOUD_API_KEY}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
  };

  const result = await fetch('https://iam.cloud.ibm.com/identity/token', options)
    .then((result) => result)
    .catch((error) => {
      throw error;
    });

  if (result.status === 200) {
    const { access_token: accessToken } = await result.json();
    return accessToken;
  }

  if (result.status === 400 || result.status === 500) {
    if (isJSON(result)) {
      const failed = await result.json();
      throw failed;
    } else {
      throw new ApiError(500, 'Service Unavailable');
    }
  }
};
