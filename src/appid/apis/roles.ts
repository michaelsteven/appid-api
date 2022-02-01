import { setBearerToken } from '.';
import { APPID_API_TENANT_ID, APPID_SERVICE_ENDPOINT } from '../../helpers/env';
import { awaitFetch } from '../../helpers/utilities';
import { Role } from '../models/Role';

export const getRoles = async (): Promise<Array<Role>> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/roles`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};

export const getUserRoles = async (profileId: string): Promise<Array<Role>> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/users/${profileId}/roles`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};
