import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const {
    user,
    logout,
    isOrganizer,
    isCoach,
    isSwimmer,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'rgba(10, 22, 40, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 28 }}>🏊</span>
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SwimMeet
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <Link to="/meets" style={{
          color: '#94A3B8',
          fontSize: 14,
          fontWeight: 500,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = '#0EA5E9'}
          onMouseLeave={e => e.target.style.color = '#94A3B8'}
        >
          Meets
        </Link>

        <Link to="/records" style={{
          color: '#94A3B8',
          fontSize: 14,
          fontWeight: 500,
        }}
          onMouseEnter={e => e.target.style.color = '#0EA5E9'}
          onMouseLeave={e => e.target.style.color = '#94A3B8'}
        >
          Records
        </Link>

        {isAdmin() && (
  <>
    <Link
      to="/admin"
      style={{
        color:'#94A3B8',
        fontSize:14,
        fontWeight:500
      }}
    >
      Dashboard
    </Link>

    <Link
      to="/admin/organizers"
      style={{
        color:'#94A3B8',
        fontSize:14,
        fontWeight:500
      }}
    >
      Organizer Requests
    </Link>

    <Link
      to="/admin/associations"
      style={{
        color:'#94A3B8',
        fontSize:14,
        fontWeight:500
      }}
    >
      Associations
    </Link>
  </>
)}

        {/* Role based links */}
        {isOrganizer() && (
  <Link to="/dashboard" style={{
    color: '#94A3B8', fontSize: 14, fontWeight: 500,
  }}
    onMouseEnter={e => e.target.style.color = '#0EA5E9'}
    onMouseLeave={e => e.target.style.color = '#94A3B8'}
  >
    Dashboard
  </Link>
)}

{/* ✅ ADD THIS */}
{isCoach() && (
  <Link to="/coach" style={{
    color: '#94A3B8', fontSize: 14, fontWeight: 500,
  }}
    onMouseEnter={e => e.target.style.color = '#0EA5E9'}
    onMouseLeave={e => e.target.style.color = '#94A3B8'}
  >
    Coach Dashboard
  </Link>
)}

{isSwimmer() && (
  <>
    <Link
      to="/swimmer/dashboard"
      style={{
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 500,
      }}
      onMouseEnter={e => e.target.style.color = '#0EA5E9'}
      onMouseLeave={e => e.target.style.color = '#94A3B8'}
    >
      Dashboard
    </Link>

    <Link
      to="/my-registrations"
      style={{
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 500,
      }}
      onMouseEnter={e => e.target.style.color = '#0EA5E9'}
      onMouseLeave={e => e.target.style.color = '#94A3B8'}
    >
      My Registrations
    </Link>

    <Link
    to="/my-certificates"
    style={{
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 500,
    }}
    onMouseEnter={e => e.target.style.color = '#0EA5E9'}
    onMouseLeave={e => e.target.style.color = '#94A3B8'}
>
    🏆 My Certificates
</Link>

    <Link to="/profile">Profile</Link>
  </>

)}

        {/* Auth buttons */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: 20,
              padding: '6px 14px',
            }}>
              <span style={{ fontSize:16 }}>
{
  isAdmin()
    ? '👑'
    : isOrganizer()
      ? '👔'
      : isCoach()
        ? '🏋️'
        : '🏊'
}
</span>
              <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
                {user.username}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login">
              <button style={{
                background: 'transparent',
                border: '1px solid rgba(14, 165, 233, 0.5)',
                color: '#0EA5E9',
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <button style={{
                background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Register
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;