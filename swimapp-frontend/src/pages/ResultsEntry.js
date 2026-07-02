import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, eventsAPI, heatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resultsAPI } from '../services/api';

const MEDAL_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const LANE_COLORS = ['#ef4444','#f59e0b','#10b981','#00d4ff','#3b82f6','#8b5cf6','#ec4899','#6b7280'];

export default function ResultsEntry() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [meet,          setMeet]          = useState(null);
  const [events,        setEvents]        = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [heats,         setHeats]         = useState([]);
  const [selectedHeat,  setSelectedHeat]  = useState('');
  const [lanes,         setLanes]         = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [heatsLoading,  setHeatsLoading]  = useState(false);
  const [laneLoading,   setLaneLoading]   = useState(false);
  const [toast,         setToast]         = useState('');
  const [allHeatsComplete, setAllHeatsComplete] = useState(false);

  // Fix: handle role as both string and object
  const isOrganizer = (user?.role?.name ?? user?.role) === 'organizer';

  useEffect(() => { fetchInitial(); }, [meetId]);
  useEffect(() => { if (selectedEvent) fetchHeats(); }, [selectedEvent]);
  useEffect(() => { if (selectedHeat) fetchLanesAndResults(); }, [selectedHeat]);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [meetRes, eventsRes] = await Promise.all([
        meetsAPI.getOne(meetId),
        eventsAPI.getMeetEvents(meetId), // Fix: pass meetId directly
      ]);
      setMeet(meetRes.data);
      const evs = eventsRes.data.results ?? eventsRes.data;
      setEvents(evs);
      if (evs.length > 0) setSelectedEvent(String(evs[0].id));
    } catch { /* handle silently */ }
    finally { setLoading(false); }
  };

  const fetchHeats = async () => {
    try {
      setHeatsLoading(true);
      setSelectedHeat('');
      setLanes([]);
      const res  = await heatsAPI.getHeats(meetId, selectedEvent);
      const data = res.data.results ?? res.data;
      setHeats(data);
      if (data.length > 0) setSelectedHeat(String(data[0].id));
    } catch { setHeats([]); }
    finally { setHeatsLoading(false); }
  };

  const fetchLanesAndResults = async () => {
    try {
      setLaneLoading(true);
      const heat = heats.find(h => String(h.id) === selectedHeat);
      if (!heat) return;

      // Fix: serializer returns 'swimmers' field
      const heatSwimmers = heat.swimmers ?? heat.lanes ?? heat.heat_entries ?? [];

      // Build lane map from swimmers
      const laneMap = {};
      heatSwimmers.forEach(sw => {
        laneMap[sw.lane_number] = sw;
      });

      // Build results map from existing results in heat
      const resultsMap = {};
      const heatResults = heat.results ?? [];
      heatResults.forEach(r => {
        resultsMap[r.swimmer] = r;
      });

      const maxLane = Math.max(8, ...Object.keys(laneMap).map(Number), 1);
      const laneEntries = Array.from({ length: maxLane }, (_, i) => {
        const laneNum  = i + 1;
        const swimmer  = laneMap[laneNum];
        const result   = swimmer ? (resultsMap[swimmer.swimmer] ?? {}) : {};
        return {
          lane_number:  laneNum,
          swimmer_id:   swimmer?.swimmer ?? null,
          swimmer_name: swimmer?.swimmer_name ?? '',
          seed_time:    swimmer?.seed_time ?? null,
          finish_time:  result.finish_time ?? '',
          status:       result.status ?? 'swam', // swam | dns | dnf | dq
          place:        null,
          dirty:        false,
        };
      });
      setLanes(laneEntries);
    } finally {
      setLaneLoading(false);
    }
  };

  const updateLane = (laneNum, field, value) => {
    setLanes(prev => prev.map(l =>
      l.lane_number === laneNum ? { ...l, [field]: value, dirty: true } : l
    ));
  };

  const autoRankLanes = () => {
    const valid = lanes
      .filter(l => l.finish_time && l.status === 'swam' && l.swimmer_name)
      .map(l => ({ ...l, seconds: parseTimeToSeconds(l.finish_time) }))
      .filter(l => l.seconds !== null)
      .sort((a, b) => a.seconds - b.seconds);

    setLanes(prev => prev.map(l => {
      const rank = valid.findIndex(v => v.lane_number === l.lane_number);
      return { ...l, place: rank >= 0 ? rank + 1 : l.place, dirty: true };
    }));
    showToast('Auto-ranked by finish time!');
  };

  const parseTimeToSeconds = (t) => {
    if (!t) return null;
    if (typeof t === 'number') return t;
    const s = String(t).trim();
    // Handle HH:MM:SS.ffffff format from backend
    const parts = s.split(':');
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    }
    if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(s) || null;
  };

  // Convert MM:SS.ss or SS.ss → 00:MM:SS.ffffff (backend format)
  const formatTimeForBackend = (t) => {
    if (!t) return null;
    try {
      const s = String(t).trim();
      let totalSeconds;
      if (s.includes(':')) {
        const [m, sec] = s.split(':');
        totalSeconds = parseFloat(m) * 60 + parseFloat(sec);
      } else {
        totalSeconds = parseFloat(s);
      }
      if (isNaN(totalSeconds)) return null;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const wholeS  = Math.floor(seconds);
      const micro   = Math.round((seconds - wholeS) * 1000000);
      return `00:${String(minutes).padStart(2,'0')}:${String(wholeS).padStart(2,'0')}.${String(micro).padStart(6,'0')}`;
    } catch { return null; }
  };

  // Display format: HH:MM:SS.ffffff → MM:SS.ss
  const formatTimeForDisplay = (t) => {
    if (!t) return '';
    const secs = parseTimeToSeconds(t);
    if (secs === null) return t;
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(2).padStart(5, '0');
    return m > 0 ? `${m}:${s}` : `${s}`;
  };

  const handleGenerateFinals = async () => {
    try {
      const response = await resultsAPI.generateFinals(
        meetId,
        selectedEvent
      );
  
      showToast('🏁 Finals generated successfully!');

      setTimeout(() => {
        navigate(`/meets/${meetId}/finals`);
      }, 1000);
  
      console.log(response.data);
  
    } catch (err) {
      showToast(
        err.response?.data?.error ||
        'Failed to generate finals'
      );
    }
  };

  const handleSave = async () => {
    const swimmerLanes = lanes.filter(l => l.swimmer_id);

    if (swimmerLanes.length === 0) { showToast('No swimmers to save results for.'); return; }

    try {
      setSaving(true);

      // Build results payload matching backend format
      const results = swimmerLanes.map(lane => ({
        swimmer_id:  lane.swimmer_id,
        finish_time: formatTimeForBackend(lane.finish_time) || null,
        status:      lane.status ?? 'swam',
      }));

      // Use heatsAPI.enterResults which maps to POST /heats/:heatId/results/
      const res = await heatsAPI.enterResults(selectedHeat, { results });

      // Refresh
      await fetchHeats();
      // Re-select same heat
      showToast('Results saved successfully!');

      if (res.data.all_heats_complete) {
        setAllHeatsComplete(true);
        showToast('All heats complete! Ready to generate finals.');
    }
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Save failed. Please try again.';
      showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const currentHeat  = heats.find(h => String(h.id) === selectedHeat);
  const currentEvent = events.find(e => String(e.id) === selectedEvent);
  const dirtyCount   = lanes.filter(l => l.dirty).length;

  const hasResults =
  currentHeat?.results?.length > 0;

  /* ── Styles ──────────────────────────────────────────── */
  const css = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '80px',
    },
    header: {
      background: 'linear-gradient(180deg, rgba(0,212,255,0.07) 0%, transparent 100%)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      padding: '24px', maxWidth: '1200px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
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
    toolRow: {
      display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap',
    },
    btn: (variant) => {
      const v = {
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none' },
        warning:   { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' },
      }[variant] || {};
      return {
        padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        background: v.bg, color: v.color, border: v.border,
      };
    },
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '12px 14px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: { padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
    timeInput: {
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '14px',
      fontFamily: 'monospace', width: '110px', outline: 'none',
    },
    statusSelect: {
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px', padding: '7px 10px', color: '#e2e8f0', fontSize: '13px',
      outline: 'none', cursor: 'pointer',
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
    emptyLane: { fontSize: '13px', color: '#334155', fontStyle: 'italic' },
    seedTime:  { fontSize: '12px', color: '#475569', fontFamily: 'monospace' },
    heatStatusBadge: (s) => ({
      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
      background: s === 'completed' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)',
      color: s === 'completed' ? '#8b5cf6' : '#f59e0b',
    }),
    saveBar: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(13,21,38,0.95)', borderTop: '1px solid rgba(0,212,255,0.15)',
      backdropFilter: 'blur(12px)', padding: '14px 24px',
      display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center',
      zIndex: 100,
    },
    dirtyCount: { fontSize: '13px', color: '#64748b', marginRight: 'auto' },
    toast: {
      position: 'fixed', bottom: '80px', right: '24px', zIndex: 1000,
      padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
      background: '#10b981', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  if (loading) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏅</div>
        <div>Loading results…</div>
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
        <h1 style={css.pageTitle}>🏅 Results Entry</h1>
        <div style={css.meetName}>{meet?.name}</div>
      </div>

      <div style={css.content}>
        {/* Selectors */}
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
          <div>
            <div style={css.label}>Heat</div>
            <select
              style={css.select}
              value={selectedHeat}
              onChange={e => setSelectedHeat(e.target.value)}
              disabled={heatsLoading}
            >
              {heatsLoading
                ? <option>Loading heats…</option>
                : heats.length === 0
                  ? <option value="">No heats generated</option>
                  : heats.map(h => (
                      <option key={h.id} value={h.id}>
                        Heat {h.heat_number} — {h.heat_status === 'completed' ? 'Completed' : 'Not Swum'}
                      </option>
                    ))
              }
            </select>
          </div>
        </div>

        {/* Tool Row — organizer only */}
        {selectedHeat && isOrganizer && (
          <div style={css.toolRow}>
            <button style={css.btn('warning')} onClick={autoRankLanes}>
              Auto-Rank by Time
            </button>
            <div style={{ fontSize: '12px', color: '#475569', marginLeft: '8px' }}>
              Enter times as MM:SS.ss (e.g. 1:02.34) or SS.ss (e.g. 58.72)
            </div>
          </div>
        )}

{allHeatsComplete && (
  <button
    style={css.btn('success')}
    onClick={handleGenerateFinals}
  >
    🏁 Generate Finals
  </button>
)}

        {/* Results Table */}
        {selectedHeat && (
          laneLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading lane data…
            </div>
          ) : (
            <div style={css.card}>
              {hasResults && (

<div
style={{
  padding:'14px',
  background:'rgba(16,185,129,0.1)',
  borderBottom:'1px solid rgba(16,185,129,0.2)',
  color:'#10b981',
  fontWeight:700
}}
>

🏊 Heat Results Locked

</div>

)}
              {/* Heat Info Bar */}
              <div style={{
                padding: '14px 20px',
                background: 'rgba(0,212,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                    {currentEvent?.event_name ?? currentEvent?.name} — Heat {currentHeat?.heat_number}
                  </span>
                  {currentHeat?.heat_status && (
                    <span style={{ ...css.heatStatusBadge(currentHeat.heat_status), marginLeft: '10px' }}>
                      {currentHeat.heat_status === 'completed' ? 'Completed' : 'Not Swum'}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  {lanes.filter(l => l.swimmer_name).length} swimmers
                </span>
              </div>

              <table style={css.table}>
                <thead>
                  <tr>
                    {[
                      'Lane', 'Swimmer', 'Seed Time', 'Finish Time',
                      ...(isOrganizer ? ['Status'] : []),
                      'Place'
                    ].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lanes.map(lane => {
                    const isInactive = lane.status !== 'swam';
                    return (
                      <tr
                        key={lane.lane_number}
                        style={{
                          background: lane.dirty ? 'rgba(0,212,255,0.03)' : 'transparent',
                          opacity: (isInactive && lane.swimmer_name) ? 0.5 : 1,
                        }}
                      >
                        {/* Lane */}
                        <td style={css.td}>
                          <span style={css.laneDot(lane.lane_number)}>{lane.lane_number}</span>
                        </td>

                        {/* Swimmer */}
<td style={css.td}>
  {
    lane.swimmer_name
      ? (
        <div>

          <strong
            style={{
              color:'#e2e8f0',
              display:'block',
              marginBottom:'8px'
            }}
          >
            {lane.swimmer_name}
          </strong>

          <button
            onClick={() =>
              navigate(
                `/swimmers/${lane.swimmer_id}`
              )
            }
            style={{
              background:'rgba(0,212,255,.15)',
              border:'1px solid rgba(0,212,255,.25)',
              color:'#00d4ff',
              borderRadius:'10px',
              padding:'6px 14px',
              cursor:'pointer',
              fontSize:'12px',
              fontWeight:600
            }}
          >
            View Profile
          </button>

        </div>
      )
      : (
        <span style={css.emptyLane}>
          — Empty lane —
        </span>
      )
  }
</td>

                        {/* Seed Time */}
                        <td style={css.td}>
                          <span style={css.seedTime}>
                            {lane.seed_time ? formatTimeForDisplay(lane.seed_time) : 'NT'}
                          </span>
                        </td>

                        {/* Finish Time */}
                        <td style={css.td}>
                          {lane.swimmer_name ? (
                            isOrganizer ? (
                              <input
                                style={{
                                  ...css.timeInput,
                                  borderColor: lane.dirty ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.12)',
                                  opacity: isInactive ? 0.4 : 1,
                                }}
                                placeholder="1:02.34"
                                value={lane.finish_time}
                                onChange={e => updateLane(lane.lane_number, 'finish_time', e.target.value)}
                                disabled={
                                  isInactive ||
                                  hasResults
                                }
                              />
                            ) : (
                              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#10b981' }}>
                                {lane.finish_time ? formatTimeForDisplay(lane.finish_time) : '—'}
                              </span>
                            )
                          ) : '—'}
                        </td>

                        {/* Status (organizer only) */}
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

                        {/* Place */}
                        <td style={{ ...css.td, textAlign: 'center' }}>
                          {lane.swimmer_name ? (
                            lane.place
                              ? (MEDAL_ICONS[lane.place] ?? `${lane.place}th`)
                              : '—'
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {!selectedHeat && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏅</div>
            <div>Select an event and heat to view or enter results.</div>
          </div>
        )}
      </div>

      {/* Save Bar — organizer only */}
      {isOrganizer &&
 selectedHeat &&
 !hasResults && (
        <div style={css.saveBar}>
          <span style={css.dirtyCount}>
            {dirtyCount > 0
              ? `${dirtyCount} unsaved change${dirtyCount > 1 ? 's' : ''}`
              : 'All changes saved'}
          </span>
          <button
            style={css.btn('secondary')}
            onClick={fetchLanesAndResults}
            disabled={saving}
          >
            Reset
          </button>
          <button
            style={{ ...css.btn('success'), opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Results'}
          </button>
        </div>
      )}

      {toast && <div style={css.toast}>{toast}</div>}
    </div>
  );
}