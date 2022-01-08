import jwtDecode from 'jwt-decode';
import { Request as ExRequest } from 'express';
import { AccessToken } from '../appid/models/AccessToken';

export const getEncodedAccessToken = (exRequest: ExRequest): string | undefined => {
  const { authorization } = exRequest.headers;
  if (authorization) {
    const token = authorization?.replace(/Bearer (.*)$/, '$1');
    if (token) {
      return token;
    }
  }
  return undefined;
};

export const getAccessToken = (exRequest: ExRequest): AccessToken | undefined => {
  const encodedAccessToken = getEncodedAccessToken(exRequest);
  if (encodedAccessToken) {
    return decodeAccessToken(encodedAccessToken);
  } else {
    return undefined;
  }
};

export const decodeAccessToken = (encodedAccessToken: string): AccessToken | undefined => {
  const decodedAccessToken = jwtDecode(encodedAccessToken) as AccessToken;
  return decodedAccessToken;
};

export const getSub = (encodedAccessToken: string): string | undefined => {
  const decodedAccessToken = decodeAccessToken(encodedAccessToken);
  if (decodedAccessToken) {
    const { sub } = decodedAccessToken;
    if (sub) {
      return sub;
    }
  }
  return undefined;
};
