import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { meetsAPI } from '../services/api';

export default function PublishResultsCenter() {

  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(false);
  const [meet, setMeet] = useState(null);

  useEffect(() => {
    fetchMeet();
  }, []);

  const fetchMeet = async () => {
    try {

        const response = await meetsAPI.getOne(id);
        
      setMeet(response.data);
      setPublished(response.data.results_published);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  const publishResults = async () => {

    try {

      await meetsAPI.publishResults(id);

      setPublished(true);

      alert('Results published successfully!');

    } catch (err) {

      alert('Unable to publish results.');

    }

  };

  const unpublishResults = async () => {

    try {

      await meetsAPI.unpublishResults(id);

      setPublished(false);

      alert('Results hidden successfully.');

    } catch (err) {

      alert('Unable to hide results.');

    }

  };

  const css = {

    page: {
      minHeight: '100vh',
      background:
        'linear-gradient(135deg,#0a0e1a 0%,#0d1526 50%,#0a1628 100%)',
      color: '#e2e8f0',
      paddingBottom: '60px'
    },

    hero: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px'
    },

    title: {
      fontSize: '42px',
      fontWeight: 900,
      color: '#fff'
    },

    subtitle: {
      marginTop: '10px',
      color: '#64748b'
    },

    grid: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit,minmax(350px,1fr))',
      gap: '25px',
      padding: '0 40px'
    },

    card: {
      background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: '24px',
      padding: '30px',
      backdropFilter: 'blur(20px)'
    },

    button: {
      background:
        'linear-gradient(135deg,#00d4ff,#3b82f6)',
      border: 'none',
      color: '#fff',
      padding: '15px 28px',
      borderRadius: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '20px'
    },

    dangerButton: {
      background:
        'linear-gradient(135deg,#ef4444,#dc2626)',
      border: 'none',
      color: '#fff',
      padding: '15px 28px',
      borderRadius: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '20px'
    }

  };

  if (loading) {

    return (
      <div style={css.page}>
        <div style={{padding:'120px',textAlign:'center'}}>
          Loading...
        </div>
      </div>
    );

  }

  return (

    <div style={css.page}>

      <div style={css.hero}>

        <div style={css.title}>
          📢 Results Publishing Center
        </div>

        <div style={css.subtitle}>
          {meet?.name}
        </div>

      </div>

      <div style={css.grid}>
              {/* Publish Results Card */}

              <div style={css.card}>

<div
  style={{
    fontSize: '30px',
    marginBottom: '20px'
  }}
>
  📢
</div>

<div
  style={{
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff'
  }}
>
  Publish Official Results
</div>

<div
  style={{
    marginTop: '15px',
    color: '#94a3b8',
    lineHeight: 1.8
  }}
>
  Once published:

  <br />

  ✓ Medal tally becomes official

  <br />

  ✓ Swimmers can view rankings

  <br />

  ✓ Dashboards become active

  <br />

  ✓ Results become public

</div>

{!published && (

  <button
    style={css.button}
    onClick={publishResults}
  >
    Publish Results
  </button>

)}

</div>


{/* Hide Results */}

<div style={css.card}>

<div
  style={{
    fontSize: '30px',
    marginBottom: '20px'
  }}
>
  🔒
</div>

<div
  style={{
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff'
  }}
>
  Lock Results
</div>

<div
  style={{
    marginTop: '15px',
    color: '#94a3b8',
    lineHeight: 1.8
  }}
>
  Hide rankings and results from
  swimmers and coaches.

</div>

{published && (

  <button
    style={css.dangerButton}
    onClick={unpublishResults}
  >
    Hide Results
  </button>

)}

</div>


{/* Current Status */}

<div style={css.card}>

<div
  style={{
    fontSize: '30px',
    marginBottom: '20px'
  }}
>
  🏆
</div>

<div
  style={{
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff'
  }}
>
  Current Status
</div>

<div
  style={{
    marginTop: '30px',
    textAlign: 'center'
  }}
>

  <div
    style={{
      background:
        published
          ? 'rgba(16,185,129,.15)'
          : 'rgba(239,68,68,.15)',

      border:
        published
          ? '1px solid rgba(16,185,129,.3)'
          : '1px solid rgba(239,68,68,.3)',

      color:
        published
          ? '#10B981'
          : '#EF4444',

      padding: '18px',
      borderRadius: '18px',
      fontWeight: 800,
      fontSize: '18px'
    }}
  >

    {
      published
        ? 'RESULTS PUBLISHED'
        : 'RESULTS NOT PUBLISHED'
    }

  </div>

</div>

</div>


{/* Timeline */}

<div style={css.card}>

<div
  style={{
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '30px'
  }}
>
  📋 Competition Timeline
</div>

<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }}
>

  <div>✅ Registration Open</div>

  <div>⬇️</div>

  <div>✅ Registration Closed</div>

  <div>⬇️</div>

  <div>✅ Heats Generated</div>

  <div>⬇️</div>

  <div>✅ Finals Completed</div>

  <div>⬇️</div>

  <div>✅ Meet Closed</div>

  <div>⬇️</div>

  <div
    style={{
      color:
        published
          ? '#10B981'
          : '#FBBF24',
      fontWeight: 700
    }}
  >

    {
      published
        ? '✅ Results Published'
        : '⭕ Waiting for Publication'
    }

  </div>

