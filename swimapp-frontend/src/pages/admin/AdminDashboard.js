import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';


export default function AdminDashboard() {

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const [analytics, setAnalytics] = useState({

    swimmers:0,
  
    meets:0,
  
    registrations:0,
  
    associations:0,
  
    organizers:0,
  
    pending:0
  
  });


  

  const fetchStats = async () => {
    try {

      const [
        pendingRes,
        approvedRes,
        rejectedRes
      ] = await Promise.all([
        adminAPI.getPendingOrganizers(),
        adminAPI.getApprovedOrganizers(),
        adminAPI.getRejectedOrganizers(),
      ]);

      const pending = pendingRes.data.length;
      const approved = approvedRes.data.length;
      const rejected = rejectedRes.data.length;

      setStats({
        pending,
        approved,
        rejected,
        total: pending + approved + rejected
      });


    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0a0e1a',
        color: '#94a3b8'
      }}>
        Loading Admin Portal...
      </div>
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg,#0a0e1a,#0d1526)',
        color: '#fff',
        padding: '40px'
      }}
    >

<div
  style={{
    marginBottom: '50px'
  }}
>

  <div
    style={{
      fontSize: '70px',
      marginBottom: '20px',
      filter:
        'drop-shadow(0 0 25px rgba(0,212,255,.6))'
    }}
  >
    👑
  </div>

  <h1
    style={{
      fontSize: '52px',
      fontWeight: 800,
      marginBottom: '15px',
      background:
        'linear-gradient(90deg,#00d4ff,#38bdf8,#7dd3fc)',

      WebkitBackgroundClip: 'text',

      WebkitTextFillColor:
        'transparent'
    }}
  >
    Federation Admin Portal
  </h1>

  <p
    style={{
      color: '#94a3b8',
      fontSize: '18px',
      maxWidth: '800px',
      lineHeight: 1.8
    }}
  >
    Manage organizer registrations,
    review documents,
    approve applications,
    and oversee the Swimming Federation ecosystem.
  </p>

</div>

      <div
        style={{
            display: 'grid',

            gridTemplateColumns:
            'repeat(auto-fit,minmax(280px,1fr))',
            
            gap:'30px',
            
            marginBottom:'50px'
        }}
      >

<Link
  to="/admin/pending"
  style={{ textDecoration:'none' }}
>
  <Card
    title="Pending Organizers"
    value={stats.pending}
    color="#f59e0b"
  />
</Link>

<Link
  to="/admin/approved"
  style={{ textDecoration:'none' }}
>
  <Card
    title="Approved Organizers"
    value={stats.approved}
    color="#10b981"
  />
</Link>

<Link
  to="/admin/rejected"
  style={{ textDecoration:'none' }}
>
  <Card
    title="Rejected Organizers"
    value={stats.rejected}
    color="#ef4444"
  />
</Link>

<Card
  title="Total Organizers"
  value={stats.total}
  color="#00d4ff"
/>
      </div>

      <div

style={{

marginTop:'60px'

}}

>

<h2

style={{

fontSize:'32px',

marginBottom:'30px'

}}

>

⚡ Quick Actions

</h2>

<div

style={{

display:'grid',

gridTemplateColumns:
'repeat(auto-fit,minmax(300px,1fr))',

gap:'25px'

}}

>

<Link
to="/admin/pending"
style={{
textDecoration:'none'
}}
>

<div

style={{

background:
'rgba(255,255,255,.04)',

border:
'1px solid rgba(255,255,255,.08)',

borderRadius:'25px',

padding:'30px'

}}

>

<h3>

⏳ Pending Applications

</h3>

<p

style={{

color:'#94a3b8',

lineHeight:1.8

}}

>

Review organizer applications waiting for approval.

</p>

</div>

</Link>

<Link
to="/admin/approved"
style={{
textDecoration:'none'
}}
>

<div

style={{

background:
'rgba(255,255,255,.04)',

border:
'1px solid rgba(255,255,255,.08)',

borderRadius:'25px',

padding:'30px'

}}

>

<h3>

✅ Approved Organizers

</h3>

<p

style={{

color:'#94a3b8',

lineHeight:1.8

}}

>

Manage organizers already verified by the federation.

</p>

</div>

</Link>

<Link
to="/admin/rejected"
style={{
textDecoration:'none'
}}
>

<div

style={{

background:
'rgba(255,255,255,.04)',

border:
'1px solid rgba(255,255,255,.08)',

borderRadius:'25px',

padding:'30px'

}}

>

<h3>

❌ Rejected Organizers

</h3>

<p

style={{

color:'#94a3b8',

lineHeight:1.8

}}

>

Review rejected applications and reasons.

</p>

</div>

</Link>

<Link
to="/admin/organizers"
style={{
textDecoration:'none'
}}
>

<div

style={{

background:
'rgba(255,255,255,.04)',

border:
'1px solid rgba(255,255,255,.08)',

borderRadius:'25px',

padding:'30px'

}}

>

<h3>

📋 Organizer Requests

</h3>

<p

style={{

color:'#94a3b8',

lineHeight:1.8

}}

>

Review uploaded PDFs and approve or reject organizer registrations.

</p>

</div>

</Link>

<Link
to="/admin/associations"
style={{
textDecoration:'none'
}}
>

<div

style={{

background:
'rgba(255,255,255,.04)',

border:
'1px solid rgba(255,255,255,.08)',

borderRadius:'25px',

padding:'30px'

}}

>

<h3>

🏛 Associations

</h3>

<p

style={{

color:'#94a3b8',

lineHeight:1.8

}}

>

Manage district, state, national and club associations.

</p>

</div>

</Link>

</div>

</div>

<h2

style={{

fontSize:'32px',

marginTop:'80px',

marginBottom:'30px'

}}

>

📊 Federation Analytics

</h2>

<div

style={{

display:'grid',

gridTemplateColumns:
'repeat(auto-fit,minmax(260px,1fr))',

gap:'25px'

}}

>

<Card
title="Total Swimmers"
value={analytics.swimmers}
color="#00d4ff"
/>

<Card
title="Total Meets"
value={analytics.meets}
color="#10b981"
/>

<Card
title="Registrations"
value={analytics.registrations}
color="#8b5cf6"
/>

<Card
title="Associations"
value={analytics.associations}
color="#f59e0b"
/>

<Card
title="Organizers"
value={analytics.organizers}
color="#3b82f6"
/>

<Card
title="Pending Approval"
value={analytics.pending}
color="#ef4444"
/>

</div>

    </div>
  );
}

function Card({

    title,
  
    value,
  
    color
  
  }) {
  
    return (
  
      <div
  
        style={{
  
          background:
            'rgba(255,255,255,.04)',
  
          backdropFilter:
            'blur(18px)',
  
          border:
            `1px solid ${color}30`,
  
          borderRadius:'30px',
  
          padding:'35px',
  
          boxShadow:
            '0 20px 60px rgba(0,0,0,.35)',
  
          transition:
            'all .35s ease'
  
        }}
  
      >
  
        <div
  
          style={{
  
            color,
  
            fontSize:'56px',
  
            fontWeight:800
  
          }}
  
        >
  
          {value}
  
        </div>
  
        <div
  
          style={{
  
            color:'#cbd5e1',
  
            fontSize:'18px',
  
            marginTop:'15px',
  
            fontWeight:600
  
          }}
  
        >
  
          {title}
  
        </div>
        </div>
  
    );
  
  }