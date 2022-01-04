import express, { Response as ExResponse, Request as ExRequest } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import errorHandler from './helpers/errorHandler';
import { checkRequiredEnvironmentVariables, PORT } from './helpers/env';
import { RegisterRoutes } from '../build/routes';
checkRequiredEnvironmentVariables();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

/* liveness and health */
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'UP' });
});
app.get('/liveness', (req, res) => {
  res.status(200).send({ status: 'UP' });
});

// Swagger UI implementation
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import('../build/swagger.json'))
  );
});

RegisterRoutes(app);
errorHandler(app);

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

export { app };
