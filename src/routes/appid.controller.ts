import { Body, Controller, Get, Post, Put, Request, Response, Route, Security, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import {
  signup as svcSignup,
  loginWithUsernamePassword as svcLoginWithUsernamePassword,
  loginWithRefreshToken as svcLoginWithRefreshToken,
  forgotPassword,
  forgotPasswordConfirmationValidationAndChange,
  getSupportedLanguages,
  setSupportedLanguages,
  getUserProfile,
  changePassword as svcChangePassword,
} from '../appid/services';
import { getEncodedAccessToken } from '../appid/helpers/token';
import { CloudDirectoryUser } from '../appid/models/CloudDirectoryUser';
import { AccessToken } from '../appid/models/AccessToken';
import { Languages } from '../appid/models/Languages';
import { UserProfile } from '../appid/models/UserProfile';

/**
 * AppId Controller
 */
@Route('appid')
export class appIdController extends Controller {
  /**
   * Signup - User signup/registration
   * @param exRequest - the express request
   * @param body SignupUser
   * @returns Promise<CloudDirectoryUser>
   */
  @Post('/signup')
  @SuccessResponse(201, 'Successfully created new user with id')
  @Response<ApiError>(409, 'The email address is already taken')
  public async signup (
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
    return await svcSignup(firstName, lastName, email, password, locale);
  };

  /**
   * Login - Authenticates a user and returns the the required tokens.
   * @param exRequest - the express request
   * @param body <username: string; password: string;>
   * @returns Promise<AccessToken>
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
    return await svcLoginWithUsernamePassword(username, password, exRequest);
  };

  @Post('/login/refresh')
  @SuccessResponse(200, 'Successful Login')
  @Response<ApiError>(400, 'Invalid email or password')
  public async loginWithRefreshToken (
    @Request() exRequest: ExRequest,
    @Body() body: {
      refreshToken: string;
      accessToken?: string;
    }
  ): Promise<AccessToken> {
    const { refreshToken, accessToken } = body;
    return await svcLoginWithRefreshToken(refreshToken, exRequest, accessToken);
  };

  /**
   * Forgot Password - Starts the password reset process by sending the forgot password email.
   * @param exRequest the express request
   * @param body username
   * @returns Promise<CloudDirectoryUser>
   */
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

  /**
   * Forgot Password Reset - Validates the context supplied by the forgot password email
   *                         then resets the password to the newPassword value.
   * @param exRequest - the express request
   * @param body {newPassword: string; context:string;}
   * @returns Promise<CloudDirectoryUser>
   */
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

  /**
   * Change Password - For an appid_authenticated user to change their own password.
   * @param exRequest - the express request
   * @param body - {newPassword: string;}
   * @returns Promise<CloudDirectoryUser>
   */
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
    // get the identity id from the user profile
    const encodedAccessToken = getEncodedAccessToken(exRequest) || '';
    const userProfile = await getUserProfile(encodedAccessToken);
    const { identities } = userProfile;
    const { id: uuid } = identities[0];

    // build the payload and change the password
    const { newPassword } = body;
    // const clientIp = exRequest.socket.remoteAddress;
    const payload = { newPassword: newPassword, uuid: uuid };
    const locale = getLocale(exRequest);
    return await svcChangePassword(payload, locale);
  };

  /**
   * Change Password for user.  This endpoint is for an administrator to change someone else's password.
   *                            Must be appid_authenticated and an administrator.
   * @param exRequest - the express request
   * @param body {newPassword: string; uuid: string; changedIpAddress?:string; }
   * @returns Promise<CloudDirectoryUser>
   */
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
   * Get Profile - for a User to retrieve their own profile
   * @param exRequest - the express request
   * @returns Promise<UserProfile>
   */
  @Get('/profile')
  @Security('jwt', ['appid_authenticated'])
  @SuccessResponse(200, 'Gets Profile')
  public getProfile (
    @Request() exRequest: ExRequest
  ):Promise<UserProfile> {
    const encodedAccessToken = getEncodedAccessToken(exRequest) || '';
    return getUserProfile(encodedAccessToken);
  }

  /**
   * Get Languages - Get supported languages set in the appid instance.
   * @param exRequest -- the express request
   * @returns Promise<Languages>
   */
  @Get('/languages')
  @SuccessResponse(200, 'Gets Supported Languages')
  public supportedLanguagesGet (
    @Request() exRequest: ExRequest
  ): Promise<Languages> {
    const locale = getLocale(exRequest);
    return getSupportedLanguages(locale);
  }

  /**
   * Put Languages - Sets the supported languages for the appid instance.
   *                 Must be appid_authenticated and an administrator
   * @param exRequest - the express request
   * @param body Languages
   * @returns void
   */
  @Put('/languages')
  @Security('jwt', ['appid_authenticated', 'administrator'])
  @SuccessResponse(204, 'No Content')
  public async supporteedLanguagesPut (
    @Request() exRequest: ExRequest,
    @Body() body: {
      languages: Array<string>;
    }
  ): Promise<void> {
    const locale = getLocale(exRequest);
    return await setSupportedLanguages(body, locale);
  }
};
