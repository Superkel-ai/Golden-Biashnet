import React from "react";

import {
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
} from "@mui/material";

import {
  TrendingUp,
  WorkspacePremium,
  Diamond,
  RocketLaunch,
} from "@mui/icons-material";

const GOLD = "#F4B400";

const plans = [
  {
    title: "Starter Investor",
    minAmount: 1000,
    icon: <TrendingUp />,
    color: "#4CAF50",

    benefits: [
      "Become a BIASHNET investor",
      "Track company growth",
      "Access investor dashboard",
      "Eligible for future rewards",
    ],
  },

  {
    title: "Growth Investor",
    minAmount: 10000,
    icon: <WorkspacePremium />,
    color: "#2196F3",

    benefits: [
      "Higher ownership stake",
      "Priority investor updates",
      "Company performance reports",
      "Future dividend eligibility",
    ],
  },

  {
    title: "Strategic Investor",
    minAmount: 50000,
    icon: <Diamond />,
    color: "#9C27B0",

    benefits: [
      "Significant ownership position",
      "Priority investment opportunities",
      "Direct communication updates",
      "Long-term growth benefits",
    ],
  },

  {
    title: "Founding Investor",
    minAmount: 100000,
    icon: <RocketLaunch />,
    color: GOLD,

    benefits: [
      "Founding investor recognition",
      "Maximum early-stage opportunity",
      "Priority future share allocations",
      "Exclusive investor communications",
    ],
  },
];

export default function Plans({
  onInvest,
}) {
  return (
    <Paper
      sx={{
        bgcolor: "#111",
        p: 3,
        borderRadius: 4,
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 22,
          mb: 3,
        }}
      >
        Investment Plans
      </Typography>

      <Grid
        container
        spacing={2}
      >
        {plans.map((plan) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={plan.title}
          >
            <Paper
              sx={{
                height: "100%",
                bgcolor: "#181818",
                p: 3,
                borderRadius: 4,
                border: `1px solid ${plan.color}30`,
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
                <Box
                  sx={{
                    color:
                      plan.color,
                    fontSize: 40,
                  }}
                >
                  {plan.icon}
                </Box>
              </Box>

              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                {plan.title}
              </Typography>

              <Typography
                sx={{
                  color: GOLD,
                  fontWeight: 900,
                  fontSize: 24,
                  textAlign: "center",
                  mt: 1,
                }}
              >
                KES{" "}
                {plan.minAmount.toLocaleString()}
              </Typography>

              <Typography
                sx={{
                  color: "#888",
                  textAlign: "center",
                  fontSize: 12,
                  mb: 2,
                }}
              >
                Minimum Investment
              </Typography>

              <Box mb={2}>
                {plan.benefits.map(
                  (benefit) => (
                    <Chip
                      key={benefit}
                      label={benefit}
                      size="small"
                      sx={{
                        mb: 1,
                        mr: 1,
                        bgcolor:
                          "#222",
                        color:
                          "#ddd",
                      }}
                    />
                  )
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={onInvest}
                sx={{
                  bgcolor: GOLD,
                  color: "#000",
                  fontWeight: 900,

                  "&:hover": {
                    bgcolor:
                      "#dca300",
                  },
                }}
              >
                Invest Now
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography
        sx={{
          mt: 3,
          color: "#888",
          fontSize: 13,
        }}
      >
        BIASHNET is building a modern
        digital marketplace connecting
        buyers, sellers, businesses,
        service providers and investors
        through one scalable platform.
        Early investors participate in
        the company's growth journey and
        future expansion opportunities.
      </Typography>
    </Paper>
  );
}