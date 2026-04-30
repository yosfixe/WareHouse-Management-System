import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import image from '../assets/image.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>

      {/* Login card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '48px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <svg width="320" height="150" viewBox="0 0 680 320">
            <rect x="200" y="156" width="120" height="18" rx="4" fill="#93c5fd"/>
            <rect x="208" y="134" width="104" height="18" rx="4" fill="#3b82f6"/>
            <rect x="216" y="112" width="88" height="18" rx="4" fill="#1d4ed8"/>
            <polygon points="260,100 270,112 250,112" fill="#1d4ed8"/>
            <text x="340" y="220" textAnchor="middle" fontFamily="system-ui" fontSize="52" fontWeight="500" fill="#111827" letterSpacing="-1">
              over<tspan fill="#2563eb">stok</tspan>
            </text>
            <text x="340" y="252" textAnchor="middle" fontFamily="system-ui" fontSize="13" fill="#6b7280" letterSpacing="2">
              WAREHOUSE MANAGEMENT
            </text>
          </svg>
        </div>

        <form onSubmit={handleLogin}>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#1f1f1f' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #c8c8c8', borderRadius: '4px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#c8c8c8'}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#1f1f1f' }}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '14px', fontWeight: 'bold', padding: 0 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #c8c8c8', borderRadius: '4px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#c8c8c8'}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px' }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: 0, textDecoration: 'underline' }}
          >
            Reset fields
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;