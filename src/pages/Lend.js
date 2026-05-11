import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

export default function LendPage() {

  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amountMin: "",
    amountMax: "",
    interestRate: "",
    duration: "",
    terms: "",
    phone: true,
    id: true,
    mpesa: true,
    bank: false,
    collateral: false
  });

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {

    const ref = doc(db, "lenders", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setProfile(snap.data());
      setForm(snap.data());
    }

  };

  // ================= LOAD REQUESTS =================
  const loadRequests = async () => {

    const q = query(
      collection(db, "boost"),
      where("lenderId", "==", uid)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setRequests(data);
    setLoading(false);

  };

  useEffect(() => {
    if (!uid) return;
    loadProfile();
    loadRequests();
  }, [uid]);

  // ================= HANDLE FORM =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleRequirement = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ================= SAVE PROFILE =================
  const handleSubmit = async () => {

    await setDoc(doc(db, "lenders", uid), {
      ...form,
      userId: uid,
      updatedAt: new Date()
    });

    alert("Profile saved ✅");
    loadProfile();

  };

  // ================= UPDATE REQUEST =================
  const updateRequest = async (id, status) => {

    await updateDoc(doc(db, "boost", id), {
      status,
      updatedAt: new Date()
    });

    loadRequests();

  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (

    <Box sx={{ background: BG, minHeight: "100vh", color: "#fff", p: 2 }}>

      {/* ================= PROFILE ================= */}
      <Card sx={{ background: CARD, border: `1px solid ${BORDER}`, mb: 3 }}>
        <CardContent>

          <Stack direction="row" spacing={2} alignItems="center">

            <Avatar sx={{ bgcolor: GOLD }}>
              {form.name?.charAt(0) || "L"}
            </Avatar>

            <Box>
              <Typography fontWeight="bold">
                {form.name || "Your Lending Profile"}
              </Typography>
              <Typography fontSize={12} color="#aaa">
                Interest: {form.interestRate || 0}%
              </Typography>
            </Box>

          </Stack>

          <Divider sx={{ my: 2, borderColor: "#333" }} />

          <Grid container spacing={2}>

            <Grid item xs={6}>
              <TextField
                label="Min Amount"
                name="amountMin"
                fullWidth
                size="small"
                value={form.amountMin}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Max Amount"
                name="amountMax"
                fullWidth
                size="small"
                value={form.amountMax}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Interest %"
                name="interestRate"
                fullWidth
                size="small"
                value={form.interestRate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Duration (days)"
                name="duration"
                fullWidth
                size="small"
                value={form.duration}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Terms"
                name="terms"
                fullWidth
                multiline
                rows={3}
                value={form.terms}
                onChange={handleChange}
              />
            </Grid>

          </Grid>

          <Typography mt={2}>Requirements</Typography>

          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {["phone", "id", "mpesa", "bank", "collateral"].map(key => (
              <Chip
                key={key}
                label={key.toUpperCase()}
                onClick={() => toggleRequirement(key)}
                sx={{
                  background: form[key] ? GOLD : "#222",
                  color: form[key] ? "#000" : "#aaa"
                }}
              />
            ))}
          </Stack>

          <Button
            fullWidth
            sx={{ mt: 2, background: GOLD, color: "#000" }}
            onClick={handleSubmit}
          >
            Save Profile
          </Button>

        </CardContent>
      </Card>

      {/* ================= REQUESTS ================= */}
      <Typography variant="h6" mb={2}>
        📥 Loan Requests ({requests.length})
      </Typography>

      {requests.length === 0 && (
        <Typography color="#777">
          No requests yet
        </Typography>
      )}

      <Grid container spacing={2}>

        {requests.map(req => (

          <Grid item xs={12} key={req.id}>

            <Card sx={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <CardContent>

                <Typography fontWeight="bold">
                  {req.name}
                </Typography>

                <Typography>
                  KES {req.amount}
                </Typography>

                <Typography fontSize={12} color="#aaa">
                  Duration: {req.duration} days
                </Typography>

                <Typography fontSize={12} mt={1}>
                  {req.reason}
                </Typography>

                <Chip
                  label={req.status}
                  size="small"
                  sx={{ mt: 1 }}
                />

                <Stack direction="row" spacing={1} mt={2}>

                  <Button
                    size="small"
                    onClick={() => updateRequest(req.id, "approved")}
                    sx={{ background: "green", color: "#fff" }}
                  >
                    Accept
                  </Button>

                  <Button
                    size="small"
                    onClick={() => updateRequest(req.id, "rejected")}
                    color="error"
                  >
                    Decline
                  </Button>

                  <Button
                    size="small"
                    onClick={() => updateRequest(req.id, "info_requested")}
                    sx={{ color: GOLD }}
                  >
                    Ask Info
                  </Button>

                </Stack>

              </CardContent>
            </Card>

          </Grid>

        ))}

      </Grid>

    </Box>
  );
}