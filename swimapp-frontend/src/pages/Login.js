import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(
        email,
        password
      );
      
      if (response.must_change_password) {

        navigate('/change-password');
      
      }
      
      else if (response.user.role === 'admin') {
      
        navigate('/admin');
      
      }
      
      else if (response.user.role === 'organizer') {
      
        navigate('/dashboard');
      
      }
      
      else if (response.user.role === 'coach') {
      
        navigate('/coach');
      
      }
      
      else if (response.user.role === 'swimmer') {
      
        navigate('/swimmer/dashboard');
      
      }
      
      else {
      
        navigate('/meets');
      
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A1628 0%, #0F2347 50%, #0A1628 100%)',
      padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '10%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(14, 165, 233, 0.15)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏊</div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>
            Sign in to SwimMeet Management
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#EF4444',
            fontSize: 13,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              color: '#94A3B8',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.2)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              color: '#94A3B8',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.2)'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? 'rgba(14, 165, 233, 0.5)'
                : 'linear-gradient(135deg, #0EA5E9, #0284C7)',
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
            }}
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ color: '#64748B', fontSize: 13 }}>
            Don't have an account?{' '}
          </span>
          <Link to="/register" style={{
            color: '#0EA5E9',
            fontSize: 13,
            fontWeight: 600,
          }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;