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
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// ============================
// OFFICIAL BIASHNET THEME COLORS
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
  if (!phone) return null;

  let cleaned = phone.replace(/\D/g, ""); 

  if ((cleaned.startsWith("07") || cleaned.startsWith("01")) && cleaned.length === 10) {
    return "254" + cleaned.slice(1);
  }

  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    return "254" + cleaned;
  }

  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return cleaned;
  }

  return null; 
};

// ============================
// TEXT FIELD STYLING SPEC
// ============================
const textFieldStyles = {
  mb: 2,
  "& .MuiInputBase-input": { color: TEXT },
  "& .MuiInputLabel-root": { color: SUBTEXT },
  "& .MuiInputLabel-root.Mui-focused": { color: GOLD },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
    "&:hover fieldset": { borderColor: GOLD },
    "&.Mui-focused fieldset": { borderColor: GOLD }
  }
};

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
   const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    buyer: true,
    seller: false
  });

   const referralId = new URLSearchParams(location.search).get("ref");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validate = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const formattedPhone = formatKenyanPhone(form.phone);

    if (!name) return "Enter your full name or business name";
    if (!email || !email.includes("@")) return "Enter a valid email address";
    if (!formattedPhone) return "Enter a valid phone number (e.g., 07XXXXXXXX)";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.buyer && !form.seller) return "Select at least one account type";

    return null;
  };

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

      // Create Authentication Entry
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const user = userCredential.user;

      // Push Account Profile Configuration straight to Firestore Users Map
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
         referredBy: referralId || null,
        referralCount: 0,
        referralCoins: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });


      if (referralId) {
  await setDoc(doc(db, "referrals", `${referralId}_${user.uid}`), {
    referrerId: referralId,
    referredId: user.uid,
    status: "pending",
    rewardGiven: false,
    createdAt: serverTimestamp(),
  });
}
      

      navigate("/");

    } catch (err) {
      console.error("Upgraded Signup Handler Capture: ", err);

      
      // Map granular authorization or verification rules breaks clearly to the operator
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use by another account.");
      } else if (err.code === "permission-denied") {
        setError("Database transaction rejected. Verify your system permissions rules layout.");
      } else if (err.code === "auth/weak-password") {
        setError("The provided password security depth is too weak.");
      } else {
        setError(`Registration failed: ${err.message || "Please check your network and try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4
      }}
    >
      <Paper
        elevation={6}
        sx={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 450,
          borderRadius: 3
        }}
      >
        {/* Header Block */}
        <Box textAlign="center" mb={3}>
          <PersonAdd sx={{ fontSize: 42, color: GOLD, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color={TEXT}>
            Create Account
          </Typography>
          <Typography variant="body2" color={SUBTEXT}>
            Join Golden Biashnet Marketplace
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
            {error}
          </Alert>
        )}

        {/* Input Map */}
        <TextField
          fullWidth
          label="Full Name / Business Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          sx={textFieldStyles}
        />

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          sx={textFieldStyles}
        />

        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="07XXXXXXXX or 01XXXXXXXX"
          value={form.phone}
          onChange={handleChange}
          sx={{
            ...textFieldStyles,
            mb: 0.5
          }}
        />
        <Typography sx={{ fontSize: 11, color: SUBTEXT, mb: 2, pl: 0.5 }}>
          Accepted formats: 07XXXXXXXX, 01XXXXXXXX or +254XXXXXXXXX
        </Typography>

        <TextField
          fullWidth
          type={showPassword ? "text" : "password"}
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          sx={textFieldStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: GOLD }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          sx={textFieldStyles}
        />

        <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.12)" }} />

        {/* Account Segment Type Selectors */}
        <Typography variant="subtitle2" color={SUBTEXT} sx={{ mb: 1, fontWeight: 600 }}>
          Account Type
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="buyer"
                checked={form.buyer}
                onChange={handleChange}
                sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: GOLD } }}
              />
            }
            label={<Typography variant="body2" color={TEXT}>Buyer</Typography>}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="seller"
                checked={form.seller}
                onChange={handleChange}
                sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: GOLD } }}
              />
            }
            label={<Typography variant="body2" color={TEXT}>Seller</Typography>}
          />
        </Box>

        {/* Action Controls */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSignup}
          disabled={loading}
          sx={{
            mt: 4,
            height: 50,
            fontSize: "1rem",
            fontWeight: "bold",
            background: GOLD,
            color: "#000",
            textTransform: "none",
            borderRadius: 2,
            "&:hover": {
              background: "#ffd54f"
            },
            "&.Mui-disabled": {
              background: "rgba(244, 180, 0, 0.3)"
            }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Create Account"}
        </Button>
      </Paper>
    </Box>
  );
}