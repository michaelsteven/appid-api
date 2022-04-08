import { Body, Controller, Delete, Get, Path, Post, Put, Query, Request, Response, Route, Security, SuccessResponse, UploadedFile } from 'tsoa';
import { Request as ExRequest, Response as ExResponse, Express } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import * as fs from 'fs';
import path from 'path';
import { bufferToReadable, circleBuffer, getMimeNameFromExt, readRangeHeader, sendBuffer, sendResponse } from '../helpers/fileUtils';

import {
  signup as svcSignup,
  loginWithUsernamePassword as svcLoginWithUsernamePassword,
  forgotPassword,
  forgotPasswordConfirmationValidationAndChange,
  getSupportedLanguages,
  setSupportedLanguages,
  getUserProfile,
  changePassword as svcChangePassword,
  redisSet,
  renewAuthWithRefreshToken,
  revokeRefreshToken as svcRevokeRefreshToken,
  redisRemove,
  getUsers as svcGetUsers,
  getUserRoles as svcGetUsersRoles,
  putUserRoles as svcPutUserRoles,
  getRoles as svcGetRoles,

} from '../appid/services';
import { CloudDirectoryUser, Languages, UserProfile, AuthInfo, IdentityToken, Users, Role } from '../appid/models';
import sharp from 'sharp';

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
  public signup (
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
    return svcSignup(firstName, lastName, email, password, locale);
  }

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
  ): Promise<AuthInfo> {
    const { username, password } = body;
    const responsePayload = await svcLoginWithUsernamePassword(username, password, exRequest);
    if (responsePayload) {
      // set the auth token and client ip in redis
      const uuid = crypto.randomUUID();
      const clientIp = exRequest.headers['x-forwarded-for'] || exRequest.socket.remoteAddress;
      console.log(`the login clientIp is: ${clientIp} `);
      const redisAuthData = JSON.stringify({ clientIp: clientIp, authToken: responsePayload });
      await redisSet(uuid, redisAuthData, 86400); // expire in one day

      // set a cookie in the response header
      const cookieOptions = 'path=/; SameSite=Strict; HttpOnly;';
      this.setHeader('Set-Cookie', `authTicket=${uuid}; ${exRequest.secure ? cookieOptions.concat(' Secure;') : cookieOptions}`);

      // return the AuthInfo object
      const { id_token: encodedIdToken, scope } = responsePayload;
      const { exp, name, given_name: givenName, family_name: familyName } = jwt.decode(encodedIdToken) as IdentityToken;
      return { exp: exp, name: name, givenName: givenName, familyName: familyName, scope: scope };
    }
    return Promise.reject(new ApiError(401, 'login provided an empty response'));
  }

  /**
   * Login with refresh token
   * @param exRequest - the express request
   * @returns Promise<AuthInfo>
   */
  @Post('/login/refresh')
  @SuccessResponse(200, 'Successful Login')
  @Response<ApiError>(400, 'Invalid email or password')
  public async loginWithRefreshToken (
    @Request() exRequest: ExRequest,
  ): Promise<AuthInfo> {
    const newUuid = crypto.randomUUID();
    const authInfo = await renewAuthWithRefreshToken(newUuid, exRequest);
    if (authInfo) { // set a cookie in the response header
      const cookieOptions = 'path=/; SameSite=Strict; HttpOnly;';
      this.setHeader('Set-Cookie', `authTicket=${newUuid}; ${exRequest.secure ? cookieOptions.concat(' Secure;') : cookieOptions}`);
    }
    return authInfo;
  }

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
  public forgotPassword (
    @Request() exRequest: ExRequest,
    @Body() body: {
      username: string;
    }
  ) : Promise<CloudDirectoryUser> {
    const { username } = body;
    const locale = getLocale(exRequest);
    return forgotPassword(username, locale);
  }

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
  public forgotPasswordReset (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
      context: string;
    }
  ) : Promise<CloudDirectoryUser> {
    const { newPassword, context } = body;
    const locale = getLocale(exRequest);
    return forgotPasswordConfirmationValidationAndChange(newPassword, context, locale);
  }

  /**
   * Change Password - For an appid_authenticated user to change their own password.
   * @param exRequest - the express request
   * @param body - {newPassword: string;}
   * @returns Promise<CloudDirectoryUser>
   */
  @Post('/changepwd')
  @Security('cookie', ['appid_authenticated'])
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
    const authTicket = exRequest.cookies.authTicket || '';
    const userProfile = await getUserProfile(authTicket);
    const { identities } = userProfile;
    const { id: uuid } = identities[0];

    // build the payload and change the password
    const { newPassword } = body;
    const payload = { newPassword: newPassword, uuid: uuid };
    const locale = getLocale(exRequest);
    return svcChangePassword(payload, locale);
  }

  /**
   * Change Password for user.  This endpoint is for an administrator to change someone else's password.
   *                            Must be appid_authenticated and an administrator.
   * @param exRequest - the express request
   * @param body {newPassword: string; uuid: string; changedIpAddress?:string; }
   * @returns Promise<CloudDirectoryUser>
   */
  @Post('/changepwdforuser')
  @Security('cookie', ['appid_authenticated', 'administrator'])
  @SuccessResponse(200, 'Successful Login')
  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  public changePasswordForUser (
    @Request() exRequest: ExRequest,
    @Body() body: {
      newPassword: string;
      uuid: string;
      changedIpAddress? : string;
    }
  ) : Promise<CloudDirectoryUser> {
    const locale = getLocale(exRequest);
    return svcChangePassword(body, locale);
  }

  /**
   * Get Profile - for a User to retrieve their own profile
   * @param exRequest - the express request
   * @returns Promise<UserProfile>
   */
  @Get('/profile')
  @Security('cookie', ['appid_authenticated'])
  @SuccessResponse(200, 'Gets Profile')
  public getProfile (
    @Request() exRequest: ExRequest
  ):Promise<UserProfile> {
    const authTicket = exRequest.cookies.authTicket || '';
    return getUserProfile(authTicket);
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
  public supporteedLanguagesPut (
    @Request() exRequest: ExRequest,
    @Body() body: {
      languages: Array<string>;
    }
  ): Promise<void> {
    const locale = getLocale(exRequest);
    return setSupportedLanguages(body, locale);
  }

  /**
   * Logout
   * @param exRequest - the express request
   */
  @Delete('/logout')
  @SuccessResponse(204, 'No Content')
  public async logout (
    @Request() exRequest: ExRequest
  ): Promise<void> {
    if (exRequest.cookies && exRequest.cookies.authTicket) {
      // revoke the refresh token
      try {
        await svcRevokeRefreshToken(exRequest);
      } catch (error) {
        console.log('failed to revoke refresh token', error);
      }
      // remove the redis data
      await redisRemove(exRequest.cookies.authTicket);

      // remove the cookie
      const cookieOptions = 'path=/; SameSite=Strict; HttpOnly;';
      this.setHeader('Set-Cookie', `authTicket=deleted; ${exRequest.secure ? cookieOptions.concat(' Secure;') : cookieOptions} expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    }
  }

  /**
   * Gets users
   * @param startIndex the start index
   * @param count the count
   * @param query the query
   * @returns Promise<Users>
   */
  @Get('/users')
  @SuccessResponse(200, 'Ok')
  @Security('cookie', ['appid_authenticated', 'user_management'])
  public getUsers (
    @Query() startIndex?: number,
    @Query() count?: number,
    @Query() query?: string
  ):Promise<Users> {
    return svcGetUsers({ startIndex: startIndex, count: count, query: query });
  }

  /**
   * Get the roles assigned to a user
   * @param userId the userId
   * @returns Promise<Array<Role>>
   */
  @Get('/users/{userId}/roles')
  @SuccessResponse(200, 'Ok')
  @Security('cookie', ['appid_authenticated', 'user_management'])
  public getUserRoles (
    @Path() userId: string
  ):Promise<Array<Role>> {
    return svcGetUsersRoles(userId);
  }

  @Put('/users/{userId}/roles')
  @SuccessResponse(200, 'Ok')
  @Security('cookie', ['appid_authenticated', 'user_management'])
  public putUserRoles (
    @Path() userId: string,
    @Body() body: {
      roles: Array<string>;
    }
  ):Promise<Array<Role>> {
    return svcPutUserRoles(userId, body.roles);
  }

  @Get('/roles')
  @SuccessResponse(200, 'Ok')
  @Security('cookie', ['appid_authenticated', 'user_management'])
  public getRoles ():Promise<Array<Role>> {
    return svcGetRoles();
  }

  @Get('/profile/avatar')
  @SuccessResponse('200', 'successful')
  public async download (
    @Request() request: any
  ) {
    const response = (<any>request).res as ExResponse;
    // TODO: hardcoding use of a local file until the cloud object storage
    //       is implemented.
    const filePath = path.join(__dirname, '../../foo.png');
    if (!fs.existsSync(filePath)) {
      sendResponse(response, 404, null, null);
      return null;
    }

    const stat: fs.Stats = await fs.promises.stat(filePath);
    const rangeRequest = readRangeHeader(this.getHeader('range'), stat.size);
    const mimeType = getMimeNameFromExt(path.extname(filePath));
    const readStream = fs.createReadStream(filePath);
    sendBuffer(readStream, stat.size, rangeRequest, response, mimeType);
  }

  @Put('/profile/avatar')
  @SuccessResponse('204', 'successful')
  @Response('400', 'invalid data supplied')
  public async uploadProfilePhoto (
    @UploadedFile() data: Express.Multer.File,
  ) {
    // TODO: hardcoding use of a local file until the cloud object storage
    //       is implemented.
    fs.writeFile('foo.png', data.buffer, (err) => {
      if (err) return console.error(err);
    });
  }

  @Get('/profile/avatar/thumbnail')
  public async downloadThumnail (
    @Request() request: any
  ): Promise<void> {
    const response = (<any>request).res as ExResponse;
    // TODO: hardcoding use of a local file until the cloud object storage
    //       is implemented.
    const filePath = path.join(__dirname, '../../foo.png');

    // Check if file exists. If not, will return the 404 'Not Found'.
    if (!fs.existsSync(filePath)) {
      return sendResponse(response, 404, null, null);
    }

    // resize the image and return inner circle
    const buffer = await sharp(filePath)
      .toFormat('png')
      .resize(20, 20)
      .composite([{ input: await circleBuffer, blend: 'dest-in' }])
      .toBuffer();

    // write the buffer into the response
    const range = this.getHeader('range');
    const readable = bufferToReadable(buffer, range);
    const mimeType = getMimeNameFromExt('png');
    sendBuffer(readable, buffer.length, range, response, mimeType);
  }
}
