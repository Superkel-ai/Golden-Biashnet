import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Link
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  Google
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "../services/firebase";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const provider = new GoogleAuthProvider();

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Email login
  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      return setError("Enter email and password");
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!form.email) {
      return setError("Enter your email first");
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, form.email);
      setSuccess("Password reset email sent!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "#111",
            color: "#fff"
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Login
          </Typography>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Email Input */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            InputProps={{
              sx: { color: "#fff" }
            }}
            InputLabelProps={{
              sx: { color: "#aaa" }
            }}
          />

          {/* Password Input */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            InputProps={{
              sx: { color: "#fff" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <VisibilityOff sx={{ color: "#fff" }} />
                    ) : (
                      <Visibility sx={{ color: "#fff" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
            InputLabelProps={{
              sx: { color: "#aaa" }
            }}
          />

          {/* Forgot password */}
          <Box textAlign="right" mt={1}>
            <Link
              component="button"
              variant="body2"
              onClick={handleForgotPassword}
              disabled={loading}
              sx={{ color: "#F4B400", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Login button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 3,
              background: "#F4B400",
              color: "#000",
              fontWeight: "bold",
              height: 50,
              "&:hover": {
                background: "#FFD54F"
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          {/* Divider */}
          <Divider sx={{ my: 3, "&::before, &::after": { borderColor: "#333" }, color: "#666" }}>
            OR
          </Divider>

          {/* Google login */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              color: "#fff",
              borderColor: "#444",
              height: 50,
              "&:hover": {
                borderColor: "#F4B400",
                background: "rgba(244, 180, 0, 0.08)"
              }
            }}
          >
            Continue with Google
          </Button>

          {/* Signup Navigation */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              New user?{" "}
              <Link
                component="button"
                onClick={() => navigate("/signup")}
                sx={{ color: "#F4B400", fontWeight: "bold", textDecoration: "none" }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;