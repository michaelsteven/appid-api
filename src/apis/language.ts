import fetch from 'cross-fetch';
import { handleResponse } from '../helpers/utilities';
import { setBearerToken } from './bearerToken';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../helpers/env';

export const getLanguages = async (acceptLanguage: string) => {
  const bearerToken = await setBearerToken();
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/config/ui/languages`;
  const response = await fetch(`${url}${path}`, options).then((result) => result);
  return handleResponse(response);
};

export const putLanguages = async (payload: {languages: Array<string>}, acceptLanguage: string) => {
  const bearerToken = await setBearerToken();
  const url = APPID_SERVICE_ENDPOINT;
  const path = `/management/v4/${APPID_API_TENANT_ID}/config/ui/languages`;
  const response = await fetch(`${url}${path}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    },
  }).then((result) => result);
  return handleResponse(response);
};
