import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POOL_LENGTHS = [25, 50];
const LANE_OPTIONS = [6, 8, 10];
const GENDER_OPTIONS = [
  { value: 1, label: 'Men'   },
  { value: 2, label: 'Women' },
  { value: 3, label: 'Mixed' },
];

const STEPS = [
  { id: 1, label: 'Basic Info',     icon: '📋' },
  { id: 2, label: 'Venue & Pool',   icon: '🏊' },
  { id: 3, label: 'Registration',   icon: '📝' },
  { id: 4, label: 'Review',         icon: '✅' },
];

const today = new Date().toISOString().split('T')[0];

export default function CreateMeet() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const organizerLevel =
(
  user?.organizer_level || ''
).toLowerCase();

const MEET_LEVELS =
organizerLevel === 'district'

? [
    {
      value:1,
      label:'District Level'
    }
  ]

: organizerLevel === 'state'

? [
    {
      value:2,
      label:'State Level'
    }
  ]

: organizerLevel === 'national'

? [
    {
      value:3,
      label:'National Level'
    }
  ]

: [];

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name:                   '',
    level:
organizerLevel === 'district'

? 1

: organizerLevel === 'state'

? 2

: 3,
    gender:                 3,
    start_date:             '',
    end_date:               '',
    location:               '',
    pool_length:            50,
    lanes:                  8,
    registration_start_date:'',
    registration_end_date:  '',
    description:            '',
    max_events_per_swimmer: 5,
  });

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim())   return 'Meet name is required.';
      if (!form.start_date)    return 'Start date is required.';
      if (!form.end_date)      return 'End date is required.';
      if (form.end_date < form.start_date) return 'End date must be after start date.';
    }
    if (step === 2) {
      if (!form.location.trim()) return 'Venue / location is required.';
    }
    if (step === 3) {
      if (form.registration_start_date && form.registration_end_date) {
        if (form.registration_end_date < form.registration_start_date)
          return 'Registration end must be after registration start.';
      }
    }
    return '';
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
    setError('');
  };

  const prevStep = () => { setStep(s => s - 1); setError(''); };

  const handleSubmit = async () => {
    try {
      setLoading(true);
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
        description:             form.description.trim() || null,
        max_events_per_swimmer:
  parseInt(form.max_events_per_swimmer),
      };
      const res = await meetsAPI.create(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/meets/${res.data.id}`), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join(' | '));
      } else {
        setError('Failed to create meet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel  = (v) => MEET_LEVELS.find(l => l.value === parseInt(v))?.label  ?? '—';
  const getGenderLabel = (v) => GENDER_OPTIONS.find(g => g.value === parseInt(v))?.label ?? '—';

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
      padding: '24px', maxWidth: '760px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    subtitle:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '760px', margin: '0 auto', padding: '32px 24px' },

    // Stepper
    stepper: {
      display: 'flex', alignItems: 'center', marginBottom: '36px',
    },
    stepItem: (active, done) => ({
      display: 'flex', alignItems: 'center', gap: '8px', flex: 1,
    }),
    stepCircle: (active, done) => ({
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: done ? '16px' : '13px', fontWeight: 700,
      background: done ? 'linear-gradient(135deg,#10b981,#059669)'
        : active ? 'linear-gradient(135deg,#00d4ff,#0099bb)'
        : 'rgba(255,255,255,0.06)',
      color: (done || active) ? (done ? '#fff' : '#0a0e1a') : '#475569',
      border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s',
    }),
    stepLabel: (active, done) => ({
      fontSize: '12px', fontWeight: active ? 700 : 400,
      color: active ? '#00d4ff' : done ? '#10b981' : '#475569',
      whiteSpace: 'nowrap',
    }),
    stepLine: (done) => ({
      flex: 1, height: '2px', margin: '0 8px',
      background: done ? '#10b981' : 'rgba(255,255,255,0.08)',
      transition: 'background 0.3s',
    }),

    // Form Card
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '32px', backdropFilter: 'blur(12px)',
    },
    stepTitle: {
      fontSize: '18px', fontWeight: 800, color: '#e2e8f0',
      marginBottom: '6px',
    },
    stepDesc: { fontSize: '13px', color: '#64748b', marginBottom: '28px' },

    // Fields
    grid2: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px',
    },
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
    select: {
      width: '100%', background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: '11px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
      cursor: 'pointer', boxSizing: 'border-box',
    },
    textarea: {
      width: '100%', background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
      padding: '11px 14px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
      resize: 'vertical', minHeight: '100px', boxSizing: 'border-box',
      fontFamily: 'inherit',
    },

    // Toggle Group
    toggleGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    toggleBtn: (active) => ({
      padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.2s', border: 'none',
      background: active ? 'linear-gradient(135deg,#00d4ff,#0099bb)' : 'rgba(255,255,255,0.06)',
      color: active ? '#0a0e1a' : '#94a3b8',
      outline: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    }),

    // Error
    errorBox: {
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
      fontSize: '13px', marginBottom: '20px',
    },

    // Navigation Buttons
    btnRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: '32px', paddingTop: '24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    btnBack: {
      padding: '11px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', background: 'rgba(255,255,255,0.06)',
      color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
    },
    btnNext: {
      padding: '11px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
      cursor: 'pointer', border: 'none',
      background: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a',
    },
    btnSubmit: {
      padding: '11px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
      cursor: 'pointer', border: 'none',
      background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
    },

    // Review
    reviewSection: { marginBottom: '24px' },
    reviewTitle: {
      fontSize: '12px', fontWeight: 700, color: '#00d4ff',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      marginBottom: '12px', paddingBottom: '8px',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
    },
    reviewGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
    },
    reviewItem: {
      background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
      padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)',
    },
    reviewLabel: { fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' },
    reviewValue: { fontSize: '14px', color: '#e2e8f0', fontWeight: 500 },

    // Success
    successBox: {
      textAlign: 'center', padding: '60px 24px',
    },
  };

  if (success) return (
    <div style={css.page}>
      <div style={{ ...css.content, ...css.successBox }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>
          Meet Created Successfully!
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          Redirecting to meet detail page…
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <>
      <div style={css.stepTitle}>Basic Information</div>
      <div style={css.stepDesc}>Enter the meet name, dates and category.</div>

      <div style={css.grid1}>
        <label style={css.label}>Meet Name <span style={css.required}>*</span></label>
        <input
          style={css.input}
          placeholder="e.g. State Swimming Championship 2026"
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
            type="date" style={css.input} min={today}
            value={form.start_date}
            onChange={e => update('start_date', e.target.value)}
          />
        </div>
        <div>
          <label style={css.label}>End Date <span style={css.required}>*</span></label>
          <input
            type="date" style={css.input} min={form.start_date || today}
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

      <div style={css.grid1}>
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
    </>
  );

  const renderStep2 = () => (
    <>
      <div style={css.stepTitle}>Venue & Pool Details</div>
      <div style={css.stepDesc}>Where is the meet taking place?</div>

      <div style={css.grid1}>
        <label style={css.label}>Venue / Location <span style={css.required}>*</span></label>
        <input
          style={css.input}
          placeholder="e.g. Mumbai Aquatic Centre, Maharashtra"
          value={form.location}
          onChange={e => update('location', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
      </div>

      <div style={css.grid1}>
        <label style={css.label}>Pool Length (metres) <span style={css.required}>*</span></label>
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

      <div style={css.grid1}>
        <label style={css.label}>Number of Lanes <span style={css.required}>*</span></label>
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

      <div style={css.grid1}>
        <label style={css.label}>Description (Optional)</label>
        <textarea
          style={css.textarea}
          placeholder="Any additional information about this meet..."
          value={form.description}
          onChange={e => update('description', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div style={css.stepTitle}>Registration Settings</div>
      <div style={css.stepDesc}>Set when swimmers can register for this meet.</div>

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
      <div style={css.grid1}>

  <label style={css.label}>
    Maximum Events Per Swimmer
  </label>

  <input
    type="number"
    min="1"
    style={css.input}
    value={form.max_events_per_swimmer}
    onChange={(e) =>
      update(
        'max_events_per_swimmer',
        e.target.value
      )
    }
  />

</div>

      <div style={{
        background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '12px', padding: '16px', marginTop: '8px',
      }}>
        <div style={{ fontSize: '13px', color: '#00d4ff', fontWeight: 600, marginBottom: '6px' }}>
          💡 Registration Info
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
          You can skip registration dates for now — they can be set later from the Meet Detail page.
          The meet will be created in <strong style={{ color: '#e2e8f0' }}>Draft</strong> status and
          only published when you advance the status.
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      <div style={css.stepTitle}>Review & Create</div>
      <div style={css.stepDesc}>Check all details before creating the meet.</div>

      <div style={css.reviewSection}>
        <div style={css.reviewTitle}>📋 Basic Information</div>
        <div style={css.reviewGrid}>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Meet Name</div>
            <div style={css.reviewValue}>{form.name || '—'}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Level</div>
            <div style={css.reviewValue}>{getLevelLabel(form.level)}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Start Date</div>
            <div style={css.reviewValue}>{form.start_date || '—'}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>End Date</div>
            <div style={css.reviewValue}>{form.end_date || '—'}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Gender</div>
            <div style={css.reviewValue}>{getGenderLabel(form.gender)}</div>
          </div>
        </div>
      </div>

      <div style={css.reviewSection}>
        <div style={css.reviewTitle}>🏊 Venue & Pool</div>
        <div style={css.reviewGrid}>
          <div style={{ ...css.reviewItem, gridColumn: '1 / -1' }}>
            <div style={css.reviewLabel}>Location</div>
            <div style={css.reviewValue}>{form.location || '—'}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Pool Length</div>
            <div style={css.reviewValue}>{form.pool_length}m</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Lanes</div>
            <div style={css.reviewValue}>{form.lanes} lanes</div>
          </div>
        </div>
      </div>

      <div style={css.reviewSection}>
        <div style={css.reviewTitle}>📝 Registration</div>
        <div style={css.reviewGrid}>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Opens</div>
            <div style={css.reviewValue}>{form.registration_start_date || 'Not set'}</div>
          </div>
          <div style={css.reviewItem}>
            <div style={css.reviewLabel}>Closes</div>
            <div style={css.reviewItem}>

<div style={css.reviewLabel}>
Maximum Events
</div>

<div style={css.reviewValue}>
{form.max_events_per_swimmer}
events
</div>

</div>
            <div style={css.reviewValue}>{form.registration_end_date || 'Not set'}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <button style={css.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1 style={css.pageTitle}>➕ Create New Meet</h1>
        <p style={css.subtitle}>Fill in the details to set up a new swim meet.</p>
      </div>

      <div style={css.content}>
        {/* Stepper */}
        <div style={css.stepper}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={css.stepItem(step === s.id, step > s.id)}>
                <div style={css.stepCircle(step === s.id, step > s.id)}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span style={css.stepLabel(step === s.id, step > s.id)}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={css.stepLine(step > s.id)} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div style={css.card}>
          {error && <div style={css.errorBox}>⚠️ {error}</div>}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation */}
          <div style={css.btnRow}>
            <button
              style={{ ...css.btnBack, visibility: step === 1 ? 'hidden' : 'visible' }}
              onClick={prevStep}
            >
              ← Back
            </button>

            {step < 4 ? (
              <button style={css.btnNext} onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button
                style={{ ...css.btnSubmit, opacity: loading ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '⏳ Creating…' : '🚀 Create Meet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}