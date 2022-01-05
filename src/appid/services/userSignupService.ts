import { ApiError } from '../../helpers/errors';
import colors from 'colors';
import { User } from '../models/user';
import { cloudDirectoryProfileRemove } from '../apis';
import { getAppIdentityToken } from './tokenService';
import { IBMCLOUD_API_KEY, APPID_SERVICE_ENDPOINT, APPID_API_TENANT_ID } from '../../helpers/env';

const SelfServiceManager = require('ibmcloud-appid').SelfServiceManager;
const selfServiceManager = new SelfServiceManager({
  iamApiKey: IBMCLOUD_API_KEY,
  managementUrl: `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}`,
});

/**
 * Signup
 * @param firstName string
 * @param lastName string
 * @param email string
 * @param password string
 * @param locale string
 * @returns user
 */
export async function signup (firstName : string, lastName : string, email: string, password : string, locale : string) {
  const user = buildSignupUser(firstName, lastName, email, password);

  const appIdUser = await selfServiceSignup(user, locale);
  const { id: cloudDirectoyId } = appIdUser;
  try {
    if (appIdUser) {
      // TODO save id to database
      return appIdUser;
    } else {
      throw new ApiError(500, 'Failed to generate App ID account.');
    }
  } catch (error) {
    if (cloudDirectoyId) {
      try {
        const rollbackProfile = await cloudDirectoryProfileRemove(
          cloudDirectoyId
        );
        console.log('\n');
        console.log(colors.bold('----- rollback app_id user -----'));
        console.log(rollbackProfile ? colors.red(rollbackProfile) : '');
        console.log('\n');
      } catch (error) {
        console.log('\n');
        console.log(colors.bold('----- rollback app_id user -----'));
        console.log(colors.red('Failed to rollback app_id.'));
        console.log(colors.red(JSON.stringify(error)));
        console.log('\n');
      }
    }
    throw error;
  }
};

/**
 * Signup
 * @param user User
 */
export async function selfServiceSignup (user: User, locale: string) {
  const iamToken = getAppIdentityToken();
  return await selfServiceManager.signUp(user, locale, iamToken).then((result:any) => result);
};

/**
 * Builds the user in the format required by AppID Signup
 * @param firstName string
 * @param lastName string
 * @param email string
 * @param password string
 * @returns user
 */
const buildSignupUser = (firstName : string, lastName : string, email: string, password: string) => {
  const user = {
    active: true,
    emails: [
      {
        value: email,
        primary: true,
      },
    ],
    userName: email,
    password: password,
    name: {
      familyName: lastName,
      givenName: firstName,
    },
  };
  return user;
};
