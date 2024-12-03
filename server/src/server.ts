import express from 'express';
import stripe from 'stripe';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import paymentRoutes from './routes/payments';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const stripeClient = new stripe('your_stripe_key');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, name, role]
    );
    const token = jwt.sign(
        { userId: result.rows[0].id }, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
      );    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, description, price } = req.body;
  const instructorId = req.user.id; // From JWT middleware
  
  const result = await pool.query(
    'INSERT INTO courses (title, description, price, instructor_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, description, price, instructorId]
  );
  res.json(result.rows[0]);
});

app.post('/api/enroll', async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // From JWT middleware

  const course = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
  
  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.rows[0].title,
          },
          unit_amount: course.rows[0].price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    
    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(400).json({ 
        error: err instanceof Error ? err.message : 'An unknown error occurred' 
      });  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));