import { Request as ExRequest, } from 'express';
import {
  loginWithUsernamePassword as apiLoginWithUsernamePassword,
  loginWithRefreshToken as apiLoginWithRefreshToken,
  forgotPassword as apiForgotPassword,
  forgotPasswordConfirmationResult,
  changePassword as apiChangePassword,
  getPublicKeys as apiGetPublicKeys
} from '../apis';
import { getLocale } from '../../helpers/locale';
import { CloudDirectoryUser } from '../models/CloudDirectoryUser';
import { ApiError } from '../../helpers/errors';
import { PublicKeys } from '../models/PublicKeys';
import { AuthToken } from '../models/AuthToken';
import { AuthInfo } from '../models/AuthInfo';
import { redisGet } from '.';
import { RedisAuthData } from '../models/RedisAuthData';
import { getRefreshToken } from './tokenService';

/**
 * Login with Credentials
 * @param username string
 * @param password string
 * @param exRequest ExRequest
 * @returns []
 */
export async function loginWithUsernamePassword (username: string, password: string, exRequest: ExRequest): Promise<AuthToken> {
  const locale = getLocale(exRequest);
  return await apiLoginWithUsernamePassword(username, password, locale);
};

/**
 * Login with RefreshToken
 * @param refreshToken the JWT refresh token
 * @param exRequest - the express request
 * @param accessToken - optionally the JWT access token
 * @returns AuthToken
 */
export async function loginWithRefreshToken (refreshToken: string, exRequest: ExRequest, accessToken?: string): Promise<AuthToken> {
  const locale = getLocale(exRequest);
  return await apiLoginWithRefreshToken(refreshToken, locale, accessToken);
};

/**
 * Logs in with the refresh token from redis and store new creds in redis
 * @param newUuid - the new UUID to set in redis
 * @param exRequest - the express request
 * @returns AuthInfo
 */
export async function loginWithRedisRefreshToken (newUuid: string, exRequest: ExRequest): Promise<AuthInfo> {
  // make sure the auth ticket is present
  if (exRequest.cookies && exRequest.cookies.authTicket) {
    return Promise.reject(new ApiError(401, 'Unauthorized. AuthTicket Cookie not found'));
  }

  // get the access token and login ip from the redis data
  const redisData = await redisGet(exRequest.cookies.authTicket);
  if (!redisData) {
    return Promise.reject(new ApiError(401, 'Unauthorized. Session not found'));
  }
  const { authToken, clientIp: loginClientIp } = JSON.parse(redisData || '') as RedisAuthData;

  // verify the IP of the request matches the IP used to log in.
  const clientIp = exRequest.headers['x-forwarded-for'] || exRequest.socket.remoteAddress;
  if (clientIp !== loginClientIp) {
    return Promise.reject(new ApiError(401, 'Unauthorized. Ip Changed'));
  }
  return await getRefreshToken(newUuid, authToken, exRequest);
}

/**
 * Forgot Password
 * @param username username
 * @param locale locale
 * @returns ForgotPasswordUser
 */
export async function forgotPassword (username: string, locale: string) : Promise<CloudDirectoryUser> {
  return await apiForgotPassword(username, locale);
};

/**
 * Forgot Password Confirmation Validate And Change
 * @param password the new password
 * @param context the context
 * @param locale the locale
 */
export async function forgotPasswordConfirmationValidationAndChange (newPassword: string, context: string, locale: string): Promise<CloudDirectoryUser> {
  // make API call to validate the confirmation context, which will return the user's UUID and a status
  const confirmationResult = await forgotPasswordConfirmationResult(context, locale);
  const { success, uuid } = confirmationResult;
  if (success === true) {
    const cloudDirectoryUser = await apiChangePassword({ newPassword: newPassword, uuid: uuid }, locale);
    return cloudDirectoryUser;
  } else {
    throw new ApiError(401, 'Context Rejected');
  }
};

/**
 * Change Password
 * @param payload - new password and uuid
 * @param locale - the locale
 * @returns Promise<CloudDirectoryUser>
 */
export async function changePassword (payload: {newPassword: string; uuid: string}, locale: string) : Promise<CloudDirectoryUser> {
  return await apiChangePassword(payload, locale);
};

/**
 * Get Public Keys
 * @returns PublicKeys
 */
export const getPublicKeys = async (): Promise<PublicKeys> => {
  return await apiGetPublicKeys();
};
