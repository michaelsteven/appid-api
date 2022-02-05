import { getUserProfile as apiGetUserProfile, getUsers as apiGetUsers } from '../apis';
import { Users, UserProfile, IdentityToken } from '../models';
import { getIdentityToken } from './tokenService';

/**
 * Gets the Profile for the logged in user
 * @param authTicket - the auth ticket
 * @returns Promise<UserProfile>
 */
export const getUserProfile = async (authTicket: string): Promise<UserProfile> => {
  const identityToken = await getIdentityToken(authTicket) as IdentityToken;
  const { sub: profileId } = identityToken;
  return apiGetUserProfile(profileId);
};

/**
 * Gets a paginated list of users
 * @param payload payload
 * @returns Promise<Users>
 */
export const getUsers = (payload: {startIndex?: number, count?: number, query?: string}): Promise<Users> => {
  return apiGetUsers(payload);
};
