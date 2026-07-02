import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, eventsAPI } from '../services/api';

const STROKES      = ['All', 'Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Medley'];
const GENDERS      = ['All', 'boys', 'girls', 'mixed'];
const AGE_GROUPS   = ['All', 'sub_junior', 'junior', 'senior', 'open'];

const STROKE_COLORS = {
  Freestyle:    '#00d4ff',
  Backstroke:   '#3b82f6',
  Breaststroke: '#10b981',
  Butterfly:    '#f59e0b',
  Medley:       '#8b5cf6',
};

export default function EventAssignment() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();

  const [meet,          setMeet]          = useState(null);
  const [masterEvents,  setMasterEvents]  = useState([]);
  const [assignedIds,   setAssignedIds]   = useState(new Set());
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState('');
  const [strokeFilter,  setStrokeFilter]  = useState('All');
  const [genderFilter,  setGenderFilter]  = useState('All');
  const [ageFilter,     setAgeFilter]     = useState('All');
  const [search,        setSearch]        = useState('');
  const [selected,      setSelected]      = useState(new Set()); // newly selected to assign
  const [tab,           setTab]           = useState('assign');  // 'assign' | 'assigned'

  useEffect(() => { fetchData(); }, [meetId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const meetRes = await meetsAPI.getOne(meetId);

const meetGender = meetRes.data.gender_name.toLowerCase();

const [masterRes, assignedRes] = await Promise.all([
    eventsAPI.getMasterList({
        meet_gender: meetGender
    }),
    eventsAPI.getMeetEvents(meetId),
]);

setMeet(meetRes.data);
      setMeet(meetRes.data);
      setMasterEvents(masterRes.data.results ?? masterRes.data);
      const assigned = assignedRes.data.results ?? assignedRes.data;

      setAssignedEvents(assigned);

      const ids = new Set(
      assigned.map(e => e.event_list)
      );

     setAssignedIds(ids);
    } catch (err) {
      showToast('❌ Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const eventLabel = (ev) =>
    `${ev.distance_m}m ${ev.stroke} — ${ev.gender_name} ${ev.age_group_label}${ev.is_relay ? ' (Relay)' : ''}`;

  const filteredEvents = masterEvents.filter(ev => {
    if (strokeFilter !== 'All' && ev.stroke !== strokeFilter) return false;
    if (genderFilter !== 'All' && ev.gender_name !== genderFilter) return false;
    if (ageFilter    !== 'All' && ev.age_group_label !== ageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!eventLabel(ev).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const meetGender = meet?.gender_name?.toLowerCase();

const invalidGenderFilter =
    (meetGender === "women" &&
        (genderFilter === "boys" || genderFilter === "men")) ||

    (meetGender === "men" &&
        (genderFilter === "girls" || genderFilter === "women"));

  const unassignedEvents = filteredEvents.filter(ev => !assignedIds.has(ev.id));

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(unassignedEvents.map(e => e.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleAssign = async () => {
    if (selected.size === 0) { showToast('Select at least one event.'); return; }
    try {
      setSaving(true);
      const eventIds = [...selected];
      await eventsAPI.assignEvents(meetId, { event_list_ids: eventIds });

      await fetchData();
      
      setSelected(new Set());
      
      showToast(
        `✅ ${eventIds.length} event${eventIds.length > 1 ? 's' : ''} assigned!`
      );
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Failed to assign events.';
      showToast(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (eventId) => {
    try {
      await eventsAPI.deleteEvent(meetId, eventId);

      await fetchData();

      showToast('✅ Event removed.');
    } catch {
      showToast('❌ Failed to remove event.');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

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
      padding: '24px', maxWidth: '1100px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' },

    // Summary Row
    summaryRow: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '14px', marginBottom: '24px',
    },
    summaryCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '12px',
      padding: '16px', textAlign: 'center',
    }),
    summaryNum:   (accent) => ({ fontSize: '28px', fontWeight: 900, color: accent }),
    summaryLabel: { fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' },

    // Tabs
    tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' },
    tab: (active) => ({
      padding: '12px 20px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#00d4ff' : '#64748b', background: 'none', border: 'none',
      cursor: 'pointer', borderBottom: active ? '2px solid #00d4ff' : '2px solid transparent',
    }),

    // Filters
    filtersRow: {
      display: 'flex', gap: '10px', flexWrap: 'wrap',
      alignItems: 'center', marginBottom: '20px',
    },
    filterSelect: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px',
      outline: 'none', cursor: 'pointer',
    },
    searchInput: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px',
      outline: 'none', width: '200px',
    },

    // Event Grid
    eventGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px',
    },
    eventCard: (selected, assigned) => ({
      background: selected
        ? 'rgba(0,212,255,0.1)'
        : assigned ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
      border: selected
        ? '1px solid rgba(0,212,255,0.4)'
        : assigned ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '14px 16px',
      cursor: assigned ? 'default' : 'pointer',
      transition: 'all 0.15s', position: 'relative',
    }),
    eventName: { fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' },
    eventMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tag: (color) => ({
      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }),
    checkmark: {
      position: 'absolute', top: '10px', right: '10px',
      width: '20px', height: '20px', borderRadius: '50%',
      background: 'linear-gradient(135deg,#00d4ff,#0099bb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', color: '#0a0e1a', fontWeight: 900,
    },
    assignedMark: {
      position: 'absolute', top: '10px', right: '10px',
      width: '20px', height: '20px', borderRadius: '50%',
      background: 'linear-gradient(135deg,#10b981,#059669)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', color: '#fff', fontWeight: 900,
    },

    // Action Bar
    actionBar: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
    },
    actionInfo: { fontSize: '14px', color: '#94a3b8' },
    actionBtns: { display: 'flex', gap: '10px' },
    btn: (variant) => {
      const v = {
        primary: { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        success: { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
        danger: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
      }[variant] ?? {};
      return {
        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        background: v.bg, color: v.color, border: v.border,
      };
    },

    // Assigned Table
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 14px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '14px' },

    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', overflow: 'hidden',
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
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏊</div>
        <div>Loading events…</div>
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
        <div style={css.titleRow}>
          <div>
            <h1 style={css.pageTitle}>🏊 Event Assignment</h1>
            <div style={css.meetName}>{meet?.name}</div>
          </div>
        </div>
      </div>

      <div style={css.content}>
        {/* Summary */}
        <div style={css.summaryRow}>
          {[
            { num: masterEvents.length, label: 'Master Events', accent: '#64748b' },
            { num: assignedIds.size,    label: 'Assigned',      accent: '#10b981' },
            { num: masterEvents.length - assignedIds.size, label: 'Available', accent: '#00d4ff' },
            { num: selected.size,       label: 'Selected',      accent: '#f59e0b' },
          ].map(({ num, label, accent }) => (
            <div key={label} style={css.summaryCard(accent)}>
              <div style={css.summaryNum(accent)}>{num}</div>
              <div style={css.summaryLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={css.tabBar}>
          <button style={css.tab(tab === 'assign')}   onClick={() => setTab('assign')}>
            ➕ Assign Events ({masterEvents.length - assignedIds.size} available)
          </button>
          <button style={css.tab(tab === 'assigned')} onClick={() => setTab('assigned')}>
            ✅ Assigned Events ({assignedIds.size})
          </button>
        </div>

        {/* ── ASSIGN TAB ── */}
        {tab === 'assign' && (
          <>
            {/* Filters */}
            <div style={css.filtersRow}>
              <input
                style={css.searchInput}
                placeholder="🔍 Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select style={css.filterSelect} value={strokeFilter} onChange={e => setStrokeFilter(e.target.value)}>
                {STROKES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Strokes' : s}</option>)}
              </select>
              <select style={css.filterSelect} value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                {GENDERS.map(g => <option key={g} value={g}>{g === 'All' ? 'All Genders' : g}</option>)}
              </select>
              <select style={css.filterSelect} value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a === 'All' ? 'All Age Groups' : a}</option>)}
              </select>
            </div>

            {/* Action Bar */}
            <div style={css.actionBar}>
              <div style={css.actionInfo}>
                {unassignedEvents.length} events shown
                {selected.size > 0 && ` · ${selected.size} selected`}
              </div>
              <div style={css.actionBtns}>
                <button style={css.btn('secondary')} onClick={selectAll}>
                  ☑️ Select All
                </button>
                {selected.size > 0 && (
                  <button style={css.btn('secondary')} onClick={clearSelection}>
                    ✖ Clear
                  </button>
                )}
                <button
                  style={{ ...css.btn('success'), opacity: selected.size === 0 || saving ? 0.5 : 1 }}
                  onClick={handleAssign}
                  disabled={selected.size === 0 || saving}
                >
                  {saving ? '⏳ Assigning…' : `✅ Assign ${selected.size > 0 ? `(${selected.size})` : ''}`}
                </button>
              </div>
            </div>

            {/* Events Grid */}
            {unassignedEvents.length === 0 ? (
              <div style={css.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
                <div>
    {invalidGenderFilter
        ? `No ${genderFilter} events are available for this ${meetGender} meet.`
        : "🎉 All available events have been assigned!"}
</div>
              </div>
            ) : (
              <div style={css.eventGrid}>
                {unassignedEvents.map(ev => {
                  const isSelected = selected.has(ev.id);
                  const color = STROKE_COLORS[ev.stroke] ?? '#94a3b8';
                  return (
                    <div
                      key={ev.id}
                      style={css.eventCard(isSelected, false)}
                      onClick={() => toggleSelect(ev.id)}
                    >
                      {isSelected && <div style={css.checkmark}>✓</div>}
                      <div style={css.eventName}>
                        {ev.distance_m}m {ev.stroke}
                      </div>
                      <div style={css.eventMeta}>
                        <span style={css.tag(color)}>{ev.stroke}</span>
                        <span style={css.tag('#94a3b8')}>{ev.gender_name}</span>
                        <span style={css.tag('#8b5cf6')}>{ev.age_group_label}</span>
                        {ev.is_relay    && <span style={css.tag('#ef4444')}>Relay</span>}
                        {ev.is_marathon && <span style={css.tag('#f59e0b')}>Marathon</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ASSIGNED TAB ── */}
        {tab === 'assigned' && (
          <div style={css.card}>
            {assignedEvents.length === 0 ? (
              <div style={css.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏊</div>
                <div>No events assigned yet.</div>
                <div style={{ fontSize: '13px', marginTop: '8px' }}>
                  Go to the Assign Events tab to add events.
                </div>
              </div>
            ) : (
              <table style={css.table}>
                <thead>
                  <tr>
                    {['#', 'Event', 'Stroke', 'Gender', 'Age Group', 'Type', 'Action'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignedEvents.map((ev, i) => {
                    const color = STROKE_COLORS[ev.stroke] ?? '#94a3b8';
                    return (
                      <tr key={ev.id}>
                        <td style={{ ...css.td, color: '#475569' }}>{i + 1}</td>
                        <td style={css.td}>
                          <strong style={{ color: '#e2e8f0' }}>{ev.distance_m}m {ev.stroke}</strong>
                        </td>
                        <td style={css.td}>
                          <span style={css.tag(color)}>{ev.stroke}</span>
                        </td>
                        <td style={{ ...css.td, color: '#94a3b8' }}>{ev.gender_name}</td>
                        <td style={{ ...css.td, color: '#94a3b8' }}>{ev.age_group_label}</td>
                        <td style={css.td}>
                          {ev.is_relay ? (
                            <span style={css.tag('#ef4444')}>Relay</span>
                          ) : (
                            <span style={css.tag('#10b981')}>Individual</span>
                          )}
                        </td>
                        <td style={css.td}>
                          <button
                            style={css.btn('danger')}
                            onClick={() => handleRemove(ev.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {toast && <div style={css.toast}>{toast}</div>}
    </div>
  );
}