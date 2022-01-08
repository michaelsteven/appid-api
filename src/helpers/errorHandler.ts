import { Express, Request as ExRequest, Response as ExResponse, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { ApiError } from './errors';

export default (app: Express) => {
  app.use(
    (error: any, exRequest: ExRequest, response: ExResponse, next: NextFunction) => {
      if (error) {
        // api error, most common
        if (error instanceof ApiError) {
          console.warn(`ApiError: ${exRequest.path} ${error.statusCode} ${error.message}`);
          return response.status(error.statusCode).json({
            message: exRequest.__(`${exRequest.path.replace('/', '').replaceAll('/', '.')}.error.${error.statusCode}`),
          });
        }

        // tsoa/express api call validation error
        if (error instanceof ValidateError) {
          console.warn(`ValidationError: ${exRequest.path}:`, error.fields);
          return response.status(422).json({
            message: exRequest.__('error.validationfailed'),
            details: error?.fields,
          });
        }

        // catch all
        if (typeof error.statusCode === 'undefined') {
          console.warn(`Error: ${exRequest.path} undefined error`);
          return response.status(500).json({
            message: exRequest.__('error.undefined'),
          });
        } else {
          console.warn(`Error: ${exRequest.path} ${error.statusCode} ${error.message}`);
          return response.status(error.statusCode).json({
            message: exRequest.__(`${exRequest.path.replace('/', '').replaceAll('/', '.')}.error.${error.statusCode}`),
          });
        }
      }
      next();
    }
  );
};
