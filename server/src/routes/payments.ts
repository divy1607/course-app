import express from 'express';
import Stripe from 'stripe';
import { pool } from '../db';
import { auth } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia' as const
  });

const router = express.Router();

router.post('/create-checkout', auth, async (req, res) => {
  const { courseId } = req.body;
  
  try {
    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) throw new Error('Course not found');

    const session = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(400).json({ error: 'Could not create checkout session' });
  }
});

export default router;