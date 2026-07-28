// src/components/about/Hero.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Card,
} from "@mui/material";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import VerifiedIcon from "@mui/icons-material/Verified";

const GOLD = "#F4B400";

export default function Hero() {

  const launchDate =
    new Date("2026-09-15T00:00:00");

  const investorDeadline =
    new Date("2026-08-31T23:59:59");

  const [launchTime, setLaunchTime] =
    useState({});

  const [investorTime, setInvestorTime] =
    useState({});

  useEffect(() => {

    const timer = setInterval(() => {

      setLaunchTime(
        calculateTime(launchDate)
      );

      setInvestorTime(
        calculateTime(
          investorDeadline
        )
      );

    }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  const showcase = [

    {
      title: "Products",
      image:
        "/about/products.jpg",
    },

    {
      title: "Housing",
      image:
        "/about/houses.jpg",
    },

    {
      title: "Services",
      image:
        "/about/services.jpg",
    },

    {
      title: "Advertising",
      image:
        "/about/adverts.jpg",
    },

    {
      title: "Delivery",
      image:
        "/about/delivery.jpg",
    },

  ];

  return (

    <Box
      sx={{
        background:
          "linear-gradient(180deg,#050505,#0d0d0d)",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >

      {/* GOLD GLOW */}

      <Box
        sx={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "rgba(244,180,0,.12)",
          filter: "blur(100px)",
        }}
      />

      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: 2,
          py: 8,
        }}
      >

        <Stack
          spacing={3}
          alignItems="center"
          textAlign="center"
        >

          {/* LOGO */}

          <Box
            component="img"
            src="/about/logo.png"
            alt="Biashnet"
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
            }}
          />

          <Chip
            icon={<VerifiedIcon />}
            label="Registered Kenyan Company"
            sx={{
              bgcolor:
                "rgba(0,200,83,.15)",
              color: "#00E676",
              fontWeight: 800,
            }}
          />

          <Typography
            sx={{
              fontSize: {
                xs: 36,
                md: 60,
              },
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            BIASHNET LTD
          </Typography>

          <Typography
            sx={{
              maxWidth: 900,
              color: "#ccc",
              fontSize: {
                xs: 16,
                md: 22,
              },
            }}
          >
            Kenya's Online Marketplace
            for Products, Housing,
            Services, Advertising
            and Delivery.
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 800,
              fontSize: {
                xs: 18,
                md: 26,
              },
            }}
          >
            🚀 Launching
            September 15, 2026
          </Typography>

          {/* INVESTOR CARD */}

          <Card
            sx={{
              bgcolor: "#111",
              border:
                `1px solid ${GOLD}`,
              borderRadius: 4,
              p: 3,
              maxWidth: 700,
              width: "100%",
            }}
          >

            <Typography
              sx={{
                color: GOLD,
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              Investor Opportunity
            </Typography>

            <Typography
              sx={{
                color: "#ddd",
                mt: 1,
              }}
            >
              We are raising
              KES 500,000 before
              August 31, 2026 to
              accelerate growth,
              marketing, delivery
              partnerships and
              nationwide launch.
            </Typography>

            <Countdown
              time={investorTime}
              label="Investment Window Closes In"
            />

          </Card>

          {/* LAUNCH COUNTDOWN */}

          <Countdown
            time={launchTime}
            label="Marketplace Launch In"
          />

          {/* CTA */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
          >

            <Button
              size="large"
              variant="contained"
              startIcon={
                <RocketLaunchIcon />
              }
              sx={{
                bgcolor: GOLD,
                color: "#000",
                fontWeight: 900,
              }}
            >
              Support The Vision
            </Button>

            <Button
              size="large"
              variant="outlined"
              startIcon={
                <BusinessCenterIcon />
              }
              sx={{
                borderColor: GOLD,
                color: GOLD,
              }}
            >
              Become A Partner
            </Button>

          </Stack>

        </Stack>

        {/* SHOWCASE */}

        <Box
          sx={{
            mt: 7,
            overflow: "hidden",
          }}
        >

          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "max-content",
              animation:
                "slide 25s linear infinite",

              "@keyframes slide": {
                from: {
                  transform:
                    "translateX(0)",
                },

                to: {
                  transform:
                    "translateX(-50%)",
                },
              },
            }}
          >

            {[...showcase,
              ...showcase].map(
              (
                item,
                index
              ) => (

                <Card
                  key={index}
                  sx={{
                    minWidth: 260,
                    bgcolor: "#111",
                    borderRadius: 4,
                    overflow:
                      "hidden",
                  }}
                >

                  <Box
                    component="img"
                    src={
                      item.image
                    }
                    sx={{
                      width:
                        "100%",
                      height:
                        180,
                      objectFit:
                        "cover",
                    }}
                  />

                  <Box
                    sx={{
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight:
                          800,
                      }}
                    >
                      {
                        item.title
                      }
                    </Typography>
                  </Box>

                </Card>

              )
            )}

          </Box>

        </Box>

      </Box>

    </Box>

  );
}

function Countdown({
  time,
  label,
}) {

  return (

    <Box sx={{ mt: 2 }}>

      <Typography
        sx={{
          color: "#bbb",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
      >

        {[
          time.days,
          time.hours,
          time.minutes,
          time.seconds,
        ].map((v, i) => (

          <Box
            key={i}
            sx={{
              bgcolor: "#000",
              border:
                "1px solid rgba(255,255,255,.08)",
              p: 1.5,
              borderRadius: 2,
              minWidth: 70,
            }}
          >

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 24,
                color: GOLD,
              }}
            >
              {v || 0}
            </Typography>

          </Box>

        ))}

      </Stack>

    </Box>

  );

}

function calculateTime(
  targetDate
) {

  const difference =
    targetDate -
    new Date();

  return {

    days: Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    ),

    hours: Math.floor(
      (
        difference %
        (1000 * 60 * 60 * 24)
      ) /
      (1000 * 60 * 60)
    ),

    minutes: Math.floor(
      (
        difference %
        (1000 * 60 * 60)
      ) /
      (1000 * 60)
    ),

    seconds: Math.floor(
      (
        difference %
        (1000 * 60)
      ) /
      1000
    ),

  };

}