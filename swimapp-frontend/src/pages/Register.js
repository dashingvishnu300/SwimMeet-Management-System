import React, {
  useState,
  useEffect
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  authAPI,
  mastersAPI
} from '../services/api';


const Register = () => {
  const [formData, setFormData] = useState({

    role_name: 'swimmer',
  
    first_name: '',
    middle_name: '',
    last_name: '',
  
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
  
    address_line1: '',
    address_line2: '',
  
    city: '',
    postal_code: '',
  
    state_master: '',
    district_master: '',
    association: '',
  
    coach_level: 'district',
  
    organizer_level: 'district',
  
    contact_information: '',

    association_name: '',
    
    association_type: '',
  
    organizer_document: null
  
  });
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
const [associations, setAssociations] = useState([]);
const [stateAssociations, setStateAssociations] = useState([]);
  const [loading, setLoading] = useState(false);
const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchStates = async () => {
  
      try {
  
        const res =
          await mastersAPI.states();
  
        setStates(
          res.data
        );
  
      }
  
      catch (err) {
  
        console.log(err);
  
      }
  
    };
  
    fetchStates();
  
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      organizer_document: e.target.files[0]
    });
  };
  const handleStateChange = async (e) => {

    handleChange(e);
  
    setDistricts([]);
    setAssociations([]);
  
    setFormData(prev => ({
  
      ...prev,
  
      district_master: '',
      association: ''
  
    }));
  
    try {
  
      const res =
        await mastersAPI.districts(
          e.target.value
        );
  
      setDistricts(
        res.data
      );
  
    }
  
    catch (err) {
  
      console.log(err);
  
    }
  
  };
  
  
  const handleDistrictChange = async (e) => {

    handleChange(e);

setAssociations([]);

setFormData(prev => ({

  ...prev,

  association: ''

}));

try {

  const res =
    await mastersAPI.associations(
      e.target.value
    );

  setAssociations(
    res.data
  );

}

catch (err) {

  console.log(err);

}
};

const handleStateAssociationChange = async (e) => {

  handleChange(e);

  setFormData(prev => ({

    ...prev,

    association: ''

  }));

  try {

    const res =
      await mastersAPI.stateAssociations(
        e.target.value
      );

    setStateAssociations(
      res.data
    );

  }

  catch (err) {

    console.log(err);

  }

};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    setLoading(true);
    try {
      const data = new FormData();

Object.entries(formData).forEach(
  ([key, value]) => {

    if (
      value !== '' &&
      value !== null
    ) {

      data.append(
        key,
        value
      );

    }

  }
);

const res = await authAPI.register(data);

if (formData.role_name === 'organizer') {

  alert(
`Registration submitted successfully.

Your organizer account is under administrator review.

You will receive an email once your application has been approved or rejected.`
  );

}
else {

  alert(
    'User registered successfully.'
  );

}

navigate('/login');
    } catch (err) {
      console.log(err.response.data);

setError(
  JSON.stringify(err.response.data)
);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
    letterSpacing: 0.5,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A1628 0%, #0F2347 50%, #0A1628 100%)',
      padding: 24,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(14, 165, 233, 0.15)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏊</div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            Create Account
          </h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>
            Join SwimMeet Management Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#EF4444',
            fontSize: 13,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>I AM A</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['swimmer', 'coach','organizer'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role_name: role })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: formData.role_name === role
                      ? '2px solid #0EA5E9'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: formData.role_name === role
                      ? 'rgba(14, 165, 233, 0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: formData.role_name === role ? '#0EA5E9' : '#94A3B8',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {
role === 'swimmer'
? '🏊 Swimmer'
: role === 'coach'
? '🏋️ Coach'
: '🏛 Organizer'
}
                </button>
              ))}
            </div>
          </div>

          {/* First Name */}
          <div style={{ marginBottom: 16 }}>
  <label style={labelStyle}>
    FIRST NAME
  </label>

  <input
    name="first_name"
    value={formData.first_name}
    onChange={handleChange}
    style={inputStyle}
  />
</div>

<div style={{ marginBottom: 16 }}>
  <label style={labelStyle}>
    MIDDLE NAME
  </label>

  <input
    name="middle_name"
    value={formData.middle_name}
    onChange={handleChange}
    style={inputStyle}
  />
</div>

<div style={{ marginBottom: 16 }}>
  <label style={labelStyle}>
    LAST NAME
  </label>

  <input
    name="last_name"
    value={formData.last_name}
    onChange={handleChange}
    style={inputStyle}
  />
