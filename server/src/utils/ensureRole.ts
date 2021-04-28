import { Role } from '.prisma/client';
import * as express from 'express';
import createHttpError from 'http-errors';

const ensureRole: (allowedRole: Role | Array<Role>) => express.Handler = (allowedRole) => async (req, _, next) => {
  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  const user = req.user;
  if (!user) throw new createHttpError.Unauthorized('Invalid credentials');
  if (!allowedRoles.includes(user.role)) throw new createHttpError.Forbidden("You can't access this endpoint.");

  next();
};

export default ensureRole;
