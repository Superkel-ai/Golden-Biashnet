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

export default function SellShares({
  open,
  onClose,
}) {
  const [shares, setShares] =
    useState(0);

  const [sharePrice, setSharePrice] =
    useState(10);

  const [quantity, setQuantity] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open]);

  const loadShares = async () => {
    try {
      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      const snap = await getDoc(
        doc(
          db,
          "investorShares",
          uid
        )
      );

      if (snap.exists()) {
        const data = snap.data();

        setShares(
          Number(
            data.totalShares || 0
          )
        );

        setSharePrice(
          Number(
            data.sharePrice || 10
          )
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClose = () => {
    setQuantity("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit =
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

        const qty =
          Number(quantity);

        if (
          !qty ||
          qty <= 0
        ) {
          setError(
            "Enter valid quantity."
          );
          return;
        }

        if (qty > shares) {
          setError(
            "You do not own enough shares."
          );
          return;
        }

        setLoading(true);

        const estimatedAmount =
          qty * sharePrice;

        await addDoc(
          collection(
            db,
            "shareSaleRequests"
          ),
          {
            userId: user.uid,

            shares: qty,

            sharePrice,

            estimatedAmount,

            status:
              "PENDING",

            createdAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          "Share sale request submitted successfully."
        );

        setQuantity("");

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

  const estimatedValue =
    Number(quantity || 0) *
    sharePrice;

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
        Sell Shares
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
          Request to sell part of your
          BIASHNET investment shares.
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
            Shares Owned
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            {shares.toLocaleString()}
          </Typography>
        </Box>

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
            Current Share Price
          </Typography>

          <Typography
            sx={{
              color: "#4CAF50",
              fontWeight: 900,
              fontSize: 20,
            }}
          >
            KES {sharePrice}
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
          type="number"
          label="Number of Shares"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              e.target.value
            )
          }
          sx={{
            input: {
              color: "#fff",
            },
          }}
        />

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#111",
            borderRadius: 3,
          }}
        >
          <Typography
            sx={{
              color: "#888",
            }}
          >
            Estimated Value
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            KES{" "}
            {estimatedValue.toLocaleString()}
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "#777",
            fontSize: 12,
            mt: 2,
          }}
        >
          Share sale requests require
          approval from BIASHNET
          management before payment is
          processed.
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
          onClick={handleSubmit}
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
            "Sell Shares"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}