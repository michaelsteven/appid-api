import { getSupportedLanguages as apiGetLanguages, putSupportedLanguages as apiPutSupportedLanguages } from '../apis';
import { Languages } from '../models/Languages';

export async function getSupportedLanguages (acceptLanguage: string): Promise<Languages> {
  return await apiGetLanguages(acceptLanguage);
}

export async function setSupportedLanguages (payload: {languages: Array<string>}, acceptLanguage: string):Promise<void> {
  return await apiPutSupportedLanguages(payload, acceptLanguage);
};
