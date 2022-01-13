import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request as ExRequest, } from 'express';
import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID, APPID_CLIENT_ID, APPID_SECRET } from '../../helpers/env';
import { redisSet, loginWithRefreshToken as svcLoginWithRefreshToken, } from '../services';
import { ApiError } from '../../helpers/errors';
import { containsRequiredScopes } from '../helpers/token';
import { AccessToken } from '../models/AccessToken';
import { AuthToken } from '../models/AuthToken';

/**
 * Gets the app identity token
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
    return tokenManager.getApplicationIdentityToken();
  } catch (err) {
    console.log('err obtained : ' + err);
  }
};

export const validateTokenOrRefresh = async (authToken: AuthToken, publicKey: string, request: ExRequest, scopes?: Array<string>) : Promise<any> => {
  const { access_token: accessToken } = authToken as AuthToken;
  try {
    return validateToken(accessToken || '', publicKey, scopes);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return getRefreshToken(authToken, request);
    }
    return Promise.reject(error);
  }
};

export const validateToken = (accessToken: string, publicKey: string, scopes?: Array<string>) : Promise<any> => {
  return new Promise((resolve, reject) => {
    // verify the token signature using the public key
    const decodedToken = jwt.verify(accessToken, publicKey) as AccessToken;

    // verify our tenant matches the token tenant
    const { tenant, aud } = decodedToken;
    if (APPID_API_TENANT_ID !== tenant) {
      return reject(new ApiError(401, 'Invalid Tenant ID'));
    }

    // Verify token client id against aud: Array<string>
    if (!aud || !aud.includes(APPID_CLIENT_ID || '')) {
      return reject(new ApiError(401, 'Invalid Client ID'));
    }

    // verify token contains required scopes
    if (!containsRequiredScopes(decodedToken, scopes || [])) {
      return reject(new ApiError(401, 'Insufficient Permissions'));
    } else {
      return resolve(accessToken);
    }
  });
};

const getRefreshToken = async (authToken: AuthToken, request: ExRequest):Promise<any> => {
  const { refresh_token: refreshToken, access_token: accessToken } = authToken as AuthToken;
  const newAuthToken = await svcLoginWithRefreshToken(refreshToken || '', request, accessToken);
  const { access_token: newAccessToken } = newAuthToken as AuthToken;
  const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  const redisAuthData = JSON.stringify({ clientIp: clientIp, authToken: newAccessToken });
  await redisSet(request.cookies.authTicket, redisAuthData, 86400); // expire in one day
  return Promise.resolve(newAccessToken || '');
};
