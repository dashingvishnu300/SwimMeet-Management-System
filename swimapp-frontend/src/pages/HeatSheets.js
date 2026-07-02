import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, eventsAPI, heatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LANE_COLORS = ['#ef4444','#f59e0b','#10b981','#00d4ff','#3b82f6','#8b5cf6','#ec4899','#6b7280'];

export default function HeatSheets() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();
  const printRef        = useRef();
  const { user }        = useAuth();

  const isOrganizer = (user?.role?.name ?? user?.role) === 'organizer';

  const [meet,          setMeet]          = useState(null);
  const [events,        setEvents]        = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [heats,         setHeats]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [heatsLoading,  setHeatsLoading]  = useState(false);
  const [error,         setError]         = useState('');
  const [viewMode,      setViewMode]      = useState('all');
  const [allHeats,      setAllHeats]      = useState({});
  const [generating,    setGenerating]    = useState(null);
  const [toast,         setToast]         = useState('');

  useEffect(() => { fetchInitial(); }, [meetId]);
  useEffect(() => { if (selectedEvent) fetchHeats(selectedEvent); }, [selectedEvent]);

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
      if (evs.length > 0) {
        setSelectedEvent(evs[0].id);
      }
    } catch {
      setError('Failed to load meet data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeats = async (eventId) => {
    if (allHeats[eventId]) { setHeats(allHeats[eventId]); return; }
    try {
      setHeatsLoading(true);
      const res  = await heatsAPI.getHeats(meetId, eventId);
      const data = res.data.results ?? res.data;
      setHeats(data);
      setAllHeats(prev => ({ ...prev, [eventId]: data }));
    } catch {
      setHeats([]);
    } finally {
      setHeatsLoading(false);
    }
  };

  const fetchAllHeats = async () => {
    setHeatsLoading(true);
    const results = {};
    for (const ev of events) {
      try {
        const res = await heatsAPI.getHeats(meetId, ev.id);
        results[ev.id] = res.data.results ?? res.data;
      } catch { results[ev.id] = []; }
    }
    setAllHeats(results);
    setHeatsLoading(false);
  };

  const handleGenerateHeats = async (eventId) => {
    try {
      setGenerating(eventId);
      await heatsAPI.generate(meetId, eventId);
      // Clear cache for this event and reload
      setAllHeats(prev => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      // Reload heats for this event
      const res  = await heatsAPI.getHeats(meetId, eventId);
      const data = res.data.results ?? res.data;
      setHeats(data);
      setAllHeats(prev => ({ ...prev, [eventId]: data }));
      showToast('Heats generated successfully!');
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to generate heats.';
      showToast(msg);
    } finally {
      setGenerating(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePrint = () => window.print();

  const formatTime = (t) => {
    if (!t) return '—';
    if (typeof t === 'string' && t.includes(':')) return t;
    const secs = parseFloat(t);
    if (isNaN(secs)) return t;
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(2).padStart(5, '0');
    return m > 0 ? `${m}:${s}` : `${s}`;
  };

  const currentEvent = events.find(e => e.id === selectedEvent);

  /* ── Styles ─────────────────────────────────────────────── */
  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '60px',
    },
    header: {
      background: 'linear-gradient(180deg, rgba(0,212,255,0.07) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      padding: '24px', maxWidth: '1400px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    toolbarBtns: { display: 'flex', gap: '10px' },
    btn: (variant) => {
      const v = {
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',    border: 'none' },
      }[variant] || {};
      return {
        padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        background: v.bg, color: v.color, border: v.border,
      };
    },
    layout: { display: 'flex', maxWidth: '1400px', margin: '0 auto', gap: 0 },
    sidebar: {
      width: '280px', flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 0', minHeight: 'calc(100vh - 120px)',
      position: 'sticky', top: 0, maxHeight: '100vh', overflowY: 'auto',
    },
    sidebarTitle: {
      fontSize: '11px', fontWeight: 700, color: '#475569',
      textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 20px 12px',
    },
    eventItem: (active) => ({
      padding: '10px 20px', cursor: 'pointer', transition: 'all 0.15s',
      background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
      borderLeft: active ? '3px solid #00d4ff' : '3px solid transparent',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    }),
    eventItemName: (active) => ({
      fontSize: '13px', fontWeight: active ? 600 : 400,
      color: active ? '#00d4ff' : '#94a3b8',
    }),
    eventItemMeta: { fontSize: '11px', color: '#475569', marginTop: '2px' },
    main: { flex: 1, padding: '24px' },
    eventHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
    },
    eventTitle: { fontSize: '20px', fontWeight: 800, color: '#fff' },
    eventMeta:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    heatCount: {
      padding: '4px 12px', background: 'rgba(0,212,255,0.1)',
      border: '1px solid rgba(0,212,255,0.25)', borderRadius: '12px',
      fontSize: '12px', color: '#00d4ff', fontWeight: 600,
    },
    heatBlock: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', marginBottom: '20px', overflow: 'hidden',
    },
    heatHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px', background: 'rgba(0,212,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    heatTitle:    { fontSize: '15px', fontWeight: 700, color: '#e2e8f0' },
    heatSubtitle: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    heatFinalBadge: {
      padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
      background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
      border: '1px solid rgba(245,158,11,0.3)',
    },
    laneTable: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)',
    },
    laneRow: (lane, total) => ({
      background: lane === Math.ceil(total / 2) ? 'rgba(0,212,255,0.04)' : 'transparent',
      transition: 'background 0.15s',
    }),
    laneCell: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '14px' },
    laneDot: (lane) => ({
      display: 'inline-flex', width: '24px', height: '24px', borderRadius: '50%',
      background: `${LANE_COLORS[(lane - 1) % LANE_COLORS.length]}22`,
      border: `2px solid ${LANE_COLORS[(lane - 1) % LANE_COLORS.length]}`,
      alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700,
      color: LANE_COLORS[(lane - 1) % LANE_COLORS.length],
    }),
    swimmerName: { fontSize: '14px', fontWeight: 600, color: '#e2e8f0' },
    teamName:    { fontSize: '11px', color: '#64748b', marginTop: '2px' },
    seedTime:    { fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' },
    ntText:      { fontSize: '13px', color: '#475569', fontStyle: 'italic' },
    emptyLane:   { fontSize: '13px', color: '#334155', fontStyle: 'italic' },
    noHeats:     { textAlign: 'center', padding: '60px 24px', color: '#475569' },
    loading:     { textAlign: 'center', padding: '60px 24px', color: '#64748b' },
    generateBtn: (disabled) => ({
      marginTop: '16px', padding: '10px 24px', borderRadius: '10px',
      fontSize: '14px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      background: 'linear-gradient(135deg,#10b981,#059669)',
      color: '#fff', border: 'none', opacity: disabled ? 0.6 : 1,
    }),
    generateBtnSm: (disabled) => ({
      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: 'linear-gradient(135deg,#10b981,#059669)',
      color: '#fff', border: 'none', opacity: disabled ? 0.6 : 1,
    }),
  };

  /* ── Render Heat Block ──────────────────────────────────── */
  const renderHeat = (heat, heatNum, totalHeats) => {
    const lanes = heat.swimmers ?? heat.lanes ?? heat.heat_entries ?? [];
    const laneMap = {};
    lanes.forEach(l => { laneMap[l.lane_number ?? l.lane] = l; });
    const maxLane = Math.max(8, ...Object.keys(laneMap).map(Number));

    return (
      <div key={heat.id} style={s.heatBlock}>
        <div style={s.heatHeader}>
          <div>
            <div style={s.heatTitle}>Heat {heat.heat_number ?? heatNum}</div>
            <div style={s.heatSubtitle}>{lanes.length} swimmer{lanes.length !== 1 ? 's' : ''} assigned</div>
          </div>
          {heat.is_final && <span style={s.heatFinalBadge}>FINAL</span>}
          {heat.heat_type && heat.heat_type !== 'preliminary' && (
            <span style={{ ...s.heatFinalBadge, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)' }}>
              {heat.heat_type.toUpperCase()}
            </span>
          )}
        </div>
        <table style={s.laneTable}>
          <thead>
            <tr>
              {['Lane', 'Swimmer', 'Team / Club', 'Age', 'Seed Time'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLane }, (_, i) => i + 1).map(laneNum => {
              const entry = laneMap[laneNum];
              return (
                <tr key={laneNum} style={s.laneRow(laneNum, maxLane)}>
                  <td style={s.laneCell}>
                    <span style={s.laneDot(laneNum)}>{laneNum}</span>
                  </td>
                  <td style={s.laneCell}>
                    {entry ? (
                      <>
                    <div style={s.swimmerName}>{entry.swimmer_name ?? '—'}</div>
                    <div style={s.teamName}>{entry.team_name ?? entry.club ?? ''}</div>
                      </>
                    ) : (
                      <span style={s.emptyLane}>— Empty lane —</span>
                    )}
                  </td>
                  <td style={s.laneCell}>
                    <span style={s.teamName}>{entry?.team_name ?? entry?.club ?? '—'}</span>
                  </td>
                  <td style={s.laneCell}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{entry?.age ?? '—'}</span>
                  </td>
                  <td style={s.laneCell}>
                    {entry ? (
                      entry.seed_time ? (
                        <span style={s.seedTime}>{formatTime(entry.seed_time)}</span>
                      ) : (
                        <span style={s.ntText}>NT</span>
                      )
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  /* ── Main Render ────────────────────────────────────────── */
  if (loading) return <div style={s.page}><div style={s.loading}>🌊 Loading heat sheets…</div></div>;
  if (error)   return <div style={s.page}><div style={s.loading}>{error}</div></div>;

  return (
    <div style={s.page} ref={printRef}>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(`/meets/${meetId}`)}>
          ← Back to Meet
        </button>
        <div style={s.titleRow}>
          <div>
            <h1 style={s.pageTitle}>🌊 Heat Sheets</h1>
            <div style={s.meetName}>{meet?.name ?? meet?.meet_name}</div>
          </div>
          <div style={s.toolbarBtns}>
            <button style={s.btn('secondary')} onClick={() => { setViewMode('all'); fetchAllHeats(); }}>
              All Events
            </button>
            <button style={s.btn('primary')} onClick={handlePrint}>
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      <div style={s.layout}>

        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>Events ({events.length})</div>
          {events.length === 0 ? (
            <div style={{ padding: '20px', color: '#475569', fontSize: '13px' }}>No events found.</div>
          ) : (
            events.map(ev => (
              <div
                key={ev.id}
                style={s.eventItem(selectedEvent === ev.id)}
                onClick={() => { setSelectedEvent(ev.id); setViewMode('single'); }}
              >
                <div style={s.eventItemName(selectedEvent === ev.id)}>
                  {ev.event_name ?? ev.name}
                </div>
                <div style={s.eventItemMeta}>
                  {[ev.gender, ev.distance ? `${ev.distance}m` : null, ev.stroke].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Content */}
        <div style={s.main}>

          {/* ── Single Event View ── */}
          {viewMode === 'single' && currentEvent && (
            <>
              <div style={s.eventHeader}>
                <div>
                  <h2 style={s.eventTitle}>{currentEvent.event_name ?? currentEvent.name}</h2>
                  <div style={s.eventMeta}>
                    {[currentEvent.gender, currentEvent.age_group, currentEvent.distance ? `${currentEvent.distance}m` : null, currentEvent.stroke].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Generate Heats Button */}
                  {isOrganizer && heats.length === 0 && (
  <button
    style={s.generateBtn(generating === selectedEvent)}
    onClick={() => handleGenerateHeats(selectedEvent)}
    disabled={generating === selectedEvent}
  >
    {generating === selectedEvent ? 'Generating...' : 'Generate Heats'}
  </button>
)}
                  <span style={s.heatCount}>
                    {heatsLoading ? '...' : `${heats.length} Heat${heats.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {heatsLoading ? (
                <div style={s.loading}>Loading heats…</div>
              ) : heats.length === 0 ? (
                <div style={s.noHeats}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌊</div>
                  <div>No heats generated for this event yet.</div>
                  {isOrganizer ? (
                    <button
                      style={s.generateBtn(generating === selectedEvent)}
                      onClick={() => handleGenerateHeats(selectedEvent)}
                      disabled={generating === selectedEvent}
                    >
                      {generating === selectedEvent ? 'Generating...' : 'Generate Heats Now'}
                    </button>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '8px' }}>
                      Heats will be generated by the organizer after registration closes.
                    </div>
                  )}
                </div>
              ) : (
                heats
                  .sort((a, b) => (a.heat_number ?? 0) - (b.heat_number ?? 0))
                  .map((heat, i) => renderHeat(heat, i + 1, heats.length))
              )}
            </>
          )}

          {/* ── All Events View ── */}
          {viewMode === 'all' && (
            <>
              <h2 style={{ ...s.eventTitle, marginBottom: '24px' }}>
                All Events — Complete Heat Sheets
              </h2>
              {heatsLoading ? (
                <div style={s.loading}>Loading all heats…</div>
              ) : (
                events.map(ev => {
                  const evHeats = allHeats[ev.id] ?? [];
                  return (
                    <div key={ev.id} style={{ marginBottom: '36px' }}>
                      {/* Event Title Row */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 0', borderBottom: '1px solid rgba(0,212,255,0.15)',
                        marginBottom: '16px',
                      }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#00d4ff' }}>
                          {ev.event_name ?? ev.name}
                          <span style={{ fontSize: '12px', color: '#475569', marginLeft: '10px', fontWeight: 400 }}>
                            {evHeats.length} heat{evHeats.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {/* Generate button per event in all-events view */}
                        {isOrganizer && evHeats.length === 0 && (
  <button
    style={s.generateBtnSm(generating === ev.id)}
    onClick={() => handleGenerateHeats(ev.id)}
    disabled={generating === ev.id}
  >
    {generating === ev.id ? 'Generating...' : 'Generate Heats'}
  </button>
)}
                      </div>

                      {evHeats.length === 0 ? (
                        <div style={{ color: '#334155', fontSize: '13px', padding: '12px 0', fontStyle: 'italic' }}>
                          No heats generated yet.
                        </div>
                      ) : (
                        evHeats
                          .sort((a, b) => (a.heat_number ?? 0) - (b.heat_number ?? 0))
                          .map((heat, i) => renderHeat(heat, i + 1, evHeats.length))
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
          background: '#10b981', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {toast}
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          button, nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}