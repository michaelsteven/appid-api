import * as express from 'express';
import { ApiError } from './helpers/errors';
import { AuthPublicKey } from './appid/helpers/AuthPublicKey';
import { RedisAuthData } from './appid/models/RedisAuthData';
import { redisGet } from './appid/services';
import { validateToken } from './appid/services/tokenService';

export async function expressAuthentication (request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  const authPublicKey = AuthPublicKey.getInstance();
  const publicKey = await authPublicKey.getPublicKey();

  // JWT Auth -- client renews access token using refresh token
  if (securityName === 'jwt') {
    const { authorization } = request.headers;
    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.replace(/Bearer (.*)$/, '$1');
      return validateToken(accessToken, publicKey, scopes);
    } else {
      return Promise.reject(new ApiError(401, 'Unauthorized. No authorization header of type Bearer present'));
    }

  // Cookie Auth -- server renews access token using refresh token
  } else if (securityName === 'cookie') {
    if (request.cookies && request.cookies.authTicket) {
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

      // validate the access token or get a new token using the refresh token if expired
      const { access_token: accessToken } = authToken;
      return validateToken(accessToken || '', publicKey, scopes);
    } else {
      return Promise.reject(new ApiError(401, 'Unauthorized. No auth cookie present'));
    }
  }

  // No Auth matched
  return Promise.reject(new ApiError(401, 'No supported authentication type matched'));
}
