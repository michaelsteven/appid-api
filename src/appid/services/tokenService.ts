import { Request as ExRequest, } from 'express';
import jwt from 'jsonwebtoken';
import { revokeRefreshToken as apiRevokeRefreshToken } from '../apis';
import { APPID_API_TENANT_ID, APPID_CLIENT_ID } from '../../helpers/env';
import { redisSet, loginWithRefreshToken as svcLoginWithRefreshToken, redisRemove, redisGet, } from '../services';
import { ApiError } from '../../helpers/errors';
import { containsRequiredScopes } from '../helpers/token';
import { AccessToken, AuthInfo, IdentityToken, RedisAuthData } from '../models';

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

export const renewAuthWithRefreshToken = async (newUuid: string, request: ExRequest):Promise<AuthInfo> => {
  // make sure the auth ticket is present
  if (request.cookies && request.cookies.authTicket) {
    return Promise.reject(new ApiError(401, 'Unauthorized. AuthTicket Cookie not found'));
  }

  // get the access token and login ip from the redis data
  const redisData = await redisGet(request.cookies.authTicket);
  if (!redisData) {
    return Promise.reject(new ApiError(401, 'Unauthorized. Session not found'));
  }
  const { authToken, clientIp: loginClientIp } = JSON.parse(redisData || '') as RedisAuthData;

  // verify the IP of the request matches the IP used to log in.
  const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  if (clientIp !== loginClientIp) {
    return Promise.reject(new ApiError(401, 'Unauthorized. Ip Changed'));
  }

  // use the refresh token to get new AuthToken
  const { refresh_token: refreshToken, access_token: accessToken } = authToken;
  const newAuthToken = await svcLoginWithRefreshToken(refreshToken || '', request, accessToken);

  // add redis data and clear out old data
  const redisAuthData = JSON.stringify({ clientIp: clientIp, authToken: newAuthToken });
  await redisSet(newUuid, redisAuthData, 86400); // expire in one day
  await redisRemove(request.cookies.authTicket);

  // revoke the original refresh token
  if (refreshToken) {
    try {
      await apiRevokeRefreshToken(refreshToken);
    } catch (error) {
      console.log('failed to revoke refresh token', error);
    }
  }

  // return the AuthInfo object
  const { id_token: encodedIdToken, scope } = newAuthToken;
  const { exp, name, given_name: givenName, family_name: familyName } = jwt.decode(encodedIdToken) as IdentityToken;
  return { exp: exp, name: name, givenName: givenName, familyName: familyName, scope: scope };
};

/**
 * Revoke Refresh Token
 * @param refreshToken - the refresh token to revoke
 * @param exRequest -- the express header
 * @returns Promise<String>
 */
export async function revokeRefreshToken (exRequest: ExRequest): Promise<string> {
  // if we can get the auth ticket from the header
  if (exRequest.cookies && exRequest.cookies.authTicket) {
    // get the refresh token from the redis data
    const redisData = await redisGet(exRequest.cookies.authTicket);
    if (redisData) {
      const { authToken } = JSON.parse(redisData || '') as RedisAuthData;
      const { refresh_token: refreshToken } = authToken;

      // call the api to revoke the refresh token
      if (refreshToken) {
        return await apiRevokeRefreshToken(refreshToken);
      }
    } else {
      return 'no redis data';
    }
  }
  return 'refresh token not revoked';
}
