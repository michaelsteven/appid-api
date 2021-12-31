import { Body, Controller, Post, Response, Route, SuccessResponse } from 'tsoa';
import { ApiError } from '../helpers/errors';
import {
  cloudDirectorySignUp,
  cloudDirectoryProfileRemove,
} from '../apis/appId';
import colors from 'colors';
import _ from 'lodash';

@Route('appid')
export class appIdController extends Controller {
  /**
   * Posts new user.
   */
  @Response<ApiError>(500, 'Failed to create user')
  @SuccessResponse(201, 'Successfully created new user with id')
  @Post('/signup')
  public async createUser (
    @Body()
      body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  ): Promise<void> {
    const { firstName, lastName, email, password } = body;
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

    let profileId;
    let cloudDirectoyID;
    try {
      const appIdUser = await cloudDirectorySignUp(user);
      profileId = _.get(appIdUser, ['profileId']);
      cloudDirectoyID = _.get(appIdUser, ['id']);

      if (profileId) {
        // TODO save id to database

        this.setStatus(200);
        return;
      } else {
        throw new ApiError(500, 'Failed to generate App ID account.');
      }
    } catch (error) {
      if (cloudDirectoyID) {
        try {
          const rollbackProfile = await cloudDirectoryProfileRemove(
            cloudDirectoyID
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
  }
}
