import { useEffect, useState } from 'react';
import api from '../services/api';

function CourseStatistics({ courseId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/courses/${courseId}/statistics`);
        setStats(response.data);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [courseId]);

  if (loading) return <div>Загрузка статистики...</div>;
  if (!stats) return null;

  return (
    <div style={{ 
      backgroundColor: 'transparent', 
      padding: '20px', 
      borderRadius: '8px', 
      marginBottom: '30px',
      border: '1px solid #ddd'
    }}>
      <h3>Статистика курса</h3>
      
      <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
        <div>
          <strong>Всего студентов:</strong> {stats.totalStudents}
        </div>
        <div>
          <strong>Всего уроков:</strong> {stats.totalLessons}
        </div>
      </div>

      {stats.students.length === 0 ? (
        <p>Пока никто не записался на курс</p>
      ) : (
        <div>
          <h4>Прогресс студентов:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Студент</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Пройдено уроков</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {stats.students.map(student => (
                <tr key={student.studentId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{student.studentName}</td>
                  <td style={{ padding: '10px' }}>{student.studentEmail}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {student.completedLessons} / {stats.totalLessons}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ 
                      backgroundColor: 'transparent', 
                      borderRadius: '4px', 
                      overflow: 'hidden',
                      height: '20px',
                      position: 'relative',
                      border: '2px',
                      borderColor: '#eee',
                    }}>
                      <div style={{ 
                        backgroundColor: student.progressPercentage === 100 ? '#4CAF50' : '#2196F3',
                        width: `${student.progressPercentage}%`,
                        height: '100%',
                        transition: 'width 0.3s',
                        
                        
                        
                      }}></div>
                      <span style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#eee'
                      }}>
                        {student.progressPercentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CourseStatistics;