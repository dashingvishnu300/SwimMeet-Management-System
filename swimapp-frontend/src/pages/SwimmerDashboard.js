import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { championshipsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MEDAL_COLORS = {
  gold: '#FBBF24',
  silver: '#94A3B8',
  bronze: '#CD7F32',
};

export default function SwimmerDashboard() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    events_participated: 0,
    gold_medals: 0,
    silver_medals: 0,
    bronze_medals: 0,
    points: 0,
    overall_rank: null
  });

  const [personalBests, setPersonalBests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      setLoading(true);

      const res = await championshipsAPI.getSwimmerDashboard();

      const data = res.data;

      setStats(data.stats || {});
      setPersonalBests(data.personal_bests || []);
      setRecentResults(data.recent_results || []);
      setAchievements(data.achievements || []);

    } catch (err) {

      setError('Failed to load dashboard.');

    } finally {

      setLoading(false);

    }
  };

  const totalMedals =
    stats.gold_medals +
    stats.silver_medals +
    stats.bronze_medals;

  const medalPercentage = medalCount => {

    if (totalMedals === 0) return '0%';

    return `${(medalCount * 100 / totalMedals).toFixed(0)}%`;
  };

  const css = {

    page: {
      minHeight: '100vh',
      background:
        'linear-gradient(135deg,#0a0e1a 0%,#0d1526 50%,#0a1628 100%)',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI',system-ui,sans-serif",
      paddingBottom: '60px'
    },

    hero: {
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(0,212,255,.1)',
      background:
        'linear-gradient(180deg,rgba(0,212,255,.08) 0%,transparent 100%)'
    },

    heroInner: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '50px 30px'
    },

    heroRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '30px',
      flexWrap: 'wrap'
    },

    avatar: {
      width: '110px',
      height: '110px',
      borderRadius: '50%',
      background:
        'linear-gradient(135deg,#00d4ff,#3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '50px',
      boxShadow:
        '0 15px 40px rgba(0,212,255,.3)'
    },

    heroLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px'
    },

    swimmerName: {
      fontSize: '38px',
      fontWeight: 900,
      color: '#fff',
      marginBottom: '8px'
    },

    swimmerSubtitle: {
      color: '#94a3b8',
      fontSize: '15px'
    },

    badgeRow: {
      display: 'flex',
      gap: '14px',
      marginTop: '18px',
      flexWrap: 'wrap'
    },

    badge: accent => ({
      background: `${accent}15`,
      border: `1px solid ${accent}30`,
      color: accent,
      borderRadius: '50px',
      padding: '10px 18px',
      fontWeight: 700,
      fontSize: '13px'
    }),

    heroStats: {
      display: 'flex',
      gap: '18px',
      flexWrap: 'wrap'
    },

    statBubble: {
      minWidth: '130px',
      background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.06)',
      borderRadius: '22px',
      backdropFilter: 'blur(20px)',
      padding: '20px',
      textAlign: 'center'
    },

    statValue: {
      fontSize: '32px',
      fontWeight: 900,
      color: '#fff'
    },

    statLabel: {
      fontSize: '12px',
      letterSpacing: '.5px',
      color: '#64748b',
      marginTop: '8px'
    },

    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '30px'
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit,minmax(180px,1fr))',
      gap: '20px',
      marginBottom: '30px'
    },

    card: accent => ({
      background:
        `linear-gradient(135deg,${accent}12,${accent}05)`,
      border: `1px solid ${accent}20`,
      borderRadius: '24px',
      padding: '26px',
      backdropFilter: 'blur(20px)',
      boxShadow:
        '0 20px 40px rgba(0,0,0,.25)'
    }),

    cardIcon: {
      fontSize: '34px',
      marginBottom: '18px'
    },

    cardValue: {
      fontSize: '34px',
      fontWeight: 900,
      color: '#fff'
    },

    cardLabel: {
      marginTop: '8px',
      fontSize: '13px',
      color: '#64748b'
    }

  };

  if (loading)
    return (
      <div style={css.page}>
        <div
          style={{
            padding: '100px',
            textAlign: 'center'
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );

  if (error)
    return (
      <div style={css.page}>
        <div
          style={{
            padding: '100px',
            textAlign: 'center',
            color: '#ef4444'
          }}
        >
          {error}
        </div>
      </div>
    );

  return (

    <div style={css.page}>

      {/* Hero */}

      <div style={css.hero}>

        <div style={css.heroInner}>

          <div style={css.heroRow}>

            <div style={css.heroLeft}>

              <div style={css.avatar}>
                🏊
              </div>

              <div>

                <div style={css.swimmerName}>
                  {user?.username}
                </div>

                <div style={css.swimmerSubtitle}>
                  Competitive Swimmer
                </div>

                <div style={css.badgeRow}>

                  <div style={css.badge('#FBBF24')}>
                    🏆 Rank #{stats.overall_rank || '-'}
                  </div>

                  <div style={css.badge('#00d4ff')}>
                    ⭐ {stats.points} Points
                  </div>

                  <div style={css.badge('#10b981')}>
                    🥇 {stats.gold_medals} Gold Medals
                  </div>

                </div>

              </div>

            </div>

                        {/* Hero Stats */}

                        <div style={css.heroStats}>

<div style={css.statBubble}>
  <div style={css.statValue}>
    {stats.events_participated}
  </div>

  <div style={css.statLabel}>
    EVENTS
  </div>
</div>

<div style={css.statBubble}>
  <div style={css.statValue}>
    {totalMedals}
  </div>

  <div style={css.statLabel}>
    MEDALS
  </div>
</div>

<div style={css.statBubble}>
  <div style={css.statValue}>
    {stats.points}
  </div>

  <div style={css.statLabel}>
    POINTS
  </div>
</div>

</div>

</div>

</div>

</div>

{/* Navigation Bar */}

<div
  style={{
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 30px',
    marginTop: '-15px',
    marginBottom: '30px'
  }}
>
  <div
    style={{
      background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.06)',
      borderRadius: '20px',
      backdropFilter: 'blur(20px)',
      padding: '16px 24px',
      display: 'flex',
      gap: '18px',
      flexWrap: 'wrap'
    }}
  >

    <button
      style={css.navButton}
      onClick={() => navigate('/')}
    >
      🏠 Home
    </button>

    <button
      style={css.navButton}
      onClick={() => navigate('/my-registrations')}
    >
      📋 My Registrations
    </button>

    <button
      style={{
        ...css.navButton,
        background: 'rgba(0,212,255,.15)',
        border: '1px solid rgba(0,212,255,.3)',
        color: '#00d4ff'
      }}
    >
      🏊 My Dashboard
    </button>

    <button
      style={css.navButton}
      onClick={() => navigate('/meets')}
    >
      🏆 Meets
    </button>

    <button
      style={css.navButton}
      onClick={() => navigate('/results')}
    >
      📊 Results
    </button>

  </div>
</div>

{/* Main Content */}

<div style={css.content}>

{/* Statistics Grid */}

<div style={css.statsGrid}>

<div style={css.card('#00d4ff')}>
<div style={css.cardIcon}>
🏅
</div>

<div style={css.cardValue}>
{stats.events_participated}
</div>

<div style={css.cardLabel}>
Events Participated
</div>
</div>


<div style={css.card('#FBBF24')}>
<div style={css.cardIcon}>
🥇
</div>

<div style={css.cardValue}>
{stats.gold_medals}
</div>

<div style={css.cardLabel}>
Gold Medals
</div>
</div>


<div style={css.card('#94A3B8')}>
<div style={css.cardIcon}>
🥈
</div>

<div style={css.cardValue}>
{stats.silver_medals}
</div>

<div style={css.cardLabel}>
Silver Medals
</div>
</div>


<div style={css.card('#CD7F32')}>
<div style={css.cardIcon}>
🥉
</div>

<div style={css.cardValue}>
{stats.bronze_medals}
</div>

<div style={css.cardLabel}>
Bronze Medals
</div>
</div>


<div style={css.card('#8B5CF6')}>
<div style={css.cardIcon}>
⭐
</div>

<div style={css.cardValue}>
{stats.points}
</div>

<div style={css.cardLabel}>
Championship Points
</div>
</div>


<div style={css.card('#10B981')}>
<div style={css.cardIcon}>
🏆
</div>

<div style={css.cardValue}>
#{stats.overall_rank || '-'}
</div>

<div style={css.cardLabel}>
Overall Rank
</div>
</div>

</div>

{/* Medal Distribution */}

<div
style={{
background: 'rgba(255,255,255,.03)',
border: '1px solid rgba(255,255,255,.06)',
borderRadius: '24px',
padding: '30px',
marginBottom: '30px',
backdropFilter: 'blur(20px)'
}}
>

<div
style={{
fontSize: '24px',
fontWeight: 800,
color: '#fff',
marginBottom: '30px'
}}
>
🏅 Medal Distribution
</div>


{/* Gold */}

<div style={{ marginBottom: '20px' }}>

<div
style={{
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px'
}}
>
<span>🥇 Gold</span>

<span>
  {medalPercentage(stats.gold_medals)}
</span>
</div>

<div
style={{
  background: '#1e293b',
  height: '12px',
  borderRadius: '50px'
}}
>
<div
  style={{
    width: medalPercentage(stats.gold_medals),
    background: '#FBBF24',
    height: '100%',
    borderRadius: '50px'
  }}
/>
</div>

</div>


{/* Silver */}

<div style={{ marginBottom: '20px' }}>

<div
style={{
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px'
}}
>
<span>🥈 Silver</span>

<span>
  {medalPercentage(stats.silver_medals)}
</span>
</div>

<div
style={{
  background: '#1e293b',
  height: '12px',
  borderRadius: '50px'
}}
>
<div
  style={{
    width: medalPercentage(stats.silver_medals),
    background: '#94A3B8',
    height: '100%',
    borderRadius: '50px'
  }}
/>
</div>

</div>


{/* Bronze */}

<div>

<div
style={{
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px'
}}
>
<span>🥉 Bronze</span>

<span>
  {medalPercentage(stats.bronze_medals)}
</span>
</div>

<div
style={{
  background: '#1e293b',
  height: '12px',
  borderRadius: '50px'
}}
>
<div
  style={{
    width: medalPercentage(stats.bronze_medals),
    background: '#CD7F32',
    height: '100%',
    borderRadius: '50px'
  }}
/>
</div>

</div>

</div>

        {/* Achievement Center */}

        <div
          style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(20px)'
          }}
        >

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '25px'
            }}
          >
            🏆 Achievement Center
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(220px,1fr))',
              gap: '20px'
            }}
          >

            {achievements.map((achievement, index) => (

              <div
                key={index}
                style={{
                  background:
                    'linear-gradient(135deg,rgba(251,191,36,.1),rgba(251,191,36,.03))',
                  border:
                    '1px solid rgba(251,191,36,.15)',
                  borderRadius: '20px',
                  padding: '25px',
                  textAlign: 'center'
                }}
              >

                <div
                  style={{
                    fontSize: '36px',
                    marginBottom: '15px'
                  }}
                >
                  🏅
                </div>

                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {achievement}
                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Personal Bests */}

        <div
          style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(20px)'
          }}
        >

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '25px'
            }}
          >
            ⏱ Personal Bests
          </div>

          {personalBests.length === 0 ? (

            <div
              style={{
                color: '#64748b'
              }}
            >
              No records available.
            </div>

          ) : (

            personalBests.map((pb, index) => (

              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '18px',
                  borderBottom:
                    '1px solid rgba(255,255,255,.05)'
                }}
              >

                <div
                  style={{
                    color: '#fff'
                  }}
                >
                  {pb.event}
                </div>

                <div
                  style={{
                    color: '#00d4ff',
                    fontWeight: 700
                  }}
                >
                  {pb.best_time}
                </div>

              </div>

            ))

          )}

        </div>


        {/* Recent Results */}

        <div
          style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(20px)'
          }}
        >

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '25px'
            }}
          >
            ⚡ Recent Results
          </div>

          {recentResults.map((result, index) => (

            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                marginBottom: '15px',
                borderRadius: '18px',
                background:
                  'rgba(255,255,255,.02)',
                border:
                  '1px solid rgba(255,255,255,.04)'
              }}
            >

              <div>

                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {result.event}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    marginTop: '6px'
                  }}
                >
                  Rank #{result.rank}
                </div>

              </div>


              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}
              >

                <div
                  style={{
                    color:
                      MEDAL_COLORS[result.medal] ||
                      '#64748b',
                    fontWeight: 700
                  }}
                >
                  {result.medal.toUpperCase()}
                </div>

                <div
                  style={{
                    color: '#00d4ff'
                  }}
                >
                  {result.time}
                </div>

              </div>

            </div>

          ))}

        </div>

                {/* Activity Feed */}

                <div
          style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(20px)'
          }}
        >

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '25px'
            }}
          >
            🌊 Activity Feed
          </div>

          {recentResults.map((result, index) => (

            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '25px'
              }}
            >

              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#00d4ff',
                  boxShadow:
                    '0 0 20px rgba(0,212,255,.5)'
                }}
              />

              <div>

                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  Participated in {result.event}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    marginTop: '5px'
                  }}
                >
                  Finished Rank #{result.rank}
                </div>

              </div>

            </div>

          ))}

        </div>


        {/* Footer */}

        <div
          style={{
            textAlign: 'center',
            paddingTop: '40px',
            color: '#64748b',
            fontSize: '13px'
          }}
        >

          <div
            style={{
              fontSize: '18px',
              color: '#00d4ff',
              marginBottom: '10px'
            }}
          >
            🏊 Swim Meet Management System
          </div>

          Track your performance, medals, rankings and achievements.

        </div>

      </div>

    </div>

  );

}