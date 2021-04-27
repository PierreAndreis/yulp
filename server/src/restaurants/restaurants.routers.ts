import { Prisma, Restaurants, Role } from '@prisma/client';
import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import createHttpError from 'http-errors';
import ensureRole from '../utils/ensureRole';
import db from './../db';
import ensureAuthentication from './../utils/ensureAuthentication';

const routers = express.Router();

routers.get('/restaurants/:id', ensureAuthentication, async (req, res) => {
  const restaurant = await db.restaurants.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      owner_user_id: true,
      reviews: {
        select: {
          id: true,
          created_at: true,
          message: true,
          visit_at: true,
          rating: true,
          reply: {
            select: {
              id: true,
              message: true,
              created_at: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });

  if (!restaurant) {
    throw new createHttpError.NotFound('Restaurant not found.');
  }

  res.status(200).json(restaurant);
});

routers.get(
  '/restaurants',
  ensureAuthentication,
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      ratingLeast: Joi.number().min(0).max(5),
    }),
  }),
  async (req, res) => {
    const isOwner = req.user?.role === 'OWNER';

    const ratingLeast = req.query.ratingLeast;

    const restaurants: Array<
      Pick<Restaurants, 'id' | 'name'> & { reviews_rating_avg: number; reviews_rating_count: number }
    > = await db.$queryRaw`
    SELECT 
      r.id as id,
      r.name as name, 
      COALESCE(AVG(review.rating), 0) as reviews_rating_avg,
      COALESCE(COUNT(review.id), 0) as reviews_rating_count
      FROM public."Restaurants" r
        LEFT JOIN public."Reviews" review on review.restaurant_id = r.id
      WHERE 1 = 1
      ${isOwner ? Prisma.sql`AND owner_user_id = ${req.user?.id}` : Prisma.empty}
      GROUP BY r.id
      ${
        typeof ratingLeast !== 'undefined'
          ? Prisma.sql`HAVING COALESCE(AVG(review.rating), 0) >= ${ratingLeast}`
          : Prisma.empty
      }
      ORDER BY reviews_rating_avg DESC`;

    res.json({ restaurants });
  },
);

routers.post(
  '/restaurants',
  ensureAuthentication,
  ensureRole(Role.OWNER),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
    }),
  }),
  async (req, res) => {
    const body: { name: string } = req.body;
    const restaurant = await db.restaurants.create({
      data: { name: body.name, owner_user: { connect: { id: req.user?.id } } },
    });

    res.status(201).json(restaurant);
  },
);

export default routers;
