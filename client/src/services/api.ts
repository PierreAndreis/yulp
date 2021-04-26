import { Restaurants, Reviews, ReviewsReply, Users, Role } from '@prisma/client';
import authorizedRequest, { parse } from './fetch';

const BASE_URL = 'http://localhost:1234';

type User = Pick<Users, 'id' | 'name' | 'email' | 'role'>;

export type Review = Pick<Reviews, 'id' | 'message' | 'created_at' | 'rating' | 'restaurant_id'> & {
  reply: Pick<ReviewsReply, 'id' | 'message' | 'created_at'> | null;
  visit_at: string;
  user: Pick<Users, 'id' | 'name'>;
};

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export async function login(data: LoginData): Promise<LoginResponse> {
  return authorizedRequest(BASE_URL + '/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(parse);
}

type RegisterData = {
  name: string;
  password: string;
  email: string;
  role: Role;
};

type RegisterResponse = {
  token: string;
  user: User;
};

export async function register(data: RegisterData): Promise<RegisterResponse> {
  return authorizedRequest(BASE_URL + '/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(parse);
}

type MeResponse = {
  user: User;
};

export async function me(): Promise<MeResponse> {
  return authorizedRequest(BASE_URL + '/me').then(parse);
}

type RestaurantsResponse = {
  restaurants: Array<Pick<Restaurants, 'id' | 'name'> & { reviews_rating_avg: number; reviews_rating_count: number }>;
};

export async function restaurants(): Promise<RestaurantsResponse> {
  return authorizedRequest(BASE_URL + '/restaurants').then(parse);
}

export type RestaurantsDetailsResponse = Pick<Restaurants, 'id' | 'name' | 'owner_user_id'> & {
  reviews: Array<Review>;
};
export async function restaurantsDetails(id: string): Promise<RestaurantsDetailsResponse> {
  return authorizedRequest(`${BASE_URL}/restaurants/${id}`).then(parse);
}

export type CreateRestaurantData = {
  name: string;
};

type CreateRestaurantResponse = Pick<Restaurants, 'id' | 'name' | 'created_at'>;

export async function createRestaurant(data: CreateRestaurantData): Promise<CreateRestaurantResponse> {
  return authorizedRequest(BASE_URL + '/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(parse);
}

type ReviewCreateData = {
  message: string;
  rating: number;
  visit_at: string;
};

type ReviewCreateResponse = Review;

export async function createReview(id: string, data: ReviewCreateData): Promise<ReviewCreateResponse> {
  return authorizedRequest(`${BASE_URL}/restaurants/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(parse);
}

type ReviewReplyData = {
  message: string;
};

type ReviewReplyResponse = Review;

export async function replyReview(reviewId: string, data: ReviewReplyData): Promise<ReviewReplyResponse> {
  return authorizedRequest(`${BASE_URL}/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(parse);
}
