import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { meetsAPI, registrationsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CoachDashboard() {
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [meets,       setMeets]       = useState([]);
  const [swimmers,    setSwimmers]    = useState([]);
  const [allRegs,     setAllRegs]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [toast,       setToast]       = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetsRes, swimmersRes] = await Promise.all([
        meetsAPI.getAll(),
        usersAPI.getSwimmers(),
      ]);

      const allMeets    = meetsRes.data.results ?? meetsRes.data;
      const allSwimmers = swimmersRes.data.results ?? swimmersRes.data;

      setMeets(allMeets);
      setSwimmers(allSwimmers);

      // Get registrations for all swimmers
      try {
        const regsRes = await registrationsAPI.myRegistrations();
        setAllRegs(regsRes.data.results ?? regsRes.data);
      } catch { /* non-critical */ }

    } catch {
      showToast('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openMeets = meets.filter(m =>
    m.status_name === 'registration_open'
  );

  const stateMeets = meets.filter(m =>
    m.status_name === 'registration_open' &&
    m.level_name !== 'district'
  );

  /* ── Styles ──────────────────────────────────────────── */
  const css = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '60px',
    },
    header: {
      background: 'linear-gradient(180deg, rgba(0,212,255,0.07) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      padding: '32px 24px', maxWidth: '1100px', margin: '0 auto',
    },
    roleTag: {
      fontSize: '11px', fontWeight: 700, color: '#00d4ff',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px',
    },
    pageTitle: { fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' },
    subtitle:  { fontSize: '14px', color: '#64748b' },
    content:   { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },

    // Stats
    statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))',
      gap: '16px', marginBottom: '32px',
    },
    statCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '14px',
      padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }),
    statNum:   (accent) => ({ fontSize: '32px', fontWeight: 900, color: accent }),
    statLabel: { fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.04em' },

    // Tabs
    tabBar: {
      display: 'flex', gap: 0,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '28px',
    },
    tab: (active) => ({
      padding: '12px 20px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#00d4ff' : '#64748b',
      background: 'none', border: 'none', cursor: 'pointer',
      borderBottom: active ? '2px solid #00d4ff' : '2px solid transparent',
      whiteSpace: 'nowrap',
    }),

    // Cards
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
    },
    cardHeader: {
      padding: '16px 20px', background: 'rgba(0,212,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    cardTitle: { fontSize: '15px', fontWeight: 700, color: '#e2e8f0' },

    // Table
    table:  { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '11px 16px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: {
      padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      fontSize: '14px', verticalAlign: 'middle',
    },

    // Buttons
    btn: (variant) => {
      const v = {
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',    border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
      }[variant] ?? {};
      return {
        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', background: v.bg, color: v.color, border: v.border,
        textDecoration: 'none', display: 'inline-block',
      };
    },

    // Meet Card
    meetCard: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '20px', marginBottom: '12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: '12px',
    },
    meetName:   { fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' },
    meetMeta:   { fontSize: '12px', color: '#64748b' },
    levelBadge: (level) => ({
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      background: level === 'district' ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
      color: level === 'district' ? '#3b82f6' : '#8b5cf6',
    }),

    // Swimmer Card
    swimmerCard: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '18px', marginBottom: '12px',
    },
    swimmerName: { fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' },
    swimmerMeta: { fontSize: '12px', color: '#64748b' },
    swimmerActions: { display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' },

    emptyState: { padding: '50px 24px', textAlign: 'center', color: '#475569' },
    toast: {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
      padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: '#10b981', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  if (loading) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏋️</div>
        <div>Loading coach dashboard…</div>
      </div>
    </div>
  );

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <div style={css.roleTag}>COACH DASHBOARD</div>
        <h1 style={css.pageTitle}>
          Welcome, {user?.username ?? user?.first_name} 👋
        </h1>
        <p style={css.subtitle}>
          Manage your swimmers and nominate them for upcoming meets.
        </p>
      </div>

      <div style={css.content}>

        {/* Stats */}
        <div style={css.statsGrid}>
          {[
            { num: swimmers.length,   label: 'Total Swimmers', accent: '#00d4ff' },
            { num: openMeets.length,  label: 'Open Meets',     accent: '#10b981' },
            { num: stateMeets.length, label: 'State/National', accent: '#8b5cf6' },
            { num: allRegs.length,    label: 'Nominations',    accent: '#f59e0b' },
          ].map(({ num, label, accent }) => (
            <div key={label} style={css.statCard(accent)}>
              <div style={css.statNum(accent)}>{num}</div>
              <div style={css.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={css.tabBar}>
          {[
            { key: 'overview',  label: '📋 Overview'        },
            { key: 'swimmers',  label: '🏊 Swimmers'        },
            { key: 'meets',     label: '🏆 Open Meets'      },
            { key: 'nominate',  label: '📝 Nominate'        },
          ].map(({ key, label }) => (
            <button
              key={key}
              style={css.tab(activeTab === key)}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Open Meets for Nomination */}
            <div style={css.card}>
              <div style={css.cardHeader}>
                <div style={css.cardTitle}>🏆 Meets Open for Registration</div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {openMeets.length} meet{openMeets.length !== 1 ? 's' : ''} open
                </span>
              </div>
              {openMeets.length === 0 ? (
                <div style={css.emptyState}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>🏊</div>
                  <div>No meets currently open for registration.</div>
                </div>
              ) : (
                <div style={{ padding: '16px' }}>
                  {openMeets.slice(0, 3).map(meet => (
                    <div key={meet.id} style={css.meetCard}>
                      <div>
                        <div style={css.meetName}>{meet.name}</div>
                        <div style={css.meetMeta}>
                          {meet.location} · {meet.start_date}
                        </div>
                        <span style={{ ...css.levelBadge(meet.level_name), marginTop: '6px', display: 'inline-block' }}>
                          {meet.level_name} Level
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to={`/meets/${meet.id}`} style={css.btn('secondary')}>
                          View Meet
                        </Link>
                        {meet.level_name !== 'district' && (
                          <Link to={`/meets/${meet.id}/register`} style={css.btn('success')}>
                            Nominate Swimmer
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={css.card}>
              <div style={css.cardHeader}>
                <div style={css.cardTitle}>⚡ Quick Actions</div>
              </div>
              <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { to: '/meets',             label: 'Browse All Meets',    icon: '🏊' },
                  { to: '/my-registrations',  label: 'View Nominations',    icon: '📋' },
                ].map(({ to, label, icon }) => (
                  <Link key={to} to={to} style={{
                    ...css.btn('secondary'),
                    padding: '12px 20px', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    {icon} {label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Swimmers Tab ── */}
        {activeTab === 'swimmers' && (
          <div style={css.card}>
            <div style={css.cardHeader}>
              <div style={css.cardTitle}>🏊 All Swimmers ({swimmers.length})</div>
            </div>
            {swimmers.length === 0 ? (
              <div style={css.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏊</div>
                <div>No swimmers found in the system.</div>
              </div>
            ) : (
              <table style={css.table}>
                <thead>
                  <tr>
                    {['#', 'Swimmer', 'Email', 'Actions'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {swimmers.map((sw, i) => (
                    <tr key={sw.id}>
                      <td style={{ ...css.td, color: '#475569' }}>{i + 1}</td>
                      <td style={css.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg,#00d4ff,#0099bb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, color: '#0a0e1a',
                          }}>
                            {sw.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <strong style={{ color: '#e2e8f0' }}>{sw.username}</strong>
                        </div>
                      </td>
                      <td style={css.td}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>{sw.email}</span>
                      </td>
                      <td style={css.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {openMeets.filter(m => m.level_name !== 'district').length > 0 && (
                            <button
                              style={css.btn('success')}
                              onClick={() => {
                                const stateMeet = openMeets.find(m => m.level_name !== 'district');
                                if (stateMeet) navigate(`/meets/${stateMeet.id}/register`);
                              }}
                            >
                              Nominate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Open Meets Tab ── */}
        {activeTab === 'meets' && (
          <div>
            {openMeets.length === 0 ? (
              <div style={{ ...css.card }}>
                <div style={css.emptyState}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏊</div>
                  <div>No meets currently open for registration.</div>
                  <Link to="/meets" style={{ ...css.btn('primary'), marginTop: '16px', display: 'inline-block' }}>
                    Browse All Meets →
                  </Link>
                </div>
              </div>
            ) : (
              openMeets.map(meet => (
                <div key={meet.id} style={css.meetCard}>
                  <div>
                    <div style={css.meetName}>{meet.name}</div>
                    <div style={css.meetMeta}>
                      {meet.location} · {meet.start_date} to {meet.end_date}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={css.levelBadge(meet.level_name)}>
                        {meet.level_name} Level
                      </span>
                      {meet.registration_end_date && (
                        <span style={{
                          padding: '3px 10px', borderRadius: '8px', fontSize: '11px',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600,
                        }}>
                          Deadline: {meet.registration_end_date}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link to={`/meets/${meet.id}`} style={css.btn('secondary')}>
                      View Details
                    </Link>
                    {meet.level_name !== 'district' && (
                      <Link to={`/meets/${meet.id}/register`} style={css.btn('success')}>
                        Nominate Swimmer →
                      </Link>
                    )}
                    {meet.level_name === 'district' && (
                      <span style={{ fontSize: '12px', color: '#475569', alignSelf: 'center' }}>
                        District — swimmers register themselves
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Nominate Tab ── */}
        {activeTab === 'nominate' && (
          <div>
            {stateMeets.length === 0 ? (
              <div style={css.card}>
                <div style={css.emptyState}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
                  <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '8px' }}>
                    No State/National meets open
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                    Coach nominations are only for State and National level meets.
                    District meets allow swimmers to self-register.
                  </div>
                  <Link to="/meets" style={{ ...css.btn('primary'), display: 'inline-block' }}>
                    Browse All Meets →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
                  fontSize: '13px', color: '#3b82f6',
                }}>
                  👨‍🏫 As a coach, you can nominate swimmers for State and National level meets.
                  Select a meet below to start nominating.
                </div>

                {stateMeets.map(meet => (
                  <div key={meet.id} style={css.meetCard}>
                    <div>
                      <div style={css.meetName}>{meet.name}</div>
                      <div style={css.meetMeta}>
                        {meet.location} · Deadline: {meet.registration_end_date ?? 'TBD'}
                      </div>
                      <span style={{ ...css.levelBadge(meet.level_name), marginTop: '6px', display: 'inline-block' }}>
                        {meet.level_name} Level
                      </span>
                    </div>
                    <Link
                      to={`/meets/${meet.id}/register`}
                      style={{ ...css.btn('success'), fontSize: '14px', padding: '10px 20px' }}
                    >
                      Nominate Swimmers →
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>

      {toast && <div style={css.toast}>{toast}</div>}
    </div>
  );
}