import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";

import { getAuth } from "firebase/auth";

export default function TestStk() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  /* =========================
     DEPOSIT (STK PUSH)
  ========================= */
  const testStk = async () => {
    try {
      if (!user) return setResponse("User not logged in");

      setLoading(true);

      const res = await fetch(
        "https://biashnet-mpesa-api-production-54f1.up.railway.app/api/stkpush",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            phone,
            amount: Number(amount),
          }),
        }
      );

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     WITHDRAW (B2C REQUEST)
  ========================= */
  const withdraw = async () => {
    try {
      if (!user) return setResponse("User not logged in");

      setLoading(true);

      const res = await fetch(
        "https://biashnet-mpesa-api-production-54f1.up.railway.app/api/withdraw",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            phone,
            amount: Number(amount),
          }),
        }
      );

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#050505", p: 3, color: "#fff" }}>
      <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 3 }}>
        Wallet Test (Deposit + Withdraw)
      </Typography>

      {user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          User ID: {user.uid}
        </Alert>
      )}

      <Paper sx={{ p: 3, bgcolor: "#111", borderRadius: 4 }}>
        <TextField
          fullWidth
          label="Phone Number"
          placeholder="254712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{ mb: 2, input: { color: "#fff" } }}
        />

        <TextField
          fullWidth
          type="number"
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2, input: { color: "#fff" } }}
        />

        {/* ================= DEPOSIT ================= */}
        <Button
          fullWidth
          variant="contained"
          onClick={testStk}
          disabled={loading}
          sx={{
            mb: 2,
            bgcolor: "#F4B400",
            color: "#000",
            fontWeight: 800,
          }}
        >
          {loading ? "Processing..." : "Deposit (STK Push)"}
        </Button>

        {/* ================= WITHDRAW ================= */}
        <Button
          fullWidth
          variant="contained"
          onClick={withdraw}
          disabled={loading}
          sx={{
            bgcolor: "#ff4444",
            color: "#fff",
            fontWeight: 800,
          }}
        >
          {loading ? "Processing..." : "Withdraw (B2C)"}
        </Button>
      </Paper>

      {response && (
        <Paper
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "#111",
            color: "#00ff99",
            whiteSpace: "pre-wrap",
          }}
        >
          {response}
        </Paper>
      )}
    </Box>
  );
}