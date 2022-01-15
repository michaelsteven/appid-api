import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID, APPID_CLIENT_ID, APPID_SECRET } from '../../helpers/env';
import { awaitFetch } from '../../helpers/utilities';
import { AuthToken } from '../models/AuthToken';
import { PublicKeys } from '../models/PublicKeys';

export const loginWithUsernamePassword = async (username: string, password: string, locale: string): Promise<AuthToken> => {
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

export const loginWithRefreshToken = async (refreshToken: string, locale: string, accessToken?: string): Promise<AuthToken> => {
  const url = `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}/token`;
  const base64Creds = Buffer.from(`${APPID_CLIENT_ID}:${APPID_SECRET}`).toString('base64');
  const options = {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      appid_access_token: accessToken,
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

export const revokeRefreshToken = async (refreshToken: string, locale: string): Promise<String> => {
  const url = `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}/revoke`;
  const base64Creds = Buffer.from(`${APPID_CLIENT_ID}:${APPID_SECRET}`).toString('base64');
  const options = {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'refresh_token',
      token: refreshToken,
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

export const getPublicKeys = async (): Promise<PublicKeys> => {
  const url = `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}/publickeys`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  return awaitFetch(url, options);
};
