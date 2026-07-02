import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';

export default function OrganizerDetails() {

  const { id } = useParams();

  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizer();
  }, []);

  const fetchOrganizer = async () => {

    try {

      const res = await userAPI.getUserById(id);

      console.log(res.data);

      setOrganizer(res.data);

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
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0a0e1a',
          color: '#94a3b8'
        }}
      >
        Loading organizer...
      </div>
    );

  if (!organizer)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0e1a',
          color: '#fff',
          padding: '40px'
        }}
      >
        Organizer not found.
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

marginBottom:'40px'

}}

>

<div

style={{

fontSize:'70px',

marginBottom:'20px'

}}

>

👤

</div>

<h1

style={{

fontSize:'50px',

fontWeight:800,

marginBottom:'15px',

background:
'linear-gradient(90deg,#00d4ff,#38bdf8,#7dd3fc)',

WebkitBackgroundClip:'text',

WebkitTextFillColor:'transparent'

}}

>

Organizer Profile

</h1>

<p

style={{

color:'#94a3b8',

fontSize:'18px',

lineHeight:1.8

}}

>

View organizer information and uploaded documents.

</p>

</div>

      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow:
'0 20px 60px rgba(0,0,0,.35)',
          borderRadius: '30px',
          padding: '40px',
          display: 'grid',
          gap: '16px'
        }}
      >

        <div>
          <strong>Name:</strong>
          {' '}
          {organizer.first_name} {organizer.last_name}
        </div>

        <div>
          <strong>Email:</strong>
          {' '}
          {organizer.email}
        </div>

        <div>
          <strong>Association Name:</strong>
          {' '}
          {organizer.association_name}
        </div>

        <div>
          <strong>Association Type:</strong>
          {' '}
          {organizer.association_type}
        </div>

        <div>
          <strong>Contact Information:</strong>
          {' '}
          {organizer.contact_information}
        </div>

        <div>
        <div>

<strong>Status:</strong>

{' '}

<span
  style={{
    color:
      organizer.organizer_status === 'approved'
        ? '#10b981'
        : organizer.organizer_status === 'rejected'
        ? '#ef4444'
        : '#f59e0b',
    fontWeight: 700
  }}
>
  {(organizer.organizer_status || 'pending').toUpperCase()}
</span>

</div>
        </div>

        {
          organizer.approved_at && (
            <div>
              <strong>Approved At:</strong>
              {' '}
              {new Date(
                organizer.approved_at
              ).toLocaleString()}
            </div>
          )
        }

        {
          organizer.rejection_reason && (
            <div
              style={{
                color: '#ef4444'
              }}
            >
              <strong>Rejection Reason:</strong>
              {' '}
              {organizer.rejection_reason}
            </div>
          )
        }

        {
          organizer.organizer_document && (
            <div>

           <a
              href={`http://127.0.0.1:8000${organizer.organizer_document}`}
                target="_blank"
                rel="noreferrer"
                style={{

                    color:'#00d4ff',
                    
                    textDecoration:'none',
                    
                    fontWeight:700
                    
                    }}
              >
                📄 View Uploaded Document
              </a>

            </div>
          )
        }

      </div>

      <div

style={{

marginTop:'50px'

}}

>

<button

onClick={() =>
window.history.back()
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

← Back

</button>

</div>

    </div>

  );

}