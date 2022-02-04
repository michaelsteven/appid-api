import { Request as ExRequest, } from 'express';
import {
  loginWithUsernamePassword as apiLoginWithUsernamePassword,
  loginWithRefreshToken as apiLoginWithRefreshToken,
  forgotPassword as apiForgotPassword,
  forgotPasswordConfirmationResult,
  changePassword as apiChangePassword,
  getPublicKeys as apiGetPublicKeys
} from '../apis';
import { CloudDirectoryUser, PublicKeys, AuthToken } from '../models';
import { getLocale } from '../../helpers/locale';
import { ApiError } from '../../helpers/errors';

/**
 * Login with Credentials
 * @param username string
 * @param password string
 * @param exRequest ExRequest
 * @returns []
 */
export function loginWithUsernamePassword (username: string, password: string, exRequest: ExRequest): Promise<AuthToken> {
  const locale = getLocale(exRequest);
  return apiLoginWithUsernamePassword(username, password, locale);
}

/**
 * Login with RefreshToken
 * @param refreshToken the JWT refresh token
 * @param exRequest - the express request
 * @param accessToken - optionally the JWT access token
 * @returns AuthToken
 */
export function loginWithRefreshToken (refreshToken: string, exRequest: ExRequest, accessToken?: string): Promise<AuthToken> {
  const locale = getLocale(exRequest);
  return apiLoginWithRefreshToken(refreshToken, locale, accessToken);
}

/**
 * Forgot Password
 * @param username username
 * @param locale locale
 * @returns ForgotPasswordUser
 */
export function forgotPassword (username: string, locale: string) : Promise<CloudDirectoryUser> {
  return apiForgotPassword(username, locale);
}

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
    return await apiChangePassword({ newPassword: newPassword, uuid: uuid }, locale);
  } else {
    throw new ApiError(401, 'Context Rejected');
  }
}

/**
 * Change Password
 * @param payload - new password and uuid
 * @param locale - the locale
 * @returns Promise<CloudDirectoryUser>
 */
export function changePassword (payload: {newPassword: string; uuid: string}, locale: string) : Promise<CloudDirectoryUser> {
  return apiChangePassword(payload, locale);
}

/**
 * Get Public Keys
 * @returns PublicKeys
 */
export const getPublicKeys = (): Promise<PublicKeys> => {
  return apiGetPublicKeys();
};
