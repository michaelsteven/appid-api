import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const IBMCLOUD_API_KEY = process.env.IBMCLOUD_API_KEY;
export const APPID_SERVICE_ENDPOINT = process.env.APPID_SERVICE_ENDPOINT;
export const APPID_API_TENANT_ID = process.env.APPID_API_TENANT_ID;

export const checkRequiredEnvironmentVariables = () => {
  const requiredEnvironmentVars = [
    'IBMCLOUD_API_KEY',
    'APPID_SERVICE_ENDPOINT',
    'APPID_API_TENANT_ID',
  ];
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
