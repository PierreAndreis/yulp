import { Users } from '@prisma/client';
import * as jose from 'jose';
const key = jose.JWK.asKey(process.env.JWT_SECRET || String(Math.random()));

export const signJwt = (user: Pick<Users, 'id' | 'email'>) => {
  return jose.JWT.sign(
    {
      'user:email': user.email,
    },
    key,
    {
      audience: user.id,
      expiresIn: '6 hours',
      header: {
        typ: 'JWT',
      },
      issuer: 'https://loud.gg',
    },
  );
};
export const decodeJwt = (jwt: string) => {
  return jose.JWT.verify(jwt, key);
};
