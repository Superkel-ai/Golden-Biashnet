import React, {
  useEffect,
  useState,
} from "react";

import {
  Paper,
  Box,
  Typography,
  Stack,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../services/firebase";

const GOLD = "#F4B400";

export default function Hero() {
  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      totalRaised: 0,
      targetCapital: 1,
      totalInvestors: 0,
      companyStage:
        "Early Stage",
      companyType:
        "Marketplace",
    });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(
        db,
        "investmentStats",
        "company"
      ),
      (snap) => {
        if (snap.exists()) {
          setStats(snap.data());
        }

        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          bgcolor: "#111",
          textAlign: "center",
        }}
      >
        <CircularProgress
          sx={{ color: GOLD }}
        />
      </Paper>
    );
  }

  const raised =
    Number(
      stats.totalRaised || 0
    );

  const target =
    Number(
      stats.targetCapital || 1
    );

  const investors =
    Number(
      stats.totalInvestors || 0
    );

  const remaining =
    Math.max(
      target - raised,
      0
    );

  const fundedPercent =
    Math.min(
      Math.round(
        (raised / target) * 100
      ),
      100
    );

  const remainingPercent =
    100 - fundedPercent;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        color: "#fff",
        background:
          "linear-gradient(135deg,#151515,#090909)",
        border:
          "1px solid rgba(244,180,0,.15)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "rgba(244,180,0,.08)",
          filter: "blur(50px)",
        }}
      />

      <Typography
        sx={{
          color: GOLD,
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 1,
          textTransform:
            "uppercase",
        }}
      >
        BIASHNET LTD
      </Typography>

      <Typography
        sx={{
          fontSize: {
            xs: 24,
            md: 32,
          },
          fontWeight: 900,
          mt: 0.5,
        }}
      >
        Investor Portal
      </Typography>

      <Typography
        sx={{
          color: "#999",
          mt: 1,
          fontSize: 14,
          maxWidth: 650,
        }}
      >
        Track company growth,
        funding progress,
        investor participation
        and business expansion.
      </Typography>

      {/* Raised */}
      <Box mt={3}>
        <Typography
          sx={{
            color: "#888",
            fontSize: 13,
          }}
        >
          Capital Raised
        </Typography>

        <Typography
          sx={{
            color: GOLD,
            fontWeight: 900,
            fontSize: {
              xs: 30,
              md: 42,
            },
          }}
        >
          KES{" "}
          {raised.toLocaleString()}
        </Typography>
      </Box>

      {/* Progress */}
      <Box mt={2}>
        <LinearProgress
          variant="determinate"
          value={fundedPercent}
          sx={{
            height: 10,
            borderRadius: 10,
            bgcolor:
              "rgba(255,255,255,.08)",
            "& .MuiLinearProgress-bar":
              {
                bgcolor: GOLD,
              },
          }}
        />

        <Stack
          direction="row"
          justifyContent="space-between"
          mt={1}
        >
          <Typography
            sx={{
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Target:
            {" "}
            KES{" "}
            {target.toLocaleString()}
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {fundedPercent}%
            Funded
          </Typography>
        </Stack>
      </Box>

      {/* Additional Stats */}
      <Stack
        direction="row"
        spacing={2}
        mt={3}
        flexWrap="wrap"
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 120,
          }}
        >
          <Typography
            sx={{
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Remaining Capital
          </Typography>

          <Typography
            sx={{
              fontWeight: 800,
              color: "#fff",
            }}
          >
            KES{" "}
            {remaining.toLocaleString()}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 120,
          }}
        >
          <Typography
            sx={{
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Remaining %
          </Typography>

          <Typography
            sx={{
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {remainingPercent}%
          </Typography>
        </Box>
      </Stack>

      {/* Quick Stats */}
      <Stack
        direction="row"
        spacing={2}
        mt={3}
        flexWrap="wrap"
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <GroupsIcon
              sx={{
                color: GOLD,
                fontSize: 20,
              }}
            />
            <Typography
              sx={{
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Investors
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontWeight: 800,
              mt: 0.5,
            }}
          >
            {investors}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <TrendingUpIcon
              sx={{
                color: GOLD,
              }}
            />
            <Typography
              sx={{
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Growth Stage
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontWeight: 800,
              mt: 0.5,
            }}
          >
            {stats.companyStage}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <BusinessCenterIcon
              sx={{
                color: GOLD,
              }}
            />

            <Typography
              sx={{
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Company
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontWeight: 800,
              mt: 0.5,
            }}
          >
            {stats.companyType}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}