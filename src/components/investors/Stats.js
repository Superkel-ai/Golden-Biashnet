import React, {
  useEffect,
  useState,
} from "react";

import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function Stats() {
  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const snap = await getDoc(
        doc(
          db,
          "companyStats",
          "current"
        )
      );

      if (snap.exists()) {
        setStats(snap.data());
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
          p: 3,
          borderRadius: 4,
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

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={6}
        md={3}
      >
        <StatCard
          icon={<PaidIcon />}
          title="Capital Raised"
          value={`KES ${Number(
            stats?.capitalRaised || 0
          ).toLocaleString()}`}
        />
      </Grid>

      <Grid
        item
        xs={6}
        md={3}
      >
        <StatCard
          icon={<TrendingUpIcon />}
          title="Target Capital"
          value={`KES ${Number(
            stats?.targetCapital || 0
          ).toLocaleString()}`}
        />
      </Grid>

      <Grid
        item
        xs={6}
        md={3}
      >
        <StatCard
          icon={<GroupsIcon />}
          title="Investors"
          value={Number(
            stats?.investorCount || 0
          ).toLocaleString()}
        />
      </Grid>

      <Grid
        item
        xs={6}
        md={3}
      >
        <StatCard
          icon={
            <AccountBalanceIcon />
          }
          title="Valuation"
          value={`KES ${Number(
            stats?.companyValuation || 0
          ).toLocaleString()}`}
        />
      </Grid>
    </Grid>
  );
}

/* ===================== */

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,

        height: "100%",

        borderRadius: 4,

        bgcolor: "#111",

        border:
          "1px solid rgba(244,180,0,.08)",

        color: "#fff",
      }}
    >
      <Typography
        sx={{
          color: GOLD,
          mb: 1,
        }}
      >
        {icon}
      </Typography>

      <Typography
        sx={{
          color: "#999",
          fontSize: 12,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: {
            xs: 18,
            md: 22,
          },

          mt: 1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}