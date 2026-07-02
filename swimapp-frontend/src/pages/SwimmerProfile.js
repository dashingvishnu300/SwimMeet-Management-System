import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useParams } from 'react-router-dom';
export default function SwimmerProfile() {
    const { user } = useAuth();

    const [stats, setStats] = useState(null);

    const [personalBests, setPersonalBests] = useState([]);

    const [recentResults,setRecentResults] = useState([]);

    const [recordsHeld,setRecordsHeld] = useState([]);

    const [meetHistory, setMeetHistory] = useState([]);

    const [registeredEvents, setRegisteredEvents] = useState([]);

    const [profileUser, setProfileUser] = useState(null);

    const { id } = useParams();

    const age = (() => {

        if (!profileUser?.date_of_birth)
          return '-';
      
        const dob = new Date(
          profileUser.date_of_birth
        );
      
        const today = new Date();
      
        let age =
          today.getFullYear()
          -
          dob.getFullYear();
      
        const monthDiff =
          today.getMonth()
          -
          dob.getMonth();
      
        if (
      
          monthDiff < 0 ||
      
          (
            monthDiff === 0
            &&
            today.getDate() < dob.getDate()
          )
      
        ) {
      
          age--;
      
        }
      
        return age;
      
      })();

      const category =

age <= 14

? 'SUB JUNIOR'

: age <= 17

? 'JUNIOR'

: 'SENIOR';


    useEffect(() => {

        fetchProfileUser();
        fetchStats();
        const fetchPersonalBests = async () => {

            try {
          
              const response =
              id
              ? await userAPI.getPersonalBestsById(id)
              : await userAPI.getPersonalBests();
          
              setPersonalBests(response.data);
          
            }
          
            catch (error) {
          
              console.log(error);
          
            }
          
          };
        fetchPersonalBests();

        fetchRecentResults();

        fetchRecordsHeld();

        fetchMeetHistory();

        fetchRegisteredEvents();

        fetchProfileUser();
      
      }, [id]);

const fetchStats = async () => {

  try {

    const response = id
  ? await userAPI.getProfileStatsById(id)
  : await userAPI.getProfileStats();

    setStats(response.data);

  }

  catch (error) {

    console.log(error);

  }

};
const fetchRecentResults = async () => {

    try {
  
        const response = id
        ? await userAPI.getRecentResultsById(id)
        : await userAPI.getRecentResults();
  
      setRecentResults(response.data);
  
    }
  
    catch(error){
  
      console.log(error);
  
    }
  
  };
  const fetchRecordsHeld = async () => {

    try {
  
        const response = id
        ? await userAPI.getRecordsHeldById(id)
        : await userAPI.getRecordsHeld();
  
      setRecordsHeld(response.data);
  
    }
  
    catch(error){
  
      console.log(error);
  
    }
  
  };
  const fetchMeetHistory = async () => {

    try {
  
        const response = id
        ? await userAPI.getMeetHistoryById(id)
        : await userAPI.getMeetHistory();
  
      setMeetHistory(response.data);
  
    }
  
    catch(error){
  
      console.log(error);
  
    }
  
  };

  const fetchRegisteredEvents = async () => {

    try {
  
        const response = id
        ? await userAPI.getRegisteredEventsById(id)
        : await userAPI.getRegisteredEvents();
  
      setRegisteredEvents(response.data);
  
    }
  
    catch(error){
  
      console.log(error);
  
    }
  
  };

  const fetchProfileUser = async () => {

    try {
  
      const response = id
        ? await userAPI.getUserById(id)
        : { data: user };
  
      setProfileUser(response.data);
  
    }
  
    catch(error){
  
      console.log(error);
  
    }
  
  };

const styles = {

    page: {
      minHeight: '100vh',
      background:
        'linear-gradient(135deg,#08101d 0%,#0c1728 50%,#091426 100%)',
      color: '#fff'
    },
  
    hero: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '50px 40px'
    },
  
    avatar: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background:
        'linear-gradient(135deg,#00d4ff,#0ea5e9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '60px'
    },
  
    name: {
      fontSize: '42px',
      fontWeight: 900
    },
  
    subtitle: {
      color: '#94a3b8',
      marginTop: '10px',
      fontSize: '18px'
    },
  
    badge: {
      display: 'inline-block',
      marginTop: '20px',
      background:'rgba(251,191,36,.15)',
      color:'#fbbf24',
      padding:'10px 20px',
      borderRadius:'20px',
      fontWeight:700
    },
  
    statCard: {
        background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,.08)',
        borderRadius:'24px',
        padding:'40px',
        transition:'0.3s',
        cursor:'pointer'
      },
  
    statValue: {
      fontSize:'40px',
      fontWeight:900,
      color:'#00d4ff'
    },
  
    statLabel: {
      color:'#94a3b8',
      marginTop:'10px'
    }
  
  };
  
  
  return (
  
  <div style={styles.page}>
  
  <div style={styles.hero}>

{/* HERO CARD */}

<div
style={{
background:'rgba(255,255,255,.04)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'30px',
padding:'40px',
display:'flex',
justifyContent:'space-between',
alignItems:'center',
backdropFilter:'blur(20px)'
}}
>

<div
style={{
display:'flex',
gap:'30px',
alignItems:'center'
}}
>

{
profileUser?.profile_picture ?

<img
src={`http://127.0.0.1:8000${profileUser.profile_picture}`}
alt=""
style={{
width:'140px',
height:'140px',
borderRadius:'50%',
objectFit:'cover'
}}
/>

:

<div style={styles.avatar}>
🏊
</div>

}


<div>

<div style={styles.name}>
{profileUser?.username}
</div>

<div style={styles.subtitle}>
Competitive Swimmer
</div>

<div
style={{
marginTop:'15px',
display:'flex',
flexDirection:'column',
gap:'8px',
color:'#94a3b8',
fontSize:'15px'
}}
>

<div>
🏊 {profileUser?.association_name_display}
</div>

<div>
📍 {profileUser?.district_name},
{' '}
{profileUser?.state_name}
</div>

</div>

<div
style={{
marginTop:'12px',
color:'#94a3b8'
}}
>

🎂 DOB:

{
profileUser?.date_of_birth ||
'-'
}

</div>

<div
style={{
marginTop:'8px',
color:'#00d4ff',
fontWeight:700
}}
>

📅 Age:

{age}

</div>

<div
style={{
    marginTop:'8px',
    color:'#94a3b8',
    fontWeight:600
}}
>
    {
        profileUser?.gender === "MALE"
            ? "👨 Gender: Male"
            : profileUser?.gender === "FEMALE"
            ? "👩 Gender: Female"
            : "🚻 Gender: -"
    }
</div>

<div style={styles.badge}>

🏊

{category}

</div>

</div>

</div>


<div>

<div
style={{
fontSize:'60px',
fontWeight:900,
color:'#00d4ff'
}}
>
{stats?.championship_points || 0}
</div>

<div
style={{
color:'#94a3b8',
textAlign:'center'
}}
>
Championship Points
</div>

</div>

</div>


{/* STATS ROW */}

<div
style={{
display:'grid',
gridTemplateColumns:'repeat(4,1fr)',
gap:'25px',
marginTop:'35px'
}}
>

<div style={styles.statCard}>
<div style={styles.statValue}>
🥇 {stats?.gold_medals || 0}
</div>

<div style={styles.statLabel}>
Gold Medals
</div>
</div>


<div style={styles.statCard}>
<div style={styles.statValue}>
🥈 {stats?.silver_medals || 0}
</div>

<div style={styles.statLabel}>
Silver Medals
</div>
</div>


<div style={styles.statCard}>
<div style={styles.statValue}>
🥉 {stats?.bronze_medals || 0}
</div>

<div style={styles.statLabel}>
Bronze Medals
</div>
</div>


<div style={styles.statCard}>
<div style={styles.statValue}>
⭐ {stats?.championship_points || 0}
</div>

<div style={styles.statLabel}>
Championship Points
</div>


</div>

</div> 

{/* ACHIEVEMENTS + PERSONAL BESTS */}

<div
style={{
    display:'grid',
    gridTemplateColumns:'35% 65%',
    gap:'30px',
    marginTop:'50px',
    width:'100%'
}}
>

{/* ACHIEVEMENTS */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px',
minHeight:'450px'}}
>

