// src/components/home/HeroSlider.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

const slides = [
  {
    title: " Flash Sales",
    subtitle:
      "Massive discounts from trusted sellers across Kenya",

    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",

    action: "/flash-sales",

    badge: "HOT DEALS",
  },

  {
    title: "🛒 Sell On Golden Biashnet",
    subtitle:
      "Upload products and reach thousands of buyers",

    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4",

    action: "/uploads",

    badge: "SELL & EARN",
  },

  {
  title: " Grow With Adverts",
  subtitle:
    "Advertise your business, event, vacancy, promotion or brand and reach more customers faster",

  image:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",

  action: "/adverts",

  badge: "ADVERTISE NOW",
},

  

  {
    title: "🏠 Houses & Rentals",
    subtitle:
      "Bedsitters, apartments and rentals near you",

    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa",

    action: "/houses",

    badge: "HOUSING",
  },

  {
    title: "🛠 Services Marketplace",
    subtitle:
      "Find skilled professionals instantly",

    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216",

    action: "/services",

    badge: "TOP SERVICES",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <Box
      sx={{
        position: "relative",

        height: {
          xs: 200,
          sm: 260,
          md: 320,
        },

        borderRadius: 4,

        overflow: "hidden",

        mx: 1.5,

        mb: 3,

        boxShadow:
          "0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      {/* IMAGE */}
      <Box
        component="img"
        src={slides[current].image}
        alt={slides[current].title}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",

          transition:
            "all .8s ease-in-out",
        }}
      />

      {/* OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,

          background:
            "linear-gradient(to right, rgba(0,0,0,.92), rgba(0,0,0,.25))",
        }}
      />

      {/* CONTENT */}
      <Box
        sx={{
          position: "absolute",

          inset: 0,

          display: "flex",

          alignItems: "center",

          px: {
            xs: 2,
            sm: 4,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 450,
          }}
        >
          {/* Badge */}
          <Box
            sx={{
              display: "inline-block",

              px: 1.5,
              py: 0.5,

              borderRadius: 2,

              bgcolor: GOLD,

              color: "#000",

              fontWeight: 700,

              fontSize: 11,

              mb: 1.5,
            }}
          >
            {slides[current].badge}
          </Box>

          {/* Title */}
          <Typography
            sx={{
              color: "#fff",

              fontWeight: 800,

              lineHeight: 1.1,

              fontSize: {
                xs: 24,
                sm: 32,
                md: 40,
              },
            }}
          >
            {slides[current].title}
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              color: "#ddd",

              mt: 1,

              mb: 2,

              fontSize: {
                xs: 13,
                sm: 15,
              },
            }}
          >
            {slides[current].subtitle}
          </Typography>

          {/* CTA */}
          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="contained"
              onClick={() =>
                navigate(slides[current].action)
              }
              sx={{
                bgcolor: GOLD,

                color: "#000",

                fontWeight: 700,

                "&:hover": {
                  bgcolor: "#ffd54f",
                },
              }}
            >
              Explore Now
            </Button>

            <Button
              variant="outlined"
              onClick={() =>
                navigate("/uploads")
              }
              sx={{
                borderColor: "#fff",

                color: "#fff",

                "&:hover": {
                  borderColor: GOLD,
                  color: GOLD,
                },
              }}
            >
              Sell Now
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ARROWS */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",

          left: 10,

          top: "50%",

          transform:
            "translateY(-50%)",

          bgcolor:
            "rgba(0,0,0,.55)",

          color: "#fff",

          "&:hover": {
            bgcolor:
              "rgba(0,0,0,.75)",
          },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",

          right: 10,

          top: "50%",

          transform:
            "translateY(-50%)",

          bgcolor:
            "rgba(0,0,0,.55)",

          color: "#fff",

          "&:hover": {
            bgcolor:
              "rgba(0,0,0,.75)",
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      {/* DOTS */}
      <Box
        sx={{
          position: "absolute",

          bottom: 12,

          left: "50%",

          transform:
            "translateX(-50%)",

          display: "flex",

          gap: 1,
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() =>
              setCurrent(index)
            }
            sx={{
              width:
                current === index
                  ? 24
                  : 8,

              height: 8,

              borderRadius: 10,

              bgcolor:
                current === index
                  ? GOLD
                  : "#fff",

              cursor: "pointer",

              transition:
                ".3s ease",
            }}
          />
        ))}
      </Box>

      {/* LOGO WATERMARK */}
      <Typography
        sx={{
          position: "absolute",

          bottom: 12,

          right: 15,

          color:
            "rgba(212, 207, 207, 0.53)",

          fontWeight: 800,

          fontSize: 14,

          letterSpacing: 1,
        }}
      >
        BIASHNET LTD
      </Typography>
    </Box>
  );
}