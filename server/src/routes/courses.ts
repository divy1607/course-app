import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { pool } from '../db';
import { auth } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

router.post('/', auth, (async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, price } = req.body;
      
      if (!req.user || req.user.role !== 'instructor') {
        return res.status(403).json({ error: 'Only instructors can create courses' });
      }
      
      const result = await pool.query(
        'INSERT INTO courses (title, description, price, instructor_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, price, req.user.id]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM courses');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;