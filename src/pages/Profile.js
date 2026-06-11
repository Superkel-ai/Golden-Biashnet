// src/pages/Profile.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Container,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

import Nav from "../components/profile/Nav";
import Prof from "../components/profile/Prof";
import TopSeller from "../components/profile/TopSeller";
import Referrals from "../components/profile/Referrals";

const BG = "#050505";
const GOLD = "#F4B400";

export default function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsub = onAuthStateChanged(
      auth,
      (currentUser) => {

        setUser(currentUser);
        setLoading(false);

      }
    );

    return () => unsub();

  }, []);

  // Loading state
  if (loading) {

    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }

  // Not logged in
  if (!user) {

    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: BG,
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 800,
              mb: 1,
            }}
          >
            Login Required
          </Typography>

          <Typography
            sx={{
              color: "#999",
              mb: 3,
            }}
          >
            Please login to access your profile,
            referrals, seller dashboard and marketplace tools.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              bgcolor: GOLD,
              color: "#000",
              fontWeight: 700,
              px: 4,
            }}
          >
            Login
          </Button>
        </Box>
      </Box>
    );

  }

  // Logged in
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: BG,
        color: "#fff",
        pb: 10,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <Prof />
        <TopSeller />
        <Referrals />
        <Nav />
      </Container>
    </Box>
  );
}