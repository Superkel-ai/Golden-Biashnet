// src/pages/AdminVerify.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

export default function AdminVerify() {

  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState([]);

  const [success, setSuccess] = useState("");

  /* =========================================
     LOAD REQUESTS
  ========================================= */

  useEffect(() => {

    fetchRequests();

  }, []);

  const fetchRequests = async () => {

    try {

      const snap = await getDocs(
        collection(db, "verificationRequests")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* =========================================
     APPROVE USER
  ========================================= */

  const handleApprove = async (user) => {

    try {

      /* UPDATE USER */

      await updateDoc(
        doc(db, "users", user.userId),
        {
          verified: true,
          verificationPlan: user.plan,
          verifiedAt: serverTimestamp()
        }
      );

      /* CREATE VERIFIED USER */

      await setDoc(
        doc(db, "verifiedUsers", user.userId),
        {
          userId: user.userId,

          name: user.name || "",

          email: user.email || "",

          phone: user.phone || "",

          plan: user.plan,

          status: "approved",

          verified: true,

          verifiedBy: "admin",

          createdAt: serverTimestamp()
        }
      );

      /* UPDATE REQUEST */

      await updateDoc(
        doc(
          db,
          "verificationRequests",
          user.id
        ),
        {
          status: "approved"
        }
      );

      setSuccess("User verified");

      fetchRequests();

    } catch (err) {

      console.error(err);

    }

  };

  /* =========================================
     REJECT
  ========================================= */

  const handleReject = async (id) => {

    try {

      await updateDoc(
        doc(db, "verificationRequests", id),
        {
          status: "rejected"
        }
      );

      fetchRequests();

    } catch (err) {

      console.error(err);

    }

  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <Box
        sx={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress />

      </Box>

    );

  }

  return (

    <Box
      sx={{
        background: "#000",
        minHeight: "100vh",
        p: 2
      }}
    >

      <Typography
        variant="h5"
        sx={{
          color: GOLD,
          fontWeight: "bold",
          mb: 3
        }}
      >
        Seller Verification
      </Typography>

      {requests.length === 0 && (

        <Typography
          sx={{
            color: "#aaa"
          }}
        >
          No verification requests
        </Typography>

      )}

      <Stack spacing={2}>

        {requests.map((user) => (

          <Paper
            key={user.id}
            sx={{
              background: "#111",
              border: "1px solid #222",
              p: 2,
              borderRadius: 3
            }}
          >

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              mb={2}
            >

              <Avatar
                src={user.photoURL || ""}
              />

              <Box>

                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: "bold"
                  }}
                >
                  {user.name}
                </Typography>

                <Typography
                  sx={{
                    color: "#aaa",
                    fontSize: 13
                  }}
                >
                  {user.email}
                </Typography>

              </Box>

            </Stack>

            <Stack
              direction="row"
              spacing={1}
              mb={2}
            >

              <Chip
                label={user.plan}
                sx={{
                  background: GOLD,
                  color: "#000",
                  fontWeight: "bold"
                }}
              />

              <Chip
                label={
                  user.status || "pending"
                }
                sx={{
                  background: "#222",
                  color: "#fff"
                }}
              />

            </Stack>

            <Typography
              sx={{
                color: "#ccc",
                fontSize: 13,
                mb: 1
              }}
            >
              Phone: {user.phone}
            </Typography>

            <Typography
              sx={{
                color: "#777",
                fontSize: 12,
                mb: 2
              }}
            >
              UID: {user.userId}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
            >

              <Button
                variant="contained"
                onClick={() =>
                  handleApprove(user)
                }
                sx={{
                  background: "#22c55e",
                  color: "#fff",
                  fontWeight: "bold"
                }}
              >
                Verify
              </Button>

              <Button
                variant="outlined"
                onClick={() =>
                  handleReject(user.id)
                }
                sx={{
                  borderColor: "#f44336",
                  color: "#f44336"
                }}
              >
                Reject
              </Button>

            </Stack>

          </Paper>

        ))}

      </Stack>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">
          {success}
        </Alert>
      </Snackbar>

    </Box>

  );

}