import React, { useState } from 'react';
import { useEffect } from "react";
import { adminAPI } from "../services/api";

export default function Associations() {

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssociations = async () => {
    try {
        const response = await adminAPI.getApprovedOrganizers();
        setAssociations(response.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
  fetchAssociations();
}, []);

const filteredAssociations =
associations.filter(a =>
  (
    filter === "all" ||
    (a.association_type &&
     a.association_type.toLowerCase() === filter)
  ) &&
  (
    a.association_name &&
    a.association_name.toLowerCase().includes(
      search.toLowerCase()
    )
  )
);
  const badgeColor = status => {

    if(status==='approved')
      return '#10b981';

    if(status==='pending')
      return '#f59e0b';

    return '#ef4444';

  };

  return (

    <div
      style={{
        minHeight:'100vh',
        background:
        'linear-gradient(135deg,#0a0e1a,#0d1526)',
        color:'#fff',
        padding:'40px'
      }}
    >

      <h1
        style={{
          fontSize:'48px',
          marginBottom:'15px'
        }}
      >
        🏛 Association Directory
      </h1>

      <p
        style={{
          color:'#94a3b8',
          marginBottom:'40px'
        }}
      >
        Manage district, state, national and club associations.
      </p>

      <input

        value={search}

        onChange={e =>
          setSearch(
            e.target.value
          )
        }

        placeholder="🔍 Search Association"

        style={{
          width:'100%',
          padding:'18px',
          borderRadius:'20px',
          background:
          'rgba(255,255,255,.04)',
          border:
          '1px solid rgba(255,255,255,.08)',
          color:'#fff',
          marginBottom:'30px'
        }}

      />

      <div
        style={{
          display:'flex',
          gap:'15px',
          marginBottom:'40px'
        }}
      >

        {
          ['all','district','state','national','club']
          .map(type => (

            <button

              key={type}

              onClick={() =>
                setFilter(type)
              }

              style={{
                padding:'12px 20px',
                borderRadius:'15px',
                border:'none',
                cursor:'pointer',
                background:
                filter===type
                ? '#00d4ff'
                : 'rgba(255,255,255,.05)',
                color:
                filter===type
                ? '#000'
                : '#fff'
              }}

            >

              {type.toUpperCase()}

            </button>

          ))
        }

      </div>

      <div
        style={{
          display:'grid',
          gap:'25px'
        }}
      >

        {
          filteredAssociations.map(a => (

            <div

              key={a.id}

              style={{
                background:
                'rgba(255,255,255,.04)',

                border:
                '1px solid rgba(255,255,255,.08)',

                borderRadius:'25px',

                padding:'30px'
              }}

            >

            <h2>
              
              {a.association_name}
              
              
              </h2>

              <p>

                Type:

                {a.association_type}

              </p>

              <p>

              Organizer: 
              
              {a.first_name} {a.last_name}

              </p>

              <div

                style={{
                  color:
                  badgeColor(
                     a.organizer_status
                  ),

                  fontWeight:700
                }}

              >

                {a.organizer_status.toUpperCase()}

              </div>

            </div>

          ))
        }

      </div>

    </div>

  );

}