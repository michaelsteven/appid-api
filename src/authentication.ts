import * as express from 'express';
import jwtDecode from 'jwt-decode';
import { AccessToken } from './appid/models/AccessToken';
import { ApiError } from './helpers/errors';
// import { AuthPublicKey } from './helpers/authPublicKey';
// import { APPID_CLIENT_ID, APPID_API_TENANT_ID } from './helpers/env';

export function expressAuthentication (request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'jwt') {
    const { authorization } = request.headers;

    return new Promise((resolve, reject) => {
      if (!authorization || !authorization.startsWith('Bearer')) {
        return reject(new ApiError(401, 'Unauthorized. No authorization header of type Bearer present'));
      } else {
        const token = authorization.replace(/Bearer (.*)$/, '$1');
        const decodedToken = jwtDecode(token) as AccessToken;
        // TODO: verify token signature
        // const authPublicKey: AuthPublicKey = AuthPublicKey.getInstance();
        // const publicKey = authPublicKey.getKeys();
        // TODO: Verify token tenant
        // TODO: Verify token client id against aud: Array<string>
        // TODO: Verify token is not expired

        // verify token contains required scopes
        if (!containsRequiredScopes(decodedToken, scopes || [])) {
          return reject(new ApiError(401, 'Insufficient Permissions'));
        } else {
          return resolve(token);
        }
      }
    });
  }
  return Promise.reject(new ApiError(401, 'No supported authentication type matched'));
};

/**
 * ContainsScopes
 * @param accessToken decoded JWT token
 * @param requiredScopesArray scopes required on the endpoint
 * @returns boolean
 */
const containsRequiredScopes = (accessToken:AccessToken, requiredScopesArray: Array<string>) => {
  const tokenScopesArray = accessToken.scope.split(' ') as Array<string>;
  for (const requiredScope of requiredScopesArray) {
    if (!tokenScopesArray.includes(requiredScope)) {
      return false;
    }
  }
  return true;
};
