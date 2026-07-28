import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

import {
  AccountBalanceWallet,
  Lock,
  TrendingUp,
  Add,
  SouthWest,
} from "@mui/icons-material";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function WalletBalance({
  onDeposit,
  onWithdraw,
}) {
  const [loading, setLoading] =
    useState(true);

  const [wallet, setWallet] =
    useState(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      const snap = await getDoc(
        doc(db, "wallets", uid)
      );

      if (snap.exists()) {
        setWallet({
          id: snap.id,
          ...snap.data(),
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: 5,
          bgcolor: "#111",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          sx={{ color: GOLD }}
        />
      </Paper>
    );
  }

  const balance =
    wallet?.balance || 0;

  const locked =
    wallet?.lockedBalance || 0;

  const total =
    balance + locked;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 5,
        color: "#fff",

        background:
          "linear-gradient(135deg,#1a1a1a,#0a0a0a)",

        border:
          "1px solid rgba(244,180,0,.15)",

        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* GOLD GLOW */}

      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "rgba(244,180,0,.10)",
          filter: "blur(40px)",
        }}
      />

      {/* HEADER */}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        <AccountBalanceWallet
          sx={{
            color: GOLD,
            fontSize: 32,
          }}
        />

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          Biashnet Wallet
        </Typography>
      </Stack>

      {/* AVAILABLE */}

      <Typography
        sx={{
          mt: 3,
          color: "#999",
          fontSize: 13,
        }}
      >
        Available Balance
      </Typography>

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: 38,
          color: GOLD,
        }}
      >
        KES {balance.toLocaleString()}
      </Typography>

      {/* STATS */}

      <Stack
        spacing={1.5}
        mt={3}
      >
        <Row
          icon={<Lock />}
          label="Locked Balance"
          value={`KES ${locked.toLocaleString()}`}
        />

        <Row
          icon={<TrendingUp />}
          label="Total Earnings"
          value={`KES ${total.toLocaleString()}`}
        />

        <Row
          label="Phone"
          value={
            wallet?.phone ||
            "Not Set"
          }
        />

        <Row
          label="Wallet Status"
          value="Active"
        />
      </Stack>

      {/* ACTIONS */}

      <Stack
        direction="row"
        spacing={1.5}
        mt={4}
      >
        <Button
          fullWidth
          startIcon={<Add />}
          onClick={onDeposit}
          sx={{
            bgcolor: GOLD,
            color: "#000",
            fontWeight: 800,
            borderRadius: 3,

            "&:hover": {
              bgcolor: "#d9a300",
            },
          }}
        >
          Deposit
        </Button>

        <Button
          fullWidth
          startIcon={<SouthWest />}
          onClick={onWithdraw}
          sx={{
            borderRadius: 3,
            fontWeight: 800,

            border:
              "1px solid rgba(244,180,0,.25)",

            color: GOLD,
          }}
        >
          Withdraw
        </Button>
      </Stack>
    </Paper>
  );
}

/* ======================================= */

function Row({
  icon,
  label,
  value,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {icon}

        <Typography
          sx={{
            color: "#bbb",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}