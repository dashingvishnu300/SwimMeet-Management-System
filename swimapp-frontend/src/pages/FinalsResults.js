import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, eventsAPI, resultsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MEDAL_CONFIG = {
  gold:   { icon: '🥇', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  silver: { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' },
  bronze: { icon: '🥉', color: '#cd7f32', bg: 'rgba(180,120,60,0.12)',  border: 'rgba(180,120,60,0.3)'  },
  none:   { icon: '',   color: '#64748b', bg: 'transparent',             border: 'rgba(255,255,255,0.06)'},
};

const LANE_COLORS = ['#ef4444','#f59e0b','#10b981','#00d4ff','#3b82f6','#8b5cf6','#ec4899','#6b7280'];

export default function FinalsResults() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const isOrganizer = (user?.role?.name ?? user?.role) === 'organizer';

  const [meet,           setMeet]           = useState(null);
  const [events,         setEvents]         = useState([]);
  const [selectedEvent,  setSelectedEvent]  = useState('');
  const [finals,         setFinals]         = useState([]);
  const [selectedFinal,  setSelectedFinal]  = useState(null);
  const [lanes,          setLanes]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [finalsLoading,  setFinalsLoading]  = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState('');
  const [viewMode,       setViewMode]       = useState('draw'); // draw | results

  useEffect(() => { fetchInitial(); }, [meetId]);
  useEffect(() => { if (selectedEvent) fetchFinals(); }, [selectedEvent]);
  useEffect(() => { if (selectedFinal) buildLanes(); }, [selectedFinal]);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [meetRes, eventsRes] = await Promise.all([
        meetsAPI.getOne(meetId),
        eventsAPI.getMeetEvents(meetId),
      ]);
      setMeet(meetRes.data);
      const evs = eventsRes.data.results ?? eventsRes.data;
      setEvents(evs);
      if (evs.length > 0) setSelectedEvent(String(evs[0].id));
    } catch { showToast('Failed to load meet data.'); }
    finally { setLoading(false); }
  };

  const fetchFinals = async () => {
    try {
      setFinalsLoading(true);
      setSelectedFinal(null);
      setLanes([]);
      const res  = await resultsAPI.getFinals(meetId, selectedEvent);
      const data = res.data.results ?? res.data;
      setFinals(data);

if (data.length > 0) {

    setSelectedFinal(data[0]);

    if (
        data[0].results &&
        data[0].results.length > 0
    ) {

        setViewMode('results');

    }

    else {

        setViewMode('draw');

    }

}
    } catch { setFinals([]); }
    finally { setFinalsLoading(false); }
  };

  const buildLanes = () => {
    if (!selectedFinal) return;

    const swimmerMap = {};
    (selectedFinal.swimmers ?? []).forEach(sw => {
      swimmerMap[sw.lane_number] = sw;
    });

    const resultsMap = {};
    (selectedFinal.results ?? []).forEach(r => {
      resultsMap[r.swimmer] = r;
    });

    // Build 8 lane entries
    const laneEntries = Array.from({ length: 8 }, (_, i) => {
      const laneNum = i + 1;
      const swimmer = swimmerMap[laneNum];
      const result  = swimmer ? (resultsMap[swimmer.swimmer] ?? {}) : {};
      return {
        lane_number:  laneNum,
        swimmer_id:   swimmer?.swimmer ?? null,
        swimmer_name: swimmer?.swimmer_name ?? '',
        swimmer_type: swimmer?.swimmer_type ?? 'finalist',
        finish_time:  result.finish_time ? formatTimeForDisplay(result.finish_time) : '',
        status:       result.status ?? 'swam',
        rank:         result.rank ?? null,
        medal:        result.medal ?? 'none',
        dirty:        false,
      };
    });

    // Add reserves (no lane assigned)
    const reserves = (selectedFinal.swimmers ?? []).filter(sw => sw.swimmer_type === 'reserve');

    setLanes(laneEntries);
  };

  const handleGenerateFinals = async () => {
    try {
      setGenerating(true);
      await resultsAPI.generateAllFinals(meetId);
      showToast('Finals generated successfully!');
      await fetchFinals();
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to generate finals.';
      showToast(msg);
    } finally {
      setGenerating(false);
    }
  };

  const updateLane = (laneNum, field, value) => {
    setLanes(prev => prev.map(l =>
      l.lane_number === laneNum ? { ...l, [field]: value, dirty: true } : l
    ));
  };

  const handleSave = async () => {
    if (!selectedFinal) return;
    const swimmerLanes = lanes.filter(l => l.swimmer_id);
    if (swimmerLanes.length === 0) { showToast('No swimmers to save.'); return; }

    try {
      setSaving(true);
      const results = swimmerLanes.map(l => ({
        swimmer_id:  parseInt(l.swimmer_id),
        finish_time: formatTimeForBackend(l.finish_time) || null,
        status:      l.status ?? 'swam',
      }));

      const res = await resultsAPI.enterFinalResults(selectedFinal.id, { results });
      showToast('Final results saved! Medals assigned automatically.');

      // Refresh finals
      await fetchFinals();
      setViewMode('results');
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Save failed.';
      showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatTimeForBackend = (t) => {
    if (!t) return null;
    try {
      const s = String(t).trim();
      let totalSecs;
      if (s.includes(':')) {
        const parts = s.split(':');
        if (parts.length === 3) {
          totalSecs = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        } else {
          totalSecs = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        }
      } else {
        totalSecs = parseFloat(s);
      }
      if (isNaN(totalSecs)) return null;
      const mins  = Math.floor(totalSecs / 60);
      const secs  = totalSecs % 60;
      const whole = Math.floor(secs);
      const micro = Math.round((secs - whole) * 1000000);
      return `00:${String(mins).padStart(2,'0')}:${String(whole).padStart(2,'0')}.${String(micro).padStart(6,'0')}`;
    } catch { return null; }
  };

  const formatTimeForDisplay = (t) => {
    if (!t) return '';
    try {
      const parts = String(t).split(':');
      let secs;
      if (parts.length === 3) {
        secs = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      } else if (parts.length === 2) {
        secs = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
      } else {
        secs = parseFloat(t);
      }
      const m = Math.floor(secs / 60);
      const s = (secs % 60).toFixed(2).padStart(5, '0');
      return m > 0 ? `${m}:${s}` : `${s}`;
    } catch { return t; }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const currentEvent = events.find(e => String(e.id) === selectedEvent);
  const hasResults   = selectedFinal?.results?.length > 0;
  const dirtyCount   = lanes.filter(l => l.dirty).length;

  /* ── Styles ──────────────────────────────────────────── */
  const css = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '80px',
    },
    header: {
      background: 'linear-gradient(180deg, rgba(251,191,36,0.07) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(251,191,36,0.1)',
      padding: '24px', maxWidth: '1100px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '1100px', margin: '0 auto', padding: '24px' },
    selectors: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px', marginBottom: '24px',
    },
    label: {
      fontSize: '11px', fontWeight: 700, color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
    },
    select: {
      width: '100%', background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
    },
    btn: (variant) => {
      const v = {
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',    border: 'none' },
        warning:   { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0a0e1a', border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' },
        gold:      { bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0a0e1a', border: 'none' },
      }[variant] || {};
      return {
        padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: v.bg, color: v.color, border: v.border,
      };
    },
    tabRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tabBtn: (active) => ({
      padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', border: 'none',
      background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
      color: active ? '#fbbf24' : '#64748b',
      outline: active ? '1px solid rgba(251,191,36,0.3)' : 'none',
    }),
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
    },
    cardHeader: {
      padding: '14px 20px', background: 'rgba(251,191,36,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '11px 16px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: {
      padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      fontSize: '14px', verticalAlign: 'middle',
    },
    laneDot: (lane) => {
      const c = LANE_COLORS[(lane - 1) % LANE_COLORS.length];
      return {
        display: 'inline-flex', width: '26px', height: '26px', borderRadius: '50%',
        background: `${c}20`, border: `2px solid ${c}`,
        alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, color: c,
      };
    },
    medalRow: (medal) => {
      const cfg = MEDAL_CONFIG[medal] ?? MEDAL_CONFIG.none;
      return {
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.border}`,
      };
    },
    medalBadge: (medal) => {
      const cfg = MEDAL_CONFIG[medal] ?? MEDAL_CONFIG.none;
      return {
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      };
    },
    timeInput: {
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '14px',
      fontFamily: 'monospace', width: '110px', outline: 'none',
    },
    statusSelect: {
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px', padding: '7px 10px', color: '#e2e8f0',
      fontSize: '13px', outline: 'none', cursor: 'pointer',
    },
    emptyState: { padding: '60px 24px', textAlign: 'center', color: '#475569' },
    generateBox: {
      background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
      borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '20px',
    },
    saveBar: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(13,21,38,0.95)', borderTop: '1px solid rgba(251,191,36,0.15)',
      backdropFilter: 'blur(12px)', padding: '14px 24px',
      display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center',
      zIndex: 100,
    },
    toast: {
      position: 'fixed', bottom: '80px', right: '24px', zIndex: 1000,
      padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: '#10b981', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  if (loading) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏆</div>
        <div>Loading finals…</div>
      </div>
    </div>
  );

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <button style={css.backBtn} onClick={() => navigate(`/meets/${meetId}`)}>
          ← Back to Meet
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={css.pageTitle}>🏆 Finals & Results</h1>
            <div style={css.meetName}>{meet?.name}</div>
          </div>
          <button
            style={css.btn('secondary')}
            onClick={() => navigate(`/meets/${meetId}/results`)}
          >
            ← Heat Results
          </button>
        </div>
      </div>

      <div style={css.content}>
        {/* Event Selector */}
        <div style={css.selectors}>
          <div>
            <div style={css.label}>Event</div>
            <select
              style={css.select}
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
            >
              {events.length === 0
                ? <option>No events found</option>
                : events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.event_name ?? ev.name}
                    </option>
                  ))
              }
            </select>
          </div>
        </div>

        {finalsLoading ? (
          <div style={css.emptyState}>Loading finals…</div>
        ) : finals.length === 0 ? (
          /* ── No Finals Yet ── */
          <div style={css.generateBox}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              No Finals Generated Yet
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              All heats must be completed before generating finals.
              Finals will include top 8 finalists + 2 reserves.
            </div>
            {isOrganizer && (
              <button
                style={{ ...css.btn('gold'), fontSize: '14px', padding: '12px 28px' }}
                onClick={handleGenerateFinals}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate All Finals'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Finals Exist ── */}
            {finals.map(final => (
              <div key={final.id}>
                {/* View Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                      Final {final.final_number} — {final.event_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {final.swimmers?.filter(s => s.swimmer_type === 'finalist').length ?? 0} finalists ·{' '}
                      {final.swimmers?.filter(s => s.swimmer_type === 'reserve').length ?? 0} reserves
                    </div>
                  </div>
                  <div style={css.tabRow}>
                  <button
  style={css.tabBtn(viewMode === 'draw')}
  onClick={() => !hasResults && setViewMode('draw')}
  disabled={hasResults}
>
  Lane Draw
</button>
{hasResults && (

<button
  style={css.tabBtn(viewMode === 'results')}
  onClick={() => setViewMode('results')}
>
  Results
</button>

)}
                  </div>
                </div>

                {/* ── Lane Draw View ── */}
                {viewMode === 'draw' && (
                  <div style={css.card}>
                    <div style={css.cardHeader}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                        Final Lane Assignments
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Enter finish times below
                      </span>
                    </div>
                    <table style={css.table}>
                      <thead>
                        <tr>
                          {['Lane', 'Swimmer', 'Type', 'Finish Time', ...(isOrganizer ? ['Status'] : [])].map(h => (
                            <th key={h} style={css.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lanes.map(lane => (
                          <tr key={lane.lane_number} style={{
                            background: lane.dirty ? 'rgba(251,191,36,0.04)' : 'transparent',
                          }}>
                            <td style={css.td}>
                              <span style={css.laneDot(lane.lane_number)}>{lane.lane_number}</span>
                            </td>
                            <td style={css.td}>
                              {lane.swimmer_name
                                ? <strong style={{ color: '#e2e8f0' }}>{lane.swimmer_name}</strong>
                                : <span style={{ color: '#334155', fontStyle: 'italic' }}>— Empty —</span>
                              }
                            </td>
                            <td style={css.td}>
                              {lane.swimmer_name && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                  background: lane.swimmer_type === 'finalist' ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.15)',
                                  color: lane.swimmer_type === 'finalist' ? '#fbbf24' : '#94a3b8',
                                }}>
                                  {lane.swimmer_type === 'finalist' ? 'Finalist' : 'Reserve'}
                                </span>
                              )}
                            </td>
                            <td style={css.td}>
                              {lane.swimmer_name ? (
                                isOrganizer ? (
                                  <input
                                    style={{
                                      ...css.timeInput,
                                      borderColor: lane.dirty ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.12)',
                                    }}
                                    placeholder="1:02.34"
                                    value={lane.finish_time}
                                    onChange={e => updateLane(lane.lane_number, 'finish_time', e.target.value)}
                                    disabled={
                                      lane.status !== 'swam' ||
                                      hasResults
                                    }
                                  />
                                ) : (
                                  <span style={{ fontFamily: 'monospace', color: '#10b981' }}>
                                    {lane.finish_time || '—'}
                                  </span>
                                )
                              ) : '—'}
                            </td>
                            {isOrganizer && (
                              <td style={css.td}>
                                {lane.swimmer_name ? (
                                  <select
                                    disabled={hasResults}
                                    style={css.statusSelect}
                                    value={lane.status}
                                    onChange={e => updateLane(lane.lane_number, 'status', e.target.value)}
                                  >
                                    <option value="swam">Swam</option>
                                    <option value="dns">DNS</option>
                                    <option value="dnf">DNF</option>
                                    <option value="dq">DQ</option>
                                  </select>
                                ) : '—'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── Results View ── */}
                {viewMode === 'results' && (
                  <div style={css.card}>
                  {/* My Performance */}
{!isOrganizer && (() => {
  const myResult = [...final.results].find(
    r => r.swimmer_name === user?.username
  );

  if (!myResult) return null;

  const medal = myResult.medal ?? 'none';

  return (
    <div
      style={{
        margin: '20px',
        padding: '20px',
        borderRadius: '14px',
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.2)'
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '16px'
        }}
      >
        🏊 Your Performance
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>Rank</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            #{myResult.rank}
          </div>
        </div>

        <div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>Medal</div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {MEDAL_CONFIG[medal]?.icon || '🏅'}
          </div>
        </div>

        <div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>Time</div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#10b981'
            }}
          >
            {formatTimeForDisplay(myResult.finish_time)}
          </div>
        </div>
      </div>
    </div>
  );
})()}

{hasResults && (

<div
  style={{
    padding: '14px',
    background: 'rgba(16,185,129,0.1)',
    borderBottom: '1px solid rgba(16,185,129,0.2)',
    color: '#10b981',
    fontWeight: 700
  }}
>
  🏆 Final Results Locked
</div>

)}


                    <div style={css.cardHeader}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                        Final Results
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Medals auto-assigned by finish time
                      </span>
                    </div>
                    {!hasResults ? (
                      <div style={css.emptyState}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏅</div>
                        <div>No results entered yet.</div>
                      </div>
                    ) : (
                      <table style={css.table}>
                        <thead>
                          <tr>
                            {['Rank', 'Medal', 'Swimmer', 'Finish Time', 'Status'].map(h => (
                              <th key={h} style={css.th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...final.results]
                            .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
                            .map(result => {
                              const medal = result.medal ?? 'none';
                              return (
                                <tr
  key={result.id}
  style={{
    ...css.medalRow(medal),
    background:
      result.swimmer_name === user?.username
        ? 'rgba(0,212,255,0.12)'
        : css.medalRow(medal).background
  }}
>
                                  <td style={{ ...css.td, textAlign: 'center', fontWeight: 800, fontSize: '16px' }}>
                                    {result.rank ?? '—'}
                                  </td>
                                  <td style={css.td}>
                                    {medal !== 'none' && (
                                      <span style={css.medalBadge(medal)}>
                                        {MEDAL_CONFIG[medal].icon} {medal.charAt(0).toUpperCase() + medal.slice(1)}
                                      </span>
                                    )}
                                  </td>
                                  <td style={css.td}>
                                    <strong style={{ color: '#e2e8f0' }}>{result.swimmer_name}</strong>
                                  </td>
                                  <td style={css.td}>
                                    <span style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '15px' }}>
                                      {result.finish_time ? formatTimeForDisplay(result.finish_time) : '—'}
                                    </span>
                                  </td>
                                  <td style={css.td}>
                                    <span style={{
                                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                      background: result.status === 'swam' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                      color: result.status === 'swam' ? '#10b981' : '#ef4444',
                                    }}>
                                      {result.status?.toUpperCase() ?? 'SWAM'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Reserves Section */}
                {final.swimmers?.filter(s => s.swimmer_type === 'reserve').length > 0 && (
                  <div style={{
                    background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.15)',
                    borderRadius: '12px', padding: '16px 20px', marginTop: '12px',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
                      📋 Reserves (Ranks 9-10)
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {final.swimmers.filter(s => s.swimmer_type === 'reserve').map((sw, i) => (
                        <div key={sw.id} style={{
                          background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                          padding: '8px 14px', fontSize: '13px', color: '#94a3b8',
                        }}>
                          Reserve {i + 1}: <strong style={{ color: '#e2e8f0' }}>{sw.swimmer_name}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Save Bar */}
      {isOrganizer &&selectedFinal &&viewMode === 'draw' &&!hasResults && (
        <div style={css.saveBar}>
          <span style={{ fontSize: '13px', color: '#64748b', marginRight: 'auto' }}>
            {dirtyCount > 0 ? `${dirtyCount} unsaved changes` : 'All changes saved'}
          </span>
          {!hasResults && (

<button
    style={css.btn('secondary')}
    onClick={buildLanes}
    disabled={saving}
>
    Reset
</button>

)}
          <button
            style={{ ...css.btn('gold'), opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Final Results'}
          </button>
        </div>
      )}

      {toast && <div style={css.toast}>{toast}</div>}
    </div>
  );
}