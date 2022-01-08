import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../../helpers/env';
import { getSub } from '../../helpers/token';
import { getUserProfile as apiGetUserProfile } from '../apis/userProfile';
import { UserProfile } from '../models/UserProfile';
const userProfileManager = require('ibmcloud-appid').UserProfileManager;

userProfileManager.init({
  tenantId: APPID_API_TENANT_ID,
  oauthServerUrl: `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}`,
  profilesUrl: `${APPID_SERVICE_ENDPOINT}`,
});

/**
 * NOT USED... leaving in as an example and in case we need it later
 * Get User Profile
 */
export const getUserProfileFromIdentityToken = (accessToken: string, identityToken: string) => {
  userProfileManager.getUserInfo(accessToken, identityToken).then(function (userInfo : any) {
    return userInfo;
  });
};

/**
 * Gets the Profile for a User
 * @param encodedAccessToken - encoded access token
 * @returns Promise<UserProfile>
 */
export const getUserProfile = async (encodedAccessToken: string): Promise<UserProfile> => {
  const sub = getSub(encodedAccessToken) || '';
  return await apiGetUserProfile(encodedAccessToken, sub);
};
