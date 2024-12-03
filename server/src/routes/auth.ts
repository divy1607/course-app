import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, name, role]
    );
    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET!);
    res.json({ user: result.rows[0], token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) throw new Error();

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

export default router;
