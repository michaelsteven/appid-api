import { Request as ExRequest, } from 'express';

export const getLocale = (exRequest: ExRequest) => {
  return exRequest.getLocale();
};
