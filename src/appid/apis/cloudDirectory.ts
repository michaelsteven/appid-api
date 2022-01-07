import { awaitFetch } from '../../helpers/utilities';
import { setBearerToken } from './bearerToken';
import { APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';
import { User } from '../models/user';
import { ForgotPasswordConfirmationResult } from '../models/ForgotPasswordConfirmationResult';
import { CloudDirectoryUser } from '../models/CloudDirectoryUser';
import { ChangePasswordPayload } from '../models/ChangePasswordPayload';

/**
 * Remove profile
 * @param id number
 * @returns string
 */
export const cloudDirectoryProfileRemove = async (id: number): Promise<any> => {
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
  console.log(url);
  console.log(options);
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
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/forgot_password/confirmation_result}`;
  const options = {
    method: 'POST',
    body: JSON.stringify({ user: context }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  console.log(url);
  console.log(options);
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
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/cloud_directory/change_password}`;
  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  console.log(url);
  console.log(options);
  return awaitFetch(url, options);
};

/**
 * Signs up a user
 * @param user the user to create
 * @param acceptLanguage the accept language
 * @returns the user info
 */
export const signup = async (user: User, acceptLanguage : string): Promise<any> => {
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
  console.log(url);
  console.log(options);
  return awaitFetch(url, options);
};
