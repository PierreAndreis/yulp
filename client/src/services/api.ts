import { Role, Restaurants, Reviews, ReviewsReply, Users } from '@prisma/client';
import authorizedRequest, { parse } from './fetch';

const BASE_URL = 'http://localhost:1234';

type User = Pick<Users, 'id' | 'email' | 'username' | 'role'>;

export type Review = Pick<Reviews, 'id' | 'message' | 'created_at' | 'visit_at' | 'rating'> & {
  reply: Pick<ReviewsReply, 'id' | 'message' | 'created_at'> | null;
  user: Pick<Users, 'id' | 'username'>;
};

type LoginData = {
  username: string;
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
  username: string;
  password: string;
  email: string;
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

export type RestaurantsDetailsResponse = Pick<Restaurants, 'id' | 'name'> & {
  reviews: Array<Review>;
};
export async function restaurantsDetails(id: string): Promise<RestaurantsDetailsResponse> {
  return authorizedRequest(`${BASE_URL}/restaurants/${id}`).then(parse);
}
