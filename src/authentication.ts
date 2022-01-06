import * as express from 'express';
import jwtDecode from 'jwt-decode';
import { DecodedToken } from './appid/models/DecodedToken';
// import { APPID_CLIENT_ID, APPID_API_TENANT_ID } from './helpers/env';

export function expressAuthentication (request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'jwt') {
    const { authorization } = request.headers;

    return new Promise((resolve, reject) => {
      if (!authorization || !authorization.startsWith('Bearer')) {
        reject(Error('Unauthorized. No authorization header of type Bearer present'));
      } else {
        const token = authorization.replace(/Bearer (.*)$/, '$1');
        const decodedToken = jwtDecode(token) as DecodedToken;
        // TODO: verify token signature
        // TODO: Verify token tenant
        // TODO: Verify token client id against aud: Array<string>
        // TODO: Verify token is not expired

        // verify token contains required scopes
        if (!containsRequiredScopes(decodedToken, scopes || [])) {
          reject(Error('Insufficient Permissions'));
        }
        resolve(token);
      }
    });
  }
  return Promise.reject(Error('No supported authentication type matched'));
};

/**
 * ContainsScopes
 * @param decodedToken decoded JWT token
 * @param requiredScopesArray scopes required on the endpoint
 * @returns boolean
 */
const containsRequiredScopes = (decodedToken:DecodedToken, requiredScopesArray: Array<string>) => {
  const tokenScopesArray = decodedToken.scope.split(' ') as Array<string>;
  for (const requiredScope of requiredScopesArray) {
    if (!tokenScopesArray.includes(requiredScope)) {
      return false;
    }
  }
  return true;
};
