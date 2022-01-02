import { Body, Controller, Post, Request, Response, Route, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import {
  cloudDirectorySignUp,
  cloudDirectoryProfileRemove,
  login,
} from '../apis';
import colors from 'colors';
import _ from 'lodash';

@Route('appid')
export class appIdUserController extends Controller {
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
      const appIdUser = cloudDirectorySignUp(user);
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

  /**
   * Login with Username and Password
   */
  @Response<ApiError>(500, 'Failed to login')
  @SuccessResponse(200, 'Successful Login')
  @Post('/login')
  public async loginWithUsernamePassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
      password: string;
    }
  ): Promise<string> {
    const { username, password } = body;
    try {
      const responsePayload = await login(username, password);
      if (responsePayload) {
        const authToken = JSON.stringify(responsePayload);
        const cookieOptions = 'path=/; SameSite=Strict;'; // not setting HttpOnly because client will read cookie with javascript
        this.setHeader('Set-Cookie', `authToken=${authToken}; ${exRequest.secure ? cookieOptions.concat(' Secure;') : cookieOptions}`);
        this.setStatus(200);
        return 'success';
      } else {
        console.log('An error occurred');
        throw new ApiError(500, 'Failed to log into App ID account.');
      }
    } catch (error) {
      console.log('\n');
      console.log(colors.red(JSON.stringify(error)));
      console.log('\n');
      throw error;
    }
  }
}
