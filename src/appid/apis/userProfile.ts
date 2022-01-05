import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';
import { setBearerToken } from './bearerToken';
import { awaitFetch } from '../../helpers/utilities';

export const userProfile = async (profileId: number) => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/users/${profileId}/profile`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};