</div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              style={inputStyle}
              onFocus={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.2)'}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>PHONE NUMBER</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+91 9999999999"
              style={inputStyle}
              onFocus={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(14, 165, 233, 0.2)'}
            />
          </div>

          {
  formData.role_name === 'swimmer' && (
    <>

    <div style={{ marginBottom: 16 }}>

      <label style={labelStyle}>
        DATE OF BIRTH
      </label>

      <input
        type="date"
        name="date_of_birth"
        value={formData.date_of_birth}
        onChange={handleChange}
        style={{
          ...inputStyle,
          colorScheme: 'dark'
        }}
        onFocus={e =>
          e.target.style.border =
          '1px solid rgba(14, 165, 233, 0.6)'
        }
        onBlur={e =>
          e.target.style.border =
          '1px solid rgba(14, 165, 233, 0.2)'
        }
      />

    </div>

    <div style={{ marginBottom: 16 }}>

  <label style={labelStyle}>
    GENDER
  </label>

  <select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    style={inputStyle}
  >

    <option value="">
      Select Gender
    </option>

    <option value="MALE">
      Male
    </option>

    <option value="FEMALE">
      Female
    </option>

  </select>

</div>
    {/* State */}

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE
</label>

<select
name="state_master"
value={formData.state_master}
onChange={handleStateChange}
style={inputStyle}
>

<option value="">
Select State
</option>

{
states.map(
state => (

<option
key={state.id}
value={state.id}
>

{state.state_name}

</option>

)
)
}


</select>

</div>
<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT
</label>

<select
name="district_master"
value={formData.district_master}
onChange={handleDistrictChange}
style={inputStyle}
disabled={!formData.state_master}
>

<option value="">
Select District
</option>

{
districts.map(
district => (

<option
key={district.id}
value={district.id}
>

{district.district_name}

</option>

)
)
}

</select>

</div>

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT ASSOCIATION
</label>

<select
name="association"
value={formData.association}
onChange={handleChange}
style={inputStyle}
disabled={!formData.district_master}
>

<option value="">
Select Association
</option>

{
associations.map(
association => (

<option
key={association.id}
value={association.id}
>

{association.association_name}

</option>

)
)
}

</select>

</div>

</>

  )
}

{
formData.role_name === 'coach' && (

<>

<div style={{ marginBottom: 20 }}>

<label style={labelStyle}>
COACH LEVEL
</label>

<div style={{ display:'flex', gap:10 }}>

{
['district','state','national'].map(level => (

<button
key={level}
type="button"
onClick={() =>
setFormData({
...formData,
coach_level: level
})
}
style={{
flex:1,
padding:'10px',
borderRadius:10,

border:
formData.coach_level===level
? '2px solid #0EA5E9'
: '1px solid rgba(255,255,255,0.1)',

background:
formData.coach_level===level
? 'rgba(14,165,233,0.15)'
: 'rgba(255,255,255,0.03)',

color:
formData.coach_level===level
? '#0EA5E9'
: '#94A3B8',

cursor:'pointer'
}}
>

{
level === 'district'
? '🏛 District'

: level === 'state'
? '🌎 State'

: '🇮🇳 National'
}

</button>

))
}

</div>

{
formData.coach_level === 'district' && (

<>

{/* STATE */}

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE
</label>

<select
name="state_master"
value={formData.state_master}
onChange={handleStateChange}
style={inputStyle}
>

<option value="">
Select State
</option>

{
states.map(state => (

<option
key={state.id}
value={state.id}
>

{state.state_name}

</option>

))
}

</select>

</div>
<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT
</label>

<select
name="district_master"
value={formData.district_master}
onChange={handleDistrictChange}
style={inputStyle}
disabled={!formData.state_master}
>

<option value="">
Select District
</option>

{
districts.map(
district => (

<option
key={district.id}
value={district.id}
>

{district.district_name}

</option>

)
)
}

</select>

</div>
<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT ASSOCIATION
</label>

<select
name="association"
value={formData.association}
onChange={handleChange}
style={inputStyle}
disabled={!formData.district_master}
>

<option value="">
Select Association
</option>

{
associations.map(
association => (

<option
key={association.id}
value={association.id}
>

{association.association_name}

</option>

)
)
}

</select>

</div>


</>

)
}
{
formData.coach_level === 'state' && (

<>

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE
</label>

<select
name="state_master"
value={formData.state_master}
onChange={handleStateAssociationChange}
style={inputStyle}
>

<option value="">
Select State
</option>

{
states.map(
state => (

<option
key={state.id}
value={state.id}
>

{state.state_name}

</option>

)
)
}

</select>

</div>



<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE ASSOCIATION
</label>

<select
name="association"
value={formData.association}
onChange={handleChange}
style={inputStyle}
>

<option value="">
Select State Association
</option>

{
stateAssociations.map(
association => (

<option
key={association.id}
value={association.id}
>

{association.association_name}

</option>

)
)
}

</select>

</div>

</>

)

}
{
formData.coach_level === 'national' && (

<div
style={{
padding:16,
borderRadius:12,
background:'rgba(14,165,233,0.1)',
marginBottom:16,
color:'#0EA5E9',
fontWeight:600
}}
>

🇮🇳 Swimming Federation of India

</div>

)

}
</div>

</>

)

}
           {
formData.role_name === 'organizer' && (
  <>
  <div style={{ marginBottom: 20 }}>

<label style={labelStyle}>
ORGANIZER LEVEL
</label>

<div style={{ display: 'flex', gap: 10 }}>

{
['district','state','national'].map(level => (

<button
key={level}
type="button"
onClick={() =>
  setFormData({
    ...formData,
    organizer_level: level,
    association_type: level
    })
}
style={{
flex: 1,
padding: '10px',
borderRadius: 10,
border:
formData.organizer_level === level
? '2px solid #0EA5E9'
: '1px solid rgba(255,255,255,0.1)',

background:
formData.organizer_level === level
? 'rgba(14,165,233,0.15)'
: 'rgba(255,255,255,0.03)',

color:
formData.organizer_level === level
? '#0EA5E9'
: '#94A3B8',

cursor: 'pointer'
}}
>

{
level === 'district'
? '🏛 District'

: level === 'state'
? '🌎 State'

: '🇮🇳 National'
}

</button>

))
}

</div>

</div>


<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE
</label>

<select
name="state_master"
value={formData.state_master}
onChange={
formData.organizer_level === 'state'
? handleStateAssociationChange
: handleStateChange
}
style={inputStyle}
>

<option value="">
Select State
</option>

{
states.map(
state => (

<option
key={state.id}
value={state.id}
>

{state.state_name}

</option>

)
)
}

</select>

</div>

{
formData.organizer_level === 'state' && (

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
STATE ASSOCIATION
</label>

<select
name="association"
value={formData.association}
onChange={handleChange}
style={inputStyle}
>

<option value="">
Select State Association
</option>

{
stateAssociations.map(
association => (

<option
key={association.id}
value={association.id}
>

{association.association_name}

</option>

)
)
}

</select>

</div>


)
}


{
  formData.organizer_level === 'national' && (
  
  <div style={{
  padding: 16,
  borderRadius: 12,
  background: 'rgba(14,165,233,0.1)',
  marginBottom: 16,
  color: '#0EA5E9',
  fontWeight: 600
  }}
  >
  
  🇮🇳 Swimming Federation of India
  
  </div>
  
  )
  }

{
formData.organizer_level === 'district' && (

<>

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT
</label>

<select
name="district_master"
value={formData.district_master}
onChange={handleDistrictChange}
style={inputStyle}
disabled={!formData.state_master}
>

<option value="">
Select District
</option>

{
districts.map(
district => (

<option
key={district.id}
value={district.id}
>

{district.district_name}

</option>

)
)
}

</select>

</div>


<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
DISTRICT ASSOCIATION
</label>

<select
name="association"
value={formData.association}
onChange={handleChange}
style={inputStyle}
disabled={!formData.district_master}
>

<option value="">
Select Association
</option>

{
associations.map(
association => (

<option
key={association.id}
value={association.id}
>

{association.association_name}

</option>

)
)
}

</select>

</div>

</>

)
}

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
ASSOCIATION NAME
</label>

<input
name="association_name"
value={formData.association_name}
onChange={handleChange}
style={inputStyle}
/>

</div>

<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
ASSOCIATION TYPE
</label>

<select
name="association_type"
value={formData.association_type}
onChange={handleChange}
style={inputStyle}
>

<option value="">
Select Type
</option>

<option value="district">
District
</option>

<option value="state">
State
</option>

<option value="national">
National
</option>

</select>

</div>
<div style={{ marginBottom: 16 }}>

<label style={labelStyle}>
CONTACT INFORMATION
</label>

<input
name="contact_information"
value={formData.contact_information}
onChange={handleChange}
style={inputStyle}
/>

</div>

<div style={{ marginBottom: 20 }}>

<label style={labelStyle}>
UPLOAD DOCUMENT (PDF)
</label>

<input
type="file"
accept=".pdf"
onChange={handleFileChange}
style={{
color: '#94A3B8'
}}
/>

</div>


</>

)

}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? 'rgba(14, 165, 233, 0.5)'
                : 'linear-gradient(135deg, #0EA5E9, #0284C7)',
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
            }}
          >
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ color: '#64748B', fontSize: 13 }}>
            Already have an account?{' '}
          </span>
          <Link to="/login" style={{
            color: '#0EA5E9',
            fontSize: 13,
            fontWeight: 600,
          }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;