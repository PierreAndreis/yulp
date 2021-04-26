import * as express from 'express';
import { decodeJwt } from '../jwt';
import db from '../db';
import createHttpError from 'http-errors';

const ensureAuthentication: express.Handler = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const jwtDecoded = decodeJwt(req.headers.authorization.replace(/Bearer /, '')) as { aud: string };
      const user = await db.users.findUnique({ where: { id: jwtDecoded.aud } });
      if (!user) throw new createHttpError.Unauthorized('User not found. Please re-login.');

      req.user = user;
      next();
      return;
    } catch (err) {
      throw new createHttpError.Unauthorized('Invalid credentials.');
    }
  }

  throw new createHttpError.Unauthorized('Invalid credentials.');
};

export default ensureAuthentication;
