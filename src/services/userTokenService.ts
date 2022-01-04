import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
  APPID_CLIENT_ID,
  APPID_SECRET
} from '../helpers/env';

/**
 * Gets the app identy token
 */
export const getAppIdentityToken = () => {
  const config = {
    tenantId: APPID_API_TENANT_ID,
    clientId: APPID_CLIENT_ID,
    secret: APPID_SECRET,
    oauthServerUrl: `${APPID_SERVICE_ENDPOINT}/oauth/v4/${APPID_API_TENANT_ID}`,
  };

  const TokenManager = require('ibmcloud-appid').TokenManager;
  const tokenManager = new TokenManager(config);
  try {
    const tokenResponse = tokenManager.getApplicationIdentityToken();
    // console.log('Token response : ' + JSON.stringify(tokenResponse));
    return tokenResponse;
  } catch (err) {
    console.log('err obtained : ' + err);
  }
};
