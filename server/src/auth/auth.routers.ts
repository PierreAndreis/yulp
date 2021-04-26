import bcryptjs from 'bcryptjs';
import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { signJwt } from './../jwt';
import db from './../db';
import ensureAuthentication from '../utils/ensureAuthentication';
import { STATUS_CODES } from 'http';
import createHttpError from 'http-errors';

const routers = express.Router();

routers.get('/me', ensureAuthentication, async (req, res) => {
  const user = await db.users.findUnique({
    where: {
      id: req.user?.id,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  res.json({ user });
});

routers.post(
  '/register',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required().alphanum().min(3).max(30),
      email: Joi.string().required().email({ minDomainSegments: 2 }).message('Email invalid'),
      password: Joi.string()
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
        .message('Password must be at least 8 character and max 30.'),
    }),
  }),
  async (req, res) => {
    const body: { username: string; email: string; password: string } = req.body;

    const countWithUsername = await db.users.count({
      where: {
        username: body.username,
      },
    });

    if (countWithUsername > 0) {
      throw new createHttpError.Conflict('Username already in use.');
    }

    const countWithEmail = await db.users.count({
      where: {
        OR: [
          {
            email: body.email,
          },
          {
            username: body.username,
          },
        ],
      },
    });

    if (countWithEmail > 0) {
      throw new createHttpError.Conflict('Email already in use.');
    }

    const hashedPassword = await bcryptjs.hash(body.password, 10);
    const user = await db.users.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
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
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    const body: { username: string; password: string } = req.body;
    const user = await db.users.findUnique({
      where: { username: body.username },
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
