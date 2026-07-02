import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { meetsAPI, eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  draft:               { label: 'Draft',              color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  scheduled:           { label: 'Scheduled',          color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'  },
  registration_open:   { label: 'Reg. Open',          color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
  registration_closed: { label: 'Reg. Closed',        color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  in_progress:         { label: 'In Progress',        color: '#00d4ff', bg: 'rgba(0,212,255,0.15)'   },
  completed:           { label: 'Completed',          color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)'  },
};

export default function OrganizerDashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [meets,    setMeets]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [stats,    setStats]    = useState({ total: 0, active: 0, completed: 0, draft: 0, events: 0 });
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const meetsRes = await meetsAPI.getAll();
      console.log('RAW API RESPONSE:', meetsRes.data);  // ← ADD THIS
      const allMeets = meetsRes.data.results ?? meetsRes.data;
      console.log('ALL MEETS:', allMeets);               // ← ADD THIS
      console.log('FIRST MEET:', allMeets[0]);           // ← ADD THIS
      console.log("USER =", user);
      console.log("ALL MEETS =", allMeets);
      // Only show organizer's own meets
      const myMeets = allMeets;

      setMeets(myMeets);
      setStats({
        total:     myMeets.length,
        active:    myMeets.filter(m => m.status_name === 'in_progress').length,
        completed: myMeets.filter(m => m.status_name === 'completed').length,
        draft:     myMeets.filter(m => m.status_name === 'draft').length,
        regOpen:   myMeets.filter(m => m.status_name === 'registration_open').length,
        events:    myMeets.reduce((s, m) => s + (m.event_count ?? 0), 0),
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetId, meetName) => {
    if (!window.confirm(`Delete "${meetName}"? This cannot be undone.`)) return;
    try {
      setDeleting(meetId);
      await meetsAPI.delete(meetId);
      setMeets(prev => prev.filter(m => m.id !== meetId));
      showToast('Meet deleted.');
    } catch (err) {
      console.log(err);
  
      showToast(
          err.response?.data?.error ||
          'Delete failed. Please try again.'
      );
  } finally {
      setDeleting(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filteredMeets = meets.filter(m => {
    const matchFilter = filter === 'all' || m.status === filter;
    const matchSearch = !search || (m.name ?? m.meet_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  /* ── Styles ───────────────────────────────────────────────── */
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '60px',
    },
    header: {
      background: 'linear-gradient(180deg, rgba(0,212,255,0.07) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      padding: '32px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    greeting: { fontSize: '13px', color: '#00d4ff', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.05em' },
    title: { fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: '#64748b' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' },
    statCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '14px',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }),
    statGlow: (accent) => ({
      position: 'absolute', top: '-20px', right: '-20px',
      width: '80px', height: '80px', borderRadius: '50%',
      background: `${accent}15`, filter: 'blur(20px)',
    }),
    statNum: (accent) => ({ fontSize: '36px', fontWeight: 900, color: accent, lineHeight: 1 }),
    statLabel: { fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
    statSub: { fontSize: '11px', color: '#475569', marginTop: '2px' },
    sectionHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
    },
    sectionTitle: { fontSize: '18px', fontWeight: 700, color: '#e2e8f0' },
    controlsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px',
      outline: 'none', width: '220px',
    },
    filterSelect: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px',
      outline: 'none', cursor: 'pointer',
    },
    createBtn: {
      background: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a',
      border: 'none', borderRadius: '10px', padding: '10px 20px',
      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '6px',
    },
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(12px)',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748b',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: {
      padding: '14px 16px', fontSize: '14px', color: '#cbd5e1',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      verticalAlign: 'middle',
    },
    statusBadge: (status) => {
      const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
      return {
        padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`,
        whiteSpace: 'nowrap',
      };
    },
    actionBtns: { display: 'flex', gap: '8px', alignItems: 'center' },
    iconBtn: (color, bg) => ({
      background: bg ?? 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: color ?? '#e2e8f0', borderRadius: '8px',
      padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }),
    emptyState: {
      padding: '60px 24px', textAlign: 'center', color: '#64748b',
    },
    quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '24px' },
    quickCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
      border: `1px solid ${accent}20`, borderRadius: '12px',
      padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
      textDecoration: 'none', color: 'inherit', display: 'block',
    }),
    quickIcon: { fontSize: '24px', marginBottom: '8px' },
    quickLabel: { fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' },
    quickDesc: { fontSize: '12px', color: '#64748b' },
    toast: {
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#10b981', color: '#fff', padding: '12px 20px',
      borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  if (loading) return (
    <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌊</div>
        <div>Loading dashboard…</div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.greeting}>ORGANIZER DASHBOARD</div>
        <h1 style={styles.title}>Welcome back, {user?.first_name ?? user?.username ?? 'Organizer'} 👋</h1>
        <p style={styles.subtitle}>Manage your swim meets, heats, results and championships.</p>
      </div>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsGrid}>
          {[
            { num: stats.total,     label: 'Total Meets',     sub: 'All time',         accent: '#00d4ff' },
            { num: stats.active,    label: 'In Progress',     sub: 'Currently running', accent: '#10b981' },
            { num: stats.regOpen,   label: 'Reg. Open',       sub: 'Accepting entries', accent: '#3b82f6' },
            { num: stats.draft,     label: 'Drafts',          sub: 'Not published',    accent: '#f59e0b' },
            { num: stats.completed, label: 'Completed',       sub: 'Finished meets',   accent: '#8b5cf6' },
            { num: stats.events,    label: 'Total Events',    sub: 'Across all meets', accent: '#ef4444' },
          ].map(({ num, label, sub, accent }) => (
            <div key={label} style={styles.statCard(accent)}>
              <div style={styles.statGlow(accent)} />
              <div style={styles.statNum(accent)}>{num}</div>
              <div style={styles.statLabel}>{label}</div>
              <div style={styles.statSub}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={styles.sectionTitle}>⚡ Quick Actions</div>
        <div style={styles.quickGrid}>
          {[
            { to: '/meets/create', icon: '➕', label: 'Create New Meet',   desc: 'Set up a new swim meet',         accent: '#00d4ff' },
            { to: '/meets',        icon: '📋', label: 'Browse All Meets',  desc: 'View public meet listings',      accent: '#3b82f6' },
            { to: '#',             icon: '📊', label: 'Championships',     desc: 'SFI points & standings',         accent: '#8b5cf6' },
            { to: '#',             icon: '📁', label: 'Export Reports',    desc: 'Download results & heat sheets', accent: '#10b981' },
          ].map(({ to, icon, label, desc, accent }) => (
            <Link key={label} to={to} style={styles.quickCard(accent)}>
              <div style={styles.quickIcon}>{icon}</div>
              <div style={styles.quickLabel}>{label}</div>
              <div style={styles.quickDesc}>{desc}</div>
            </Link>
          ))}
        </div>

        {/* Meets Table */}
        <div style={{ ...styles.sectionHeader, marginTop: '40px' }}>
          <div style={styles.sectionTitle}>🏊 My Meets</div>
          <div style={styles.controlsRow}>
            <input
              style={styles.searchInput}
              placeholder="🔍  Search meets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              style={styles.filterSelect}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button style={styles.createBtn} onClick={() => navigate('/meets/create')}>
              + New Meet
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {filteredMeets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏊</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {meets.length === 0 ? 'No meets yet' : 'No meets match your filter'}
              </div>
              <div style={{ fontSize: '13px' }}>
                {meets.length === 0
                  ? <button style={styles.createBtn} onClick={() => navigate('/meets/create')}>Create your first meet →</button>
                  : 'Try adjusting your search or filter'}
              </div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Meet Name', 'Dates', 'Venue', 'Events', 'Status', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMeets.map((meet, i) => {
                  const name = meet.name ?? meet.meet_name ?? 'Untitled Meet';
                  return (
                    <tr key={meet.id} style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      transition: 'background 0.15s',
                    }}>
                      <td style={styles.td}>
                        <Link to={`/meets/${meet.id}`} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>
                          {name}
                        </Link>
                        {meet.meet_type && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{meet.meet_type}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px' }}>{formatDate(meet.start_date)}</div>
                        {meet.end_date && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>to {formatDate(meet.end_date)}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div>{meet.venue ?? '—'}</div>
                        {meet.city && <div style={{ fontSize: '11px', color: '#64748b' }}>{meet.city}</div>}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#00d4ff' }}>
                          {meet.event_count ?? '—'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(meet.status)}>{STATUS_CONFIG[meet.status_name]?.label ?? meet.status_name
                        }</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.iconBtn('#00d4ff')} onClick={() => navigate(`/meets/${meet.id}`)}>
                            View
                          </button>
                          <button style={styles.iconBtn('#e2e8f0')} onClick={() => navigate(`/meets/${meet.id}/heats`)}>
                            Heats
                          </button>
                          <button style={styles.iconBtn('#e2e8f0')} onClick={() => navigate(`/meets/${meet.id}/results`)}>
                            Results
                          </button>
                          {
  meet.status_name === 'completed' && (
    <button
      style={styles.iconBtn(
        '#10b981',
        'rgba(16,185,129,0.08)'
      )}
      onClick={() =>
        navigate(`/meets/${meet.id}/publish`)
      }
    >
      📢 Publish
    </button>
  )
}
                          <button
                            style={styles.iconBtn('#ef4444', 'rgba(239,68,68,0.08)')}
                            onClick={() => handleDelete(meet.id, name)}
                            disabled={deleting === meet.id}
                          >
                            {deleting === meet.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}