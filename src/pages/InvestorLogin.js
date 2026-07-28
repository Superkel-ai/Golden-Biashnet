import React, { useState } from "react";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  TrendingUp,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

const BG = "#000";
const CARD = "#111";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUB = "#aaa";
const BORDER = "#222";

export default function InvestorLogin() {

  const navigate = useNavigate();

  const [isSignup, setIsSignup] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const formatPhone = (phone) => {

    let cleaned =
      phone.replace(/\D/g, "");

    if (
      cleaned.startsWith("07") &&
      cleaned.length === 10
    ) {
      return "254" + cleaned.slice(1);
    }

    if (
      cleaned.startsWith("01") &&
      cleaned.length === 10
    ) {
      return "254" + cleaned.slice(1);
    }

    if (
      cleaned.startsWith("254") &&
      cleaned.length === 12
    ) {
      return cleaned;
    }

    return null;
  };

// ================= SIGN UP =================

const handleSignup = async () => {

  setError("");
  setSuccess("");

  if (
    !form.name ||
    !form.phone ||
    !form.email ||
    !form.password
  ) {
    setError("Please fill all fields.");
    return;
  }

  const formattedPhone =
    formatPhone(form.phone);

  if (!formattedPhone) {
    setError("Enter a valid phone number.");
    return;
  }

  if (form.password.length < 6) {
    setError(
      "Password must be at least 6 characters."
    );
    return;
  }

  try {

    setLoading(true);

    // Create Firebase Auth account
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

    const user = credential.user;

    // Send verification email
    await sendEmailVerification(user);

    // Create Users document
    await setDoc(
      doc(db, "users", user.uid),
      {

        uid: user.uid,

        name: form.name,

        email: user.email,

        phone: formattedPhone,

        role: "investor",

        accountStatus: "active",

        emailVerified: false,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

      },
      { merge: true }
    );

    // Create Investor profile
    const investorRef = doc(
  db,
  "investor",
  user.uid
);

const investorSnap =
  await getDoc(investorRef);

if (!investorSnap.exists()) {

  await setDoc(
    investorRef,
    {
      uid: user.uid,

      name: form.name,

      email: user.email,

      phone: formattedPhone,

      shares: 0,

      totalInvested: 0,

      walletBalance: 0,

      contributionsCount: 0,

      status: "active",

      createdAt: serverTimestamp(),
    }
  );

  await updateDoc(
    doc(
      db,
      "investmentStats",
      "company"
    ),
    {
      totalInvestors:
        increment(1),

      updatedAt:
        serverTimestamp(),
    }
  );

}

    setSuccess(
      "Account created successfully. A verification email has been sent. Please verify your email before logging in."
    );

    await auth.signOut();

    setIsSignup(false);

    setForm({
      name: "",
      phone: "",
      email: "",
      password: "",
    });

  } catch (err) {

    console.error(err);

    switch (err.code) {

      case "auth/email-already-in-use":
        setError("Email already exists.");
        break;

      case "auth/weak-password":
        setError("Choose a stronger password.");
        break;

      case "auth/invalid-email":
        setError("Invalid email address.");
        break;

      default:
        setError(err.message);

    }

  } finally {

    setLoading(false);

  }

};


// ================= LOGIN =================

const handleLogin = async () => {

  setError("");
  setSuccess("");

  if (!form.email || !form.password) {

    setError("Enter your email and password.");

    return;

  }

  try {

    setLoading(true);

    const credential =
      await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

    const user = credential.user;

    await user.reload();

    // Require email verification
    if (!user.emailVerified) {

      await auth.signOut();

      setError(
        "Please verify your email first. Check your inbox and spam folder."
      );

      return;

    }

    // Create user document if missing
    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {

      await setDoc(
        userRef,
        {

          uid: user.uid,

          email: user.email,

          name:
            user.displayName || "",

          phone: "",

          role: "investor",

          accountStatus: "active",

          emailVerified: true,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),

        },
        { merge: true }
      );

    }

    // Create investor profile if missing
    const investorRef =
      doc(
        db,
        "investor",
        user.uid
      );

    const investorSnap =
      await getDoc(investorRef);

    if (!investorSnap.exists()) {

      await setDoc(
        investorRef,
        {

          uid: user.uid,

          email: user.email,

          name:
            user.displayName || "",

          phone: "",

          shares: 0,

          totalInvested: 0,

          walletBalance: 0,

          contributionsCount: 0,

          status: "active",

          createdAt:
            serverTimestamp(),

        },
        { merge: true }
      );

    }

    navigate("/invest");

  } catch (err) {

    console.error(err);

    switch (err.code) {

      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        setError("Invalid email or password.");
        break;

      case "auth/too-many-requests":
        setError(
          "Too many login attempts. Try again later."
        );
        break;

      default:
        setError(err.message);

    }

  } finally {

    setLoading(false);

  }

};

