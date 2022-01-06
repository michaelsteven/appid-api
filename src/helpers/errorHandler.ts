import { Express, Request as ExRequest, Response as ExResponse, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { ApiError } from './errors';

export default (app: Express) => {
  app.use(
    (error: any, _request: ExRequest, response: ExResponse, next: NextFunction) => {
      if (error) {
        if (error.status === 401) {
          return response.status(401).json({
            message: error.message
          });
        }

        if (error.status === 404) {
          return response.status(404).json({
            message: error.message
          });
        }

        if (error instanceof ValidateError) {
          console.warn(
            `Caught Validation Error for ${_request.path}:`,
            error.fields
          );
          return response.status(422).json({
            message: 'Validation Failed',
            details: error?.fields,
          });
        }

        if (error instanceof ApiError) {
          console.log(error.message);
          console.log(error.statusCode);
          return response.status(error.statusCode).json({
            message: error.message,
          });
        }

        if (error.status === 500) {
          response.statusCode = 500;
          const msg = {
            error: error.message || 'Unknown Error',
          };
          msg.error = error.name
            ? `${error.name}: ${error.message}`
            : error.message;
          response.end(JSON.stringify(msg));
        }

        // catch all
        if (typeof error.statusCode === 'undefined') {
          console.log(error);
          return response.status(500).json({
            message: 'an unknown error occurred'
          });
        } else {
          return response.status(error.statusCode).json({
            message: error.message,
          });
        }
      }
      next();
    }
  );
};
