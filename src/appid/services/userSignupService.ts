import { ApiError } from '../../helpers/errors';
import { SignupUser } from '../models/SignupUser';
import { cloudDirectoryProfileRemove, signup as apiSignup } from '../apis';
import { CloudDirectoryUser } from '../models';

/**
 * Signup
 * @param firstName string
 * @param lastName string
 * @param email string
 * @param password string
 * @param locale string
 * @returns user
 */
export async function signup (firstName : string, lastName : string, email: string, password : string, locale : string): Promise<CloudDirectoryUser> {
  const user = buildSignupUser(firstName, lastName, email, password);
  const appIdUser = await apiSignup(user, locale);
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
        console.log('----- rollback app_id user -----');
        console.log(rollbackProfile || '');
        console.log('\n');
      } catch (error2) {
        console.log('\n');
        console.log('----- rollback app_id user -----');
        console.log('Failed to rollback app_id.');
        console.log(JSON.stringify(error2));
        console.log('\n');
      }
    }
    throw error;
  }
}

/**
 * Builds the user in the format required by AppID Signup
 * @param firstName string
 * @param lastName string
 * @param email string
 * @param password string
 * @returns user
 */
const buildSignupUser = (firstName : string, lastName : string, email: string, password: string) : SignupUser => {
  return {
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
};
