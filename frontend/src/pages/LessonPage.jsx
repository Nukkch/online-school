import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Уникальный ключ для сохранения кода этого урока
  const storageKey = `code_${courseId}_${lessonId}`;

  useEffect(() => {
  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
      
      const savedCode = localStorage.getItem(storageKey);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(response.data.codeTemplate || '// Напишите ваш код здесь');
      }
      
      if (user.role === 'STUDENT') {
        try {
          // Получаем все записи студента
          const enrollmentsResponse = await api.get('/enrollments/my');
          const enrollments = enrollmentsResponse.data;
          
          // Проверяем, есть ли текущий курс в списке
          const enrolled = enrollments.some(e => e.courseId === parseInt(courseId));
          setIsEnrolled(enrolled);
          
          if (enrolled) {
            const progressResponse = await api.get(`/progress/course/${courseId}`);
            const completed = progressResponse.data.find(p => p.lessonId === parseInt(lessonId))?.completed;
            setIsCompleted(completed || false);
          }
        } catch (err) {
          console.error('Ошибка проверки записей:', err);
          setIsEnrolled(false);
          setIsCompleted(false);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки урока:', err);
      setLoading(false);
    }
  };
  fetchLesson();
}, [lessonId, courseId, user, storageKey]);

  // Сохраняем код при каждом изменении
  const handleCodeChange = (value) => {
    setCode(value);
    localStorage.setItem(storageKey, value);
  };

const handleEnroll = async () => {
  try {
    await api.post(`/enrollments/courses/${courseId}`);
    setIsEnrolled(true);
    alert('Вы успешно записались на курс!');
    
    // После записи сразу загружаем прогресс
    const progressResponse = await api.get(`/progress/course/${courseId}`);
    const completed = progressResponse.data.find(p => p.lessonId === parseInt(lessonId))?.completed;
    setIsCompleted(completed || false);
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || 'Ошибка записи на курс';
    alert(message);
  }
};

  // Сброс кода к шаблону
  const handleResetCode = () => {
    if (window.confirm('Сбросить код к исходному шаблону? Несохраненные изменения будут потеряны.')) {
      const templateCode = lesson.codeTemplate || '// Напишите ваш код здесь';
      setCode(templateCode);
      localStorage.setItem(storageKey, templateCode);
      setOutput(''); // Очищаем консоль
    }
  };

  const handleToggleProgress = async () => {
    try {
      const response = await api.post(`/progress/lessons/${lessonId}`);
      setIsCompleted(response.data.completed);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка обновления прогресса');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Компиляция и выполнение...');
    try {
      const response = await api.post('/code/execute', {
        sourceCode: code,
        language: lesson.language || 'java',
        stdin: ''
      });
      
      let resultText = '';
      if (response.data.status === 3) {
        resultText = `✅ Успешно выполнено!\nВремя: ${response.data.time}с, Память: ${response.data.memory} КБ\n\n--- Вывод ---\n${response.data.output}`;
      } else {
        resultText = `❌ Ошибка выполнения (Статус: ${response.data.status})\n\n--- Ошибка ---\n${response.data.stderr || response.data.compileOutput || 'Неизвестная ошибка'}`;
      }
      setOutput(resultText);
    } catch (err) {
      setOutput(`❌ Ошибка запроса: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка урока...</div>;
  if (!lesson) return <div style={{ padding: '20px' }}>Урок не найден</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(`/courses/${courseId}`)} 
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', background: 'none', border: '1px solid #ddd', borderRadius: '4px' }}
      >
        ← Вернуться к курсу
      </button>

      <h1>{lesson.title}</h1>
      
      <div style={{ 
        backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', 
        border: '1px solid #ddd', marginBottom: '30px', lineHeight: '1.6' 
      }}>
        {lesson.content}
      </div>

      {/* ПЕСОЧНИЦА */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>🖥️ Песочница ({lesson.language || 'java'})</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleResetCode}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Сбросить
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              style={{
                padding: '8px 20px',
                backgroundColor: isRunning ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isRunning ? '⏳ Выполняется...' : '▶ Выполнить код'}
            </button>
          </div>
        </div>

        {/* Редактор кода Monaco */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
          <Editor
            height="300px"
            language={lesson.language === 'javascript' ? 'javascript' : lesson.language || 'java'}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true
            }}
          />
        </div>

        {/* Консоль вывода */}
        <div style={{ 
          backgroundColor: '#1e1e1e', 
          color: '#d4d4d4', 
          padding: '15px', 
          borderRadius: '8px', 
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '14px',
          minHeight: '100px',
          whiteSpace: 'pre-wrap',
          border: '1px solid #333'
        }}>
          {output || '// Здесь появится результат выполнения кода...'}
        </div>
      </div>

      {user.role === 'STUDENT' && (
  <div style={{ marginTop: '20px' }}>
    {isEnrolled ? (
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
          width: '100%'
        }}
      >
        {isCompleted ? 'Урок пройден' : 'Отметить урок как пройденный'}
      </button>
    ) : (
      <button
        onClick={handleEnroll}
        style={{
          padding: '12px 24px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        Записаться на курс, чтобы отмечать прогресс
      </button>
    )}
  </div>
)}
    </div>
  );
}

export default LessonPage;