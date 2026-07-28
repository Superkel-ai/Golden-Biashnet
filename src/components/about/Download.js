// src/components/about/Download.js

import React from "react";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
} from "@mui/material";

import {
  Description,
  Downloading,
  VerifiedUser,
  Business,
  AccountBalance,
  LockOpen,
} from "@mui/icons-material";

const GOLD = "#F4B400";

const documents = [
  {
    title: "Certificate of Incorporation",
    description:
      "Official registration certificate issued by the Registrar of Companies.",
    icon: <Business />,
    status: "Available",
    file: "/documents/certificate-of-incorporation.pdf",
  },

  {
    title: "KRA PIN Certificate",
    description:
      "Official Kenya Revenue Authority registration certificate.",
    icon: <VerifiedUser />,
    status: "Available",
    file: "/documents/kra-pin-certificate.pdf",
  },

  {
    title: "CR12",
    description:
      "Company directors and ownership structure document.",
    icon: <AccountBalance />,
    status: "Available",
    file: "/documents/cr12.pdf",
  },

  {
    title: "Company Profile",
    description:
      "Overview of BIASHNET, vision, roadmap and operations.",
    icon: <Description />,
    status: "Coming Soon",
    file: "",
  },

  {
    title: "Investor Brief",
    description:
      "Investment proposal, projections and capital plans.",
    icon: <Description />,
    status: "Coming Soon",
    file: "",
  },
];

export default function Download() {
  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        bgcolor: "#050505",
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
            color: "#fff",
            fontWeight: 900,
            fontSize: {
              xs: 28,
              md: 40,
            },
            textAlign: "center",
          }}
        >
          Company Documents
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#999",
            mt: 1,
            mb: 5,
            maxWidth: 700,
            mx: "auto",
          }}
        >
          Access official BIASHNET registration
          documents and investor resources.
        </Typography>

        {/* DOCUMENT GRID */}

        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid
              key={doc.title}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  bgcolor: "#111",
                  color: "#fff",
                  borderRadius: 4,
                  border:
                    "1px solid rgba(255,255,255,.06)",

                  transition: ".25s",

                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: GOLD,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      bgcolor:
                        "rgba(244,180,0,.15)",

                      color: GOLD,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      mb: 2,
                    }}
                  >
                    {doc.icon}
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 18,
                      }}
                    >
                      {doc.title}
                    </Typography>

                    <Chip
                      label={doc.status}
                      size="small"
                      sx={{
                        bgcolor:
                          doc.status === "Available"
                            ? "rgba(0,200,83,.15)"
                            : "rgba(255,152,0,.15)",

                        color:
                          doc.status === "Available"
                            ? "#00C853"
                            : "#FF9800",

                        fontWeight: 800,
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      color: "#aaa",
                      fontSize: 14,
                      minHeight: 60,
                      mb: 2,
                    }}
                  >
                    {doc.description}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      doc.status === "Available"
                        ? <Downloading />
                        : <LockOpen />
                    }
                    disabled={
                      doc.status !== "Available"
                    }
                    href={
                      doc.status === "Available"
                        ? doc.file
                        : undefined
                    }
                    target="_blank"
                    sx={{
                      bgcolor: GOLD,
                      color: "#000",
                      fontWeight: 800,

                      "&:hover": {
                        bgcolor: "#dca300",
                      },

                      "&.Mui-disabled": {
                        bgcolor: "#222",
                        color: "#666",
                      },
                    }}
                  >
                    {doc.status === "Available"
                      ? "Download PDF"
                      : "Coming Soon"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* INVESTOR SECTION */}

        <Box
          sx={{
            mt: 6,
            p: 4,
            borderRadius: 5,

            background:
              "linear-gradient(135deg,#111,#1a1a1a)",

            border:
              "1px solid rgba(244,180,0,.15)",

            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900,
              fontSize: 28,
              mb: 1,
            }}
          >
            Investor Information
          </Typography>

          <Typography
            sx={{
              color: "#ccc",
              maxWidth: 800,
              mx: "auto",
              mb: 3,
            }}
          >
            Serious investors may request
            additional information including
            business plans, financial projections,
            growth strategies, market analysis,
            operational structure and expansion
            plans.
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Capital Goal: KES 500,000
          </Typography>

          <Typography
            sx={{
              color: "#999",
              mt: 1,
            }}
          >
            Investment window closes on
            31 August 2026.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}