import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/lessons/${lessonId}`);
        setLesson(response.data);
        
        // Проверяем статус прохождения, если это студент
        if (user.role === 'STUDENT') {
          const progressResponse = await api.get(`/progress/course/${courseId}`);
          const completed = progressResponse.data.find(p => p.lessonId === parseInt(lessonId))?.completed;
          setIsCompleted(completed || false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки урока:', err);
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, courseId, user]);

  const handleToggleProgress = async () => {
    try {
      const response = await api.post(`/progress/lessons/${lessonId}`);
      setIsCompleted(response.data.completed);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка обновления прогресса');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка урока...</div>;
  if (!lesson) return <div style={{ padding: '20px' }}>Урок не найден</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(`/courses/${courseId}`)} 
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', background: 'none', border: 'none', color: '#2196F3' }}
      >
        ← Вернуться к курсу
      </button>

      <h1>{lesson.title}</h1>
      
      {/* Контент урока */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #ddd',
        marginBottom: '30px',
        whiteSpace: 'pre-wrap', // Сохраняет переносы строк
        lineHeight: '1.6'
      }}>
        {lesson.content}
      </div>

      {/* Заглушка для песочницы (покажем, что она будет здесь) */}
      {lesson.language && (
        <div style={{ marginBottom: '30px' }}>
          <h3>🖥️ Песочница ({lesson.language})</h3>
          <div style={{ 
            backgroundColor: '#2d2d2d', 
            color: '#f8f8f2', 
            padding: '15px', 
            borderRadius: '8px', 
            fontFamily: 'monospace',
            minHeight: '150px',
            border: '1px solid #444'
          }}>
            {lesson.codeTemplate || '// Здесь будет редактор кода'}
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
            * Интеграция с Judge0 будет добавлена на следующем этапе.
          </p>
        </div>
      )}

      {/* Кнопка отметки прогресса (только для студентов) */}
      {user.role === 'STUDENT' && (
        <button
          onClick={handleToggleProgress}
          style={{
            padding: '12px 24px',
            backgroundColor: isCompleted ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '30px'
          }}
        >
          {isCompleted ? '✓ Урок пройден (нажмите, чтобы отменить)' : 'Отметить урок как пройденный'}
        </button>
      )}

      {/* Навигация (заглушка, пока не сделаем динамическую) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <button onClick={() => navigate(`/courses/${courseId}`)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ← К списку уроков
        </button>
      </div>
    </div>
  );
}

export default LessonPage;