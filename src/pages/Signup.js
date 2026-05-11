import React, { useState } from "react";
import {
Box,
TextField,
Typography,
Button,
Paper,
Checkbox,
FormControlLabel,
CircularProgress,
Alert,
IconButton,
InputAdornment,
Divider
} from "@mui/material";

import {
Visibility,
VisibilityOff,
PersonAdd
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
doc,
setDoc,
serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

// ============================
// THEME
// ============================

const BG = "#0a0909";
const CARD = "#083d44";
const BORDER = "#66f324";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUBTEXT = "#aaa";

// ============================
// PHONE FORMATTER
// ============================
const formatKenyanPhone = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, ""); // remove spaces, +, etc

  // 07XXXXXXXX or 01XXXXXXXX
  if (
    (cleaned.startsWith("07") || cleaned.startsWith("01")) &&
    cleaned.length === 10
  ) {
    return "254" + cleaned.slice(1);
  }

  // 7XXXXXXXX or 1XXXXXXXX
  if (
    (cleaned.startsWith("7") || cleaned.startsWith("1")) &&
    cleaned.length === 9
  ) {
    return "254" + cleaned;
  }

  // +254XXXXXXXXX → 254XXXXXXXXX
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }

  return null; // ❌ invalid
};


// ============================
// COMPONENT
// ============================

export default function Signup() {

const navigate = useNavigate();

const [loading, setLoading] = useState(false);

const [error, setError] = useState("");

const [showPassword, setShowPassword] = useState(false);

const [form, setForm] = useState({
name: "",
email: "",
phone: "",
password: "",
confirmPassword: "",
buyer: true,
seller: false
});

// ============================
// Handle change
// ============================

const handleChange = (e) => {

const { name, value, type, checked } = e.target;

setForm({
  ...form,
  [name]: type === "checkbox" ? checked : value
});

};

// ============================
// VALIDATION
// ============================

const validate = () => {

const name = form.name.trim();
const email = form.email.trim();
const formattedPhone = formatKenyanPhone(form.phone);

if (!formattedPhone) {
  return "Enter a valid phone (07..., 01..., or +254...)";
}

if (!name) return "Enter your full name";

if (!email || !email.includes("@"))
  return "Enter a valid email address";

if (form.password.length < 6)
  return "Password must be at least 6 characters";

if (form.password !== form.confirmPassword)
  return "Passwords do not match";

if (!form.buyer && !form.seller)
  return "Select account type";

return null;

};

// ============================
// SIGNUP
// ============================

const handleSignup = async () => {

if (loading) return;

setError("");

const validationError = validate();

if (validationError) {
  setError(validationError);
  return;
}

try {

  setLoading(true);

  const formattedPhone = formatKenyanPhone(form.phone);

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      form.email.trim(),
      form.password
    );

  const user = userCredential.user;


  // ============================
  // FIRESTORE USER DOCUMENT
  // ============================

  await setDoc(doc(db, "users", user.uid), {

    userId: user.uid,

    name: form.name.trim(),

    email: form.email.trim(),

    phone: formattedPhone,

    photoURL: "",

    location: "",

    roles: {
      buyer: form.buyer,
      seller: form.seller
    },

    sellerVerified: false,

    sellerRating: 0,

    totalRatings: 0,

    listingsCount: 0,

    ordersCount: 0,

    completedOrders: 0,

    subscriptionActive: false,

    subscriptionPlan: null,

    subscriptionExpiresAt: null,

    accountStatus: "active",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),

    lastLoginAt: serverTimestamp()

  });


  navigate("/");

} catch (err) {

  console.error(err);

  setError("Failed to create account. Please try again.");

}

setLoading(false);

};

// ============================
// UI
// ============================

return (

<Box
  sx={{
    background: BG,
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    px: 2
  }}
>

  <Paper
    sx={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      p: { xs: 3, sm: 4 },
      width: "100%",
      maxWidth: 450,
      borderRadius: 3
    }}
  >

    {/* Title */}

    <Box textAlign="center" mb={3}>

      <PersonAdd sx={{ fontSize: 40, color: GOLD }} />

      <Typography
        variant="h5"
        fontWeight="bold"
        color={TEXT}
      >
        Create Account
      </Typography>

      <Typography color={SUBTEXT}>
        Join Golden Biashnet Marketplace
      </Typography>

    </Box>


    {error && (

      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>

    )}


    {/* Name */}

    <TextField
      fullWidth
      label="Full Name/Business Name"
      name="name"
      value={form.name}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />


    {/* Email */}

    <TextField
      fullWidth
      label="Email"
      name="email"
      type="email"
      value={form.email}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />


    {/* Phone */}

    <TextField
  fullWidth
  label="Phone Number"
  name="phone"
  type="tel"
  placeholder="07XXXXXXXX or 01XXXXXXXX"
  value={form.phone}
  onChange={handleChange}
  sx={{ mb: 1 }}
/>

<Typography
  sx={{
    fontSize: 12,
    color: SUBTEXT,
    mb: 2
  }}
>
  Accepted formats: 07XXXXXXXX, 01XXXXXXXX or +254XXXXXXXXX
</Typography>


    {/* Password */}

    <TextField
      fullWidth
      type={showPassword ? "text" : "password"}
      label="Password"
      name="password"
      value={form.password}
      onChange={handleChange}
      sx={{ mb: 2 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">

            <IconButton
              onClick={() =>
                setShowPassword(!showPassword)
              }
              sx={{ color: GOLD }}
            >
              {showPassword
                ? <VisibilityOff />
                : <Visibility />}
            </IconButton>

          </InputAdornment>
        )
      }}
    />


    {/* Confirm */}

    <TextField
      fullWidth
      type="password"
      label="Confirm Password"
      name="confirmPassword"
      value={form.confirmPassword}
      onChange={handleChange}
      sx={{ mb: 2 }}
    />


    <Divider sx={{ my: 2, borderColor: BORDER }} />


    {/* Roles */}

    <Typography color={SUBTEXT}>
      Account Type
    </Typography>


    <FormControlLabel
      control={
        <Checkbox
          name="buyer"
          checked={form.buyer}
          onChange={handleChange}
          sx={{ color: GOLD }}
        />
      }
      label={<Typography color={TEXT}>Buyer</Typography>}
    />


    <FormControlLabel
      control={
        <Checkbox
          name="seller"
          checked={form.seller}
          onChange={handleChange}
          sx={{ color: GOLD }}
        />
      }
      label={<Typography color={TEXT}>Seller</Typography>}
    />


    {/* Button */}

    <Button
      fullWidth
      variant="contained"
      onClick={handleSignup}
      disabled={loading}
      sx={{
        mt: 3,
        height: 50,
        fontWeight: "bold",
        background: GOLD,
        color: "#000",
        "&:hover": {
          background: "#ffd54f"
        }
      }}
    >

      {loading
        ? <CircularProgress size={24} />
        : "Create Account"}

    </Button>

  </Paper>

</Box>

);

}