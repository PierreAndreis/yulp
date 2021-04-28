import { Users } from '@prisma/client';
import * as jose from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

const key = jose.JWK.asKey(process.env.JWT_SECRET);

export const signJwt = (user: Pick<Users, 'id' | 'email' | 'role'>) => {
  return jose.JWT.sign(
    {
      'user:email': user.email,
      'user:role': user.role,
    },
    key,
    {
      audience: user.id,
      expiresIn: '6 hours',
      header: {
        typ: 'JWT',
      },
    },
  );
};
export const decodeJwt = (jwt: string) => {
  return jose.JWT.verify(jwt, key);
};
