import React, {
  useEffect,
  useState,
} from "react";

import {
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";

import {
  TrendingUp,
  Groups,
  CalendarMonth,
  Savings,
} from "@mui/icons-material";

import {
  db,
} from "../../services/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

const GOLD = "#F4B400";

export default function Progress() {
  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState({
      targetAmount: 0,
      raisedAmount: 0,
      investorsCount: 0,
      daysRemaining: 0,
    });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const snap = await getDoc(
        doc(
          db,
          "fundraising",
          "current"
        )
      );

      if (snap.exists()) {
        setData(snap.data());
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
          bgcolor: "#111",
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  const target =
    Number(
      data.targetAmount || 0
    );

  const raised =
    Number(
      data.raisedAmount || 0
    );

  const percentage =
    target > 0
      ? Math.min(
          (raised / target) * 100,
          100
        )
      : 0;

  return (
    <Paper
      sx={{
        bgcolor: "#111",
        p: 3,
        borderRadius: 4,
      }}
    >
      {/* HEADER */}

      <Typography
        sx={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 22,
          mb: 1,
        }}
      >
        Company Fundraising Progress
      </Typography>

      <Typography
        sx={{
          color: "#888",
          mb: 3,
        }}
      >
        Follow BIASHNET's growth
        journey and investment
        progress in real time.
      </Typography>

      {/* AMOUNTS */}

      <Box mb={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={1}
        >
          <Typography
            sx={{
              color: "#aaa",
            }}
          >
            Raised Capital
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900,
            }}
          >
            {percentage.toFixed(1)}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 12,
            borderRadius: 10,

            bgcolor:
              "rgba(255,255,255,.08)",

            "& .MuiLinearProgress-bar":
              {
                backgroundColor:
                  GOLD,
              },
          }}
        />
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
      >
        {/* TARGET */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              bgcolor: "#181818",
              p: 2,
              borderRadius: 3,
            }}
          >
            <Savings
              sx={{
                color: GOLD,
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: "#888",
                fontSize: 12,
              }}
            >
              Target Capital
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
              }}
            >
              KES{" "}
              {target.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        {/* RAISED */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              bgcolor: "#181818",
              p: 2,
              borderRadius: 3,
            }}
          >
            <TrendingUp
              sx={{
                color: "#4CAF50",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: "#888",
                fontSize: 12,
              }}
            >
              Raised So Far
            </Typography>

            <Typography
              sx={{
                color: "#4CAF50",
                fontWeight: 900,
              }}
            >
              KES{" "}
              {raised.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        {/* INVESTORS */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              bgcolor: "#181818",
              p: 2,
              borderRadius: 3,
            }}
          >
            <Groups
              sx={{
                color: "#2196F3",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: "#888",
                fontSize: 12,
              }}
            >
              Investors
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
              }}
            >
              {Number(
                data.investorsCount || 0
              ).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        {/* DAYS */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              bgcolor: "#181818",
              p: 2,
              borderRadius: 3,
            }}
          >
            <CalendarMonth
              sx={{
                color: "#FF9800",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: "#888",
                fontSize: 12,
              }}
            >
              Days Remaining
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
              }}
            >
              {Number(
                data.daysRemaining || 0
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          bgcolor:
            "rgba(244,180,0,.08)",
          border:
            "1px solid rgba(244,180,0,.15)",
        }}
      >
        <Typography
          sx={{
            color: GOLD,
            fontWeight: 800,
            mb: .5,
          }}
        >
          BIASHNET Growth Mission
        </Typography>

        <Typography
          sx={{
            color: "#bbb",
            fontSize: 13,
          }}
        >
          Capital raised will support
          platform development,
          infrastructure, marketing,
          seller acquisition, logistics
          partnerships and expansion
          across Kenya.
        </Typography>
      </Box>
    </Paper>
  );
}