import { Body, Controller, Post, Response, Route, SuccessResponse } from 'tsoa';
import { ApiError } from '../helpers/errors';
import { login } from '../apis';
import colors from 'colors';

@Route('appid')
export class appIdController extends Controller {
  /**
   * Posts new user.
   */
  @Response<ApiError>(500, 'Failed to login')
  @SuccessResponse(200, 'Successful Login')
  @Post('/login')
  public async loginWithUsernamePassword (
    @Body()
      body: {
      username: string;
      password: string;
      redirectUri: string;
    }
  ): Promise<void> {
    const { username, password, redirectUri } = body;
    try {
      const responsePayload = await login(username, password, redirectUri);
      if (responsePayload) {
        console.log(JSON.stringify(responsePayload));
        this.setStatus(200);
        return;
      } else {
        throw new ApiError(500, 'Failed to log into App ID account.');
      }
    } catch (error) {
      console.log('\n');
      console.log(colors.bold('----- rollback app_id user -----'));
      console.log(colors.red('Failed to rollback app_id.'));
      console.log(colors.red(JSON.stringify(error)));
      console.log('\n');
      throw error;
    }
  }
}
