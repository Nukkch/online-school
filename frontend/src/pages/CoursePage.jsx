import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем информацию о курсе
        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);

        // Получаем модули курса
        const modulesResponse = await api.get(`/modules/course/${courseId}`);
        setModules(modulesResponse.data);

        // Если студент записан - получаем прогресс
        if (user.role === 'STUDENT') {
          const progressResponse = await api.get(`/progress/course/${courseId}`);
          const progressMap = {};
          progressResponse.data.forEach(p => {
            progressMap[p.lessonId] = p.completed;
          });
          setProgress(progressMap);
        }

        // Проверяем, записан ли студент на курс
        if (user.role === 'STUDENT') {
          const enrollmentsResponse = await api.get('/enrollments/my');
          const enrolled = enrollmentsResponse.data.some(e => e.courseId === parseInt(courseId));
          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(true); // Преподаватель всегда имеет доступ
        }

        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных курса:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    try {
      await api.post(`/enrollments/courses/${courseId}`);
      setIsEnrolled(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка записи на курс');
    }
  };

  const handleToggleProgress = async (lessonId) => {
    try {
      const response = await api.post(`/progress/lessons/${lessonId}`);
      setProgress(prev => ({
        ...prev,
        [lessonId]: response.data.completed
      }));
    } catch (err) {
      console.error('Ошибка обновления прогресса:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>;
  }

  if (!course) {
    return <div style={{ padding: '20px' }}>Курс не найден</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
      >
        ← Назад к курсам
      </button>

      <h1>{course.title}</h1>
      <p style={{ color: '#666' }}>{course.description}</p>

      {user.role === 'STUDENT' && !isEnrolled && (
        <button 
          onClick={handleEnroll}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Записаться на курс
        </button>
      )}

      {modules.length === 0 ? (
        <p>Модули пока не добавлены</p>
      ) : (
        modules.map(module => (
          <div key={module.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
              {module.title}
            </h2>
            <p style={{ color: '#666' }}>{module.description}</p>
            
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {module.lessons?.map(lesson => (
                <li 
                  key={lesson.id} 
                  style={{ 
                    padding: '15px', 
                    marginBottom: '10px', 
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{lesson.title}</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {lesson.content}
                    </p>
                  </div>
                  {user.role === 'STUDENT' && isEnrolled && (
                    <button
                      onClick={() => handleToggleProgress(lesson.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: progress[lesson.id] ? '#4CAF50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {progress[lesson.id] ? '✓ Пройден' : 'Отметить'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default CoursePage;