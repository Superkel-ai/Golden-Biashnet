import React, {
  useEffect,
  useState,
} from "react";

import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";

import {
  AccountBalanceWallet,
  Lock,
  TrendingUp,
  Add,
  SouthWest,
  Sell,
} from "@mui/icons-material";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function Wallet({
  onDeposit,
  onWithdraw,
  onSellShares,
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

      if (!uid) {
        setLoading(false);
        return;
      }

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
          sx={{
            color: GOLD,
          }}
        />
      </Paper>
    );
  }

  const balance =
    Number(wallet?.balance || 0);

  const lockedBalance =
    Number(
      wallet?.lockedBalance || 0
    );

  const totalValue =
    balance + lockedBalance;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,

        color: "#fff",

        background:
          "linear-gradient(135deg,#171717,#090909)",

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
          top: -70,
          right: -70,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background:
            "rgba(244,180,0,.08)",
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
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Investor Wallet
        </Typography>
      </Stack>

      {/* MAIN BALANCE */}

      <Typography
        sx={{
          color: "#999",
          mt: 3,
          fontSize: 13,
        }}
      >
        Available Balance
      </Typography>

      <Typography
        sx={{
          color: GOLD,
          fontWeight: 900,
          fontSize: {
            xs: 34,
            md: 42,
          },
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
          label="Locked Funds"
          value={`KES ${lockedBalance.toLocaleString()}`}
        />

        <Row
          icon={<TrendingUp />}
          label="Portfolio Value"
          value={`KES ${totalValue.toLocaleString()}`}
        />

        <Row
          label="Phone"
          value={
            wallet?.phone ||
            "Not Set"
          }
        />

        <Row
          label="Status"
          value="Active"
        />
      </Stack>

      {/* ACTION BUTTONS */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
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
              bgcolor: "#dca300",
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
            color: GOLD,
            fontWeight: 800,
            borderRadius: 3,

            border:
              "1px solid rgba(244,180,0,.25)",
          }}
        >
          Withdraw
        </Button>

        <Button
          fullWidth
          startIcon={<Sell />}
          onClick={onSellShares}
          sx={{
            color: "#fff",
            fontWeight: 800,
            borderRadius: 3,

            border:
              "1px solid rgba(255,255,255,.15)",
          }}
        >
          Sell Shares
        </Button>
      </Stack>
    </Paper>
  );
}

/* ========================== */

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