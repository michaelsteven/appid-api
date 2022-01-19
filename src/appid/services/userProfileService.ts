import { getSub } from '../helpers/token';
import { getProfileForUser as apiGetUserProfile, getUsers as apiGetUsers } from '../apis';
import { CloudDirectoryUsers, UserProfile } from '../models';

/**
 * Gets the Profile for a User
 * @param encodedAccessToken - encoded access token
 * @returns Promise<UserProfile>
 */
export const getUserProfile = async (encodedAccessToken: string): Promise<UserProfile> => {
  const sub = getSub(encodedAccessToken) || '';
  return await apiGetUserProfile(sub);
};

export const getUsers = async (payload: {startIndex?: number, count?: number, query?: string}): Promise<CloudDirectoryUsers> => {
  return await apiGetUsers(payload);
};
