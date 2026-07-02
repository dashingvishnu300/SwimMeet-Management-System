import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RecordsCenter() {

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchRecords();

  }, []);

  const fetchRecords = async () => {

    try {

      const response = await axios.get(
        'http://127.0.0.1:8000/api/championships/records/'
      );

      setRecords(response.data.records);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  const styles = {

    page: {
      minHeight: '100vh',
      background:
        'linear-gradient(135deg,#0a0e1a 0%,#0d1526 50%,#091427 100%)',
      color: '#fff',
      paddingBottom: '80px'
    },

    hero: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '50px 40px'
    },

    title: {
      fontSize: '48px',
      fontWeight: 900,
      marginBottom: '10px'
    },

    subtitle: {
      color: '#64748b',
      fontSize: '18px'
    },

    statsGrid: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit,minmax(250px,1fr))',
      gap: '25px',
      padding: '0 40px',
      marginBottom: '40px'
    },

    statCard: {
      background:
        'rgba(255,255,255,.03)',
      border:
        '1px solid rgba(255,255,255,.08)',
      borderRadius: '24px',
      padding: '30px',
      backdropFilter: 'blur(20px)'
    },

    statNumber: {
      fontSize: '42px',
      fontWeight: 900,
      color: '#fbbf24'
    },

    statLabel: {
      color: '#94a3b8',
      marginTop: '10px'
    },

    section: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 40px'
    },

    sectionTitle: {
      fontSize: '28px',
      fontWeight: 800,
      marginBottom: '30px'
    }

  };

  if (loading) {

    return (

      <div style={styles.page}>

        <div
          style={{
            padding: '150px',
            textAlign: 'center'
          }}
        >
          Loading records...
        </div>

      </div>

    );

  }

  return (

    <div style={styles.page}>

      <div style={styles.hero}>

        <div style={styles.title}>
          🏆 Records Center
        </div>

        <div style={styles.subtitle}>
          Track the greatest performances in swimming history.
        </div>

      </div>

      <div style={styles.statsGrid}>

        <div style={styles.statCard}>

          <div style={styles.statNumber}>
            {records.length}
          </div>

          <div style={styles.statLabel}>
            Total Records
          </div>

        </div>

        <div style={styles.statCard}>

          <div style={styles.statNumber}>
            ⭐
          </div>

          <div style={styles.statLabel}>
            Top Performances
          </div>

        </div>

        <div style={styles.statCard}>

          <div style={styles.statNumber}>
            ⚡
          </div>

          <div style={styles.statLabel}>
            Fastest Swimmers
          </div>

        </div>

        <div style={styles.statCard}>

          <div style={styles.statNumber}>
            🌎
          </div>

          <div style={styles.statLabel}>
            Championships
          </div>

        </div>

      </div>
      <div style={styles.section}>

<div style={styles.sectionTitle}>
  ⚡ Record Performances
</div>

<div
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(320px,1fr))',
    gap: '25px',
    marginBottom: '50px'
  }}
>

  {records.map((record, index) => (

    <div
      key={index}
      style={{
        background:
          'linear-gradient(135deg,rgba(251,191,36,.15),rgba(255,255,255,.03))',
        border:
          '1px solid rgba(251,191,36,.25)',
        borderRadius: '24px',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >

      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: '#fbbf24',
          color: '#111827',
          padding: '6px 12px',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '12px'
        }}
      >
        RECORD
      </div>

      <div
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '20px'
        }}
      >
        {record.event}
      </div>

      <div
        style={{
          fontSize: '36px',
          fontWeight: 900,
          color: '#fbbf24'
        }}
      >
        {record.time}
      </div>

      <div
        style={{
          marginTop: '20px',
          color: '#cbd5e1',
          fontWeight: 700
        }}
      >
        🏊 {record.swimmer}
      </div>

      <div
        style={{
          marginTop: '10px',
          color: '#94a3b8'
        }}
      >
        🏆 {record.meet}
      </div>

      <div
        style={{
          marginTop: '10px',
          color: '#64748b'
        }}
      >
        📅 {record.year}
      </div>

    </div>

  ))}

</div>


<div style={styles.sectionTitle}>
  📋 Records Table
</div>

<div
  style={{
    background:
      'rgba(255,255,255,.03)',
    border:
      '1px solid rgba(255,255,255,.08)',
    borderRadius: '24px',
    overflow: 'hidden'
  }}
