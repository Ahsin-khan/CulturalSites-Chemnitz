// helpers/verifyAuthToken.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest, TokenPayload } from '../types/types';

dotenv.config();

const token_secret = process.env.TOKEN_SECRET as string;

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const decoded = jwt.verify(token, token_secret) as TokenPayload;
    authReq.user = decoded;

    next();
  } catch (error) {
    console.error('verifyAuthToken error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export { verifyAuthToken };
