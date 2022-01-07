import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../../helpers/env';
import { getUserProfile as apiGetUserProfile } from '../apis/userProfile';
import { UserProfile } from '../models/UserProfile';
const userProfileManager = require('ibmcloud-appid').UserProfileManager;

userProfileManager.init({
  tenantId: APPID_API_TENANT_ID,
  oauthServerUrl: `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}`,
  profilesUrl: `${APPID_SERVICE_ENDPOINT}`,
});

/**
 * Get User Profile
 */
export const getUserProfileFromIdentityToken = (accessToken: string, identityToken: string) => {
  userProfileManager.getUserInfo(accessToken, identityToken).then(function (userInfo : any) {
    return userInfo;
  });
};

export const getUserProfile = async (sub: string): Promise<UserProfile> => {
  return await apiGetUserProfile(sub);
};
