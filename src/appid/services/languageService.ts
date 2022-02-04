import { getSupportedLanguages as apiGetLanguages, putSupportedLanguages as apiPutSupportedLanguages } from '../apis';
import { Languages } from '../models';

export function getSupportedLanguages (acceptLanguage: string): Promise<Languages> {
  return apiGetLanguages(acceptLanguage);
}

export function setSupportedLanguages (payload: {languages: Array<string>}, acceptLanguage: string):Promise<void> {
  return apiPutSupportedLanguages(payload, acceptLanguage);
}
