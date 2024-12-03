import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { coursesState } from '../../state/atom';
import CourseCard from './CourseCard';
import axios from 'axios';

export default function CourseList() {
  const [courses, setCourses] = useRecoilState(coursesState);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await axios.get('/api/courses');
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      const { data } = await axios.post('/api/payments/create-checkout', {
        courseId
      });
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onEnroll={handleEnroll}
        />
      ))}
    </div>
  );
}