const handleResendVerification = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {

      setError(
        "Login after creating your account to resend the verification email."
      );

      return;
    }

    await sendEmailVerification(user);

    setSuccess(
      "Verification email sent successfully. Check your inbox and spam folder."
    );

  } catch (err) {

    console.log(err);

    setError(
      "Unable to resend verification email."
    );

  }

};
return (

<Box
sx={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#000",
py:4
}}
>

<Container maxWidth="sm">

<Paper
elevation={0}
sx={{
p:4,
borderRadius:5,
background:"#111",
border:"1px solid #222"
}}
>

<Box textAlign="center" mb={4}>

<TrendingUp
sx={{
fontSize:60,
color:GOLD
}}
/>

<Typography
variant="h4"
fontWeight={900}
color="#fff"
mt={1}
>
BIASHNET
</Typography>

<Typography
color="#aaa"
mt={1}
>
Investor Portal
</Typography>

<Typography
color={GOLD}
fontSize={14}
mt={1}
>
Own a share in the future of Africa's digital marketplace.
</Typography>

</Box>

{error && (
<Alert
severity="error"
sx={{mb:2}}
>
{error}
</Alert>
)}

{success && (
<Alert
severity="success"
sx={{mb:2}}
>
{success}
</Alert>
)}

{isSignup && (

<>

<TextField
fullWidth
label="Full Name"
name="name"
value={form.name}
onChange={handleChange}
margin="normal"
/>

<TextField
fullWidth
label="Phone Number"
placeholder="07XXXXXXXX"
name="phone"
value={form.phone}
onChange={handleChange}
margin="normal"
/>

</>

)}

<TextField
fullWidth
label="Email Address"
name="email"
type="email"
value={form.email}
onChange={handleChange}
margin="normal"
/>

<TextField
fullWidth
label="Password"
name="password"
type={
showPassword
? "text"
: "password"
}
value={form.password}
onChange={handleChange}
margin="normal"
InputProps={{
endAdornment:(
<InputAdornment position="end">

<IconButton
onClick={()=>
setShowPassword(
!showPassword
)
}
>

{showPassword
?
<VisibilityOff/>
:
<Visibility/>
}

</IconButton>

</InputAdornment>
)
}}
/>

<Button
fullWidth
variant="contained"
disabled={loading}
onClick={
isSignup
?
handleSignup
:
handleLogin
}
sx={{
mt:3,
height:52,
fontWeight:800,
fontSize:16,
background:GOLD,
color:"#000",

"&:hover":{
background:"#dca300"
}
}}
>

{loading ?

<CircularProgress
size={24}
sx={{color:"#000"}}
/>

:

isSignup ?

"Create Investor Account"

:

"Login"

}

</Button>

{!isSignup && (

<Button
fullWidth
onClick={
handleResendVerification
}
sx={{
mt:2,
color:GOLD
}}
>
Resend Verification Email
</Button>

)}

<Divider sx={{my:3}}/>

<Box textAlign="center">

<Typography color="#aaa">

{isSignup ?

"Already have an account?"

:

"New Investor?"

}

</Typography>

<Button

onClick={()=>
setIsSignup(
!isSignup
)
}

sx={{
mt:1,
fontWeight:800,
color:GOLD
}}
>

{isSignup ?

"Login"

:

"Create Investor Account"

}

</Button>

</Box>

</Paper>

</Container>

</Box>

);
}