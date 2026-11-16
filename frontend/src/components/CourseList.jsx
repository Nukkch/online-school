import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { truncateText } from '../utils/textUtils';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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

  const handleDelete = async (e, courseId) => {
    e.stopPropagation(); // Чтобы не срабатывал клик по карточке
    if (!window.confirm('Удалить курс?')) return;
    
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  if (!user) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>{user.role === 'TEACHER' ? 'Мои курсы' : 'Доступные курсы'}</h3>
      {courses.length === 0 ? (
        <p>Курсов пока нет.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {courses.map(course => (
            <li 
              key={course.id} 
              onClick={() => navigate(`/courses/${course.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px', 
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{truncateText(course.title, 40)}</h4>
                <p style={{ margin: 0, color: '#666' }}>{truncateText(course.description, 60)}</p>
                {user.role === 'STUDENT' && (
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                    Преподаватель: {course.teacherName}
                  </p>
                )}
              </div>
              {user.role === 'TEACHER' && (
                <button
                  onClick={(e) => handleDelete(e, course.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '15px'
                  }}
                >
                  Удалить
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;