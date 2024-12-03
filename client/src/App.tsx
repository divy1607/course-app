import { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { userState } from './state/atom';
import { useState } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CourseList from './components/Course/CourseList';
import CreateCourse from './components/Course/CreateCourse';
import axios from 'axios';

export default function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(({ data }) => setUser(data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {!user ? (
        <>
          <Login />
          <Register />
        </>
      ) : (
        <>
          {user.role === 'instructor' && <CreateCourse />}
          <CourseList />
        </>
      )}
    </div>
  );
}