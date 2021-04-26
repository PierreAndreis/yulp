import { Role } from '.prisma/client';
import bcryptjs from 'bcryptjs';
import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import createHttpError from 'http-errors';
import ensureAuthentication from '../utils/ensureAuthentication';
import db from './../db';
import { signJwt } from './../jwt';

const routers = express.Router();

routers.get('/me', ensureAuthentication, async (req, res) => {
  const user = await db.users.findUnique({
    where: {
      id: req.user?.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  res.json({ user });
});

routers.post(
  '/register',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().min(3).max(30),
      role: Joi.required().allow(Role.USER, Role.OWNER),
      email: Joi.string().required().email({ minDomainSegments: 2 }).message('Email invalid'),
      password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
        .message('Password must be at least 8 character and max 30.'),
    }),
  }),
  async (req, res) => {
    const body: { name: string; role: Role; email: string; password: string } = req.body;

    const users_with_same_email = await db.users.count({
      where: {
        email: body.email,
      },
    });

    if (users_with_same_email > 0) {
      throw new createHttpError.Conflict('Email already in use.');
    }

    const hashedPassword = await bcryptjs.hash(body.password, 10);
    const user = await db.users.create({
      data: {
        name: body.name,
        role: body.role,
        email: body.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      },
    });

    res.json({
      user,
      token: signJwt(user),
    });
  },
);

routers.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    const body: { email: string; password: string } = req.body;
    const user = await db.users.findUnique({
      where: { email: body.email },
    });

    const isCorrect = await bcryptjs.compare(body.password, user?.password ?? '');

    if (!isCorrect || !user) {
      throw new createHttpError.Unauthorized('Invalid credentials.');
    }

    res.status(200).json({
      token: signJwt(user),
    });
  },
);
export default routers;