<h2
style={{
marginTop:0
}}
>
🏆 Achievements
</h2>

<div
style={{
display:'flex',
flexDirection:'column',
gap:'28px',
marginTop:'25px'
}}
>

{
stats?.achievements?.map((achievement,index)=>(

<div
key={index}
style={styles.badge}
>

{
achievement === "Champion 2026"
? "🏆"
:
achievement === "Record Holder"
? "⚡"
:
"⭐"
}

{" "}
{achievement}

</div>

))
}

</div>

</div>


{/* PERSONAL BESTS */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px',
minHeight:'450px'}}
>

<h2
style={{
marginTop:0
}}
>
⚡ Personal Bests
</h2>

<div
style={{
marginTop:'30px'
}}
>

{
personalBests.map((pb,index)=>(

<div
key={index}
style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    padding:'22px 0',
    borderBottom:'1px solid rgba(255,255,255,.08)'
    }}
>

<div>

<div
style={{
fontWeight:700,
fontSize:'18px'
}}
>
{pb.event}
</div>

<div
style={{
color:'#94a3b8',
fontSize:'14px',
marginTop:'5px'
}}
>
Personal Best
</div>

</div>

<div
style={{
minWidth:'140px',
textAlign:'right',
fontWeight:900,
fontSize:'42px',
color:'#fbbf24',
letterSpacing:'1px'
}}
>
{
pb.time
?.replace(/^0:/,'')
?.replace(/\.?0+$/,'')
}</div>

</div>

))
}

