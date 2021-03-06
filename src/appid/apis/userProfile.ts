import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';
import { setBearerToken } from './bearerToken';
import { awaitFetch } from '../../helpers/utilities';
import { UserProfile } from '../models/UserProfile';

/**
 * Get User Profile - for a user to get their own profile
 *   -----------  WARNING ------------------
 *   THIS METHOD DOESN'T WORK - It appears that a user is unable to get their own profile
 *   from appid using their own auth token.  Leaving this in for troubleshooting.  The
 *   method below works but uses the application's token.
 * @param encodedAccessToken - the user's encoded access token
 * @param profileId -- the profile of the user
 * @returns Promise<UserProfile>
 */
export const getUserProfileBroken = async (encodedAccessToken: string, profileId: string) : Promise<UserProfile> => {
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/users/${profileId}/profile`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${encodedAccessToken}`,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Get profile for user - for an administrator to access a user's profile.
 * @param encodedAccessToken - string
 * @param profileId - the profileId for the user
 * @returns Promise<UserProfile>
 */
export const getUserProfile = async (profileId: string) : Promise<UserProfile> => {
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
