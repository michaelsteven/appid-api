import { getLanguages, putLanguages } from '../apis';

export async function getSupportedLanguages (acceptLanguage: string) {
  return await getLanguages(acceptLanguage);
}

export async function putSupportedLanguages (payload: {languages: Array<string>}, acceptLanguage: string) {
  return await putLanguages(payload, acceptLanguage);
};
