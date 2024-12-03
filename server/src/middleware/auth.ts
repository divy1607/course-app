import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { pool } from '../db';

interface CustomJwtPayload extends JwtPayload {
  userId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) throw new Error();
    
    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};