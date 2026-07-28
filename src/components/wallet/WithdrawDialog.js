import React, {
  useEffect,
  useState,
} from "react";

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
  SouthWest,
} from "@mui/icons-material";

import {
  auth,
  db,
} from "../../services/firebase";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

const GOLD = "#F4B400";

export default function WithdrawDialog({
  open,
  onClose,
}) {
  const [wallet, setWallet] =
    useState(null);

  const [phone, setPhone] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (open) {
      loadWallet();
    }
  }, [open]);

  const loadWallet = async () => {
    try {
      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      const snap = await getDoc(
        doc(db, "wallets", uid)
      );

      if (snap.exists()) {
        const data = snap.data();

        setWallet(data);

        setPhone(
          data.phone || ""
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    setAmount("");
    setSuccess("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitWithdrawal =
    async () => {
      try {
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
          Number(amount) < 10
        ) {
          setError(
            "Minimum withdrawal is KES 10."
          );
          return;
        }

        const balance =
          wallet?.balance || 0;

        if (
          Number(amount) > balance
        ) {
          setError(
            "Insufficient wallet balance."
          );
          return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        await addDoc(
          collection(
            db,
            "withdrawalRequests"
          ),
          {
            userId: user.uid,

            phone,

            amount:
              Number(amount),

            status: "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          "Withdrawal request submitted successfully. Processing may take a few minutes."
        );

        setAmount("");

      } catch (err) {
        console.log(err);

        setError(
          err.message ||
            "Failed to submit request."
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
        Withdraw Funds
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
          <SouthWest
            sx={{
              color: GOLD,
              fontSize: 50,
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
          Withdraw money from your
          Biashnet Wallet to M-Pesa.
        </Typography>

        <Box
          sx={{
            bgcolor: "#111",
            borderRadius: 3,
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: "#999",
              fontSize: 13,
            }}
          >
            Available Balance
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            KES{" "}
            {Number(
              wallet?.balance || 0
            ).toLocaleString()}
          </Typography>
        </Box>

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
          label="M-Pesa Number"
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
          label="Amount"
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
            color: "#777",
            fontSize: 12,
            mt: 2,
          }}
        >
          Withdrawals are reviewed and
          processed before funds are sent
          to your M-Pesa account.
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
          onClick={
            submitWithdrawal
          }
          sx={{
            bgcolor: GOLD,
            color: "#000",
            fontWeight: 800,

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
            "Request Withdrawal"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}