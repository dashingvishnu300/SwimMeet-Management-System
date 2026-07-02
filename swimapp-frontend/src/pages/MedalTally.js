import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetsAPI, championshipsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MedalTally() {
  const { id: meetId } = useParams();
  const navigate        = useNavigate();
  const { user } = useAuth();
  console.log("USER =", user);
 
  const [meet,    setMeet]    = useState(null);
  const [tally,   setTally]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [sortBy,  setSortBy]  = useState('gold');

  useEffect(() => { fetchData(); }, [meetId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetRes, tallyRes] = await Promise.all([
        meetsAPI.getOne(meetId),
        championshipsAPI.getMedalTally(meetId),
      ]);
      setMeet(meetRes.data);
      const data =
    tallyRes.data.leaderboard ??
    tallyRes.data.results ??
    tallyRes.data;

setTally(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load medal tally.');
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...tally].sort((a, b) => {
    if (sortBy === 'gold')
      return (b.gold_count ?? 0) - (a.gold_count ?? 0) ||
             (b.silver_count ?? 0) - (a.silver_count ?? 0) ||
             (b.bronze_count ?? 0) - (a.bronze_count ?? 0);
  
    if (sortBy === 'total')
      return ((b.gold_count ?? 0) + (b.silver_count ?? 0) + (b.bronze_count ?? 0))
           - ((a.gold_count ?? 0) + (a.silver_count ?? 0) + (a.bronze_count ?? 0));
  
    if (sortBy === 'points')
      return (b.points ?? 0) - (a.points ?? 0);
  
    return 0;
  });

  const totals = tally.reduce((acc, t) => ({
    gold: acc.gold + (t.gold_count ?? 0),
    silver: acc.silver + (t.silver_count ?? 0),
    bronze: acc.bronze + (t.bronze_count ?? 0),
    points: acc.points + (t.points ?? 0),
  }), { gold: 0, silver: 0, bronze: 0, points: 0 });

  const myStanding = sorted.find(
    row =>
      row.team_name === user?.username ||
      row.swimmer_name === user?.username
  );
  console.log("MY STANDING =", myStanding);
  console.log("SORTED =", sorted);
  
  const myRank =
    myStanding
      ? sorted.findIndex(
          r =>
            r.team_name === myStanding.team_name &&
            r.points === myStanding.points
        ) + 1
      : null;

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)' };
    if (rank === 2) return { bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.15)' };
    if (rank === 3) return { bg: 'rgba(180,120,60,0.05)',  border: 'rgba(180,120,60,0.15)' };
    return { bg: 'transparent', border: 'rgba(255,255,255,0.04)' };
  };

  const medalBar = (gold, silver, bronze) => {
    const total = gold + silver + bronze;
    if (total === 0) return null;
    return (
      <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '80px', gap: '1px' }}>
        {gold   > 0 && <div style={{ flex: gold,   background: '#fbbf24' }} />}
        {silver > 0 && <div style={{ flex: silver, background: '#94a3b8' }} />}
        {bronze > 0 && <div style={{ flex: bronze, background: '#b47c3c' }} />}
      </div>
    );
  };

  const css = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a1628 100%)',
      color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif",
      paddingBottom: '60px',
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
    pageTitle: { fontSize: '26px', fontWeight: 800, color: '#fff' },
    meetName:  { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    content:   { maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' },
    summaryGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: '14px', marginBottom: '28px',
    },
    summaryCard: (accent) => ({
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: `1px solid ${accent}25`, borderRadius: '14px',
      padding: '18px', textAlign: 'center',
    }),
    summaryNum:   (accent) => ({ fontSize: '32px', fontWeight: 900, color: accent }),
    summaryLabel: { fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' },
    controls: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
    },
    sectionTitle: { fontSize: '17px', fontWeight: 700, color: '#e2e8f0' },
    sortBtns: { display: 'flex', gap: '8px' },
    sortBtn: (active) => ({
      padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', border: 'none',
      background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
      color: active ? '#fbbf24' : '#64748b',
      outline: active ? '1px solid rgba(251,191,36,0.3)' : 'none',
    }),
    card: {
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', overflow: 'hidden',
    },
    table:    { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#475569',
      textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    thCenter: { textAlign: 'center' },
    tr: (rank) => ({
      background: getRankStyle(rank).bg,
      borderBottom: `1px solid ${getRankStyle(rank).border}`,
    }),
    td: { padding: '14px 16px', verticalAlign: 'middle', fontSize: '14px' },
    rankBadge: (rank) => {
      const configs = {
        1: { bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0a0e1a', shadow: '0 2px 8px rgba(251,191,36,0.4)' },
        2: { bg: 'linear-gradient(135deg,#94a3b8,#64748b)', color: '#fff',    shadow: '0 2px 8px rgba(148,163,184,0.3)' },
        3: { bg: 'linear-gradient(135deg,#cd7f32,#b47c3c)', color: '#fff',    shadow: '0 2px 8px rgba(180,120,60,0.3)' },
      };
      const cfg = configs[rank];
      if (cfg) return {
        display: 'inline-flex', width: '32px', height: '32px', borderRadius: '50%',
        background: cfg.bg, color: cfg.color, alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 900, boxShadow: cfg.shadow,
      };
      return {
        display: 'inline-flex', width: '32px', height: '32px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', color: '#64748b',
        alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700,
      };
    },
    medalCell: (color) => ({ textAlign: 'center', fontSize: '18px', fontWeight: 800, color }),
    teamName:    { fontSize: '14px', fontWeight: 700, color: '#e2e8f0' },
    teamCode:    { fontSize: '11px', color: '#475569', marginTop: '2px' },
    points:      { fontSize: '15px', fontWeight: 800, color: '#a78bfa', textAlign: 'center' },
    totalMedals: { fontSize: '14px', fontWeight: 600, color: '#94a3b8', textAlign: 'center' },
    emptyState:  { padding: '60px 24px', textAlign: 'center', color: '#475569' },
    totalsRow:   { background: 'rgba(255,255,255,0.04)', borderTop: '2px solid rgba(255,255,255,0.1)' },
    podium: {
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px', marginBottom: '28px',
    },
    podiumCard: (place) => {
      const cfg = [
        { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
        { bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)'},
        { bg: 'rgba(180,120,60,0.06)',  border: 'rgba(180,120,60,0.15)' },
      ][place - 1] ?? {};
      return {
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '14px', padding: '20px', textAlign: 'center',
      };
    },
    podiumEmoji:  { fontSize: '28px', marginBottom: '8px' },
    podiumLabel:  { fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
    podiumTeam:   { fontSize: '16px', fontWeight: 800, color: '#e2e8f0', marginTop: '6px' },
    podiumMedals: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  };

  if (loading) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🥇</div>
        <div>Loading medal tally…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ ...css.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#ef4444' }}>{error}</div>
    </div>
  );

  return (
    <div style={css.page}>

      {/* ── Header ── */}
      <div style={css.header}>
        <button style={css.backBtn} onClick={() => navigate(`/meets/${meetId}`)}>
          ← Back to Meet
        </button>
        <h1 style={css.pageTitle}>🥇 Medal Tally</h1>
        <div style={css.meetName}>{meet?.name ?? meet?.meet_name}</div>
      </div>

      <div style={css.content}>
      
      {/* My Performance */}
{myStanding && (
  <div
    style={{
      background: 'rgba(0,212,255,.08)',
      border: '1px solid rgba(0,212,255,.2)',
      borderRadius: 18,
      padding: 24,
      marginBottom: 28
    }}
  >
    <div
      style={{
        fontSize: 22,
        fontWeight: 800,
        color: '#fff',
        marginBottom: 18
      }}
    >
      🏊 Your Performance
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
        gap: 20
      }}
    >
      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Rank</div>
        <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>
          #{myRank}
        </div>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Gold</div>
        <div style={{ color: '#fbbf24', fontSize: 32, fontWeight: 800 }}>
          🥇 {myStanding.gold_count}
        </div>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Silver</div>
        <div style={{ color: '#94a3b8', fontSize: 32, fontWeight: 800 }}>
          🥈 {myStanding.silver_count}
        </div>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Bronze</div>
        <div style={{ color: '#cd7f32', fontSize: 32, fontWeight: 800 }}>
          🥉 {myStanding.bronze_count}
        </div>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Points</div>
        <div style={{ color: '#a78bfa', fontSize: 32, fontWeight: 800 }}>
          ⭐ {Math.round(myStanding.points)}
        </div>
      </div>
    </div>
  </div>
)}

        {/* ── Summary Cards ── */}
        <div style={css.summaryGrid}>
          {[
            { num: tally.length,              label: 'Teams',         accent: '#00d4ff' },
            { num: totals.gold,               label: 'Gold Medals',   accent: '#fbbf24' },
            { num: totals.silver,             label: 'Silver Medals', accent: '#94a3b8' },
            { num: totals.bronze,             label: 'Bronze Medals', accent: '#cd7f32' },
            { num: Math.round(totals.points), label: 'Total Points',  accent: '#a78bfa' },
          ].map(({ num, label, accent }) => (
            <div key={label} style={css.summaryCard(accent)}>
              <div style={css.summaryNum(accent)}>{num}</div>
              <div style={css.summaryLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Podium (Top 3) ── */}
        {sorted.length >= 3 && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px' }}>
              🏆 Podium
            </div>
            <div style={css.podium}>
              {[1, 2, 3].map(place => {
                const team = sorted[place - 1];
                if (!team) return null;
                return (
                  <div key={place} style={css.podiumCard(place)}>
                    <div style={css.podiumEmoji}>{['🥇','🥈','🥉'][place - 1]}</div>
                    <div style={css.podiumLabel}>{place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'} Place</div>
                    <div style={css.podiumTeam}>{team.team_name ?? team.club ?? team.team ?? `Team ${place}`}</div>
                    <div style={css.podiumMedals}>{team.gold_count ?? 0}G ·
{team.silver_count ?? 0}S ·
{team.bronze_count ?? 0}B</div>
                    {team.points != null && (
                      <div style={{ fontSize: '12px', color: '#a78bfa', marginTop: '4px' }}>{team.points} pts</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Full Standings Table ── */}
        <div style={css.controls}>
          <div style={css.sectionTitle}>📋 Full Standings ({sorted.length} swimmers)</div>
          <div style={css.sortBtns}>
            <span style={{ fontSize: '12px', color: '#475569', alignSelf: 'center' }}>Sort by:</span>
            {[
              { key: 'gold',   label: '🥇 Gold'   },
              { key: 'total',  label: '# Total'   },
              { key: 'points', label: '⭐ Points'  },
            ].map(({ key, label }) => (
              <button key={key} style={css.sortBtn(sortBy === key)} onClick={() => setSortBy(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={css.card}>
          {sorted.length === 0 ? (
            <div style={css.emptyState}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏅</div>
              <div>No results recorded yet.</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#334155' }}>
                Medal tally appears once results are entered.
              </div>
            </div>
          ) : (
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={{ ...css.th, width: '56px' }}>Rank</th>
                  <th style={css.th}>Swimmer</th>
                  <th style={{ ...css.th, ...css.thCenter }}>🥇 Gold</th>
                  <th style={{ ...css.th, ...css.thCenter }}>🥈 Silver</th>
                  <th style={{ ...css.th, ...css.thCenter }}>🥉 Bronze</th>
                  <th style={{ ...css.th, ...css.thCenter }}>Total</th>
                  <th style={{ ...css.th, ...css.thCenter }}>Distribution</th>
                  <th style={{ ...css.th, ...css.thCenter }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => {
                  const rank  = idx + 1;
                  const total =
  (row.gold_count ?? 0) +
  (row.silver_count ?? 0) +
  (row.bronze_count ?? 0);
                  return (
                    <tr key={row.team ?? row.club ?? idx} style={css.tr(rank)}>
                      <td style={{ ...css.td, textAlign: 'center' }}>
                        <span style={css.rankBadge(rank)}>{rank}</span>
                      </td>
                      <td style={css.td}>
                      <div style={css.teamName}>
  {row.team_name ?? row.swimmer_name ?? `Swimmer ${rank}`}
</div>
                        {row.team_code && <div style={css.teamCode}>{row.team_code}</div>}
                      </td>
                      <td style={css.td}>
                        <div style={css.medalCell('#fbbf24')}>{row.gold_count ?? 0}</div>
                      </td>
                      <td style={css.td}>
                        <div style={css.medalCell('#94a3b8')}>{row.silver_count ?? 0}</div>
                      </td>
                      <td style={css.td}>
                        <div style={css.medalCell('#cd7f32')}>{row.bronze_count ?? 0}</div>
                      </td>
                      <td style={css.td}>
                        <div style={css.totalMedals}>{total}</div>
                      </td>
                      <td style={{ ...css.td, textAlign: 'center' }}>
                        {medalBar(
  row.gold_count ?? 0,
  row.silver_count ?? 0,
  row.bronze_count ?? 0
)}
                      </td>
                      <td style={css.td}>
                        <div style={css.points}>{row.points != null ? Math.round(row.points) : '—'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals Footer */}
              <tfoot>
                <tr style={css.totalsRow}>
                  <td style={css.td} colSpan={2}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>TOTALS</span>
                  </td>
                  <td style={{ ...css.td, ...css.medalCell('#fbbf24') }}>{totals.gold}</td>
                  <td style={{ ...css.td, ...css.medalCell('#94a3b8') }}>{totals.silver}</td>
                  <td style={{ ...css.td, ...css.medalCell('#cd7f32') }}>{totals.bronze}</td>
                  <td style={{ ...css.td, ...css.totalMedals }}>{totals.gold + totals.silver + totals.bronze}</td>
                  <td style={css.td} />
                  <td style={{ ...css.td, ...css.points }}>{Math.round(totals.points)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}