import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import useAuthStore from './store/authStore';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          token ? (
            <Navigate to="/dashboard" />
          ) : (
            <div>
              <Login />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
              </div>
            </div>
          )
        } />
        <Route path="/register" element={
          token ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/courses/:courseId" 
          element={token ? <CoursePage /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;