>

  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse'
    }}
  >

    <thead>

      <tr
        style={{
          background:
            'rgba(255,255,255,.04)'
        }}
      >

        <th style={{padding:'20px'}}>
          Event
        </th>

        <th style={{padding:'20px'}}>
          Swimmer
        </th>

        <th style={{padding:'20px'}}>
          Meet
        </th>

        <th style={{padding:'20px'}}>
          Time
        </th>

        <th style={{padding:'20px'}}>
          Year
        </th>

      </tr>

    </thead>

    <tbody>

      {records.map((record, index) => (

        <tr
          key={index}
          style={{
            borderTop:
              '1px solid rgba(255,255,255,.05)'
          }}
        >

          <td style={{padding:'20px'}}>
            {record.event}
          </td>

          <td style={{padding:'20px'}}>
            {record.swimmer}
          </td>

          <td style={{padding:'20px'}}>
            {record.meet}
          </td>

          <td
            style={{
              padding:'20px',
              color:'#fbbf24',
              fontWeight:800
            }}
          >
            {record.time}
          </td>

          <td style={{padding:'20px'}}>
            {record.year}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

      {/* Top Swimmers Podium */}

      <div
        style={{
          marginTop: '60px'
        }}
      >

        <div style={styles.sectionTitle}>
          🥇 Top Performers
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(300px,1fr))',
            gap: '25px',
            marginBottom: '60px'
          }}
        >

          <div
            style={{
              background:
                'linear-gradient(135deg,#fbbf24,#f59e0b)',
              borderRadius: '24px',
              padding: '30px',
              color: '#111827'
            }}
          >

            <div
              style={{
                fontSize: '50px'
              }}
            >
              🥇
            </div>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 900,
                marginTop: '20px'
              }}
            >
              Fastest Record
            </div>

            <div
              style={{
                marginTop: '20px',
                fontSize: '18px'
              }}
            >
              {records[0]?.swimmer}
            </div>

          </div>


          <div
            style={{
              background:
                'linear-gradient(135deg,#94a3b8,#64748b)',
              borderRadius: '24px',
              padding: '30px'
            }}
          >

            <div
              style={{
                fontSize: '50px'
              }}
            >
              🥈
            </div>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 900,
                marginTop: '20px'
              }}
            >
              Championship Holder
            </div>

            <div
              style={{
                marginTop: '20px'
              }}
            >
              {records[1]?.swimmer}
            </div>

          </div>


          <div
            style={{
              background:
                'linear-gradient(135deg,#b45309,#92400e)',
              borderRadius: '24px',
              padding: '30px'
            }}
          >

            <div
              style={{
                fontSize: '50px'
              }}
            >
              🥉
            </div>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 900,
                marginTop: '20px'
              }}
            >
              Elite Performer
            </div>

            <div
              style={{
                marginTop: '20px'
              }}
            >
              {records[2]?.swimmer}
            </div>

          </div>

        </div>

      </div>


      {/* Timeline */}

      <div
        style={{
          marginBottom: '70px'
        }}
      >

        <div style={styles.sectionTitle}>
          📅 Records Timeline
        </div>

        <div
          style={{
            background:
              'rgba(255,255,255,.03)',
            border:
              '1px solid rgba(255,255,255,.08)',
            borderRadius: '24px',
            padding: '40px'
          }}
        >

          {

            [...new Set(records.map(r => r.year))]

            .map(year => (

              <div
                key={year}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '30px'
                }}
              >

                <div
                  style={{
                    width: '90px',
                    color: '#fbbf24',
                    fontWeight: 900,
                    fontSize: '20px'
                  }}
                >
                  {year}
                </div>

                <div
                  style={{
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    background: '#00d4ff'
                  }}
                />

                <div
                  style={{
                    marginLeft: '30px',
                    color: '#cbd5e1'
                  }}
                >
                  Championship Records Updated
                </div>

              </div>

            ))

          }

        </div>

      </div>


      {/* Footer */}

      <div
        style={{
          textAlign: 'center',
          color: '#64748b',
          paddingBottom: '60px'
        }}
      >

        <div
          style={{
            fontSize: '22px',
            color: '#00d4ff',
            marginBottom: '15px'
          }}
        >
          🏆 SwimMeet Records Center
        </div>

        Track greatness. Celebrate champions.

      </div>

</div>

</div>

);

}