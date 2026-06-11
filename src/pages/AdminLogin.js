import React, { useState } from "react";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const GOLD = "#F4B400";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verify admin status directly from Firestore
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        setError("Access denied. Not an admin account.");
        await signOut(auth); // Immediately boot unauthorized user out of Firebase
        return;
      }

      const adminData = adminSnap.data();
      if (adminData.status !== "active") {
        setError("Access denied. Admin account is inactive.");
        await signOut(auth); // Boot inactive admin out
        return;
      }

      // Success! AuthContext will detect this and handle the state change globally
      navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
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
          sx={{ color: GOLD, fontWeight: 700, mb: 3, textAlign: "center" }}
        >
          Secure Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            background: GOLD,
            color: "#000",
            fontWeight: 700,
            "&:hover": { background: "#d39e00" }
          }}
        >
          {loading ? "Checking..." : "Login with Google"}
        </Button>
      </Paper>
    </Box>
  );
}