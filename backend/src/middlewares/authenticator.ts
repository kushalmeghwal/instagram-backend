// middlewares/authenticator.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export interface CustomRequest extends Request {
  token?: any; // Ideally: { username: string, ... }
}

export const Authenticator = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.COOKIE_SECRET as string);
    console.log(decoded);
    req.token = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: 'Invalid or expired token', error });
  }
};
