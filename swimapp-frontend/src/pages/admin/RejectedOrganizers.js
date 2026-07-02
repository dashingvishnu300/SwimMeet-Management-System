import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function RejectedOrganizers() {

  const [organizers, setOrganizers] = useState([]);
  const [search, setSearch] =
useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {

    try {

      const res =
      await adminAPI.getRejectedOrganizers();

      setOrganizers(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
};

      

      if (loading)
        return (
          <div
            style={{
              minHeight:'100vh',
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              background:'#0a0e1a',
              color:'#94a3b8'
            }}
          >
            Loading...
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
          
              <h1
                style={{
                  fontSize: '36px',
                  marginBottom: '10px'
                }}
              >
               ❌ Rejected Organizers
              </h1>
          
              <p
                style={{
                  color: '#94a3b8',
                  marginBottom: '40px'
                }}
              >
                Rejected organizer applications.
              </p>
          
              <div
                style={{
                  display: 'grid',
                  gap: '24px'
                }}
              >
                <input

type="text"

placeholder="🔍 Search organizer..."

value={search}

onChange={(e) =>
setSearch(e.target.value)
}

style={{

width:'100%',

padding:'18px',

background:
'rgba(255,255,255,.05)',

border:
'1px solid rgba(255,255,255,.1)',

borderRadius:'20px',

color:'white',

fontSize:'16px',

marginBottom:'30px'

}}

/>
          
                {organizers

.filter(

(org)=>

`${org.first_name}

${org.middle_name || ''}

${org.last_name}`

.toLowerCase()

.includes(

search.toLowerCase()

)

)

.map(org => (
          
                  <div
                    key={org.id}
                    style={{
                      background:
                        'rgba(255,255,255,0.05)',
          
                      border:
                        '1px solid rgba(255,255,255,0.08)',
          
                      borderRadius: '20px',
          
                      padding: '28px',
          
                      backdropFilter: 'blur(14px)'
                    }}
                  >
          
          <h2
  style={{
    marginBottom: '16px',
    cursor: 'pointer',
    color: '#00d4ff'
  }}
  onClick={() =>
    navigate(`/admin/organizers/${org.id}`)
  }
>
  👤 {org.first_name} {org.last_name}
</h2>
          
                    <div
                      style={{
                        display: 'grid',
                        gap: '10px',
                        color: '#cbd5e1'
                      }}
                    >
          
                      <div>
                        📧 {org.email}
                      </div>
          
                      <div>
                        🏛 {org.association_name}
                      </div>
          
                      <div>
                        🏊 Association Type:
                        {' '}
                        {org.association_type}
                      </div>
          
                      <div>
                        📞 {org.contact_information}

                        
                      </div>

                      {
  org.rejection_reason && (

    <div
      style={{
        color: '#ef4444'
      }}
    >
      ❗ Reason:

      {' '}

      {org.rejection_reason}

    </div>

  )
}
          
                    </div>
          
                    {
                      org.organizer_document &&
                      (
                        <div
                          style={{
                            marginTop: '20px'
                          }}
                        >
          
                          <a
                            href={org.organizer_document}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#00d4ff'
                            }}
                          >
                            📄 View Document
                          </a>
          
                        </div>
                      )
                    }
          
          <div
  style={{
    marginTop: '24px'
  }}
>
<div

style={{

marginTop:'25px'

}}

>

<button

onClick={() =>
navigate(
`/admin/organizers/${org.id}`
)
}

style={{

background:'#00d4ff',

border:'none',

color:'#fff',

padding:'12px 20px',

borderRadius:'15px',

cursor:'pointer',

fontWeight:700

}}

>

👁 View Details

</button>

</div>

  <span
    style={{
      background:
    'rgba(239,68,68,0.15)',

      color:
       '#ef4444',

      padding:
        '8px 16px',

      borderRadius:
        '20px',

      fontWeight:
        700,

      border:
     '1px solid rgba(239,68,68,0.3)'
    }}
  >
    REJECTED
  </span>

</div>
          
                  </div>
          
                ))}
          
              </div>

              <div

style={{

marginTop:'50px'

}}

>

<button

onClick={() =>
navigate('/admin')
}

style={{

background:'transparent',

border:'none',

color:'#38bdf8',

fontWeight:700,

fontSize:'16px',

cursor:'pointer'

}}

>

← Back To Dashboard

</button>

</div>
          
            </div>
          );
}