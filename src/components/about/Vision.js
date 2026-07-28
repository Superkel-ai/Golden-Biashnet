// src/components/about/Vision.js

import React from "react";

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  Button,
  Stack,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PublicIcon from "@mui/icons-material/Public";
import DownloadIcon from "@mui/icons-material/Download";

const GOLD = "#F4B400";

export default function Vision() {
  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        bgcolor: "#fafafa",
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
            fontSize: 36,
            fontWeight: 900,
            textAlign: "center",
            mb: 1,
          }}
        >
          Vision & Growth Strategy
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            maxWidth: 800,
            mx: "auto",
            mb: 5,
          }}
        >
          Learn why BIASHNET was created, the problems we
          solve, our future plans, delivery system and
          long-term expansion strategy.
        </Typography>

        {/* ACCORDIONS */}

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={800}>
              Why BIASHNET Exists
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>
              BIASHNET was created to help businesses,
              students, service providers, property owners,
              advertisers and everyday sellers access a
              professional digital marketplace without the
              high costs and complexity of traditional
              e-commerce platforms.

              <br />
              <br />

              Our goal is to connect buyers and sellers in
              one trusted ecosystem where products,
              services, houses, jobs, events and
              advertisements can be discovered easily.

              <br />
              <br />

              We believe millions of small businesses across
              Kenya and Africa deserve affordable digital
              tools to grow and compete globally.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={800}>
              Problem We Solve
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>
              Today many businesses depend entirely on
              WhatsApp Status, Facebook groups and personal
              networks to find customers.

              <br />
              <br />

              This creates several problems:
              <br />
              • Limited reach
              <br />
              • Poor product visibility
              <br />
              • Lack of trust
              <br />
              • No delivery coordination
              <br />
              • Difficult business growth
              <br />
              • No analytics or marketing tools
              <br />
              • Scattered online presence

              <br />
              <br />

              BIASHNET solves this by bringing everything
              into one marketplace platform.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* ROADMAP */}

        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 28,
              mb: 3,
            }}
          >
            Roadmap
          </Typography>

          <Grid container spacing={2}>
            {[
              {
                year: "2026",
                title: "Marketplace Launch",
                text:
                  "Products, Services, Houses, Events and Advertising platform.",
              },

              {
                year: "2027",
                title: "Delivery Network",
                text:
                  "Partner riders and logistics system across major towns.",
              },

              {
                year: "2028",
                title: "Business Growth Tools",
                text:
                  "Seller analytics, subscriptions, promotions and financing tools.",
              },

              {
                year: "2029",
                title: "Regional Expansion",
                text:
                  "Expansion into East African markets.",
              },

              {
                year: "2030",
                title: "Global Marketplace",
                text:
                  "International trade and global seller ecosystem.",
              },
            ].map((item) => (
              <Grid item xs={12} md={4} key={item.year}>
                <Card
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 4,
                  }}
                >
                  <Typography
                    sx={{
                      color: GOLD,
                      fontWeight: 900,
                      fontSize: 22,
                    }}
                  >
                    {item.year}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      my: 1,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography color="text.secondary">
                    {item.text}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* DELIVERY */}

        <Box sx={{ mt: 7 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 28,
              mb: 3,
            }}
          >
            Delivery System Plan
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <LocalShippingIcon
                  sx={{
                    color: GOLD,
                    fontSize: 40,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                  }}
                >
                  Partner Riders
                </Typography>

                <Typography color="text.secondary">
                  Independent riders and logistics partners
                  will handle local deliveries.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <StorefrontIcon
                  sx={{
                    color: GOLD,
                    fontSize: 40,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                  }}
                >
                  Seller Fulfillment
                </Typography>

                <Typography color="text.secondary">
                  Sellers can manage inventory and dispatch
                  directly through BIASHNET systems.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <TrendingUpIcon
                  sx={{
                    color: GOLD,
                    fontSize: 40,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                  }}
                >
                  Smart Tracking
                </Typography>

                <Typography color="text.secondary">
                  Future delivery tracking and order
                  management ecosystem.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* EXPANSION */}

        <Box sx={{ mt: 7 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 28,
              mb: 3,
            }}
          >
            Expansion Strategy
          </Typography>

          <Card
            sx={{
              p: 4,
              borderRadius: 4,
            }}
          >
            <Stack spacing={2}>
              <Typography>
                🇰🇪 Start in Kenya
              </Typography>

              <Typography>
                🌍 Expand across East Africa
              </Typography>

              <Typography>
                📦 Build delivery and logistics systems
              </Typography>

              <Typography>
                📢 Scale advertising services
              </Typography>

              <Typography>
                🤝 Strategic partnerships
              </Typography>

              <Typography>
                🌐 Global seller ecosystem
              </Typography>
            </Stack>
          </Card>
        </Box>

        {/* PDF BUTTON */}

        <Box
          sx={{
            textAlign: "center",
            mt: 6,
          }}
        >
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: GOLD,
              color: "#000",
              fontWeight: 800,
              px: 4,
            }}
          >
            Download Investor Brief PDF
          </Button>
        </Box>
      </Box>
    </Box>
  );
}