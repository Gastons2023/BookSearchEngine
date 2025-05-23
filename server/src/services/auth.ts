import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = async ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET_KEY || 'secret';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return req; // Forbidden
      }

      req.user = user as JwtPayload;
      return req;
    });
  } else {
    return req;
  }
  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || 'secret';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
