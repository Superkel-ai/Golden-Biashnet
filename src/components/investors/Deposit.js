import React, { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

import {
  TrendingUp,
} from "@mui/icons-material";

import { auth } from "../../services/firebase";

const GOLD = "#F4B400";

const API_URL =
  "https://biashnet-mpesa-api-production-54f1.up.railway.app";

export default function Deposit({
  open,
  onClose,
}) {
  const [phone, setPhone] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const resetForm = () => {
    setPhone("");
    setAmount("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDeposit = async () => {
    try {
      setError("");
      setSuccess("");

      const user =
        auth.currentUser;

      if (!user) {
        setError(
          "Please login first."
        );
        return;
      }

      if (!phone) {
        setError(
          "Enter phone number."
        );
        return;
      }

      if (
        !amount ||
        Number(amount) < 1
      ) {
        setError(
          "Minimum investment is KES 1."
        );
        return;
      }

      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/stkpush`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              userId: user.uid,
              phone,
              amount: Number(amount),

              source:
                "INVESTOR_PORTAL",

              transactionType:
                "INVESTMENT",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Investment request failed."
        );
      }

      setSuccess(
        "Investment request sent successfully. Check your phone and enter your M-Pesa PIN."
      );

    } catch (err) {
      console.log(err);

      setError(
        err.message ||
          "Failed to initiate investment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        sx={{
          bgcolor: "#111",
          color: GOLD,
          fontWeight: 800,
        }}
      >
        Invest In BIASHNET
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: "#050505",
          pt: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            mb: 2,
          }}
        >
          <TrendingUp
            sx={{
              color: GOLD,
              fontSize: 55,
            }}
          />
        </Box>

        <Typography
          sx={{
            color: "#aaa",
            textAlign: "center",
            mb: 3,
          }}
        >
          Deposit investment capital
          into your BIASHNET Investor
          Account using M-Pesa.
        </Typography>

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

        <TextField
          fullWidth
          label="M-Pesa Phone Number"
          placeholder="254712345678"
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value
            )
          }
          sx={{
            mb: 2,
            input: {
              color: "#fff",
            },
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Investment Amount (KES)"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          sx={{
            input: {
              color: "#fff",
            },
          }}
        />

        <Typography
          sx={{
            mt: 2,
            color: "#888",
            fontSize: 12,
          }}
        >
          Investments are subject to
          BIASHNET investor terms and
          conditions.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "#050505",
          p: 2,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "#aaa",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleDeposit}
          sx={{
            bgcolor: GOLD,
            color: "#000",
            fontWeight: 900,

            "&:hover": {
              bgcolor: "#dca300",
            },
          }}
        >
          {loading ? (
            <CircularProgress
              size={20}
              sx={{
                color: "#000",
              }}
            />
          ) : (
            "Invest Now"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}