</div>

</div>

</div>

{/* RECENT RESULTS + RECORDS HELD */}

<div
style={{
display:'grid',
gridTemplateColumns:'1fr 1fr',
gap:'30px',
marginTop:'50px'
}}
>

{/* RECENT RESULTS */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px'
}}
>

<h2
style={{
marginTop:0,
fontSize:'42px',
fontWeight:800
}}
>
📈 Recent Results
</h2>

<div style={{
display:'flex',
flexDirection:'column',
gap:'25px',
marginTop:'30px'
}}>

{
recentResults.map((result,index)=>(

<div
key={index}
style={{
padding:'20px',
borderRadius:'18px',

background:
result.medal === 'gold'
? 'rgba(255,215,0,.12)'
:
result.medal === 'silver'
? 'rgba(192,192,192,.12)'
:
'rgba(205,127,50,.12)',

border:'1px solid rgba(255,255,255,.08)'
}}
>

{
result.medal === 'gold' && '🥇'
}

{
result.medal === 'silver' && '🥈'
}

{
result.medal === 'bronze' && '🥉'
}

{' '}
{result.event}

</div>

))
}

</div>

</div>


{/* RECORDS HELD */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px'
}}
>

<h2
style={{
marginTop:0,
fontSize:'42px',
fontWeight:800
}}
>🏆 Records Held
</h2>

<div
style={{
display:'flex',
flexDirection:'column',
gap:'25px',
marginTop:'30px'
}}
>

{
recordsHeld.map((record,index)=>(

<div
key={index}
style={{
padding:'20px',
borderRadius:'18px',
background:'rgba(255,255,255,.05)',
marginBottom:'20px'
}}
>

⚡ {record.event}

</div>

))
}

</div>

</div>

</div>

{/* MEET HISTORY + REGISTERED EVENTS */}

<div
style={{
display:'grid',
gridTemplateColumns:'1fr 1fr',
gap:'30px',
marginTop:'50px'
}}
>

{/* MEET HISTORY */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px'
}}
>

<h2
style={{
marginTop:0,
fontSize:'42px',
fontWeight:800
}}
>📅 Meet History
</h2>

<div
style={{
marginTop:'30px',
display:'flex',
flexDirection:'column',
gap:'20px'
}}
>

{
meetHistory.map((meet,index)=>(

<div
key={index}
style={{
padding:'20px',
borderBottom:'1px solid rgba(255,255,255,.08)'
}}
>

<div
style={{
fontWeight:700
}}
>
🏆 {meet.meet}
</div>

</div>

))
}
</div>

</div>



{/* REGISTERED EVENTS */}

<div
style={{
background:'rgba(255,255,255,.04)',
backdropFilter:'blur(20px)',
border:'1px solid rgba(255,255,255,.08)',
borderRadius:'24px',
padding:'40px'
}}
>

<h2
style={{
marginTop:0,
fontSize:'42px',
fontWeight:800
}}
>
📝 Registered Events
</h2>

<div
style={{
display:'flex',
flexWrap:'wrap',
gap:'20px',
marginTop:'30px'
}}
>

{
registeredEvents.map((event,index)=>(

<div
key={index}
style={{
background:'rgba(14,165,233,.15)',
padding:'18px 24px',
borderRadius:'18px'
}}
>

🏊 {event.event}

</div>

))
}

</div>

</div>

</div>

</div>

</div>
  
  
  );
  
  }
