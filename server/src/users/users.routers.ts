import { Role } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import createHttpError from 'http-errors';
import ensureRole from '../utils/ensureRole';
import db from './../db';
import ensureAuthentication from './../utils/ensureAuthentication';

const routers = express.Router();

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
};

routers.get('/users', ensureAuthentication, ensureRole('ADMIN'), async (_, res) => {
  const users = await db.users.findMany({
    select: ADMIN_USER_SELECT,
    orderBy: {
      role: 'asc' as const,
    },
  });

  res.status(200).json({ users });
});

routers.put(
  '/users/:id',
  ensureAuthentication,
  ensureRole('ADMIN'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(3).max(30),
      role: Joi.allow(Role.USER, Role.OWNER, Role.ADMIN),
      email: Joi.string().email({ minDomainSegments: 2 }).message('Email invalid'),
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
        .message('Password must be at least 8 character and max 30.'),
    }),
  }),
  async (req, res) => {
    const body: { name?: string; role?: Role; email?: string; password?: string } = req.body;
    const myUserId = req.user?.id;
    const userId = req.params.id;

    if (myUserId && userId && body.role !== Role.ADMIN) {
      throw new createHttpError.Forbidden('You are not allowed to change your own role out of admin.');
    }

    let passwordHashed;
    if (body.password) {
      passwordHashed = await bcryptjs.hash(body.password, 10);
    }

    const user = await db.users.update({
      where: {
        id: userId,
      },
      data: {
        name: body.name,
        email: body.email,
        password: passwordHashed,
        role: body.role,
      },
      select: ADMIN_USER_SELECT,
    });

    if (!user) {
      throw new createHttpError.NotFound('User not found.');
    }

    res.status(200).json(user);
  },
);

routers.delete('/users/:id', ensureAuthentication, ensureRole('ADMIN'), async (req, res) => {
  const userId = req.params.id;
  const myUserId = req.user?.id;

  if (myUserId === userId) {
    throw new createHttpError.Forbidden('You are not allowed to delete yourself.');
  }

  const [, userCount] = await db.$transaction([
    db.restaurants.updateMany({
      data: {
        owner_user_id: myUserId,
      },
      where: {
        owner_user_id: userId,
      },
    }),

    // https://github.com/prisma/prisma/issues/2328
    db.$executeRaw`
    DELETE FROM "public"."Users" WHERE id = ${userId}
  `,
  ]);

  if (userCount === 0) {
    throw new createHttpError.NotFound('User not found.');
  }

  res.status(204).end();
});

export default routers;
