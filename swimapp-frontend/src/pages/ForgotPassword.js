import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {

const [email, setEmail] =
  useState('');

const [loading, setLoading] =
  useState(false);

const [error, setError] =
  useState('');

const [success, setSuccess] =
  useState('');

const handleSubmit = async (e) => {

  e.preventDefault();

  setError('');
  setSuccess('');

  setLoading(true);

  try {

    await authAPI.forgotPassword({

      email

    });

    setSuccess(

      'Password reset link has been sent successfully.'

    );

  }

  catch (err) {

    setError(

      err.response?.data?.error ||

      'Unable to send reset email.'

    );

  }

  finally {

    setLoading(false);

  }

};
return (

    <div
    
    style={{
    
    minHeight:'100vh',
    
    display:'flex',
    
    alignItems:'center',
    
    justifyContent:'center',
    
    background:
    'linear-gradient(135deg,#0A1628 0%,#0F2347 50%,#0A1628 100%)',
    
    padding:24,
    
    overflow:'hidden',
    
    position:'relative'
    
    }}
    
    >
    
    <div
    
    style={{
    
    position:'fixed',
    
    top:'10%',
    
    left:'8%',
    
    width:450,
    
    height:450,
    
    background:
    'radial-gradient(circle, rgba(14,165,233,.08) 0%, transparent 70%)',
    
    pointerEvents:'none'
    
    }}
    
    >
    
    </div>
    
    <div
    
    style={{
    
    position:'fixed',
    
    bottom:'10%',
    
    right:'8%',
    
    width:350,
    
    height:350,
    
    background:
    'radial-gradient(circle, rgba(56,189,248,.06) 0%, transparent 70%)',
    
    pointerEvents:'none'
    
    }}
    
    >
    
    </div>
    
    <div
    
    style={{
    
    background:
    'rgba(255,255,255,.03)',
    
    backdropFilter:
    'blur(20px)',
    
    border:
    '1px solid rgba(14,165,233,.15)',
    
    borderRadius:32,
    
    padding:'50px',
    
    width:'100%',
    
    maxWidth:800,
    
    boxShadow:
    '0 30px 80px rgba(0,0,0,.45)',
    
    position:'relative',
    
    overflow:'hidden',

    zIndex:1
    
    }}
    
    >
    
    <div
    
    style={{
    
    position:'absolute',
    
    top:-100,
    
    right:-100,
    
    width:220,
    
    height:220,
    
    borderRadius:'50%',
    
    background:
    'radial-gradient(circle, rgba(14,165,233,.15), transparent)',
    
    pointerEvents:'none'
    
    }}
    
    >
    
    </div>
    <div

style={{

position:'absolute',

bottom:-100,

left:-100,

width:220,

height:220,

borderRadius:'50%',

background:
'radial-gradient(circle, rgba(56,189,248,.12), transparent)',

pointerEvents:'none'

}}

>

</div>
    
    <div
    
    style={{
    
    textAlign:'center',
    
    marginBottom:40
    
    }}
    
    >
    
    <div
    
    style={{
    
    fontSize:72,
    
    marginBottom:20,

    animation:
'pulse 3s infinite',


   filter:
    'drop-shadow(0 0 20px rgba(14,165,233,.7))'
    
    }}
    
    >
    
    📧
    
    </div>
    
    <h1
    
    style={{
    
    fontSize:38,
    
    fontWeight:900,
    
    background:
    'linear-gradient(135deg,#0EA5E9,#38BDF8)',
    
    WebkitBackgroundClip:
    'text',
    
    WebkitTextFillColor:
    'transparent',
    
    marginBottom:15
    
    }}
    
    >
    
    Forgot Password
    
    </h1>
    
    <p
    
    style={{
    
    color:'#94A3B8',
    
    fontSize:15,
    
    lineHeight:1.8
    
    }}
    
    >
    
    Recover access to your SwimMeet account.
    
    We'll send a secure password reset link to your registered email address.
    
    </p>
    
    </div>
    <div

style={{

background:
'rgba(14,165,233,.08)',

border:
'1px solid rgba(14,165,233,.15)',

boxShadow:
'0 10px 30px rgba(14,165,233,.12)',

borderRadius:20,

padding:20,

marginBottom:30

}}

>

<div

style={{

display:'flex',

gap:18,

alignItems:'center'

}}

>

<div

style={{

fontSize:36

}}

>

💡

</div>

<div>

<h3

style={{

color:'#E2E8F0',

marginBottom:10

}}

>

Password Recovery Guide

</h3>

<p

style={{

color:'#CBD5E1',

fontSize:14,

lineHeight:1.8

}}

>

Enter the email address associated with your SwimMeet account. We'll send a secure password reset link to help you regain access.

</p>

</div>

</div>

</div>

    {
error && (

<div

style={{

background:
'rgba(239,68,68,.1)',

border:
'1px solid rgba(239,68,68,.3)',

borderRadius:18,

padding:18,

marginBottom:20,

color:'#EF4444',

boxShadow:
'0 0 25px rgba(239,68,68,.15)'

}}

>

❌ {error}

</div>

)
}

{
success && (

<div

style={{

background:
'rgba(34,197,94,.1)',

border:
'1px solid rgba(34,197,94,.3)',

borderRadius:18,

padding:18,

marginBottom:20,

color:'#22C55E',

fontWeight:600,

boxShadow:
'0 0 25px rgba(34,197,94,.15)'

}}

>

✅ {success}

</div>

)
}
<form

onSubmit={handleSubmit}

style={{

position:'relative',

zIndex:2

}}

>

<div

style={{

marginBottom:30,


}}

>

<label

style={{

display:'block',

color:'#94A3B8',

fontSize:13,

fontWeight:700,

letterSpacing:.5,

marginBottom:12

}}

>

EMAIL ADDRESS

</label>

<input

type="email"

value={email}

onChange={
e =>
setEmail(
e.target.value
)
}

required

placeholder="Enter your registered email address"

style={{

width:'100%',

background:
'rgba(255,255,255,.05)',

border:
'1px solid rgba(14,165,233,.15)',

borderRadius:16,

padding:'18px 20px',

color:'#fff',

fontSize:15,

outline:'none',

boxShadow:
'inset 0 0 15px rgba(255,255,255,.03)',

transition:
'all .3s ease'

}}

onFocus={
e =>
e.target.style.border =
'1px solid rgba(14,165,233,.7)'
}

onBlur={
e =>
e.target.style.border =
'1px solid rgba(14,165,233,.15)'
}

/>

</div>

<button

type="submit"

disabled={loading}

style={{

width:'100%',

background:

loading

?

'rgba(14,165,233,.5)'

:

'linear-gradient(135deg,#0EA5E9,#0284C7)',

border:'none',

borderRadius:18,

padding:'18px',

fontSize:16,

fontWeight:700,

color:'#fff',

cursor:

loading

?

'not-allowed'

:

'pointer',

boxShadow:
'0 10px 35px rgba(14,165,233,.4)',

transition:
'all .35s ease',

letterSpacing:.5

}}

>

{

loading

?

'⏳ Sending Reset Link...'

:

'📨 Send Reset Link'

}

</button>
<p

style={{

textAlign:'center',

color:'#64748B',

fontSize:13,

marginTop:15,

lineHeight:1.8

}}

>

We'll send a secure reset link to your email address.

</p>
<div

style={{

display:'grid',

gap:18,

marginTop:35,

marginBottom:35

}}

>

<div

style={{

background:
'rgba(255,255,255,.03)',

backdropFilter:
'blur(20px)',

border:
'1px solid rgba(14,165,233,.1)',

borderRadius:24,

padding:22,

boxShadow:
'0 20px 50px rgba(0,0,0,.4)',

transition:
'all .35s ease'

}}

>

<h4

style={{

color:'#E2E8F0',

fontSize:18,

fontWeight:700,

marginBottom:12

}}

>

🔐 Secure Email Verification

</h4>

<p

style={{

color:'#94A3B8',

fontSize:14,

lineHeight:1.8

}}

>

A password reset link will only be sent to your registered email address to ensure account security.

</p>

</div>

<div

style={{

background:
'rgba(255,255,255,.03)',

backdropFilter:
'blur(20px)',

border:
'1px solid rgba(14,165,233,.1)',

borderRadius:24,

padding:22,

boxShadow:
'0 20px 50px rgba(0,0,0,.4)',

transition:
'all .35s ease'

}}

>

<h4

style={{

color:'#E2E8F0',

fontSize:18,

fontWeight:700,

marginBottom:12

}}

>

📩 Email Delivery Information

</h4>

<p

style={{

color:'#94A3B8',

fontSize:14,

lineHeight:1.8

}}

>

Please check your Inbox and Spam folder. Email delivery may take a few minutes depending upon your email provider.

</p>

</div>

<div

style={{

background:
'rgba(255,255,255,.03)',

backdropFilter:
'blur(20px)',

border:
'1px solid rgba(14,165,233,.1)',

borderRadius:24,

padding:22,

boxShadow:
'0 20px 50px rgba(0,0,0,.4)',

transition:
'all .35s ease'

}}

>

<h4

style={{

color:'#E2E8F0',

fontSize:18,

fontWeight:700,

marginBottom:12

}}

>

⏱ Reset Link Expiry

</h4>

<p

style={{

color:'#94A3B8',

fontSize:14,

lineHeight:1.8

}}

>

Password reset links expire automatically for security reasons. Use the latest email if multiple reset requests are made.

</p>

</div>

</div>
<div

style={{

background:
'rgba(245,158,11,.08)',

border:
'1px solid rgba(245,158,11,.2)',

transition:
'all .35s ease',

borderRadius:28,

padding:25,

marginBottom:35,

boxShadow:
'0 10px 30px rgba(245,158,11,.1)'

}}

>

<h3

style={{

color:'#F59E0B',

marginBottom:15

}}

>

⚠ Important Information

</h3>

<p

style={{

color:'#CBD5E1',

fontSize:14,

lineHeight:1.9

}}

>

• Reset links are time-sensitive.

<br /><br />

• Use the latest email if multiple reset requests are made.

<br /><br />

• Never share reset links with anyone.

<br /><br />

• Contact your organizer if login issues continue.

</p>

</div>

<div

style={{

textAlign:'center',

marginBottom:35

}}

>

<p

style={{

color:'#94A3B8',

fontSize:15,

marginBottom:15

}}

>

Remember your password?

</p>

<Link

to="/login"

style={{

color:'#38BDF8',

fontWeight:700,

fontSize:15,

textDecoration:'none',

transition:
'all .3s ease'

}}

>

← Back to Login

</Link>

</div>

<div

style={{

borderTop:
'1px solid rgba(255,255,255,.08)',

paddingTop:30,

textAlign:'center'

}}

>

<p

style={{

color:'#94A3B8',

fontSize:14,

lineHeight:2,

letterSpacing:.3

}}

>

🏊 SwimMeet Management Platform

<br />

Secure Authentication System

<br />

Built for Organizers, Coaches and Swimmers

<br />

© 2026 SwimMeet. All Rights Reserved.
</p>

</div>
</form>

</div>

</div>

);

};

export default ForgotPassword;
