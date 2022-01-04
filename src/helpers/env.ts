import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const IBMCLOUD_API_KEY = process.env.IBMCLOUD_API_KEY;
export const APPID_SERVICE_ENDPOINT = process.env.APPID_SERVICE_ENDPOINT;
export const APPID_API_TENANT_ID = process.env.APPID_API_TENANT_ID;
export const APPID_CLIENT_ID = process.env.APPID_CLIENT_ID;
export const APPID_SECRET = process.env.APPID_SECRET;
export const FALLBACK_LANGUAGE = process.env.FALLBACK_LANGUAGE;
export const SUPPORTED_LANGUAGES = process.env.SUPPORTED_LANGUAGES;
export const USE_REFRESH_TOKEN = process.env.USE_REFRESH_TOKEN;
export const REFRESH_TOKEN_DAYS = process.env.REFRESH_TOKEN_DAYS;

export const checkRequiredEnvironmentVariables = () => {
  const requiredEnvironmentVars = [
    'IBMCLOUD_API_KEY',
    'APPID_SERVICE_ENDPOINT',
    'APPID_API_TENANT_ID',
    'APPID_CLIENT_ID',
    'APPID_SECRET',
    'FALLBACK_LANGUAGE',
    'SUPPORTED_LANGUAGES',
    'USE_REFRESH_TOKEN',
  ];
  if (USE_REFRESH_TOKEN === 'true') {
    requiredEnvironmentVars.push('REFRESH_TOKEN_DAYS');
  }

  let missingCount = 0;
  requiredEnvironmentVars.forEach((envVar) => {
    if (!(envVar in process.env)) {
      console.log(
        colors.red(
          `----- REQUIRED ENVIRONMENT VARIABLE ${envVar} IS MISSING -----`
        )
      );
      missingCount++;
    }
  });
  if (missingCount > 0) {
    throw new Error('Missing required environment variable(s)');
  }
};
