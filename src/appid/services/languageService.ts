import { getSupportedLanguages as apiGetLanguages, putSupportedLanguages as apiPutSupportedLanguages } from '../apis';

export async function getSupportedLanguages (acceptLanguage: string) {
  return await apiGetLanguages(acceptLanguage);
}

export async function setSupportedLanguages (payload: {languages: Array<string>}, acceptLanguage: string) {
  return await apiPutSupportedLanguages(payload, acceptLanguage);
};