</div>

</div>
        {/* Recent Activity */}

        <div style={css.card}>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '30px'
            }}
          >
            🌊 Recent Activity
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}
          >

            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700
                }}
              >
                ✅ Finals Completed
              </div>

              <div
                style={{
                  color: '#64748b',
                  marginTop: '6px'
                }}
              >
                Final rankings generated successfully.
              </div>
            </div>


            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700
                }}
              >
                🥇 Medals Assigned
              </div>

              <div
                style={{
                  color: '#64748b',
                  marginTop: '6px'
                }}
              >
                Gold, Silver and Bronze medals allocated.
              </div>
            </div>


            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 700
                }}
              >
                ⭐ Championship Points Calculated
              </div>

              <div
                style={{
                  color: '#64748b',
                  marginTop: '6px'
                }}
              >
                Leaderboard updated.
              </div>
            </div>


            <div>
              <div
                style={{
                  color:
                    published
                      ? '#10B981'
                      : '#FBBF24',

                  fontWeight: 700
                }}
              >

                {
                  published
                    ? '📢 Results Published'
                    : '⌛ Awaiting Publication'
                }

              </div>

              <div
                style={{
                  color: '#64748b',
                  marginTop: '6px'
                }}
              >
                Organizer controls public visibility.
              </div>

            </div>

          </div>

        </div>


        {/* Statistics */}

        <div style={css.card}>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '30px'
            }}
          >
            📊 Meet Statistics
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(180px,1fr))',
              gap: '20px'
            }}
          >

            <div
              style={{
                background: 'rgba(0,212,255,.08)',
                borderRadius: '20px',
                padding: '20px'
              }}
            >
              <div
                style={{
                  fontSize: '30px'
                }}
              >
                🏊
              </div>

              <div
                style={{
                  marginTop: '15px',
                  fontSize: '28px',
                  fontWeight: 900
                }}
              >
                --
              </div>

              <div
                style={{
                  color: '#94a3b8'
                }}
              >
                Swimmers
              </div>

            </div>


            <div
              style={{
                background: 'rgba(251,191,36,.08)',
                borderRadius: '20px',
                padding: '20px'
              }}
            >
              <div
                style={{
                  fontSize: '30px'
                }}
              >
                🏆
              </div>

              <div
                style={{
                  marginTop: '15px',
                  fontSize: '28px',
                  fontWeight: 900
                }}
              >
                --
              </div>

              <div
                style={{
                  color: '#94a3b8'
                }}
              >
                Events
              </div>

            </div>


            <div
              style={{
                background: 'rgba(16,185,129,.08)',
                borderRadius: '20px',
                padding: '20px'
              }}
            >
              <div
                style={{
                  fontSize: '30px'
                }}
              >
                📢
              </div>

              <div
                style={{
                  marginTop: '15px',
                  fontSize: '22px',
                  fontWeight: 900,
                  color:
                    published
                      ? '#10B981'
                      : '#EF4444'
                }}
              >
                {
                  published
                    ? 'LIVE'
                    : 'HIDDEN'
                }
              </div>

              <div
                style={{
                  color: '#94a3b8'
                }}
              >
                Result Status
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Footer */}

      <div
        style={{
          textAlign: 'center',
          padding: '50px',
          color: '#64748b'
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

        Official Results Publication Center

      </div>

    </div>

  );

}