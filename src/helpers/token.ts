import jwtDecode from 'jwt-decode';
import { Request as ExRequest } from 'express';
import { DecodedToken } from '../appid/models/DecodedToken';

export const getAuthToken = (exRequest: ExRequest): DecodedToken | undefined => {
  const { authorization } = exRequest.headers;
  const token = authorization?.replace(/Bearer (.*)$/, '$1');
  if (token) {
    const decodedToken = jwtDecode(token) as DecodedToken;
    return decodedToken;
  } else {
    return undefined;
  }
};
