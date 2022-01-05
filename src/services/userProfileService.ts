import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';
const userProfileManager = require('ibmcloud-appid').UserProfileManager;

userProfileManager.init({
  tenantId: APPID_API_TENANT_ID,
  oauthServerUrl: `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}`,
  profilesUrl: `${APPID_SERVICE_ENDPOINT}`,
});

/**
 * Get User Profile
 */
export const getUserProfile = (accessToken: string, identityToken: string) => {
  userProfileManager.getUserInfo(accessToken, identityToken).then(function (userInfo : any) {
    return userInfo;
  });
};
