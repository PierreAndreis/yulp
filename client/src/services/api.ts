import type { Restaurants, Reviews, ReviewsReply, Users, Role } from '@prisma/client';
import authorizedRequest, { parse } from './fetch';
import qs from 'query-string';

const BASE_URL = import.meta.env.VITE_API_ENDPOINT ?? '';

export type User = Pick<Users, 'id' | 'name' | 'email' | 'role'>;

export type Review = Pick<Reviews, 'id' | 'message' | 'created_at' | 'rating' | 'restaurant_id'> & {
  reply: Pick<ReviewsReply, 'id' | 'message' | 'created_at'> | null;
  visit_at: string;
  restaurant: Pick<Restaurant, 'name'>;
  user: Pick<Users, 'id' | 'name'>;
};

export type Restaurant = Pick<Restaurants, 'id' | 'name'> & {
  reviews_rating_avg: number;
  reviews_rating_count: number;
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
  restaurants: Array<Restaurant>;
};

type RestaurantsQueries = {
  ratingLeast?: number;
  showOnlyOwned?: boolean;
};

export async function restaurants(params?: RestaurantsQueries): Promise<RestaurantsResponse> {
  return authorizedRequest(`${BASE_URL}/restaurants?${qs.stringify(params ?? {})}`).then(parse);
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

type ReviewsResponse = {
  reviews: Array<Review>;
};

type ReviewsListParams = {
  replied?: boolean;
  showOnlyOwned?: boolean;
};

export async function reviews(params?: ReviewsListParams): Promise<ReviewsResponse> {
  return authorizedRequest(`${BASE_URL}/reviews?${qs.stringify(params || {})}`).then(parse);
}

type ReviewCreateData = {
  message: string;
  rating: number;
  visit_at: string;
  restaurant_id: string;
};

type ReviewCreateResponse = Review;

export async function createReview(data: ReviewCreateData): Promise<ReviewCreateResponse> {
  return authorizedRequest(`${BASE_URL}/reviews`, {
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

// ** ADMIN ENDPOINTS ** //

type UsersListResponse = {
  users: Array<User>;
};

export async function listUsers(): Promise<UsersListResponse> {
  return authorizedRequest(`${BASE_URL}/users`).then(parse);
}

type UserEditData = Partial<Pick<Users, 'name' | 'password' | 'email' | 'role'>>;
export async function editUser(userId: string, data: UserEditData): Promise<User> {
  return authorizedRequest(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(parse);
}

export async function deleteUser(userId: string): Promise<boolean> {
  return authorizedRequest(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  }).then(parse);
}

type RestaurantEditData = Partial<Pick<Restaurant, 'name'>>;

export async function editRestaurant(
  restaurantId: string,
  data: RestaurantEditData,
): Promise<Pick<Restaurant, 'name' | 'id'>> {
  return authorizedRequest(`${BASE_URL}/restaurants/${restaurantId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(parse);
}

export async function deleteRestaurant(restaurantId: string): Promise<Pick<Restaurant, 'name' | 'id'>> {
  return authorizedRequest(`${BASE_URL}/restaurants/${restaurantId}`, {
    method: 'DELETE',
  }).then(parse);
}

type ReviewEditData = Partial<ReviewCreateData> & {
  replyMessage?: null | string;
};

export async function editReview(reviewId: string, data: ReviewEditData): Promise<Review> {
  return authorizedRequest(`${BASE_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(parse);
}

export async function deleteReview(reviewId: string): Promise<Review> {
  return authorizedRequest(`${BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
  }).then(parse);
}
