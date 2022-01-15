import { getSub } from '../helpers/token';
import { getProfileForUser as apiGetUserProfile } from '../apis/userProfile';
import { UserProfile } from '../models';

/**
 * Gets the Profile for a User
 * @param encodedAccessToken - encoded access token
 * @returns Promise<UserProfile>
 */
export const getUserProfile = async (encodedAccessToken: string): Promise<UserProfile> => {
  const sub = getSub(encodedAccessToken) || '';
  return await apiGetUserProfile(sub);
};
