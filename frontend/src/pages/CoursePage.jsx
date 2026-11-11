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

  // Состояния для форм создания
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '', orderIndex: 1 });
  
  const [showLessonForm, setShowLessonForm] = useState(null); // ID модуля, для которого открыта форма
  const [newLesson, setNewLesson] = useState({ title: '', content: '', orderIndex: 1 });


      useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);

        const modulesResponse = await api.get(`/modules/course/${courseId}`);
        setModules(modulesResponse.data);

        if (user.role === 'STUDENT') {
          const progressResponse = await api.get(`/progress/course/${courseId}`);
          const progressMap = {};
          progressResponse.data.forEach(p => {
            progressMap[p.lessonId] = p.completed;
          });
          setProgress(progressMap);

          const enrollmentsResponse = await api.get('/enrollments/my');
          const enrolled = enrollmentsResponse.data.some(e => e.courseId === parseInt(courseId));
          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(true);
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

  const handleUnenroll = async () => {
    if (!window.confirm('Отписаться от курса?')) return;
    try {
      await api.delete(`/enrollments/courses/${courseId}`);
      setIsEnrolled(false);
      setProgress({});
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка отписки');
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

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Удалить модуль и все его уроки?')) return;
    try {
      await api.delete(`/modules/${moduleId}`);
      setModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Удалить урок?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/modules', { ...newModule, courseId: parseInt(courseId) });
      setShowModuleForm(false);
      setNewModule({ title: '', description: '', orderIndex: modules.length + 1 });
      // Перезагружаем данные курса
        const modulesResponse = await api.get(`/modules/course/${courseId}`);
        setModules(modulesResponse.data); // Перезагружаем данные
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания модуля');
    }
  };

  const handleCreateLesson = async (e, moduleId) => {
    e.preventDefault();
    try {
      await api.post('/lessons', { ...newLesson, moduleId });
      setShowLessonForm(null);
      setNewLesson({ title: '', content: '', orderIndex: 1 });
      // Перезагружаем данные курса
        const modulesResponse = await api.get(`/modules/course/${courseId}`);
        setModules(modulesResponse.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания урока');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;
  if (!course) return <div style={{ padding: '20px' }}>Курс не найден</div>;

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

      {user.role === 'STUDENT' && isEnrolled && (
        <button 
          onClick={handleUnenroll}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Отписаться от курса
        </button>
      )}

      {user.role === 'TEACHER' && (
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => setShowModuleForm(!showModuleForm)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showModuleForm ? 'Отмена' : '+ Добавить модуль'}
          </button>

          {showModuleForm && (
            <form onSubmit={handleCreateModule} style={{ marginTop: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Новый модуль</h3>
              <input 
                placeholder="Название модуля" 
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <textarea 
                placeholder="Описание" 
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px' }}
              />
              <input 
                type="number"
                placeholder="Порядковый номер" 
                value={newModule.orderIndex}
                onChange={(e) => setNewModule({ ...newModule, orderIndex: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Создать модуль
              </button>
            </form>
          )}
        </div>
      )}

      {modules.length === 0 ? (
        <p>Модули пока не добавлены</p>
      ) : (
        modules.map(module => (
          <div key={module.id} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0 }}>{module.title}</h2>
              {user.role === 'TEACHER' && (
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Удалить модуль
                </button>
              )}
            </div>
            <p style={{ color: '#666' }}>{module.description}</p>
            
            {user.role === 'TEACHER' && (
              <div style={{ marginBottom: '15px' }}>
                <button 
                  onClick={() => setShowLessonForm(showLessonForm === module.id ? null : module.id)}
                  style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  {showLessonForm === module.id ? 'Отмена' : '+ Добавить урок'}
                </button>

                {showLessonForm === module.id && (
                  <form onSubmit={(e) => handleCreateLesson(e, module.id)} style={{ marginTop: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <input 
                      placeholder="Название урока" 
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <textarea 
                      placeholder="Содержание урока" 
                      value={newLesson.content}
                      onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                      style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }}
                    />
                    <input 
                      type="number"
                      placeholder="Порядковый номер" 
                      value={newLesson.orderIndex}
                      onChange={(e) => setNewLesson({ ...newLesson, orderIndex: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Создать урок
                    </button>
                  </form>
                )}
              </div>
            )}
            
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {module.lessons?.map(lesson => (
                <li 
                  key={lesson.id} 
                  style={{ 
                    padding: '15px', 
                    marginBottom: '10px', 
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{lesson.title}</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {lesson.content}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
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
                    {user.role === 'TEACHER' && (
                      <button
                        onClick={() => handleDeleteLesson(module.id, lesson.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
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