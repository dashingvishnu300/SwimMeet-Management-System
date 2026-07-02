import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

   const [loading, setLoading] =
    useState(false);

    const [showCurrentPassword,
        setShowCurrentPassword] =
        useState(false);
      
      const [showNewPassword,
        setShowNewPassword] =
        useState(false);
      
      const [showConfirmPassword,
        setShowConfirmPassword] =
        useState(false);
  
    const hasMinLength =
    newPassword.length >= 8;
  
  const hasUpperCase =
    /[A-Z]/.test(newPassword);
  
  const hasLowerCase =
    /[a-z]/.test(newPassword);
  
  const hasNumber =
    /[0-9]/.test(newPassword);
  
  const hasSpecialCharacter =
    /[!@#$%^&*(),.?":{}|<>]/.test(
      newPassword
    );

    let strength = 0;

    if (hasMinLength)
      strength++;
    
    if (hasUpperCase)
      strength++;
    
    if (hasLowerCase)
      strength++;
    
    if (hasNumber)
      strength++;
    
    if (hasSpecialCharacter)
      strength++;

    let strengthLabel = 'Weak';

if (strength >= 2)
  strengthLabel = 'Medium';

if (strength >= 4)
  strengthLabel = 'Strong';

if (strength === 5)
  strengthLabel = 'Very Strong';
  
  const passwordsMatch =
    confirmPassword &&
    newPassword === confirmPassword;

    const handleSubmit = async (e) => {

        e.preventDefault();
      
        setError('');
        setSuccess('');
      
        if (
          newPassword !==
          confirmPassword
        ) {
      
          setError(
            'Passwords do not match'
          );
      
          return;
      
        }
      
        setLoading(true);
      
        try {
      
          await authAPI.changePassword({
      
            current_password:
              currentPassword,
      
            new_password:
              newPassword
      
          });
      
          setSuccess(
            'Password changed successfully'
          );
      
          setTimeout(() => {
      
            const role =
              user.role?.name ||
              user.role;
      
            if (
              role === 'organizer'
            ) {
      
              navigate('/dashboard');
      
            }
      
            else if (
              role === 'swimmer'
            ) {
      
              navigate('/profile');
      
            }
      
            else {
      
              navigate('/meets');
      
            }
      
          }, 1500);
      
        }
      
        catch (err) {
      
          setError(
      
            err.response?.data?.error ||
      
            'Failed to change password'
      
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

borderRadius:30,

padding:'40px',

width:'100%',

maxWidth:900,

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

top:-120,

right:-120,

width:250,

height:250,

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

fontSize:70,

animation:
'pulse 3s infinite',

filter:
'drop-shadow(0 0 20px rgba(14,165,233,.7))',

marginBottom:15

}}

>

🔒

</div>

<h1

style={{

fontSize:36,

fontWeight:900,

background:
'linear-gradient(135deg,#0EA5E9,#38BDF8)',

WebkitBackgroundClip:
'text',

WebkitTextFillColor:
'transparent',

marginBottom:10

}}

>

Change Password

</h1>

<p

style={{

color:'#94A3B8',
fontSize:14

}}

>
Secure your SwimMeet account

</p>

<p

style={{

color:'#94A3B8',

fontSize:15,

marginTop:15,

lineHeight:1.8

}}

>

Create a secure password to protect your account and keep your swimming data safe.

</p>

</div>

<div

style={{

background:
'rgba(245,158,11,.1)',

border:
'1px solid rgba(245,158,11,.3)',

borderRadius:18,

boxShadow:
'0 10px 30px rgba(245,158,11,.15)',

padding:22,

marginBottom:30

}}

>

<div

style={{

display:'flex',

gap:15,

alignItems:'center'

}}

>

<div

style={{

fontSize:32

}}

>

⚠️

</div>

<div

style={{



}}

>

<h3

style={{

marginBottom:10,

color:'#F59E0B'

}}

>

Temporary Password Detected

</h3>

<p

style={{

color:'#CBD5E1',

fontSize:14,

lineHeight:1.8

}}

>

For security reasons, your temporary password must be replaced before accessing the SwimMeet platform.

</p>

</div>

</div>

</div>

        {
  error && (

    <div
      style={{
        background: 'rgba(239,68,68,0.1)',
        boxShadow:'0 0 25px rgba(239,68,68,.2)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        color: '#EF4444'
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
        background: 'rgba(34,197,94,0.1)',
        boxShadow:'0 0 25px rgba(34,197,94,.2)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        color: '#22C55E',
        fontSize: 14,
        fontWeight: 600
      }}
    >

      ✅ {success}

    </div>

  )
}


<div

style={{

background:
'rgba(255,255,255,0.03)',

border:
'1px solid rgba(255,255,255,0.05)',

borderRadius: 20,

padding: 20,

marginBottom: 25

}}

>

<h3
style={{
    color:'#E2E8F0',

    fontSize:20,
    
    fontWeight:700,
    
    letterSpacing:.5
}}
>

Password Strength

</h3>

<div

style={{

height:10,

background:
'rgba(255,255,255,0.06)',

borderRadius:50,

overflow:'hidden',

marginTop:15

}}

>

<div

style={{

width:`${strength*20}%`,

height:'100%',

background:

strength <=1

?

'#EF4444'

:

strength <=3

?

'#F59E0B'

:

'#22C55E',

transition:
'width .6s ease, background .3s ease',

boxShadow:

strength <=1

?

'0 0 15px rgba(239,68,68,.7)'

:

strength <=3

?

'0 0 15px rgba(245,158,11,.7)'

:

'0 0 20px rgba(34,197,94,.8)'

}}

>

</div>

</div>

<p

style={{

marginTop:15,

color:'#94A3B8'

}}

>

Strength:

<strong

style={{

color:

strength <=1

?

'#EF4444'

:

strength <=3

?

'#F59E0B'

:

'#22C55E'

}}

>

{' '}

{strengthLabel}

</strong>

</p>

</div>

<div

style={{

background:
'rgba(255,255,255,0.03)',

border:
'1px solid rgba(255,255,255,0.05)',

borderRadius:24,

padding:20,

marginBottom:25

}}

>

<h3
style={{
    color:'#E2E8F0',

    fontSize:20,
    
    fontWeight:700,
    
    letterSpacing:.5
}}
>

Password Requirements

</h3>

<div

style={{

display:'grid',

gap:12,

marginTop:20

}}

>

<div

style={{

background:

hasMinLength

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

border:

hasMinLength

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:14,

padding:15,

transition:
'all .35s ease',

cursor:'default'

}}

>

{

hasMinLength

?

'✅'

:

'❌'

}

 Minimum 8 characters

</div>

<div

style={{

background:

hasUpperCase

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

border:

hasUpperCase

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:14,

padding:15,
transition:
'all .35s ease',

cursor:'default'

}}

>

{

hasUpperCase

?

'✅'

:

'❌'

}

 Uppercase Letter

</div>

<div

style={{

background:

hasLowerCase

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

border:

hasLowerCase

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:14,

padding:15,
transition:
'all .35s ease',

cursor:'default'

}}

>

{

hasLowerCase

?

'✅'

:

'❌'

}

 Lowercase Letter

</div>

<div

style={{

background:

hasNumber

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

border:

hasNumber

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:14,

padding:15,
transition:
'all .35s ease',

cursor:'default'
}}

>

{

hasNumber

?

'✅'

:

'❌'

}

 Number

</div>

<div

style={{

background:

hasSpecialCharacter

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

border:

hasSpecialCharacter

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:14,

padding:15,
transition:
'all .35s ease',

cursor:'default'
}}

>

{

hasSpecialCharacter

?

'✅'

:

'❌'

}

 Special Character

</div>

</div>
</div>

      <form
        onSubmit={handleSubmit}
      >

<div
style={{
marginBottom: 25
}}
>

<label

style={{

display: 'block',

color: '#94A3B8',

fontSize: 13,

fontWeight: 600,

marginBottom: 10,

letterSpacing: .5

}}

>

CURRENT PASSWORD

</label>

<input

type={
    showCurrentPassword
    ?
    'text'
    :
    'password'
    }

value={
currentPassword
}


onChange={
e =>
setCurrentPassword(
e.target.value
)
}

required

placeholder="Enter current password"

style={{

width:'100%',

background:
'rgba(255,255,255,0.05)',

boxShadow:
'inset 0 0 15px rgba(255,255,255,.03)',

border:
'1px solid rgba(14,165,233,.15)',

borderRadius: 14,

padding:'15px 18px',

color:'#fff',

fontSize:14,

outline:'none',

transition:
'width .6s ease, background .3s ease',

boxShadow:

strength <=1

?

'0 0 15px rgba(239,68,68,.7)'

:

strength <=3

?

'0 0 15px rgba(245,158,11,.7)'

:

'0 0 20px rgba(34,197,94,.8)'

}}

onFocus={
e =>
e.target.style.border =
'1px solid rgba(14,165,233,.7)'
}

onBlur={
e =>
e.target.style.border =
'1px solid rgba(14,165,233,.2)'
}

/>

<div

style={{

marginTop:10,

display:'flex',

justifyContent:'flex-end'

}}

>

<button

type="button"

onClick={()=>

setShowCurrentPassword(

!showCurrentPassword

)

}

style={{

background:'transparent',

border:'none',

color:'#0EA5E9',

cursor:'pointer',

fontSize:13,

fontWeight:600

}}

>

{

showCurrentPassword

?

'🙈 Hide Password'

:

'👁 Show Password'

}

</button>

</div>

</div>

        <br />

        <div
style={{
    marginBottom:30
}}
>

<label

style={{

display:'block',

color:'#94A3B8',

fontSize:13,

fontWeight:600,

marginBottom:10,

letterSpacing:.5

}}

>

NEW PASSWORD

</label>

<input

type={
    showNewPassword
    ?
    'text'
    :
    'password'
    }
value={
newPassword
}

onChange={
e =>
setNewPassword(
e.target.value
)
}

required

placeholder="Create new password"

style={{

width:'100%',

background:
'rgba(255,255,255,0.05)',

boxShadow:
'inset 0 0 15px rgba(255,255,255,.03)',

border:
'1px solid rgba(14,165,233,.15)',

borderRadius:14,

padding:'15px 18px',

color:'#fff',

fontSize:14,

outline:'none',

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
'1px solid rgba(14,165,233,.2)'
}

/>
<div

style={{

marginTop:10,

display:'flex',

justifyContent:'flex-end'

}}

>

<button

type="button"

onClick={()=>

setShowNewPassword(

!showNewPassword

)

}

style={{

background:'transparent',

border:'none',

color:'#0EA5E9',

cursor:'pointer',

fontSize:13,

fontWeight:600

}}

>

{

showNewPassword

?

'🙈 Hide Password'

:

'👁 Show Password'

}

</button>

</div>

</div>

        <br />

        <div
style={{
    marginBottom:30
}}
>

<label

style={{

display:'block',

color:'#94A3B8',

fontSize:13,

fontWeight:600,

marginBottom:10,

letterSpacing:.5

}}

>

CONFIRM PASSWORD

</label>

<input

type={
    showConfirmPassword
    
    ?
    
    'text'
    
    :
    
    'password'
    }

value={
confirmPassword
}

onChange={
e =>
setConfirmPassword(
e.target.value
)
}

required

placeholder="Confirm password"

style={{

width:'100%',

background:
'rgba(255,255,255,0.05)',

boxShadow:
'inset 0 0 15px rgba(255,255,255,.03)',

border:
'1px solid rgba(14,165,233,.15)',

borderRadius:14,

padding:'15px 18px',

color:'#fff',

fontSize:14,

outline:'none',

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
'1px solid rgba(14,165,233,.2)'
}

/>
<div

style={{

marginTop:10,

display:'flex',

justifyContent:'flex-end'

}}

>

<button

type="button"

onClick={()=>

setShowConfirmPassword(

!showConfirmPassword

)

}

style={{

background:'transparent',

border:'none',

color:'#0EA5E9',

cursor:'pointer',

fontSize:13,

fontWeight:600

}}

>

{

showConfirmPassword

?

'🙈 Hide Password'

:

'👁 Show Password'

}

</button>

</div>

</div>

        <br />

        <div

style={{

background:

passwordsMatch

?

'rgba(34,197,94,.1)'

:

'rgba(239,68,68,.1)',

boxShadow:

passwordsMatch

?

'0 0 25px rgba(34,197,94,.15)'

:

'0 0 25px rgba(239,68,68,.15)',

border:

passwordsMatch

?

'1px solid rgba(34,197,94,.3)'

:

'1px solid rgba(239,68,68,.3)',

borderRadius:16,

padding:18,

marginBottom:30

}}

>

<p

style={{

margin:0,

fontSize:14,

fontWeight:600,

color:

passwordsMatch

?

'#22C55E'

:

'#EF4444'

}}

>

{

passwordsMatch

?

'✅ Passwords Match'

:

'⚠ Passwords Do Not Match'

}

</p>

</div>

<div

style={{

display:'grid',

gap:15,

marginBottom:30

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

padding:20,

boxShadow:
'0 8px 30px rgba(0,0,0,.35)',

transition:
'all .35s ease',

cursor:'default'

}}

>

<h4
style={{
color:'#E2E8F0',
fontSize:18,

fontWeight:700
}}
>

🔒 Never Share Passwords

</h4>

<p
style={{
color:'#94A3B8',
fontSize:15,
lineHeight:1.7
}}
>

Protect your account credentials and never share them with anyone.

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

padding:20,

boxShadow:
'0 8px 30px rgba(0,0,0,.35)',

transition:
'all .35s ease',

cursor:'default'

}}

>

<h4

style={{

color:'#E2E8F0',
fontSize:18,

fontWeight:700

}}

>

⚡ Update Temporary Passwords

</h4>

<p

style={{

color:'#94A3B8',

fontSize:15,

lineHeight:1.7

}}

>

Temporary passwords are designed only for initial access. Update them immediately to strengthen your account security and prevent unauthorized access.

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

padding:20,

boxShadow:
'0 8px 30px rgba(0,0,0,.35)',

transition:
'all .35s ease',

cursor:'default'

}}

>

<h4

style={{

color:'#E2E8F0',
fontSize:18,

fontWeight:700

}}

>

🛡 Password Best Practices

</h4>

<p

style={{

color:'#94A3B8',

fontSize:15,

lineHeight:1.7

}}

>

Use a combination of uppercase letters, lowercase letters, numbers, and special characters. Avoid predictable passwords and never reuse passwords across multiple platforms.

</p>

</div>

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

borderRadius:16,

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

letterSpacing:.5,

transform:
loading

?

'none'

:

'scale(1)'

}}

>

{

loading

?

'⏳ Updating Password...'

:

'🔐 Update Password'

}

</button>
<div

style={{

marginTop:40,

paddingTop:25,

borderTop:
'1px solid rgba(255,255,255,.08)',

textAlign:'center'

}}

>

<p

style={{

color:'#94A3B8',

fontSize:14,

lineHeight:1.8

}}

>

🏊 SwimMeet Management Platform

<br/>

Secure Authentication System

<br/>

Built for Organizers, Coaches and Swimmers

</p>

</div>

      </form>

    </div>

    </div>

  );

};

export default ChangePassword;