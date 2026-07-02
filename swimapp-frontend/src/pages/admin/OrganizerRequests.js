import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrganizerRequests = () => {

    const [pendingOrganizers, setPendingOrganizers] = useState([]);

    const [approvedOrganizers, setApprovedOrganizers] = useState([]);

    const [rejectedOrganizers, setRejectedOrganizers] = useState([]);

    const [activeTab, setActiveTab] = useState('pending');

    const fetchData = async () => {

        const token = localStorage.getItem('access');

        const headers = {

            Authorization: `Bearer ${token}`

        };

        try {

            const pendingResponse = await axios.get(

                'http://127.0.0.1:8000/api/users/pending-organizers/',

                { headers }

            );

            const approvedResponse = await axios.get(

                'http://127.0.0.1:8000/api/users/approved-organizers/',

                { headers }

            );

            const rejectedResponse = await axios.get(

                'http://127.0.0.1:8000/api/users/rejected-organizers/',

                { headers }

            );

            setPendingOrganizers(
                pendingResponse.data
            );

            setApprovedOrganizers(
                approvedResponse.data
            );

            setRejectedOrganizers(
                rejectedResponse.data
            );

        }

        catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {

        fetchData();
    
    }, []);

    const approveOrganizer = async (id) => {

        const token = localStorage.getItem('access');
    
        await axios.post(
    
            `http://127.0.0.1:8000/api/users/approve-organizer/${id}/`,
    
            {},
    
            {
    
                headers: {
    
                    Authorization:
    
                        `Bearer ${token}`
    
                }
    
            }
    
        );
    
        fetchData();
    
    };

    const rejectOrganizer = async (id) => {

        const token = localStorage.getItem('access');
    
        const reason = prompt(
            'Enter rejection reason'
        );
    
        await axios.post(
    
            `http://127.0.0.1:8000/api/users/reject-organizer/${id}/`,
    
            {
    
                reason
    
            },
    
            {
    
                headers: {
    
                    Authorization:
    
                        `Bearer ${token}`
    
                }
    
            }
    
        );
    
        fetchData();
    
    };

    const organizers =

activeTab === 'pending'

? pendingOrganizers

: activeTab === 'approved'

? approvedOrganizers

: rejectedOrganizers;



return (

    <div
    style={{
        minHeight: '100vh',
        background:
            'linear-gradient(135deg,#081224,#0B1D38,#081224)',
        padding: 30,
        color: '#fff'
    }}
    >
    
    <h1
    style={{
        fontSize: 32,
        fontWeight: 800,
        marginBottom: 30
    }}
    >
    Organizer Requests
    </h1>
    
    
    {/* Tabs */}
    
    <div
    style={{
        display: 'flex',
        gap: 15,
        marginBottom: 30
    }}
    >
    
    <button
    onClick={() => setActiveTab('pending')}
    style={{
        background:
            activeTab === 'pending'
            ? '#0EA5E9'
            : '#1E293B',
    
        color: '#fff',
    
        border: 'none',
    
        padding: '12px 24px',
    
        borderRadius: 12,
    
        cursor: 'pointer'
    }}
    >
    Pending
    </button>
    
    
    <button
    onClick={() => setActiveTab('approved')}
    style={{
        background:
            activeTab === 'approved'
            ? '#10B981'
            : '#1E293B',
    
        color: '#fff',
    
        border: 'none',
    
        padding: '12px 24px',
    
        borderRadius: 12,
    
        cursor: 'pointer'
    }}
    >
    Approved
    </button>
    
    
    <button
    onClick={() => setActiveTab('rejected')}
    style={{
        background:
            activeTab === 'rejected'
            ? '#EF4444'
            : '#1E293B',
    
        color: '#fff',
    
        border: 'none',
    
        padding: '12px 24px',
    
        borderRadius: 12,
    
        cursor: 'pointer'
    }}
    >
    Rejected
    </button>
    
    </div>

    <div
style={{
    display: 'grid',
    gap: 25
}}
>

{
organizers.map(
organizer => (

<div
key={organizer.id}

style={{
    background:
        'rgba(255,255,255,0.04)',

    backdropFilter:
        'blur(20px)',

    border:
        '1px solid rgba(14,165,233,.15)',

    borderRadius: 20,

    padding: 30
}}
>

<h2
style={{
    color: '#38BDF8',
    marginBottom: 20
}}
>
{organizer.first_name}
{' '}
{organizer.last_name}
</h2>


<p>

<b>Email :</b>

{' '}

{organizer.email}

</p>


<p>

<b>Association :</b>

{' '}

{organizer.association_name}

</p>


<p>

<b>Level :</b>

{' '}

{organizer.association_type}

</p>


<p>

<b>Contact :</b>

{' '}

{organizer.contact_information}

</p>

{
organizer.organizer_document && (

<a

href={`http://127.0.0.1:8000${organizer.organizer_document}`}

target="_blank"

rel="noreferrer"

style={{

display: 'inline-block',

marginTop: 15,

padding: '10px 18px',

background: '#0284C7',

color: '#fff',

textDecoration: 'none',

borderRadius: 10

}}

>

View PDF

</a>

)
}

{
activeTab === 'pending' && (

<div
style={{
    display: 'flex',
    gap: 15,
    marginTop: 25
}}
>

<button

onClick={() =>
approveOrganizer(
organizer.id
)
}

style={{
    background: '#10B981',

    border: 'none',

    color: '#fff',

    padding: '12px 24px',

    borderRadius: 12,

    cursor: 'pointer'
}}
>

Approve

</button>


<button

onClick={() =>
rejectOrganizer(
organizer.id
)
}

style={{
    background: '#EF4444',

    border: 'none',

    color: '#fff',

    padding: '12px 24px',

    borderRadius: 12,

    cursor: 'pointer'
}}
>

Reject

</button>

</div>

)
}
</div>

))
}

</div>

</div>

);

};

export default OrganizerRequests;