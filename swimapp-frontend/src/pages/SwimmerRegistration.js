import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, eventsAPI, registrationsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STROKE_COLORS = {
  Freestyle:    '#00d4ff',
  Backstroke:   '#3b82f6',
  Breaststroke: '#10b981',
  Butterfly:    '#f59e0b',
  Medley:       '#8b5cf6',
};

export default function SwimmerRegistration() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [meet,            setMeet]            = useState(null);
  const [events,          setEvents]          = useState([]);
  const [myRegs,          setMyRegs]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [registering,     setRegistering]     = useState(null);
  const [toast,           setToast]           = useState('');
  const [tab,             setTab]             = useState('events');
  const [seedTimes,       setSeedTimes]       = useState({});
  const [showSeedInput,   setShowSeedInput]   = useState(null);
  const [swimmers, setSwimmers] = useState({});
  const [selectedSwimmer, setSelectedSwimmer] = useState({});


  const isSwimmer   = (user?.role?.name ?? user?.role) === 'swimmer';
  const isCoach     = (user?.role?.name ?? user?.role) === 'coach';
  const isOrganizer = (user?.role?.name ?? user?.role) === 'organizer';

  useEffect(() => { fetchData(); }, [meetId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetRes, eventsRes, myRegsRes] = await Promise.all([
        meetsAPI.getOne(meetId),
        isSwimmer
    ? eventsAPI.getEligibleEvents(meetId)
    : eventsAPI.getMeetEvents(meetId),
        registrationsAPI.myRegistrations(),
    ]);
    
    console.log("MEET DATA =", meetRes.data);
    
    setMeet(meetRes.data);
      setEvents(eventsRes.data.results ?? eventsRes.data);
      const allMyRegs = myRegsRes.data.results ?? myRegsRes.data;
      setMyRegs(allMyRegs.filter(r => r.meet === parseInt(meetId)));


}
catch (err) {

    console.error(err);

    showToast(
        '❌ Failed to load data.'
    );

}
finally {

    setLoading(false);

}

};

  const registeredEventIds = new Set(myRegs.filter(r => !r.recall).map(r => r.event));

  const handleRegister = async (eventId) => {
    try {
      setRegistering(eventId);

      const maxEvents =
  meet?.max_events_per_swimmer || 5;

if (

registeredEventIds.size >=

maxEvents

)

{

showToast(

`❌ Maximum ${maxEvents} events allowed.`

);

setRegistering(null);

return;

}

      const isDistrictMeet = meet?.level_name === 'district';
      const swimmerId = isDistrictMeet
? user.id
: parseInt(selectedSwimmer[eventId]);

if (

  !isDistrictMeet &&
  
  (isCoach || isOrganizer) &&
  
  !selectedSwimmer[eventId]
  
  ) {
        showToast('❌ Please select a swimmer first.');
        setRegistering(null);
        return;
      }

      const seedTime = seedTimes[eventId];
      let formattedSeedTime = null;
      if (seedTime) formattedSeedTime = formatSeedTime(seedTime);

      if (!seedTime) {
        showToast(
            '❌ Seed time is required.'
        );
        setRegistering(null);
        return;
    }

    const payload = {
      swimmer_id: swimmerId,
      event_id: eventId,
      seed_time: formattedSeedTime
  };
      await registrationsAPI.register(meetId, payload);
      showToast('✅ Registered successfully!');
      setShowSeedInput(null);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Registration failed.';
      showToast(`❌ ${msg}`);
    } finally {
      setRegistering(null);
    }
  };

  const handleRecall = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await registrationsAPI.recall(meetId, regId);
      showToast('✅ Registration cancelled.');
      await fetchData();
    } catch {
      showToast('❌ Failed to cancel registration.');
    }
  };

  const formatSeedTime = (t) => {
    if (!t) return null;
    try {
      if (t.includes(':')) {
        const [m, s] = t.split(':');
        const sec = parseFloat(s);
        const ms = Math.round((sec % 1) * 1000000).toString().padStart(6, '0');
        const wholeS = Math.floor(sec).toString().padStart(2, '0');
        const wholeM = parseInt(m).toString().padStart(2, '0');
        return `00:${wholeM}:${wholeS}.${ms}`;
      } else {
        const sec = parseFloat(t);
        const ms = Math.round((sec % 1) * 1000000).toString().padStart(6, '0');
        const wholeS = Math.floor(sec).toString().padStart(2, '0');
        return `00:00:${wholeS}.${ms}`;
      }
    } catch { return null; }
  };

  const displaySeedTime = (t) => {
    if (!t) return 'NT';
    try {
      const parts = t.split(':');
      const sec   = parseFloat(parts[2] ?? parts[0]);
      const min   = parseInt(parts[1] ?? 0);
      const s     = sec.toFixed(2).padStart(5, '0');
      return min > 0 ? `${min}:${s}` : `${s}`;
    } catch { return t; }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const registrationOpen = meet?.registration_open;

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
      padding: '24px', maxWidth: '1000px', margin: '0 auto',
    },
    backBtn: {
      background: 'none', border: 'none', color: '#64748b',
      cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
    },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
    pageTitle: { fontSize: '24px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    regBadge: (open) => ({
      padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
      background: open ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      color: open ? '#10b981' : '#ef4444',
      border: `1px solid ${open ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }),
    content: { maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' },
    alertBox: (color) => ({
      background: `${color}10`, border: `1px solid ${color}25`,
      borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
      fontSize: '14px', color, display: 'flex', alignItems: 'center', gap: '10px',
    }),
    summaryRow: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))',
      gap: '14px', marginBottom: '24px',
    },
    summaryCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '12px',
      padding: '16px', textAlign: 'center',
    }),
    summaryNum:   (accent) => ({ fontSize: '26px', fontWeight: 900, color: accent }),
    summaryLabel: { fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' },
    tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' },
    tab: (active) => ({
      padding: '12px 20px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#00d4ff' : '#64748b', background: 'none', border: 'none',
      cursor: 'pointer', borderBottom: active ? '2px solid #00d4ff' : '2px solid transparent',
    }),
    eventGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '14px',
    },
    eventCard: (registered) => ({
      background: registered ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
      border: registered ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '18px', transition: 'all 0.2s',
    }),
    eventTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    eventName: { fontSize: '16px', fontWeight: 700, color: '#e2e8f0' },
    eventSub:  { fontSize: '12px', color: '#64748b', marginTop: '3px' },
    tagRow:    { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
    tag: (color) => ({
      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }),
    registeredBadge: {
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      background: 'rgba(16,185,129,0.15)', color: '#10b981',
      border: '1px solid rgba(16,185,129,0.3)',
    },
    seedRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' },
    seedInput: {
      flex: 1, background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
      padding: '8px 12px', color: '#e2e8f0', fontSize: '13px',
      fontFamily: 'monospace', outline: 'none',
    },
    seedLabel: { fontSize: '11px', color: '#64748b', marginBottom: '4px' },
    btn: (variant) => {
      const v = {
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',    border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
        danger:    { bg: 'rgba(239,68,68,0.1)',    color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)'  },
        ghost:     { bg: 'transparent',            color: '#64748b', border: 'none' },
      }[variant] ?? {};
      return {
        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: v.bg, color: v.color, border: v.border, transition: 'all 0.2s',
      };
    },
    fullBtn: (variant) => ({
      ...{
        primary:   { bg: 'linear-gradient(135deg,#00d4ff,#0099bb)', color: '#0a0e1a', border: 'none' },
        success:   { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',    border: 'none' },
        secondary: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
      }[variant],
      width: '100%', padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
      cursor: 'pointer', border: 'none', textAlign: 'center',
    }),
    card: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '11px 14px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: { padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '14px' },
    emptyState: { padding: '50px 24px', textAlign: 'center', color: '#475569' },
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
        <div>Loading registration…</div>
      </div>
    </div>
  );

  return (
    <div style={css.page}>
      <div style={css.header}>
        <button style={css.backBtn} onClick={() => navigate(`/meets/${meetId}`)}>
          ← Back to Meet
        </button>
        <div style={css.titleRow}>
          <div>
            <h1 style={css.pageTitle}>📝 Event Registration</h1>
            <div style={css.meetName}>{meet?.name}</div>
          </div>
          <span style={css.regBadge(registrationOpen)}>
            {registrationOpen ? '✅ Registration Open' : '🔒 Registration Closed'}
          </span>
        </div>
      </div>

      <div style={css.content}>
        {!registrationOpen && (
          <div style={css.alertBox('#f59e0b')}>
            ⚠️ Registration is currently closed for this meet. You can view events but cannot register.
          </div>
        )}

        {(isCoach || isOrganizer) && (
          <div style={css.alertBox('#3b82f6')}>
            👨‍🏫 As a {isCoach ? 'coach' : 'organizer'}, you can nominate swimmers for State/National level meets.
          </div>
        )}

        <div style={css.summaryRow}>
          {[
            { num: events.length,                           label: 'Total Events', accent: '#00d4ff' },
            { num: registeredEventIds.size,                 label: 'Registered',   accent: '#10b981' },
            { num: events.length - registeredEventIds.size, label: 'Available',    accent: '#f59e0b' },
            { num: myRegs.filter(r => r.recall).length,     label: 'Cancelled',    accent: '#ef4444' },
            {
              num: meet?.max_events_per_swimmer ?? 5,
              label: 'Max Events',
              accent: '#8b5cf6'
            },
          ].map(({ num, label, accent }) => (
            <div key={label} style={css.summaryCard(accent)}>
              <div style={css.summaryNum(accent)}>{num}</div>
              <div style={css.summaryLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div style={css.tabBar}>
        <div

style={{

background:'rgba(139,92,246,0.08)',

border:'1px solid rgba(139,92,246,0.2)',

borderRadius:'12px',

padding:'16px',

marginBottom:'20px',

fontWeight:700,

color:'#c4b5fd'

}}

>

🎯 Selected Events:

{registeredEventIds.size}

/

{meet?.max_events_per_swimmer || 5}

</div>
          <button style={css.tab(tab === 'events')} onClick={() => setTab('events')}>
            🏊 Available Events ({events.length})
          </button>
          <button style={css.tab(tab === 'my')} onClick={() => setTab('my')}>
            📋 My Registrations ({registeredEventIds.size})
          </button>
        </div>

        {tab === 'events' && (
          events.length === 0 ? (
            <div style={css.emptyState}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏊</div>
              <div>No events assigned to this meet yet.</div>
            </div>
          ) : (
            <>
              
              <div style={css.eventGrid}>
                {events.map(ev => {
                  const registered = registeredEventIds.has(ev.id);
                  const color      = STROKE_COLORS[ev.stroke] ?? '#94a3b8';
                  const isShowSeed = showSeedInput === ev.id;

                  return (
                    <div key={ev.id} style={css.eventCard(registered)}>
                      <div style={css.eventTop}>
                        <div>
                          <div style={css.eventName}>{ev.distance_m}m {ev.stroke}</div>
                          <div style={css.eventSub}>{ev.gender_name} · {ev.age_group_label}</div>
                        </div>
                        {registered && <span style={css.registeredBadge}>✓ Registered</span>}
                      </div>

                      <div style={css.tagRow}>
                        <span style={css.tag(color)}>{ev.stroke}</span>
                        <span style={css.tag('#94a3b8')}>{ev.gender_name}</span>
                        <span style={css.tag('#8b5cf6')}>{ev.age_group_label}</span>
                        {ev.is_relay && <span style={css.tag('#ef4444')}>Relay</span>}
                      </div>

                      {(isCoach || isOrganizer) && meet?.level_name !== 'district' && (

<div
style={{

background:'rgba(59,130,246,0.08)',

padding:'12px',

borderRadius:'10px',

marginBottom:'12px'

}}

>

<div
style={{

fontSize:'12px',

fontWeight:700,

color:'#3b82f6',

marginBottom:'8px'

}}

>

Qualified Swimmers

</div>

<select

style={{

width:'100%',

background:'rgba(255,255,255,0.08)',

border:'1px solid rgba(255,255,255,0.15)',

padding:'10px',

borderRadius:'8px',

color:'#fff'

}}

value={selectedSwimmer[ev.id] || ''}

onClick={async () => {

try {

let level = null;

if (meet.level_name === 'state') {

level = 'STATE';

}

else if (meet.level_name === 'national') {

level = 'NATIONAL';

}

const swimmersRes =

await usersAPI.getQualifiedSwimmers(

level,

ev.id

);

setSwimmers(prev => ({

  ...prev,

  [ev.id]:

      swimmersRes.data.results ??

      swimmersRes.data

}));

}

catch {

showToast(

'❌ Failed to load qualified swimmers.'

);

}

}}

onChange={(e)=>

  setSelectedSwimmer(
    prev => ({
    ...prev,
    [ev.id]: e.target.value
    })
    )

}

>

<option value="">

Select swimmer

</option>

{(swimmers[ev.id] || []).map(

s => (

<option

key={s.id}

value={s.id}

>

{s.username}

</option>

)

)}
</select>

</div>

)}

                     {!registered && registrationOpen && (isSwimmer || isCoach || isOrganizer) && (
                        <>
                          {isShowSeed ? (
                            <>
                              <div style={css.seedLabel}>Seed Time (required) — format: 1:02.34 or 58.72</div>
                              <div style={css.seedRow}>
                              <input
    style={css.seedInput}
    placeholder="e.g. 1:02.34"
    required
    value={seedTimes[ev.id] ?? ''}
    onChange={e =>
        setSeedTimes(prev => ({
            ...prev,
            [ev.id]: e.target.value
        }))
    }
/>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  style={{ ...css.fullBtn('success'), flex: 1 }}
                                  onClick={() => handleRegister(ev.id)}
                                  disabled={registering === ev.id}
                                >
                                  {registering === ev.id ? '⏳ Registering…' : '✅ Confirm Register'}
                                </button>
                                <button style={css.btn('ghost')} onClick={() => setShowSeedInput(null)}>
                                  ✖
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              style={css.fullBtn('primary')}
                              onClick={async () => {

    setShowSeedInput(ev.id);

    try {

        let level = null;

        if (meet.level_name === 'state') {

            level = 'STATE';

        }

        else if (meet.level_name === 'national') {

            level = 'NATIONAL';

        }

        if (level) {

            const swimmersRes =

                await usersAPI.getQualifiedSwimmers(

                    level,

                    ev.id

                );

                setSwimmers(prev => ({

                  ...prev,
              
                  [ev.id]:
              
                      swimmersRes.data.results ??
              
                      swimmersRes.data
              
              }));

        }

    }

    catch {

        showToast(

            '❌ Failed to load qualified swimmers.'

        );

    }

}}
                            >
                              ➕ Register Event
                            </button>
                          )}
                        </>
                      )}

                      {registered && (
                        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                          ✓ You are registered for this event
                        </div>
                      )}

                      {!registrationOpen && !registered && (
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
                          🔒 Registration closed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}

        {tab === 'my' && (
          <div style={css.card}>
            {myRegs.length === 0 ? (
              <div style={css.emptyState}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <div>You haven't registered for any events yet.</div>
                <button
                  style={{ ...css.btn('primary'), margin: '16px auto', display: 'flex' }}
                  onClick={() => setTab('events')}
                >
                  Browse Events →
                </button>
              </div>
            ) : (
              <table style={css.table}>
                <thead>
                  <tr>
                    {['#', 'Event', 'Seed Time', 'Status', 'Action'].map(h => (
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myRegs.map((reg, i) => (
                    <tr key={reg.id}>
                      <td style={{ ...css.td, color: '#475569' }}>{i + 1}</td>
                      <td style={css.td}>
                        <strong style={{ color: '#e2e8f0' }}>{reg.event_name}</strong>
                      </td>
                      <td style={css.td}>
                        <span style={{ fontFamily: 'monospace', color: '#00d4ff' }}>
                          {displaySeedTime(reg.seed_time)}
                        </span>
                      </td>
                      <td style={css.td}>
                        {reg.recall ? (
                          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>Cancelled</span>
                        ) : reg.sent_back ? (
                          <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>Sent Back</span>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>✓ Active</span>
                        )}
                      </td>
                      <td style={css.td}>
                        {!reg.recall && registrationOpen && (
                          <button style={css.btn('danger')} onClick={() => handleRecall(reg.id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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