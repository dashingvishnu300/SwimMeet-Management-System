import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { meetsAPI } from '../services/api';

const statusColors = {
  draft: '#64748B',
  scheduled: '#0EA5E9',
  registration_open: '#10B981',
  registration_closed: '#F59E0B',
  in_progress: '#8B5CF6',
  completed: '#6B7280',
  cancelled: '#EF4444',
  rescheduled: '#F97316',
};

const statusIcons = {
  draft: '📝',
  scheduled: '📅',
  registration_open: '✅',
  registration_closed: '🔒',
  in_progress: '🏊',
  completed: '🏆',
  cancelled: '❌',
  rescheduled: '🔄',
};

const MeetCard = ({ meet }) => {
  const navigate = useNavigate();
  const statusColor = statusColors[meet.status_name] || '#64748B';
  const statusIcon = statusIcons[meet.status_name] || '📋';

  return (
    <Link to={`/meets/${meet.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(14, 165, 233, 0.1)',
        borderRadius: 16,
        padding: 24,
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.border = '1px solid rgba(14, 165, 233, 0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.border = '1px solid rgba(14, 165, 233, 0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${statusColor}, transparent)`,
        }} />

        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: `${statusColor}18`,
          border: `1px solid ${statusColor}44`,
          borderRadius: 20,
          padding: '4px 12px',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 12 }}>{statusIcon}</span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: statusColor,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            {meet.status_name?.replace('_', ' ')}
          </span>
        </div>

        {/* Meet name */}
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: 12,
          lineHeight: 1.3,
        }}>
          {meet.name}
        </h3>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>{meet.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>
              {new Date(meet.start_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })} — {new Date(meet.end_date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 13, color: '#94A3B8', textTransform: 'capitalize' }}>
              {meet.level_name} Level
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🏊</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>
              {meet.pool_length}m pool · {meet.lanes} lanes
            </span>
          </div>
        </div>

{/* Registration info */}
{meet.status_name === 'registration_open' && (
  <>
    <div style={{
      marginTop: 16,
      padding: '10px 14px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: 10,
      fontSize: 12,
      color: '#10B981',
      fontWeight: 600,
    }}>
      🟢 Registration Open until {new Date(meet.registration_end_date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short'
      })}
    </div>

    {/* ✅ ADD THIS REGISTER BUTTON */}
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/meets/${meet.id}/register`);
      }}
      style={{
        marginTop: 10,
        padding: '10px 14px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: 10,
        fontSize: 13,
        color: '#fff',
        fontWeight: 700,
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      📝 Register Now →
    </div>
  </>
)}
      </div>
    </Link>
  );
};

const Meets = () => {
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    meetsAPI.getAll()
      .then(res => setMeets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? meets
    : meets.filter(m => m.status_name === filter);

  const filters = [
    { key: 'all', label: 'All Meets' },
    { key: 'registration_open', label: '✅ Open' },
    { key: 'in_progress', label: '🏊 Live' },
    { key: 'completed', label: '🏆 Completed' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏊</div>
          <h1 style={{
            fontSize: 42,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fff 0%, #0EA5E9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 12,
          }}>
            Swim Meets
          </h1>
          <p style={{ color: '#64748B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Browse all swimming competitions — register, compete, and track your performance
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 32,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key
                  ? 'linear-gradient(135deg, #0EA5E9, #0284C7)'
                  : 'rgba(255,255,255,0.05)',
                border: filter === f.key
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '8px 20px',
                color: filter === f.key ? '#fff' : '#94A3B8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Meets Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#64748B' }}>Loading meets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏊</div>
            <p style={{ color: '#64748B', fontSize: 16 }}>No meets found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filtered.map(meet => (
              <MeetCard key={meet.id} meet={meet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meets;