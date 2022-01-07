export class ApiError extends Error {
  statusCode: number;
  locale? : string;
  constructor (statusCode: number, message?: string, locale?: string) {
    super(message);
    this.statusCode = statusCode;
    this.locale = locale;
  }
}
