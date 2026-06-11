// src/components/profile/Referrals.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PeopleIcon from "@mui/icons-material/People";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";

const GOLD = "#F4B400";
const BASE_URL = "https://golden-biashnet.web.app";

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [referralStats, setReferralStats] = useState({
    count: 0,
    coins: 0,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // USER DATA
      const snap = await getDoc(doc(db, "users", uid));

      if (snap.exists()) {
        const data = snap.data();
        setUser({ id: snap.id, ...data });

        // 🔥 REAL REFERRALS COUNT (from referrals collection)
        const refQuery = query(
          collection(db, "referrals"),
          where("referrerId", "==", uid)
        );

        const refSnap = await getDocs(refQuery);

        const count = refSnap.size;

        // coins rule (50 per referral)
        const coins = count * 50;

        setReferralStats({ count, coins });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = user
  ? `${BASE_URL}/signup?ref=${user.id}`
  : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (err) {
      console.log(err);
    }
  };

  const shareWhatsApp = () => {
    const message = `Join me on Biashnet Marketplace and start earning! 🚀\n\nSign up here: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  if (loading) {
    return (
      <Paper
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "#111",
          borderRadius: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={20} sx={{ color: GOLD }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        bgcolor: "#111",
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,.05)",
      }}
    >
      {/* HEADER */}
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 900,
          color: "#fff",
        }}
      >
        Invite & Earn
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "#888",
          mt: 0.5,
        }}
      >
        Earn 50 coins per successful referral
      </Typography>

      {/* LINK BOX */}
      <Box
        sx={{
          mt: 1.5,
          p: 1.2,
          borderRadius: 2,
          bgcolor: "#0a0a0a",
          border: "1px solid rgba(255,255,255,.05)",
          fontSize: 11,
          wordBreak: "break-all",
          color: "#ccc",
        }}
      >
        {referralLink}
      </Box>

      {/* ACTION BUTTONS */}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          fullWidth
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={copyLink}
          sx={{
            bgcolor: GOLD,
            color: "#000",
            fontWeight: 800,
            fontSize: 11,
            "&:hover": { bgcolor: "#ffd54f" },
          }}
        >
          Copy
        </Button>

        <Button
          fullWidth
          size="small"
          startIcon={<WhatsAppIcon />}
          onClick={shareWhatsApp}
          sx={{
            bgcolor: "#25D366",
            color: "#000",
            fontWeight: 800,
            fontSize: 11,
            "&:hover": { bgcolor: "#1ebe5d" },
          }}
        >
          Share
        </Button>
      </Stack>

      {/* STATS */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <StatBox
          icon={<PeopleIcon />}
          label="Referrals"
          value={referralStats.count}
        />

        <StatBox
          icon={<WalletIcon />}
          label="Coins"
          value={referralStats.coins}
        />
      </Stack>

      {/* EXTRA INFO */}
      <Box sx={{ mt: 2 }}>
        <Chip
          label="Auto rewards enabled"
          size="small"
          sx={{
            bgcolor: "rgba(244,180,0,.12)",
            color: GOLD,
            fontWeight: 700,
          }}
        />
      </Box>
    </Paper>
  );
}

/* =========================
   SMALL STAT BOX
========================= */

function StatBox({ icon, label, value }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.2,
        borderRadius: 3,
        bgcolor: "#0a0a0a",
        border: "1px solid rgba(255,255,255,.05)",
        textAlign: "center",
      }}
    >
      <Box sx={{ color: GOLD }}>{icon}</Box>

      <Typography sx={{ fontWeight: 900, fontSize: 14, mt: 0.5 }}>
        {value}
      </Typography>

      <Typography sx={{ fontSize: 10, color: "#888" }}>
        {label}
      </Typography>
    </Box>
  );
}