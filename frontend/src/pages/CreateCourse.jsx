import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/courses', formData);
      // После успешного создания возвращаемся на дашборд
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании курса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', background: 'none', border: 'none', color: '#2196F3' }}
      >
        ← Назад
      </button>

      <h2>Создать новый курс</h2>
      
      {error && <p style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Название курса:</label>
          <input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="Например: Java для начинающих"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Описание:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
            placeholder="Чему научатся студенты?"
            rows="4"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: loading ? '#ccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Создание...' : 'Создать курс'}
        </button>
      </form>
    </div>
  );
}

export default CreateCourse;