import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.PROD ? 'https://crm-api.YOUR_SUBDOMAIN.workers.dev' : '/api';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      onLogin(res.data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'خطأ في تسجيل الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{maxWidth:'400px',paddingTop:'100px'}}>
      <div className="card">
        <h2 className="text-center mb-4" style={{color:'#667eea'}}>تسجيل الدخول</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">البريد الإلكتروني</label>
            <input type="email" className="input" value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label className="label">كلمة المرور</label>
            <input type="password" className="input" value={formData.password} onChange={(e)=>setFormData({...formData,password:e.target.value})} required/>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>{loading?'جاري...':'دخول'}</button>
        </form>
        <p className="text-center mt-4">ليس لديك حساب؟ <Link to="/register" style={{color:'#667eea'}}>إنشاء حساب</Link></p>
      </div>
    </div>
  );
}
export default Login;
