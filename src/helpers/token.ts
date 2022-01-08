import jwtDecode from 'jwt-decode';
import { Request as ExRequest } from 'express';
import { AccessToken } from '../appid/models/AccessToken';

export const getAuthToken = (exRequest: ExRequest): AccessToken | undefined => {
  const { authorization } = exRequest.headers;
  const token = authorization?.replace(/Bearer (.*)$/, '$1');
  if (token) {
    const decodedToken = jwtDecode(token) as AccessToken;
    return decodedToken;
  } else {
    return undefined;
  }
};
