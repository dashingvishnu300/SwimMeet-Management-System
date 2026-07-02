import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetsAPI, eventsAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  draft:              { label: 'Draft',              color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  scheduled:          { label: 'Scheduled',          color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  registration_open:  { label: 'Registration Open',  color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  registration_closed:{ label: 'Reg. Closed',        color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  in_progress:        { label: 'In Progress',        color: '#00d4ff', bg: 'rgba(0,212,255,0.15)' },
  completed:          { label: 'Completed',          color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
};

const TABS = [
  {
    key: 'overview',
    label: '📋 Overview',
    icon: '📋'
  },
  {
    key: 'events',
    label: '🏊 Events',
    icon: '🏊'
  },
  {
    key: 'heats',
    label: '🌊 Heat Lists',
    icon: '🌊'
  },
  {
    key: 'finals',
    label: '🏆 Final Lists',
    icon: '🏆'
  },
  {
    key: 'results',
    label: '⏱ Results',
    icon: '⏱'
  },
  {
    key: 'medals',
    label: '🥇 Medal Tally',
    icon: '🥇'
  },
  {
    key: 'documents',
    label: '📄 Documents',
    icon: '📄'
  }
];

const EVENT_CATEGORIES = {
  freestyle:    { label: 'Freestyle',   color: '#00d4ff' },
  backstroke:   { label: 'Backstroke',  color: '#3b82f6' },
  breaststroke: { label: 'Breaststroke',color: '#10b981' },
  butterfly:    { label: 'Butterfly',   color: '#f59e0b' },
  medley:       { label: 'Medley',      color: '#8b5cf6' },
  relay:        { label: 'Relay',       color: '#ef4444' },
};

export default function MeetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meet, setMeet]             = useState(null);
  const [events, setEvents]         = useState([]);
  const [regStats, setRegStats]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg]   = useState('');

  const isOrganizer = (user?.role?.name ?? user?.role) === 'organizer';
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [meetRes, eventsRes] = await Promise.all([
        meetsAPI.getOne(id),
        eventsAPI.getMeetEvents(id),
      ]);
      setMeet(meetRes.data);
      setEvents(eventsRes.data.results ?? eventsRes.data);

      // Try to fetch registration stats if organizer
      if (user?.role === 'organizer') {
        try {
            const regRes = await registrationsAPI.getAll(id);
                      const regs = regRes.data.results ?? regRes.data;
          setRegStats({
            total: regs.length,
            swimmers: [...new Set(regs.map(r => r.swimmer))].length,
            teams:    [...new Set(regs.map(r => r.team).filter(Boolean))].length,
          });
        } catch { /* non-critical */ }
      }
    } catch (err) {
      setError('Failed to load meet details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      await meetsAPI.action(id, newStatus);
      setMeet(prev => ({ ...prev, status: newStatus }));
      setStatusMsg(`✅ Action completed successfully!`);
      fetchData(); // refresh meet data      
      setTimeout(() => setStatusMsg(''), 3000);
      
    } catch (err) {
      setStatusMsg('Failed to update status.');
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };
  const handleToggleRegistration = async () => {
    try {
      setActionLoading(true);
      const action = meet?.registration_open ? 'close-registration' : 'open-registration';
      await meetsAPI.action(id, action);
      setMeet(prev => ({ ...prev, registration_open: !prev.registration_open }));
      setStatusMsg(meet?.registration_open ? '🔒 Registration closed!' : '✅ Registration opened!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to update registration.';
      setStatusMsg(`❌ ${msg}`);
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMeet = async () => {

    console.log("DELETE BUTTON CLICKED");
  
    if (!window.confirm('Delete this meet permanently?')) {
      return;
    }
  
    try {
  
      console.log("CALLING DELETE API");
  
      await meetsAPI.delete(id);
  
      alert('Meet deleted successfully');
  
      navigate('/meets');
  
    }
    catch (err) {
  
      console.log(err);
  
      alert(
        err.response?.data?.error ||
        'Failed to delete meet'
      );
  
    }
  
  };

  // ✅ New — uses correct action names from backend
const getNextAction = (currentStatus) => {
  const actions = {
    'draft':               { action: 'publish',            label: 'Publish Meet' },
    'scheduled':           { action: 'open-registration',  label: 'Open Registration' },
    'registration_open':   { action: 'close-registration', label: 'Close Registration' },
    'registration_closed': { action: 'start',              label: 'Start Meet' },
    'in_progress':         { action: 'complete',           label: 'Complete Meet' },
  };
  return actions[currentStatus] ?? null;
};

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

  const groupedEvents = events.reduce((acc, ev) => {
    const cat = ev.stroke || ev.event_type || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ev);
    return acc;
  }, {});

  /* ── Styles ─────────────────────────────────────────────────── */
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '60px',
    },
    hero: {
      background: 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      padding: '32px 24px 0',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '14px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    meetTitle: {
      fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
      color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px',
    },
    metaRow: {
      display: 'flex', flexWrap: 'wrap', gap: '16px',
      alignItems: 'center', marginBottom: '20px',
    },
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      color: STATUS_CONFIG[status]?.color ?? '#6b7280',
      background: STATUS_CONFIG[status]?.bg ?? 'rgba(107,114,128,0.15)',
      border: `1px solid ${STATUS_CONFIG[status]?.color ?? '#6b7280'}40`,
    }),
    metaItem: {
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '14px', color: '#94a3b8',
    },
    tabBar: {
      display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginTop: '8px', overflowX: 'auto',
    },
    tab: (active) => ({
      padding: '14px 20px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#00d4ff' : '#64748b',
      background: 'none', border: 'none', cursor: 'pointer',
      borderBottom: active ? '2px solid #00d4ff' : '2px solid transparent',
      whiteSpace: 'nowrap', transition: 'all 0.2s',
    }),
    content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)',
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '16px', fontWeight: 700, color: '#cbd5e1',
      marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
    },
    statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px',
    },
    statCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '12px',
      padding: '16px', textAlign: 'center',
    }),
    statNum: (accent) => ({
      fontSize: '28px', fontWeight: 800, color: accent, lineHeight: 1,
    }),
    statLabel: { fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 },
    actionRow: {
      display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px',
    },
    btn: (variant) => {
      const v = {
        primary: { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' },
        success: { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none' },
        danger: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' },
      }[variant] || {};
      return {
        padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s', background: v.bg, color: v.color, border: v.border,
      };
    },
    eventTable: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 14px', fontSize: '11px', fontWeight: 600,
      color: '#64748b', textAlign: 'left', textTransform: 'uppercase',
      letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: {
      padding: '12px 14px', fontSize: '14px', color: '#cbd5e1',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      color: '#94a3b8',
      fontSize: '18px'
    },
    
    error: {
      textAlign: 'center',
      color: '#ef4444',
      padding: '40px'
    },
    
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: '16px'
    },
    
    infoItem: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '16px'
    },
    
    infoLabel: {
      color: '#64748b',
      fontSize: '12px',
      marginBottom: '6px'
    },
    
    infoValue: {
      color: '#e2e8f0',
      fontSize: '15px',
      fontWeight: 600
    },
    
    navCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '18px',
      marginBottom: '14px',
      textDecoration: 'none'
    },
    
    toast: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#10b981',
      color: '#fff',
      padding: '12px 18px',
      borderRadius: '10px',
      zIndex: 1000
    },
    eventBadge: (cat) => {
      const cfg = EVENT_CATEGORIES[cat] ?? { color: '#94a3b8' };
      return {
        display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
        background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30`,
        fontWeight: 600,
      };
    },
  };
   
  /* ── Render Helpers ─────────────────────────────────────────── */

  const renderOverview = () => (
    <>
      {/* Stats */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>📊 Meet Summary</div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard('#00d4ff')}>
            <div style={styles.statNum('#00d4ff')}>{events.length}</div>
            <div style={styles.statLabel}>Events</div>
          </div>
          {regStats && (
            <>
              <div style={styles.statCard('#10b981')}>
                <div style={styles.statNum('#10b981')}>{regStats.total}</div>
                <div style={styles.statLabel}>Entries</div>
              </div>
              <div style={styles.statCard('#3b82f6')}>
                <div style={styles.statNum('#3b82f6')}>{regStats.swimmers}</div>
                <div style={styles.statLabel}>Swimmers</div>
              </div>
              <div style={styles.statCard('#8b5cf6')}>
                <div style={styles.statNum('#8b5cf6')}>{regStats.teams}</div>
                <div style={styles.statLabel}>Teams</div>
              </div>
            </>
          )}
          <div style={styles.statCard('#f59e0b')}>
            <div style={styles.statNum('#f59e0b')}>
              {meet?.pool_length ?? meet?.pool_length ?? meet?.pool ?? '50'}
            </div>
            <div style={styles.statLabel}>Pool (m)</div>
            <div style={styles.statCard('#10b981')}>

  <div style={styles.statNum('#10b981')}>
    {meet?.max_events_per_swimmer || 5}
  </div>

  <div style={styles.statLabel}>
    Max Events
  </div>

</div>
          </div>
        </div>
      </div>

      {/* Meet Details */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>📍 Details</div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Venue</div>
            <div style={styles.infoValue}>{meet?.location ?? '—'}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>City</div>
            <div style={styles.infoValue}>{meet?.location ?? meet?.location ?? '—'}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Start Date</div>
            <div style={styles.infoValue}>{formatDate(meet?.start_date)}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>End Date</div>
            <div style={styles.infoValue}>{formatDate(meet?.end_date)}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Registration Deadline</div>
            <div style={styles.infoValue}>{formatDate(meet?.registration_end_date)}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Pool Type</div>
            <div style={styles.infoValue}>{meet?.pool_type ?? '—'}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Organized By</div>
            <div style={styles.infoValue}>{meet?.created_by_name ?? meet?.created_by_name ?? '—'}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Championship Type</div>
            <div style={styles.infoItem}>

  <div style={styles.infoLabel}>
    Maximum Events Per Swimmer
  </div>

  <div style={styles.infoValue}>
    🎯 {meet?.max_events_per_swimmer || 5}
  </div>

</div>
            <div style={styles.infoValue}>{meet?.meet_type ?? meet?.championship_type ?? 'Standard'}</div>
          </div>
        </div>
        {meet?.description && (
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            {meet.description}
          </p>
        )}
      </div>

{/* Organizer Actions */}
{isOrganizer && (
  <div style={styles.card}>
    <div style={styles.sectionTitle}>⚙️ Organizer Actions</div>
    <div style={styles.actionRow}>

      {/* Advance Status Button */}
      {getNextAction(meet?.status_name) && (
        <button
          style={styles.btn('success')}
          onClick={() => handleStatusChange(getNextAction(meet?.status_name).action)}
          disabled={actionLoading}
        >
          {getNextAction(meet?.status_name)?.label}
        </button>
      )}

      {/* Toggle Registration */}
      {(meet?.status_name === 'registration_open' ||
        meet?.status_name === 'registration_closed') && (
        <button
          style={styles.btn(meet?.registration_open ? 'danger' : 'success')}
          onClick={handleToggleRegistration}
          disabled={actionLoading}
        >
          {meet?.registration_open ? 'Close Registration' : 'Open Registration'}
        </button>
      )}

      <button
        style={styles.btn('secondary')}
        onClick={() => navigate(`/meets/${id}/edit`)}
      >
        Edit Meet
      </button>

      <button
        style={styles.btn('primary')}
        onClick={() => navigate(`/meets/${id}/events`)}
      >
        Assign Events
      </button>

      <button
        style={styles.btn('primary')}
        onClick={() => navigate(`/meets/${id}/heats`)}
      >
        Manage Heats
      </button>

      <button
  style={styles.btn('danger')}
  onClick={handleDeleteMeet}
>
  Delete Meet
</button>

    </div>
    {statusMsg && (
      <p style={{ marginTop: '12px', color: '#10b981', fontSize: '13px' }}>
        {statusMsg}
      </p>
    )}
  </div>
)}

      {/* Quick Nav */}
<div style={styles.card}>
  <div style={styles.sectionTitle}>
    🔗 Quick Navigation
  </div>

  {[
        { to: `/meets/${id}/register`, icon: '📝', label: 'Register for Events', desc: 'Register yourself for events in this meet' },
        { to: `/meets/${id}/heats`,   icon: '🌊', label: 'Heat Sheets',  desc: 'View lane assignments & seedings' },
        { to: `/meets/${id}/results`, icon: '🏅', label: 'Results',      desc: 'Enter & view race times' },
        { to: `/meets/${id}/medals`,  icon: '🥇', label: 'Medal Tally',  desc: 'Team rankings & championship points' },
      ].map(({ to, icon, label, desc }) => (
        <Link key={to} to={to} style={styles.navCard}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>{icon} {label}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{desc}</div>
          </div>
          <span style={{ color: '#00d4ff', fontSize: '20px' }}>→</span>
        </Link>
      ))}
      </div>
    </>
  );
  const renderEvents = () => (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>
        🏊 Events
      </div>
  
      <p style={{ color: '#94a3b8' }}>
        Event list coming soon.
      </p>
    </div>
  );
  
  const renderTabLink = (to, title, desc, icon) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={styles.card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '32px' }}>
            {icon}
          </div>
  
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {title}
            </div>
  
            <div
              style={{
                fontSize: '14px',
                color: '#94a3b8'
              }}
            >
              {desc}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
  /* ── Main Render ─────────────────────────────────────────────── */
  if (loading) return <div style={styles.loading}>🌊 Loading meet details…</div>;
  if (error)   return <div style={styles.error}>{error}<br /><button style={{ ...styles.btn('secondary'), margin: '16px auto' }} onClick={fetchData}>Retry</button></div>;
  if (!meet)   return <div style={styles.error}>Meet not found.</div>;

  const status = meet.status_name ?? 'draft';
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <div style={styles.page}>
      {/* Hero Header */}
      <div style={styles.hero}>
        <button style={styles.backBtn} onClick={() => navigate('/meets')}>← Back to Meets</button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={styles.meetTitle}>{meet.name ?? meet.meet_name}</h1>
            <div style={styles.metaRow}>
              <span style={styles.badge(status)}>{statusCfg.label}</span>
              <span style={styles.metaItem}>📅 {formatDate(meet.start_date)} – {formatDate(meet.end_date)}</span>
              <span style={styles.metaItem}>📍 {meet.venue ?? meet.location ?? 'TBD'}</span>
              <span style={styles.metaItem}>🏊 {meet?.pool_length ?? '50'}m Pool</span>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              style={styles.tab(activeTab === tab.key)}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
      {activeTab === 'overview' && renderOverview()}

{activeTab === 'events' && renderEvents()}

{activeTab === 'heats' &&
  renderTabLink(
    `/meets/${id}/heats`,
    'Heat Lists',
    'View lane assignments and seedings',
    '🌊'
  )
}

{activeTab === 'finals' &&
  renderTabLink(
    `/meets/${id}/finals`,
    'Final Lists',
    'View qualified swimmers and final lane assignments',
    '🏆'
  )
}

{activeTab === 'results' &&
  renderTabLink(
    `/meets/${id}/results`,
    'Results',
    'Heat and final timings',
    '⏱'
  )
}

{activeTab === 'medals' &&
  renderTabLink(
    `/meets/${id}/medals`,
    'Medal Tally',
    'Championship points and standings',
    '🥇'
  )
}

{activeTab === 'documents' &&
  renderTabLink(
    `/meets/${id}/documents`,
    'Documents',
    'Circulars, PDFs and meet files',
    '📄'
  )
}
      </div>

      {statusMsg && <div style={styles.toast}>{statusMsg}</div>}
    </div>
  );
}