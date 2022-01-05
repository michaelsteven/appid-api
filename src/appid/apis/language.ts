import { awaitFetch } from '../../helpers/utilities';
import { setBearerToken } from './bearerToken';
import {
  APPID_SERVICE_ENDPOINT,
  APPID_API_TENANT_ID,
} from '../../helpers/env';

export const getSupportedLanguages = async (acceptLanguage: string) => {
  const bearerToken = await setBearerToken();
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/config/ui/languages`;
  return awaitFetch(url, options);
};

export const putSupportedLanguages = async (payload: {languages: Array<string>}, acceptLanguage: string) => {
  const bearerToken = await setBearerToken();
  const url = `${APPID_SERVICE_ENDPOINT}/management/v4/${APPID_API_TENANT_ID}/config/ui/languages`;
  const options = {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Language': acceptLanguage,
    }
  };
  return awaitFetch(url, options);
};
