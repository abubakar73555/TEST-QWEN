import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { setIsAuthenticated(!!localStorage.getItem('token')); }, []);
  
  const handleLogin = (token) => { localStorage.setItem('token', token); setIsAuthenticated(true); };
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
