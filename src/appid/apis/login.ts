import { awaitFetch } from '../../helpers/utilities';
import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID, APPID_CLIENT_ID, APPID_SECRET } from '../../helpers/env';

export const loginWithCredentials = async (username: string, password: string, locale: string) => {
  const url = `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}/token`;
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
  return awaitFetch(url, options);
};
