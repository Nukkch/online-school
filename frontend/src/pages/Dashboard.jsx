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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Привет, {user?.email}!</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Выйти
        </button>
      </div>
      
      <p style={{ color: '#666' }}>Ваша роль: <strong>{user?.role}</strong></p>
      
      <CourseList />
    </div>
  );
}

export default Dashboard;