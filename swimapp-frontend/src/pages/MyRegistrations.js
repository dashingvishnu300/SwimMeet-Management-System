import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyRegistrations() {
  const navigate       = useNavigate();
  const { user }       = useAuth();

  const [regs,     setRegs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | active | cancelled
  const [toast,    setToast]    = useState('');

  useEffect(() => { fetchRegs(); }, []);

  const fetchRegs = async () => {
    try {
      setLoading(true);
      const res  = await registrationsAPI.myRegistrations();
      const data = res.data.results ?? res.data;
      setRegs(data);
    } catch {
      showToast('❌ Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (meetId, regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await registrationsAPI.recall(meetId, regId);
      showToast('✅ Registration cancelled.');
      fetchRegs();
    } catch {
      showToast('❌ Failed to cancel.');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const displaySeedTime = (t) => {
    if (!t) return 'NT';
    try {
      const parts = t.split(':');
      const sec = parseFloat(parts[2] ?? parts[0]);
      const min = parseInt(parts[1] ?? 0);
      const s   = sec.toFixed(2).padStart(5, '0');
      return min > 0 ? `${min}:${s}` : `${s}`;
    } catch { return t; }
  };

  const filtered = regs.filter(r => {
    if (filter === 'active')    return !r.recall;
    if (filter === 'cancelled') return r.recall;
    return true;
  });

  // Group by meet
  const grouped = filtered.reduce((acc, reg) => {
    const key = reg.meet;
    if (!acc[key]) acc[key] = { meet_name: reg.meet_name, meet_id: reg.meet, regs: [] };
    acc[key].regs.push(reg);
    return acc;
  }, {});

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
      padding: '24px', maxWidth: '900px', margin: '0 auto',
    },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    subtitle:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '900px', margin: '0 auto', padding: '28px 24px' },

    // Summary
    summaryRow: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))',
      gap: '14px', marginBottom: '24px',
    },
    summaryCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '12px',
      padding: '16px', textAlign: 'center',
    }),
    summaryNum:   (accent) => ({ fontSize: '28px', fontWeight: 900, color: accent }),
    summaryLabel: { fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' },

    // Filter
    filterRow: { display: 'flex', gap: '10px', marginBottom: '24px' },
    filterBtn: (active) => ({
      padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', border: 'none', transition: 'all 0.2s',
      background: active ? 'linear-gradient(135deg,#00d4ff,#0099bb)' : 'rgba(255,255,255,0.06)',
      color: active ? '#0a0e1a' : '#94a3b8',
    }),

    // Meet Group
    meetGroup: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
    },
    meetHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', background: 'rgba(0,212,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    meetName: { fontSize: '16px', fontWeight: 700, color: '#e2e8f0' },
    meetLink: { fontSize: '12px', color: '#00d4ff', textDecoration: 'none', fontWeight: 600 },
    eventCount: {
      padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
      background: 'rgba(0,212,255,0.1)', color: '#00d4ff',
    },

    // Table
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)',
    },
    td: { padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '14px' },

    statusBadge: (recall, sentBack) => ({
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      background: recall
        ? 'rgba(239,68,68,0.15)'
        : sentBack
          ? 'rgba(245,158,11,0.15)'
          : 'rgba(16,185,129,0.15)',
      color: recall ? '#ef4444' : sentBack ? '#f59e0b' : '#10b981',
    }),

    cancelBtn: {
      padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', background: 'rgba(239,68,68,0.1)',
      color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
    },
    emptyState: { padding: '60px 24px', textAlign: 'center', color: '#475569' },
    toast: {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
      padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: toast?.startsWith('❌') ? '#ef4444' : '#10b981',
      color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  if (loading) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
        <div>Loading your registrations…</div>
      </div>
    </div>
  );

  const activeCount    = regs.filter(r => !r.recall).length;
  const cancelledCount = regs.filter(r => r.recall).length;
  const meetCount      = [...new Set(regs.map(r => r.meet))].length;

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <h1 style={css.pageTitle}>📋 My Registrations</h1>
        <p style={css.subtitle}>
          Welcome, {user?.username ?? user?.first_name}! Here are all your event registrations.
        </p>
      </div>

      <div style={css.content}>
        {/* Summary */}
        <div style={css.summaryRow}>
          {[
            { num: regs.length,    label: 'Total Entries',  accent: '#00d4ff' },
            { num: meetCount,      label: 'Meets Entered',  accent: '#3b82f6' },
            { num: activeCount,    label: 'Active',         accent: '#10b981' },
            { num: cancelledCount, label: 'Cancelled',      accent: '#ef4444' },
          ].map(({ num, label, accent }) => (
            <div key={label} style={css.summaryCard(accent)}>
              <div style={css.summaryNum(accent)}>{num}</div>
              <div style={css.summaryLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={css.filterRow}>
          {[
            { key: 'all',       label: `All (${regs.length})`         },
            { key: 'active',    label: `✅ Active (${activeCount})`    },
            { key: 'cancelled', label: `❌ Cancelled (${cancelledCount})` },
          ].map(({ key, label }) => (
            <button key={key} style={css.filterBtn(filter === key)} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Grouped by Meet */}
        {Object.keys(grouped).length === 0 ? (
          <div style={css.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏊</div>
            <div style={{ fontSize: '18px', color: '#e2e8f0', marginBottom: '8px' }}>
              No registrations found
            </div>
            <div style={{ fontSize: '13px', marginBottom: '20px' }}>
              {filter !== 'all'
                ? 'Try changing the filter above.'
                : 'Browse meets and register for events!'}
            </div>
            <button
              style={{
                padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                background: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a',
                border: 'none', cursor: 'pointer',
              }}
              onClick={() => navigate('/meets')}
            >
              Browse Meets →
            </button>
          </div>
        ) : (
          Object.values(grouped).map(group => (
            <div key={group.meet_id} style={css.meetGroup}>
              {/* Meet Header */}
              <div style={css.meetHeader}>
                <div>
                  <div style={css.meetName}>{group.meet_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    {group.regs.filter(r => !r.recall).length} active · {group.regs.filter(r => r.recall).length} cancelled
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={css.eventCount}>{group.regs.length} event{group.regs.length !== 1 ? 's' : ''}</span>
                  <Link to={`/meets/${group.meet_id}`} style={css.meetLink}>
                    View Meet →
                  </Link>
                </div>
              </div>

              {/* Events Table */}
              <table style={css.table}>
                <thead>
                  <tr>
                    {['#', 'Event', 'Seed Time', 'Nominated By', 'Status', 'Action'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.regs.map((reg, i) => (
                    <tr key={reg.id} style={{ opacity: reg.recall ? 0.5 : 1 }}>
                      <td style={{ ...css.td, color: '#475569' }}>{i + 1}</td>
                      <td style={css.td}>
                        <strong style={{ color: '#e2e8f0' }}>{reg.event_name}</strong>
                      </td>
                      <td style={css.td}>
                        <span style={{ fontFamily: 'monospace', color: '#00d4ff', fontSize: '13px' }}>
                          {displaySeedTime(reg.seed_time)}
                        </span>
                      </td>
                      <td style={css.td}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          {reg.nominated_by_name ?? 'Self'}
                        </span>
                      </td>
                      <td style={css.td}>
                        <span style={css.statusBadge(reg.recall, reg.sent_back)}>
                          {reg.recall ? 'Cancelled' : reg.sent_back ? 'Sent Back' : '✓ Active'}
                        </span>
                      </td>
                      <td style={css.td}>
                        {!reg.recall && (
                          <button
                            style={css.cancelBtn}
                            onClick={() => handleCancel(reg.meet, reg.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {toast && <div style={css.toast}>{toast}</div>}
    </div>
  );
}