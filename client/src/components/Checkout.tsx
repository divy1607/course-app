import { useRecoilValue } from 'recoil';
import { loadStripe } from '@stripe/stripe-js';
import { userState } from '../state/atom';
// import { coursesState } from '../state/atom';
import { Course } from '../types';

const stripePromise = loadStripe('your_publishable_key');

const Checkout = ({ course }: { course: Course }) => {
  const user = useRecoilValue(userState);

  const handleEnroll = async () => {
    const response = await fetch('/api/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ courseId: course.id })
    });
    
    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <button 
      onClick={handleEnroll}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Enroll for ${course.price}
    </button>
  );
};

export default Checkout;