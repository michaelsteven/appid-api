import * as express from 'express';
import jwt from 'jsonwebtoken';
import { AccessToken } from './appid/models/AccessToken';
import { ApiError } from './helpers/errors';
import { containsRequiredScopes } from './appid/helpers/token';
import { AuthPublicKey } from './appid/helpers/AuthPublicKey';
import { APPID_CLIENT_ID, APPID_API_TENANT_ID } from './helpers/env';

export async function expressAuthentication (request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'jwt') {
    const { authorization } = request.headers;
    const authPublicKey = AuthPublicKey.getInstance();
    const publicKey = await authPublicKey.getPublicKey();

    return new Promise((resolve, reject) => {
      if (!authorization || !authorization.startsWith('Bearer')) {
        return reject(new ApiError(401, 'Unauthorized. No authorization header of type Bearer present'));
      } else {
        // verify the token signature using the public key
        const token = authorization.replace(/Bearer (.*)$/, '$1');
        const decodedToken = jwt.verify(token, publicKey) as AccessToken;

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
          return resolve(token);
        }
      }
    });
  }
  return Promise.reject(new ApiError(401, 'No supported authentication type matched'));
};
