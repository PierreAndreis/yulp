/* eslint-disable import/first */
import { config } from 'dotenv';
config({
  path: '../.env',
});
require('express-async-errors');

import { errors } from 'celebrate';
import cors from 'cors';
import express, { NextFunction } from 'express';
import helmet from 'helmet';
import { isHttpError } from 'http-errors';
import morgan from 'morgan';
import authRouters from './auth/auth.routers';
import restaurantsRouters from './restaurants/restaurants.routers';
import reviewRouters from './reviews/reviews.routers';
import usersRouters from './users/users.routers';

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'common'));
}

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(authRouters);
app.use(restaurantsRouters);
app.use(reviewRouters);
app.use(usersRouters);

app.use(errors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (err: Error, _req: express.Request, res: express.Response, _next: NextFunction) {
  if (isHttpError(err)) {
    // These errors are expected so no need to log it.
    res.status(err.statusCode).send({
      statusCode: err.statusCode,
      error: err.name,
      message: err.message,
    });
    return;
  }

  console.error(err.stack);

  res.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'There was an error in our backend. Please try again later.'
        : err.message,
  });
});

export default app;
