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

export async function loginWithRefreshToken (refreshToken: string, exRequest: ExRequest, accessToken?: string): Promise<AuthToken> {
  const locale = getLocale(exRequest);
  return await apiLoginWithRefreshToken(refreshToken, locale, accessToken);
};

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

export async function changePassword (payload: {newPassword: string; uuid: string}, locale: string) : Promise<CloudDirectoryUser> {
  return await apiChangePassword(payload, locale);
};

export const getPublicKeys = async (): Promise<PublicKeys> => {
  return await apiGetPublicKeys();
};
