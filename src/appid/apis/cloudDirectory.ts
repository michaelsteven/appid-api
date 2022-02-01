import { awaitFetch } from '../../helpers/utilities';
import { setBearerToken } from './bearerToken';
import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';
import { SignupUser } from '../models/SignupUser';
import { CloudDirectoryUser, Users, ChangePasswordPayload, ForgotPasswordConfirmationResult } from '../models';

/**
 * Remove profile
 * @param id number
 * @returns string
 */
export const cloudDirectoryProfileRemove = async (id: string): Promise<any> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/remove/${id}`;
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Starts the forgot Password flow
 * @param username username
 * @param locale locale
 * @returns user info
 */
export const forgotPassword = async (username: string, acceptLanguage : string): Promise<any> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/forgot_password?language=${acceptLanguage}`;
  const options = {
    method: 'POST',
    body: JSON.stringify({ user: username }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Confirms the forgot password context is valid and returns the uuid of the user.
 * @param context;
 * @param acceptLanguage;
 * @returns Promise: { status:boolean, uuid: string }
 */
export const forgotPasswordConfirmationResult = async (context: string, acceptLanguage: string): Promise<ForgotPasswordConfirmationResult> => {
  const bearerToken = await setBearerToken();
  const formData = new URLSearchParams();
  formData.append('context', context);
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/forgot_password/confirmation_result`;
  const options = {
    method: 'POST',
    body: formData.toString(),
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Language': acceptLanguage,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Change Password
 * @param payload - object of type ChangePasswordPayload
 * @param acceptLanguage - the request accept language
 * @param changedIpAddress? - (optional) IP address of the request
 * @returns Promise<CloudDirectoryUser>
 */
export const changePassword = async (payload: ChangePasswordPayload, acceptLanguage: string): Promise<CloudDirectoryUser> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/change_password?language=${acceptLanguage}`;
  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  return awaitFetch(url, options);
};

/**
 * Signs up a user
 * @param user the user to create
 * @param acceptLanguage the accept language
 * @returns the user info
 */
export const signup = async (user: SignupUser, acceptLanguage : string): Promise<CloudDirectoryUser> => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/sign_up?language=${acceptLanguage}`;
  const options = {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  return awaitFetch(url, options);
};

export const getUsers = async (payload: {startIndex?: number, count?: number, query?: string}): Promise<Users> => {
  const bearerToken = await setBearerToken();
  const searchParams = new URLSearchParams();
  if (payload.startIndex) { searchParams.append('startIndex', payload.startIndex.toString()); }
  if (payload.count) { searchParams.append('count', payload.count.toString()); }
  if (payload.query) { searchParams.append('query', payload.query); }
  searchParams.append('dataScope', 'full');

  const url = new URL(`${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/users`);
  url.search = searchParams.toString();
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    }
  };
  return await awaitFetch(url.toString(), options);
};
