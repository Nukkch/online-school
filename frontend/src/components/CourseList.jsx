import { useEffect, useState } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const endpoint = user.role === 'TEACHER' ? '/courses/my' : '/courses';
        const response = await api.get(endpoint);
        setCourses(response.data);
      } catch (err) {
        console.error('Ошибка загрузки курсов:', err);
      }
    };
    
    if (user) fetchCourses();
  }, [user]);

  // Если user еще не загружен - ничего не рендерим
  if (!user) {
    return null;
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>
        {user.role === 'TEACHER' ? 'Мои курсы' : 'Доступные курсы'}
      </h3>
      {courses.length === 0 ? (
        <p>Курсов пока нет.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {courses.map(course => (
            <li key={course.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '8px' 
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{course.title}</h4>
              <p style={{ margin: 0, color: '#666' }}>{course.description}</p>
              {user.role === 'STUDENT' && (
                <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                  Преподаватель: {course.teacherEmail}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;