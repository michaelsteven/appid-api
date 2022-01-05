import fetch from 'cross-fetch';
import { ApiError } from '../../helpers/errors';
import { IBMCLOUD_API_KEY } from '../../helpers/env';

export const setBearerToken = async () => {
  const options = {
    method: 'POST',
    body: `grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=${IBMCLOUD_API_KEY}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
  };
  const result = await fetch('https://iam.cloud.ibm.com/identity/token', options).then((result) => result);
  if (result.ok) {
    const { access_token: accessToken } = await result.json();
    return accessToken;
  }
  throw new ApiError(result.status, result.statusText);
};
