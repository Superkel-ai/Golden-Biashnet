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
  TrendingDown,
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

export default function Withdraw({
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
        doc(
          db,
          "investorWallets",
          uid
        )
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
    setError("");
    setSuccess("");
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
            "Enter M-Pesa number."
          );
          return;
        }

        if (
          !amount ||
          Number(amount) < 100
        ) {
          setError(
            "Minimum withdrawal is KES 100."
          );
          return;
        }

        const balance =
          wallet?.balance || 0;

        if (
          Number(amount) > balance
        ) {
          setError(
            "Insufficient investment balance."
          );
          return;
        }

        setLoading(true);

        setError("");
        setSuccess("");

        await addDoc(
          collection(
            db,
            "investorWithdrawals"
          ),
          {
            userId: user.uid,

            phone,

            amount:
              Number(amount),

            status:
              "PENDING",

            type:
              "INVESTOR_WITHDRAWAL",

            createdAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          "Withdrawal request submitted successfully. Your request will be reviewed by the BIASHNET finance team."
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
          fontWeight: 900,
        }}
      >
        Investor Withdrawal
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
          <TrendingDown
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
          Request withdrawal of
          investment funds to your
          M-Pesa account.
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
              color: "#888",
              fontSize: 13,
            }}
          >
            Available Investment Balance
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
          label="Withdrawal Amount"
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
          Withdrawal requests are
          reviewed before approval.
          Processing time may vary
          depending on company policy.
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
            "Request Withdrawal"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}