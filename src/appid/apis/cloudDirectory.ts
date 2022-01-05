import { awaitFetch } from '../../helpers/utilities';
import { setBearerToken } from './bearerToken';
import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';

/**
 * Remove profile
 * @param id number
 * @returns string
 */
export const cloudDirectoryProfileRemove = async (id: number): Promise<any> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/remove/${id}`;
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Starts the forgot Password flow
 * @param username username
 * @param locale locale
 * @returns user info
 */
export const forgotPassword = async (username: string, locale : string): Promise<any> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/forgot_password?language=${locale}`;
  const options = {
    method: 'POST',
    body: JSON.stringify({ user: username }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};