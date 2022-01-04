import { Request as ExRequest, } from 'express';
import {
  SUPPORTED_LANGUAGES,
  FALLBACK_LANGUAGE,
} from '../helpers/env';

export const getLocale = (exRequest: ExRequest) => {
  const language = exRequest.acceptsLanguages(SUPPORTED_LANGUAGES ? SUPPORTED_LANGUAGES.split(',') : ['']);
  return language || FALLBACK_LANGUAGE || 'en';
};
