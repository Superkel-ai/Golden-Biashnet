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
  Divider
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  TrendingUp
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

// ================= THEME =================

const BG = "#000";
const CARD = "#111";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUB = "#aaa";
const BORDER = "#222";

// ================= PAGE =================

export default function InvestorAuth() {

  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= PHONE FORMAT =================

  const formatPhone = (phone) => {

    if (!phone) return "";

    let cleaned = phone.replace(/\D/g, "");

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

  // ================= SIGNUP =================

  const handleSignup = async () => {

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.password
    ) {
      return setError("Fill all fields");
    }

    const formattedPhone =
      formatPhone(form.phone);

    if (!formattedPhone) {
      return setError("Invalid phone number");
    }

    if (form.password.length < 6) {
      return setError(
        "Password must be at least 6 characters"
      );
    }

    try {

      setLoading(true);

      // CREATE AUTH ACCOUNT
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

      const user = userCredential.user;

      // CREATE USER DOCUMENT
      await setDoc(doc(db, "users", user.uid), {

        userId: user.uid,

        name: form.name,

        email: form.email,

        phone: formattedPhone,

        role: "investor",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        accountStatus: "active"

      });

      // CREATE INVESTOR DOCUMENT
      await setDoc(doc(db, "investors", user.uid), {

        userId: user.uid,

        name: form.name,

        email: form.email,

        phone: formattedPhone,

        totalInvested: 0,

        contributionsCount: 0,

        status: "active",

        createdAt: serverTimestamp()

      });

      setSuccess(
        "Account created successfully"
      );

      navigate("/investor-dashboard");

    } catch (err) {

      console.error(err);

      setError(err.message);

    }

    setLoading(false);

  };

  // ================= LOGIN =================

  const handleLogin = async () => {

    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      return setError(
        "Enter email and password"
      );
    }

    try {

      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

      const uid = userCredential.user.uid;

      // ENSURE USER DOC EXISTS
      const userRef = doc(db, "users", uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        await setDoc(userRef, {
          userId: uid,
          email: form.email,
          role: "investor",
          createdAt: serverTimestamp()
        });

      }

      navigate("/investor-dashboard");

    } catch (err) {

      console.error(err);

      setError("Invalid email or password");

    }

    setLoading(false);

  };

  // ================= UI =================

  return (

    <Box
      sx={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        py: 4
      }}
    >

      <Container maxWidth="sm">

        <Paper
          sx={{
            p: 4,
            background: CARD,
            borderRadius: 4,
            border: `1px solid ${BORDER}`
          }}
        >

          {/* LOGO */}
          <Box textAlign="center" mb={3}>

            <TrendingUp
              sx={{
                fontSize: 50,
                color: GOLD
              }}
            />

            <Typography
              sx={{
                color: TEXT,
                fontWeight: "bold",
                fontSize: 28,
                mt: 1
              }}
            >
              Investor Access
            </Typography>

            <Typography
              sx={{
                color: SUB,
                fontSize: 14
              }}
            >
              Golden Biashnet Investment Platform
            </Typography>

          </Box>

          {/* ALERTS */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              {success}
            </Alert>
          )}

          {/* SIGNUP ONLY */}
          {isSignup && (

            <>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </>

          )}

          {/* EMAIL */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {/* PASSWORD */}
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
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">

                  <IconButton
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
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

          {/* BUTTON */}
          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={
              isSignup
                ? handleSignup
                : handleLogin
            }
            sx={{
              height: 50,
              mt: 1,
              background: GOLD,
              color: "#000",
              fontWeight: "bold",
              "&:hover": {
                background: "#ffd54f"
              }
            }}
          >

            {loading ? (
              <CircularProgress size={24} />
            ) : isSignup ? (
              "Create Investor Account"
            ) : (
              "Login"
            )}

          </Button>

          {/* DIVIDER */}
          <Divider
            sx={{
              my: 3,
              borderColor: "#222"
            }}
          />

          {/* SWITCH */}
          <Box textAlign="center">

            <Typography
              sx={{
                color: SUB,
                fontSize: 14
              }}
            >

              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}

            </Typography>

            <Button
              onClick={() =>
                setIsSignup(!isSignup)
              }
              sx={{
                color: GOLD,
                fontWeight: "bold",
                mt: 1
              }}
            >

              {isSignup
                ? "Login Instead"
                : "Create Investor Account"}

            </Button>

          </Box>

        </Paper>

      </Container>

    </Box>

  );

}