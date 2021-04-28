import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import createHttpError from 'http-errors';
import ensureRole from '../utils/ensureRole';
import db from './../db';
import ensureAuthentication from './../utils/ensureAuthentication';

const routers = express.Router();

export const REVIEW_SELECT = {
  id: true,
  created_at: true,
  message: true,
  visit_at: true,
  rating: true,
  restaurant_id: true,
  reply: {
    select: {
      id: true,
      message: true,
      created_at: true,
    },
  },
  restaurant: {
    select: {
      name: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

routers.post(
  '/restaurants/:id/reviews',
  ensureAuthentication,
  ensureRole('USER'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      message: Joi.string().required().min(2).max(255),
      rating: Joi.number().min(1).max(5),
      visit_at: Joi.date(),
    }),
  }),
  async (req, res) => {
    const body: { message: string; rating: number; visit_at: string } = req.body;
    const restaurant_id = req.params.id;
    const user = req.user as NonNullable<typeof req.user>;

    const restaurant = await db.restaurants.findUnique({ where: { id: restaurant_id }, include: { reviews: true } });

    if (!restaurant) {
      throw new createHttpError.NotFound('Restaurant not found.');
    }

    const hasNotReviewed = restaurant.reviews.every((review) => review.user_id !== user.id);

    if (!hasNotReviewed) {
      throw new createHttpError.Conflict("You can't review a restaurant more than once.");
    }

    const review = await db.reviews.create({
      data: {
        message: body.message,
        visit_at: body.visit_at,
        rating: body.rating,
        user_id: user.id,
        created_at: new Date(),
        restaurant_id: restaurant.id,
      },
      select: REVIEW_SELECT,
    });

    res.status(200).json(review);
  },
);

routers.get(
  '/reviews',
  ensureAuthentication,
  ensureRole(['ADMIN', 'OWNER']),
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      replied: Joi.boolean(),
    }),
  }),
  async (req, res) => {
    const replied = req.query.replied;
    const user = req.user as NonNullable<typeof req.user>;
    const isOwner = user.role === 'OWNER';

    const reviews = await db.reviews.findMany({
      where: {
        ...(isOwner
          ? {
              restaurant: {
                owner_user_id: user.id,
              },
            }
          : {}),
        ...(typeof replied === 'boolean'
          ? {
              reply: replied
                ? {
                    id: {
                      gt: '1',
                    },
                  }
                : null,
            }
          : {}),
      },
      select: REVIEW_SELECT,
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({ reviews });
  },
);

routers.put(
  '/reviews/:id',
  ensureAuthentication,
  ensureRole('ADMIN'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      message: Joi.string().min(2).max(255),
      rating: Joi.number().min(1).max(5),
      visit_at: Joi.date(),
      replyMessage: Joi.string().min(1).max(255),
    }),
  }),
  async (req, res) => {
    const reviewId = req.params.id;
    const body: { message?: string; rating?: number; visit_at?: Date; replyMessage?: string } = req.body;

    const review = await db.reviews.update({
      where: {
        id: reviewId,
      },
      data: {
        message: body.message,
        rating: body.rating,
        visit_at: body.visit_at,
        ...(body.replyMessage
          ? {
              reply: {
                upsert: {
                  create: {
                    message: body.replyMessage,
                    created_at: new Date(),
                  },
                  update: {
                    message: body.replyMessage,
                  },
                },
              },
            }
          : {}),
      },
      select: REVIEW_SELECT,
    });

    if (!review) {
      throw new createHttpError.NotFound('Review not found.');
    }

    res.status(200).json(review);
  },
);

routers.delete('/reviews/:id', ensureAuthentication, ensureRole('ADMIN'), async (req, res) => {
  const reviewId = req.params.id;

  const review = await db.reviews.delete({
    where: {
      id: reviewId,
    },
    select: REVIEW_SELECT,
  });

  if (!review) {
    throw new createHttpError.NotFound('Review not found.');
  }

  res.status(200).json(review);
});

routers.post(
  '/reviews/:id/reply',
  ensureAuthentication,
  ensureRole('OWNER'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      message: Joi.string().required().min(2).max(255),
    }),
  }),
  async (req, res) => {
    const body: { message: string } = req.body;
    const review_id = req.params.id;
    const user = req.user as NonNullable<typeof req.user>;

    const review = await db.reviews.findUnique({
      where: {
        id: review_id,
      },
      include: {
        restaurant: true,
        reply: true,
      },
    });

    if (!review) {
      throw new createHttpError.NotFound('Review not found.');
    }
    if (review.restaurant.owner_user_id !== user.id) {
      throw new createHttpError.Forbidden("You can't reply to an review from a restaurant you don't own.");
    }
    if (review.reply) {
      throw new createHttpError.Conflict('You have already replied to this review.');
    }

    const updatedReview = await db.reviews.update({
      where: {
        id: review.id,
      },
      data: {
        reply: {
          create: {
            message: body.message,
          },
        },
      },
      select: REVIEW_SELECT,
    });

    res.status(200).json(updatedReview);
  },
);

routers.put(
  '/reviews/:id/reply',
  ensureAuthentication,
  ensureRole('ADMIN'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      message: Joi.string().required().min(2).max(255),
    }),
  }),
  async (req, res) => {
    const reviewId = req.params.id;
    const body: { message: string } = req.body;

    const review = await db.reviews.update({
      where: {
        id: reviewId,
      },
      data: {
        reply: {
          update: {
            message: body.message,
          },
        },
      },
      select: REVIEW_SELECT,
    });

    if (!review) {
      throw new createHttpError.NotFound('Review not found.');
    }

    res.status(200).json(review);
  },
);

routers.delete('/reviews/:id/reply', ensureAuthentication, ensureRole('ADMIN'), async (req, res) => {
  const reviewId = req.params.id;

  const review = await db.reviews.update({
    where: {
      id: reviewId,
    },
    data: {
      reply: {
        delete: true,
      },
    },
    select: REVIEW_SELECT,
  });

  if (!review) {
    throw new createHttpError.NotFound('Review not found.');
  }

  res.status(200).json(review);
});

export default routers;
