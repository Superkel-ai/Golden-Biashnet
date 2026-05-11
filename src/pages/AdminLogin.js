import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const GOLD = "#F4B400";

export default function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email) {
      setError("Enter admin email");
      return;
    }

    try {
      setLoading(true);

      // Query admins collection
      const q = query(
        collection(db, "admins"),
        where("email", "==", email),
        where("status", "==", "active")
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        // Save session
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminLoggedIn", "true");

        // Call callback to update App.js state
        if (onLoginSuccess) onLoginSuccess();

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        setError("Access denied. Not an admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000"
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: 360,
          background: "#111",
          border: "1px solid #333"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: GOLD,
            fontWeight: 700,
            mb: 3,
            textAlign: "center"
          }}
        >
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Admin Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 3,
            input: { color: "#fff" },
            label: { color: "#aaa" }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            background: GOLD,
            color: "#000",
            fontWeight: 700,
            "&:hover": { background: "#d9a200" }
          }}
        >
          {loading ? "Checking..." : "Login"}
        </Button>
      </Paper>
    </Box>
  );
}