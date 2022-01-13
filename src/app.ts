import express, { Response as ExResponse, Request as ExRequest } from 'express';
import bodyParser from 'body-parser';
import { I18n } from 'i18n';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import errorHandler from './helpers/errorHandler';
import { checkRequiredEnvironmentVariables, PORT } from './helpers/env';
import { RegisterRoutes } from '../build/routes';

// verify required environment variables are present, and fail to start if absent
checkRequiredEnvironmentVariables();

// configure i18n
const i18n = new I18n();
i18n.configure({
  locales: ['en', 'fr_FR', 'fr_CA'],
  directory: path.join(__dirname, 'locales'),
  logWarnFn: function (msg): void {
    console.log('warn', msg);
  },
  defaultLocale: 'en',
  retryInDefaultLocale: false,
});

// add express middleware
const app = express();
app.use(i18n.init);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import('../build/swagger.json'))
  );
});

/* liveness and health */
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'UP' });
});
app.get('/liveness', (req, res) => {
  res.status(200).send({ status: 'UP' });
});

// register tsoa routes
RegisterRoutes(app);

// wire in error handling
errorHandler(app);

// start the server
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

export { app };
