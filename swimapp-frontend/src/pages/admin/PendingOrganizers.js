import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function PendingOrganizers() {

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
        await adminAPI.getPendingOrganizers();

      setOrganizers(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
};

    const approveOrganizer = async (id) => {

        try {
      
          await adminAPI.approveOrganizer(id);
      
          fetchOrganizers();
      
        } catch (err) {
      
          console.error(err);
      
        }
      
      };

      const rejectOrganizer = async (id) => {

        try {
      
          const reason =
            window.prompt(
              'Reason for rejection'
            );
      
          await adminAPI.rejectOrganizer(
            id,
            reason
          );
      
          fetchOrganizers();
      
        } catch (err) {
      
          console.error(err);
      
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
                ⏳ Pending Organizers
              </h1>
          
              <p
                style={{
                  color: '#94a3b8',
                  marginBottom: '40px'
                }}
              >
                Review and approve organizer registrations.
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
  setSearch(
    e.target.value
  )
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
(org) =>
`${org.first_name} ${org.middle_name || ''} ${org.last_name}`
.toLowerCase()
.includes(search.toLowerCase())
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
                        display: 'flex',
                        gap: '14px',
                        marginTop: '28px'
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
          
                      <button
                        onClick={() =>
                          approveOrganizer(org.id)
                        }
          
                        style={{
                          background: '#10b981',
                          border: 'none',
                          color: '#fff',
                          padding: '12px 20px',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        ✅ Approve
                      </button>
          
                      <button
                        onClick={() =>
                          rejectOrganizer(org.id)
                        }
          
                        style={{
                          background: '#ef4444',
                          border: 'none',
                          color: '#fff',
                          padding: '12px 20px',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        ❌ Reject
                      </button>
          
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