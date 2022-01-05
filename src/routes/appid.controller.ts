import { Body, Controller, Get, Post, Put, Request, Response, Route, SuccessResponse } from 'tsoa';
import { Request as ExRequest, } from 'express';
import { ApiError } from '../helpers/errors';
import { getLocale } from '../helpers/locale';
import { signup, loginWithCredentials, forgotPassword, getSupportedLanguages, setSupportedLanguages, getUserProfile } from '../appid/services';
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
  ): Promise<any> {
    const { firstName, lastName, email, password } = body;
    const locale = getLocale(exRequest);
    const response = await signup(firstName, lastName, email, password, locale);
    this.setStatus(201);
    return response;
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

  @Response(400, 'The request body is missing or invalid')
  @Response(401, 'The user is unauthorized.')
  @Response(403, 'Insufficient permissions.')
  @Response(409, 'User account not verified.')
  @SuccessResponse(200, 'Successful Login')
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
    return getUserProfile(accessToken, idToken);
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
}
