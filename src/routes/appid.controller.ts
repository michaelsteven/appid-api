import { Body, Controller, Get, Post, Request, Response, Route, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import { loginWithCredentials } from '../services/userLoginService';
import { signup } from '../services/userSignupService';
import { getUserProfile } from '../services/userProfileService';
import colors from 'colors';

@Route('appid')
export class appIdUserController extends Controller {
  /**
   * Posts new user.
   */
  @Response<ApiError>(500, 'Failed to create user')
  @SuccessResponse(201, 'Successfully created new user with id')
  @Post('/signup')
  public async createUser (
    @Request() exRequest: ExRequest,
    @Body()
      body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  ): Promise<void> {
    const { firstName, lastName, email, password } = body;
    const locale = getLocale(exRequest);
    await signup(firstName, lastName, email, password, locale);
    this.setStatus(201);
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
      const cookieArray = await loginWithCredentials(username, password, exRequest);
      if (cookieArray.length > 0) {
        this.setHeader('Set-Cookie', cookieArray);
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

  /**
   * Get Profile
   */
   @SuccessResponse(200, 'Gets Profile')
   @Get('/profile')
  public async getProfile (
    @Request() exRequest: ExRequest
  ) {
    const { access_token: accessToken, id_token: idToken } = exRequest.cookies;
    return await getUserProfile(accessToken, idToken);
  }
}
