import { Request as ExRequest, } from 'express';
import {
  loginWithCredentials as apiLoginWithCredentials,
  forgotPassword as apiForgotPassword,
} from '../apis';
import { getLocale } from '../../helpers/locale';
import { ForgotPasswordUser } from '../models/ForgotPasswordUser';

/**
 * Login with Credentials
 * @param username string
 * @param password string
 * @param exRequest ExRequest
 * @returns []
 */
export async function loginWithCredentials (username: string, password: string, exRequest: ExRequest) {
  const locale = getLocale(exRequest);
  return await apiLoginWithCredentials(username, password, locale);
};

/**
 * Forgot Password
 * @param username username
 * @param locale locale
 * @returns ForgotPasswordUser
 */
export async function forgotPassword (username: string, locale: string) : Promise<ForgotPasswordUser> {
  return await apiForgotPassword(username, locale);
};
