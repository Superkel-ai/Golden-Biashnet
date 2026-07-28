// src/components/about/Invest.js

import React from "react";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Stack,
} from "@mui/material";

import {
  TrendingUp,
  Groups,
  Handshake,
  Campaign,
  BusinessCenter,
} from "@mui/icons-material";

const GOLD = "#F4B400";

export default function Invest() {

  const target = 500000;
  const raised = 120000;

  const percentage =
    (raised / target) * 100;

  return (

    <Box
      sx={{
        py: 8,
        px: 2,
        bgcolor: "#fff",
      }}
    >

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
        }}
      >

        {/* HEADER */}

        <Typography
          sx={{
            fontSize: 38,
            fontWeight: 900,
            textAlign: "center",
            mb: 1,
          }}
        >
          Investors & Partners
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 800,
            mx: "auto",
            mb: 6,
          }}
        >
          Join BIASHNET as an investor,
          marketing ambassador,
          strategic partner or early supporter.
        </Typography>

        {/* CAPITAL GOAL */}

        <Card
          sx={{
            mb: 5,
            borderRadius: 5,
          }}
        >
          <CardContent>

            <Typography
              sx={{
                fontSize: 26,
                fontWeight: 900,
                mb: 1,
              }}
            >
              Capital Raising Goal
            </Typography>

            <Typography
              sx={{
                color: "#666",
                mb: 2,
              }}
            >
              BIASHNET aims to raise
              KES 500,000 before
              August 31, 2026.
            </Typography>

            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 14,
                borderRadius: 10,
                mb: 2,
              }}
            />

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={3}
            >

              <Typography>
                Raised:
                <strong>
                  {" "}
                  KES {raised.toLocaleString()}
                </strong>
              </Typography>

              <Typography>
                Target:
                <strong>
                  {" "}
                  KES {target.toLocaleString()}
                </strong>
              </Typography>

              <Typography>
                Remaining:
                <strong>
                  {" "}
                  KES {(target-raised).toLocaleString()}
                </strong>
              </Typography>

            </Stack>

          </CardContent>
        </Card>

        {/* OPPORTUNITIES */}

        <Grid
          container
          spacing={3}
        >

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 5,
              }}
            >
              <CardContent>

                <TrendingUp
                  sx={{
                    color: GOLD,
                    fontSize: 45,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 24,
                    mt: 2,
                  }}
                >
                  Investor Opportunity
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#666",
                  }}
                >
                  Support the growth of
                  BIASHNET as we build a
                  scalable marketplace
                  connecting buyers,
                  sellers and service
                  providers across Kenya.
                </Typography>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 5,
              }}
            >
              <CardContent>

                <Campaign
                  sx={{
                    color: GOLD,
                    fontSize: 45,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 24,
                    mt: 2,
                  }}
                >
                  Marketing Team
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#666",
                  }}
                >
                  We are recruiting campus
                  ambassadors, marketers,
                  influencers and sales
                  agents to help accelerate
                  growth and user adoption.
                </Typography>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 5,
              }}
            >
              <CardContent>

                <Handshake
                  sx={{
                    color: GOLD,
                    fontSize: 45,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 24,
                    mt: 2,
                  }}
                >
                  Strategic Partnerships
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#666",
                  }}
                >
                  We welcome delivery
                  partners, universities,
                  SACCOs, businesses,
                  agencies and brands
                  interested in collaboration.
                </Typography>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 5,
              }}
            >
              <CardContent>

                <Groups
                  sx={{
                    color: GOLD,
                    fontSize: 45,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 24,
                    mt: 2,
                  }}
                >
                  Early Supporters
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#666",
                  }}
                >
                  Join our community
                  before launch and help
                  shape the future of
                  commerce, services and
                  digital opportunities.
                </Typography>

              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* CTA */}

        <Box
          sx={{
            mt: 6,
            textAlign: "center",
          }}
        >

          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 28,
              mb: 3,
            }}
          >
            Get Involved
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            justifyContent="center"
          >

            <Button
              variant="contained"
              startIcon={
                <BusinessCenter />
              }
              sx={{
                bgcolor: GOLD,
                color: "#000",
                fontWeight: 800,
              }}
            >
              Become Investor
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: GOLD,
                color: GOLD,
              }}
            >
              Become Partner
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: GOLD,
                color: GOLD,
              }}
            >
              Join Marketing Team
            </Button>

          </Stack>

        </Box>

      </Box>

    </Box>
  );
}