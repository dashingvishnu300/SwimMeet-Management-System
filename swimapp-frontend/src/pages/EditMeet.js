import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI } from '../services/api';

const POOL_LENGTHS  = [25, 50];
const LANE_OPTIONS  = [6, 8, 10];
const MEET_LEVELS   = [
  { value: 1, label: 'District Level' },
  { value: 2, label: 'State Level'    },
  { value: 3, label: 'National Level' },
  { value: 4, label: 'International'  },
];
const GENDER_OPTIONS = [
  { value: 1, label: 'Men'   },
  { value: 2, label: 'Women' },
  { value: 3, label: 'Mixed' },
];

export default function EditMeet() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [meet,    setMeet]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [changed, setChanged] = useState(false);

  const [form, setForm] = useState({
    name:                    '',
    level:                   1,
    gender:                  3,
    start_date:              '',
    end_date:                '',
    location:                '',
    pool_length:             50,
    lanes:                   8,
    registration_start_date: '',
    registration_end_date:   '',
    description:             '',
  });

  useEffect(() => { fetchMeet(); }, [id]);

  const fetchMeet = async () => {
    try {
      setLoading(true);
      const res  = await meetsAPI.getOne(id);
      const data = res.data;
      setMeet(data);
      setForm({
        name:                    data.name                    ?? '',
        level:                   data.level                   ?? 1,
        gender:                  data.gender                  ?? 3,
        start_date:              data.start_date              ?? '',
        end_date:                data.end_date                ?? '',
        location:                data.location                ?? '',
        pool_length:             data.pool_length             ?? 50,
        lanes:                   data.lanes                   ?? 8,
        registration_start_date: data.registration_start_date ?? '',
        registration_end_date:   data.registration_end_date   ?? '',
        description:             data.description             ?? '',
      });
    } catch {
      setError('Failed to load meet details.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setChanged(true);
    setError('');
  };

  const validate = () => {
    if (!form.name.trim())   return 'Meet name is required.';
    if (!form.start_date)    return 'Start date is required.';
    if (!form.end_date)      return 'End date is required.';
    if (form.end_date < form.start_date) return 'End date must be after start date.';
    if (!form.location.trim()) return 'Venue / location is required.';
    if (form.registration_start_date && form.registration_end_date) {
      if (form.registration_end_date < form.registration_start_date)
        return 'Registration end must be after registration start.';
    }
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setSaving(true);
      setError('');
      const payload = {
        name:                    form.name.trim(),
        level:                   parseInt(form.level),
        gender:                  parseInt(form.gender),
        start_date:              form.start_date,
        end_date:                form.end_date,
        location:                form.location.trim(),
        pool_length:             parseInt(form.pool_length),
        lanes:                   parseInt(form.lanes),
        registration_start_date: form.registration_start_date || null,
        registration_end_date:   form.registration_end_date   || null,
        description:             form.description.trim()      || null,
      };
      await meetsAPI.update(id, payload);
      setSuccess(true);
      setChanged(false);
      setTimeout(() => navigate(`/meets/${id}`), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) =>
          `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
        );
        setError(msgs.join(' | '));
      } else {
        setError('Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

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
      padding: '24px', maxWidth: '820px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    titleRow: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: '12px',
    },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    statusBadge: {
      padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
      background: 'rgba(0,212,255,0.1)', color: '#00d4ff',
      border: '1px solid rgba(0,212,255,0.25)',
    },
    content: { maxWidth: '820px', margin: '0 auto', padding: '32px 24px' },
    section: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '28px', marginBottom: '20px',
      backdropFilter: 'blur(12px)',
    },
    sectionTitle: {
      fontSize: '15px', fontWeight: 700, color: '#00d4ff',
      marginBottom: '20px', paddingBottom: '12px',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      display: 'flex', alignItems: 'center', gap: '8px',
    },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
    grid1: { marginBottom: '20px' },
    label: {
      display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px',
    },
    required: { color: '#ef4444', marginLeft: '2px' },
    input: {
      width: '100%', background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: '11px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
      transition: 'border-color 0.2s', boxSizing: 'border-box',
    },
    textarea: {
      width: '100%', background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: '11px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
      resize: 'vertical', minHeight: '100px', boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    toggleGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    toggleBtn: (active) => ({
      padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.2s', border: 'none',
      background: active ? 'linear-gradient(135deg,#00d4ff,#0099bb)' : 'rgba(255,255,255,0.06)',
      color: active ? '#0a0e1a' : '#94a3b8',
      outline: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    }),
    errorBox: {
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
      fontSize: '13px', marginBottom: '20px',
    },
    successBox: {
      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
      borderRadius: '10px', padding: '12px 16px', color: '#10b981',
      fontSize: '13px', marginBottom: '20px', fontWeight: 600,
    },
    saveBar: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(13,21,38,0.95)', borderTop: '1px solid rgba(0,212,255,0.15)',
      backdropFilter: 'blur(12px)', padding: '16px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 100,
    },
    changedText: { fontSize: '13px', color: '#f59e0b', fontWeight: 600 },
    savedText:   { fontSize: '13px', color: '#64748b' },
    btnRow: { display: 'flex', gap: '12px' },
    btnCancel: {
      padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', background: 'rgba(255,255,255,0.06)',
      color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
    },
    btnSave: (disabled) => ({
      padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
      background: disabled
        ? 'rgba(16,185,129,0.3)'
        : 'linear-gradient(135deg,#10b981,#059669)',
      color: '#fff', opacity: disabled ? 0.6 : 1,
    }),
    loading: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: '#64748b', fontSize: '16px',
    },
  };

  if (loading) return (
    <div style={css.page}>
      <div style={css.loading}>🌊 Loading meet details…</div>
    </div>
  );

  if (error && !meet) return (
    <div style={css.page}>
      <div style={{ ...css.loading, color: '#ef4444' }}>{error}</div>
    </div>
  );

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <button style={css.backBtn} onClick={() => navigate(`/meets/${id}`)}>
          ← Back to Meet
        </button>
        <div style={css.titleRow}>
          <div>
            <h1 style={css.pageTitle}>✏️ Edit Meet</h1>
            <div style={css.meetName}>{meet?.name}</div>
          </div>
          <span style={css.statusBadge}>{meet?.status_name ?? meet?.status ?? 'Draft'}</span>
        </div>
      </div>

      <div style={css.content}>
        {error  && <div style={css.errorBox}>⚠️ {error}</div>}
        {success && <div style={css.successBox}>✅ Meet updated successfully! Redirecting…</div>}

        {/* ── Section 1: Basic Info ── */}
        <div style={css.section}>
          <div style={css.sectionTitle}>📋 Basic Information</div>

          <div style={css.grid1}>
            <label style={css.label}>Meet Name <span style={css.required}>*</span></label>
            <input
              style={css.input}
              value={form.name}
              onChange={e => update('name', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={css.grid2}>
            <div>
              <label style={css.label}>Start Date <span style={css.required}>*</span></label>
              <input
                type="date" style={css.input}
                value={form.start_date}
                onChange={e => update('start_date', e.target.value)}
              />
            </div>
            <div>
              <label style={css.label}>End Date <span style={css.required}>*</span></label>
              <input
                type="date" style={css.input}
                min={form.start_date}
                value={form.end_date}
                onChange={e => update('end_date', e.target.value)}
              />
            </div>
          </div>

          <div style={css.grid1}>
            <label style={css.label}>Meet Level <span style={css.required}>*</span></label>
            <div style={css.toggleGroup}>
              {MEET_LEVELS.map(l => (
                <button
                  key={l.value}
                  style={css.toggleBtn(parseInt(form.level) === l.value)}
                  onClick={() => update('level', l.value)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...css.grid1, marginBottom: 0 }}>
            <label style={css.label}>Gender Category <span style={css.required}>*</span></label>
            <div style={css.toggleGroup}>
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g.value}
                  style={css.toggleBtn(parseInt(form.gender) === g.value)}
                  onClick={() => update('gender', g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Venue & Pool ── */}
        <div style={css.section}>
          <div style={css.sectionTitle}>🏊 Venue & Pool Details</div>

          <div style={css.grid1}>
            <label style={css.label}>Venue / Location <span style={css.required}>*</span></label>
            <input
              style={css.input}
              value={form.location}
              onChange={e => update('location', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={css.grid2}>
            <div>
              <label style={css.label}>Pool Length (metres)</label>
              <div style={css.toggleGroup}>
                {POOL_LENGTHS.map(p => (
                  <button
                    key={p}
                    style={css.toggleBtn(parseInt(form.pool_length) === p)}
                    onClick={() => update('pool_length', p)}
                  >
                    {p}m Pool
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={css.label}>Number of Lanes</label>
              <div style={css.toggleGroup}>
                {LANE_OPTIONS.map(l => (
                  <button
                    key={l}
                    style={css.toggleBtn(parseInt(form.lanes) === l)}
                    onClick={() => update('lanes', l)}
                  >
                    {l} Lanes
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...css.grid1, marginBottom: 0 }}>
            <label style={css.label}>Description</label>
            <textarea
              style={css.textarea}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              placeholder="Any additional information about this meet..."
            />
          </div>
        </div>

        {/* ── Section 3: Registration ── */}
        <div style={css.section}>
          <div style={css.sectionTitle}>📝 Registration Settings</div>

          <div style={css.grid2}>
            <div>
              <label style={css.label}>Registration Opens</label>
              <input
                type="date" style={css.input}
                value={form.registration_start_date}
                onChange={e => update('registration_start_date', e.target.value)}
              />
            </div>
            <div>
              <label style={css.label}>Registration Closes</label>
              <input
                type="date" style={css.input}
                min={form.registration_start_date}
                value={form.registration_end_date}
                onChange={e => update('registration_end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Advance Status */}
          <div style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>
              ⚡ Current Status: {meet?.status_name ?? meet?.status ?? 'draft'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              To change the meet status (e.g. open registration, mark in progress),
              use the <strong style={{ color: '#e2e8f0' }}>Advance Status</strong> button
              on the Meet Detail page.
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div style={css.saveBar}>
        <span style={changed ? css.changedText : css.savedText}>
          {changed ? '⚠️ You have unsaved changes' : '✅ All changes saved'}
        </span>
        <div style={css.btnRow}>
          <button style={css.btnCancel} onClick={() => navigate(`/meets/${id}`)}>
            Cancel
          </button>
          <button
            style={css.btnSave(!changed || saving)}
            onClick={handleSave}
            disabled={!changed || saving}
          >
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}