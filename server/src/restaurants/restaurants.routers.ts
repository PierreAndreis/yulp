import { Prisma, Restaurants } from '@prisma/client';
import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import createHttpError from 'http-errors';
import ensureRole from '../utils/ensureRole';
import db from './../db';
import ensureAuthentication from './../utils/ensureAuthentication';
import { REVIEW_SELECT } from '../reviews/reviews.routers';

const routers = express.Router();

const RESTAURANT_SELECT = {
  id: true,
  name: true,
  owner_user_id: true,
  reviews: {
    select: REVIEW_SELECT,
    orderBy: {
      created_at: 'desc' as const,
    },
  },
};

routers.get('/restaurants/:id', ensureAuthentication, async (req, res) => {
  const restaurant = await db.restaurants.findUnique({
    where: { id: req.params.id },
    select: RESTAURANT_SELECT,
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
      showOnlyOwned: Joi.boolean().default(false),
    }),
  }),
  async (req, res) => {
    const userRole = req.user?.role;
    const ratingLeast = req.query.ratingLeast;

    const showOnlyOwned = userRole === 'OWNER' ? true : req.query.showOnlyOwned;

    const restaurants: Array<
      Pick<Restaurants, 'id' | 'name'> & { reviews_rating_avg: number; reviews_rating_count: number }
    > = await db.$queryRaw`
    SELECT 
      r.id as id,
      r.name as name, 
      COALESCE(AVG(review.rating), 0) as reviews_rating_avg,
      COALESCE(COUNT(review.id), 0) as reviews_rating_count
      FROM "Restaurants" r
        LEFT JOIN "Reviews" review on review.restaurant_id = r.id
      WHERE 1 = 1
      ${showOnlyOwned ? Prisma.sql`AND owner_user_id = ${req.user?.id}` : Prisma.empty}
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
  ensureRole(['OWNER', 'ADMIN']),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().min(3),
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

routers.put(
  '/restaurants/:id',
  ensureAuthentication,
  ensureRole('ADMIN'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string(),
    }),
  }),
  async (req, res) => {
    const restaurantId = req.params.id;
    const body: { name: string } = req.body;

    try {
      const restaurant = await db.restaurants.update({
        where: {
          id: restaurantId,
        },
        data: {
          name: body.name,
        },
        select: RESTAURANT_SELECT,
      });

      res.status(200).json(restaurant);
    } catch (e) {
      if (e.message.includes('Record to update not found')) {
        throw new createHttpError.NotFound('Restaurant not found.');
      }
      throw e;
    }
  },
);

routers.delete('/restaurants/:id', ensureAuthentication, ensureRole('ADMIN'), async (req, res) => {
  const restaurantId = req.params.id;

  // https://github.com/prisma/prisma/issues/2328
  const restaurant: Array<Pick<Restaurants, 'id' | 'name' | 'owner_user_id'>> = await db.$queryRaw`
    DELETE FROM "Restaurants" WHERE id = ${restaurantId} RETURNING id, name owner_user_id
  `;

  if (restaurant.length < 1) {
    throw new createHttpError.NotFound('Restaurant not found.');
  }

  res.status(200).json(restaurant[0]);
});

export default routers;
