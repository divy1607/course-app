import { Course } from '../../types';
import { useRecoilValue } from 'recoil';
import { userState } from '../../state/atom';

interface Props {
  course: Course;
  onEnroll: (courseId: string) => void;
}

export default function CourseCard({ course, onEnroll }: Props) {
  const user = useRecoilValue(userState);

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-xl font-bold">{course.title}</h3>
      <p className="mt-2">{course.description}</p>
      <p className="mt-2 font-bold">${course.price}</p>
      {user?.role === 'student' && (
        <button
          onClick={() => onEnroll(course.id)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enroll Now
        </button>
      )}
    </div>
  );
}