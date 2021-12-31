import { Express, Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { ApiError } from './errors';

export default (app: Express) => {
  app.use(
    (error: any, _request: Request, response: Response, next: NextFunction) => {
      if (error) {
        if (error.status === 401) {
          response.statusCode = 401;
          const msg = {
            error: error.message || 'Unauthorized',
          };
          msg.error = error.name
            ? `${error.name}: ${error.message}`
            : error.message;
          response.end(JSON.stringify(msg));
        }

        if (error.status === 404) {
          response.statusCode = 404;
          const msg = {
            error: error.message || 'Not Found',
          };
          msg.error = error.name
            ? `${error.name}: ${error.message}`
            : error.message;
          response.end(JSON.stringify(msg));
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
      }
      next();
    }
  );
};
