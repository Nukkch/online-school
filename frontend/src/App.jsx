import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import CoursePage from './pages/CoursePage';
import useAuthStore from './store/authStore';
import LessonPage from './pages/LessonPage';

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" /> : (
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
          path="/create-course" 
          element={
            // Разрешаем доступ только если залогинен и роль TEACHER
            (token && user?.role === 'TEACHER') ? <CreateCourse /> : <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/courses/:courseId" 
          element={token ? <CoursePage /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/login" />} />
        
        <Route 
          path="/courses/:courseId/lessons/:lessonId" 
          element={token ? <LessonPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;