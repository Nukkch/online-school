import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import CourseList from '../components/CourseList';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Привет, {user?.firstName} {user?.lastName}!</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Выйти
        </button>
      </div>
      
      <p style={{ color: '#666' }}>Ваша роль: <strong>{user?.role}</strong></p>
      
      {/* Кнопка создания курса только для преподавателей */}
      {user?.role === 'TEACHER' && (
        <button 
          onClick={() => navigate('/create-course')}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '16px'
          }}
        >
          + Создать новый курс
        </button>
      )}
      
      {/* Добавляем ключ key={Date.now()} не будем, просто сделаем простой рендер. 
          Чтобы список обновился после создания, можно использовать простой хак с перерисовкой, 
          но для начала хватит и того, что курс появится после обновления страницы. */}
      <CourseList />
    </div>
  );
}

export default Dashboard;