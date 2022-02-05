import { getSub } from '../helpers/token';
import { getProfileForUser as apiGetUserProfile, getUsers as apiGetUsers } from '../apis';
import { Users, UserProfile } from '../models';

/**
 * Gets the Profile for a User
 * @param encodedAccessToken - encoded access token
 * @returns Promise<UserProfile>
 */
export const getUserProfile = (encodedAccessToken: string): Promise<UserProfile> => {
  const sub = getSub(encodedAccessToken) || '';
  return apiGetUserProfile(sub);
};

export const getUsers = (payload: {startIndex?: number, count?: number, query?: string}): Promise<Users> => {
  return apiGetUsers(payload);
};
