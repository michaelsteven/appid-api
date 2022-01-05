import { Request as ExRequest, } from 'express';
import {
  login,
  cloudDirectoryForgotPassword,
} from '../apis';
import { USE_REFRESH_TOKEN, REFRESH_TOKEN_DAYS } from '../helpers/env';
import { getLocale } from '../helpers/locale';
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
  const responsePayload = await login(username, password, locale);
  if (responsePayload) {
    return buildCookieArray(responsePayload, exRequest);
  }
  return [];
}

/**
 * Forgot Password
 * @param username username
 * @param locale locale
 * @returns ForgotPasswordUser
 */
export async function forgotPassword (username: string, locale: string) : Promise<ForgotPasswordUser> {
  return await cloudDirectoryForgotPassword(username, locale);
}

/**
 * Builds an array of cookie data from the response
 * @param payload any
 * @param exRequest ExRequest
 * @returns []
 */
const buildCookieArray = (payload: any, exRequest: ExRequest) => {
  const { access_token: accessToken, id_token: idToken, refresh_token: refreshToken, expires_in: expiresIn } = payload;
  let idTokenMaxAge = expiresIn;

  // define the cookie array with the access token
  const accessCookieOptions = `Max-Age=${expiresIn}; path=/; SameSite=Strict;`; // not setting HttpOnly because client will read cookie with javascript
  const cookieArray = [`access_token=${accessToken}; ${exRequest.secure ? accessCookieOptions.concat(' Secure;') : accessCookieOptions}`];

  // add the refresh token to the cookie array
  if (USE_REFRESH_TOKEN === 'true') {
    const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * parseInt(REFRESH_TOKEN_DAYS || '30');
    idTokenMaxAge = refreshTokenMaxAge;
    const refreshCookieOptions = `Max-Age=${refreshTokenMaxAge}; path=/; SameSite=Strict;`;
    cookieArray.push(`refresh_token=${refreshToken}; ${exRequest.secure ? refreshCookieOptions.concat(' Secure;') : refreshCookieOptions}`);
  }

  // add the ID token to the cookie array
  const idTokenOptions = `Max-Age=${idTokenMaxAge}; path=/; SameSite=Strict;`;
  cookieArray.push(`id_token=${idToken}; ${exRequest.secure ? idTokenOptions.concat(' Secure;') : idTokenOptions}`);
  return cookieArray;
};
