import { Request as ExRequest, } from 'express';
import jwt from 'jsonwebtoken';
import { APPID_API_TENANT_ID, APPID_CLIENT_ID } from '../../helpers/env';
import { redisSet, loginWithRefreshToken as svcLoginWithRefreshToken, redisRemove, } from '../services';
import { ApiError } from '../../helpers/errors';
import { containsRequiredScopes } from '../helpers/token';
import { AccessToken } from '../models/AccessToken';
import { AuthToken } from '../models/AuthToken';
import { AuthInfo } from '../models/AuthInfo';
import { IdentityToken } from '../models/IdentityToken';

/**
 * Validate Token
 * @param accessToken - the access token
 * @param publicKey - the public key from the auth server
 * @param scopes - array of scopes
 * @returns Promise<void>
 */
export const validateToken = (accessToken: string, publicKey: string, scopes?: Array<string>) : Promise<void> => {
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
      return resolve();
    }
  });
};

export const getRefreshToken = async (newUuid: string, authToken: AuthToken, request: ExRequest):Promise<AuthInfo> => {
  // use the refresh token to get new AuthToken
  const { refresh_token: refreshToken, access_token: accessToken } = authToken as AuthToken;
  const newAuthToken = await svcLoginWithRefreshToken(refreshToken || '', request, accessToken);

  // add redis data and clear out old data
  const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  const redisAuthData = JSON.stringify({ clientIp: clientIp, authToken: newAuthToken });
  await redisSet(newUuid, redisAuthData, 86400); // expire in one day
  await redisRemove(request.cookies.authTicket);

  // TODO: make call to the auth server to invalidate the old refresh token

  // return the AuthInfo object
  const { id_token: encodedIdToken, scope } = newAuthToken;
  const idToken = jwt.decode(encodedIdToken) as IdentityToken;
  return { idToken: idToken, scope: scope };
};
