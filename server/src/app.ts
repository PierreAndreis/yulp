import { config } from 'dotenv';
config();

import express, { NextFunction } from 'express';
require('express-async-errors');
import { errors, isCelebrateError } from 'celebrate';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRouters from './auth/auth.routers';
import restaurantsRouters from './restaurants/restaurants.routers';
import { isHttpError } from 'http-errors';

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'common'));
}

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(authRouters);
app.use(restaurantsRouters);

app.use(errors());

app.use(function (err: Error, _: express.Request, res: express.Response, next: NextFunction) {
  if (isHttpError(err)) {
    // These errors are expected so no need to log it.
    res.status(err.statusCode).send({
      statusCode: err.statusCode,
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Sometimes during tests we expect the errors
  // and this console error is annoying
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }

  res.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

export default app;
