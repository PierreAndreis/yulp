import { Role } from '.prisma/client';
import * as express from 'express';
import createHttpError from 'http-errors';

const ensureRole: (role: Role) => express.Handler = (role: Role) => async (req, _, next) => {
  const user = req.user;
  if (!user) throw new createHttpError.Unauthorized('Invalid credentials');
  if (user.role !== role) throw new createHttpError.Forbidden("You can't access this endpoint.");

  next();
};

export default ensureRole;
