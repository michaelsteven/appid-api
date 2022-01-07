import { Body, Controller, Get, Post, Put, Request, Response, Route, Security, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import { signup, loginWithCredentials, forgotPassword, forgotPasswordConfirmationValidationAndChange, getSupportedLanguages, setSupportedLanguages, getUserProfile, changePassword as svcChangePassword } from '../appid/services';
import colors from 'colors';
import { getAuthToken } from '../helpers/token';
import { getUserProfileFromIdentityToken } from '../appid/services/userProfileService';

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
  ): Promise<any> {
    const { firstName, lastName, email, password } = body;
    const locale = getLocale(exRequest);
    const response = await signup(firstName, lastName, email, password, locale);
    this.setStatus(201);
    return response;
  };

  /**
   * Login with Username and Password
   */
  @Post('/login')
  @Response<ApiError>(500, 'Failed to login')
  @SuccessResponse(200, 'Successful Login')
  public async loginWithUsernamePassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
      password: string;
    }
  ): Promise<string> {
    const { username, password } = body;
    try {
      const response = await loginWithCredentials(username, password, exRequest);
      if (response) {
        return response;
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
  };

  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  @SuccessResponse(201, 'Forgot password email sent')
  @Post('/forgotpwd')
  public async forgotPassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
    }
  ) : Promise<string> {
    const { username } = body;
    const locale = getLocale(exRequest);
    const jsonResponse = await forgotPassword(username, locale);
    this.setStatus(201);
    return JSON.stringify(jsonResponse);
  };

  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  @SuccessResponse(200, 'Password is reset')
  @Post('/forgotpwd/reset')
  public async forgotPasswordReset (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
      context: string;
    }
  ) : Promise<string> {
    const { newPassword, context } = body;
    const locale = getLocale(exRequest);
    const cloudDirectoryUser = await forgotPasswordConfirmationValidationAndChange(newPassword, context, locale);
    this.setStatus(200);
    return JSON.stringify(cloudDirectoryUser);
  };

  @Post('/changepwd')
  @Security('jwt', ['appid_authenticated'])
  @SuccessResponse(200, 'Successful Login')
  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  public async changePassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
    }
  ) : Promise<string> {
    // get the sub from the auth token
    const authToken = getAuthToken(exRequest);
    if (!authToken) {
      throw new ApiError(401, 'Unauthorized');
    }
    const { sub } = authToken;

    // get the identity id from the user profile using the sub
    const userProfile = await getUserProfile(sub);
    const { identities } = userProfile;
    const { id: uuid } = identities[0];

    // build the payload
    const { newPassword } = body;
    // const clientIp = exRequest.socket.remoteAddress;
    const payload = { newPassword: newPassword, uuid: uuid };
    const locale = getLocale(exRequest);

    // change the password
    const cloudDirectoryUser = await svcChangePassword(payload, locale);
    this.setStatus(200);
    return JSON.stringify(cloudDirectoryUser);
  };

  @Post('/changepwdforuser')
  @Security('jwt', ['appid_authenticated', 'administrator'])
  @SuccessResponse(200, 'Successful Login')
  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  public async changePasswordForUser (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
      uuid: string;
      changedIpAddress? : string;
    }
  ) : Promise<string> {
    const locale = getLocale(exRequest);
    const cloudDirectoryUser = await svcChangePassword(body, locale);
    this.setStatus(200);
    return JSON.stringify(cloudDirectoryUser);
  }

  /**
   * Get Profile
   */
  @SuccessResponse(200, 'Gets Profile')
  @Get('/profile')
  public getProfile (
    @Request() exRequest: ExRequest
  ) {
    const { access_token: accessToken, id_token: idToken } = exRequest.cookies;
    return getUserProfileFromIdentityToken(accessToken, idToken);
  }

  /**
   * Get Supported Languages
   */
  @SuccessResponse(200, 'Gets Supported Languages')
  @Get('/languages')
  public supportedLanguagesGet (
    @Request() exRequest: ExRequest
  ) {
    const locale = getLocale(exRequest);
    return getSupportedLanguages(locale);
  }

  /**
   * Put Supported Languages
   */
  @SuccessResponse(200, 'Puts Supported Languages')
  @Put('/languages')
  public async supporteedLanguagesPut (
    @Request() exRequest: ExRequest,
    @Body() body: {
      languages: Array<string>;
    }
  ) {
    const locale = getLocale(exRequest);
    const jsonResponse = await setSupportedLanguages(body, locale);
    this.setStatus(200);
    return jsonResponse;
  }
};
