import { Body, Controller, Get, Post, Put, Request, Response, Route, Security, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import { signup, loginWithCredentials, forgotPassword, forgotPasswordConfirmationValidationAndChange, getSupportedLanguages, setSupportedLanguages, getUserProfile, changePassword as svcChangePassword } from '../appid/services';
import { getAuthToken } from '../helpers/token';
import { getUserProfileFromIdentityToken } from '../appid/services/userProfileService';
import { CloudDirectoryUser } from '../appid/models/CloudDirectoryUser';
import { AccessToken } from '../appid/models/AccessToken';

@Route('appid')
export class appIdUserController extends Controller {
  /**
   * Signup - creates a new user
   */
  @Post('/signup')
  @SuccessResponse(201, 'Successfully created new user with id')
  @Response<ApiError>(409, 'The email address is already taken')
  public async createUser (
    @Request() exRequest: ExRequest,
    @Body()
      body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  ): Promise<CloudDirectoryUser> {
    const { firstName, lastName, email, password } = body;
    const locale = getLocale(exRequest);
    return await signup(firstName, lastName, email, password, locale);
  };

  /**
   * Login with Username and Password
   */
  @Post('/login')
  @SuccessResponse(200, 'Successful Login')
  @Response<ApiError>(400, 'Invalid email or password')
  public async loginWithUsernamePassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
      password: string;
    }
  ): Promise<AccessToken> {
    const { username, password } = body;
    return await loginWithCredentials(username, password, exRequest);
  };

  @Post('/forgotpwd')
  @SuccessResponse(201, 'Forgot password email sent')
  @Response(400, 'Bad Request')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  public async forgotPassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
    }
  ) : Promise<CloudDirectoryUser> {
    const { username } = body;
    const locale = getLocale(exRequest);
    return await forgotPassword(username, locale);
  };

  @Post('/forgotpwd/reset')
  @SuccessResponse(200, 'Password is reset')
  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  public async forgotPasswordReset (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
      context: string;
    }
  ) : Promise<CloudDirectoryUser> {
    const { newPassword, context } = body;
    const locale = getLocale(exRequest);
    return await forgotPasswordConfirmationValidationAndChange(newPassword, context, locale);
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
  ) : Promise<CloudDirectoryUser> {
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
    return await svcChangePassword(payload, locale);
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
  ) : Promise<CloudDirectoryUser> {
    const locale = getLocale(exRequest);
    return await svcChangePassword(body, locale);
  }

  /**
   * Get Profile
   */
  @Get('/profile')
  @SuccessResponse(200, 'Gets Profile')
  public getProfile (
    @Request() exRequest: ExRequest
  ) {
    const { access_token: accessToken, id_token: idToken } = exRequest.cookies;
    return getUserProfileFromIdentityToken(accessToken, idToken);
  }

  /**
   * Get Supported Languages
   */
  @Get('/languages')
  @SuccessResponse(200, 'Gets Supported Languages')
  public supportedLanguagesGet (
    @Request() exRequest: ExRequest
  ) {
    const locale = getLocale(exRequest);
    return getSupportedLanguages(locale);
  }

  /**
   * Put Supported Languages
   */
  @Put('/languages')
  @SuccessResponse(200, 'Puts Supported Languages')
  public async supporteedLanguagesPut (
    @Request() exRequest: ExRequest,
    @Body() body: {
      languages: Array<string>;
    }
  ) {
    const locale = getLocale(exRequest);
    return await setSupportedLanguages(body, locale);
  }
};
