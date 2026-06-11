// src/components/home/CategoryScroller.js

import React from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

/* ==========================================
   MAIN MARKETPLACE CATEGORIES
========================================== */

const categories = [
  {
    name: "Products",
    image: "/categories/all.jpg",
    route: "/",
  },

  {
    name: "Find Services",
    image: "/categories/services.jpg",
    route: "/services",
  },

  {
    name: "Find Rentals",
    image: "/categories/houses.jpg",
    route: "/houses",
  },

  {
    name: "Advertisements",
    image: "/categories/adverts.jpg",
    route: "/adverts",
  },

  {
    name: "Events",
    image: "/categories/events.jpg",
    route: "/adverts?type=event",
  },

  {
    name: "Job Opportunities",
    image: "/categories/jobs.jpg",
    route: "/adverts?type=job",
  },

  {
    name: "Market Businesses",
    image: "/categories/business.jpg",
    route: "/adverts?type=business",
  },
];

export default function CategoryScroller() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.5,
      }}
    >
      {/* SECTION TITLE */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          Browse Categories
        </Typography>

        <Typography
          sx={{
            color: GOLD,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Explore →
        </Typography>
      </Box>

      {/* CATEGORY SCROLLER */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 1.5,

          scrollBehavior: "smooth",

          "&::-webkit-scrollbar": {
            display: "none",
          },

          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((category) => (
          <Box
            key={category.name}
            onClick={() => navigate(category.route)}
            sx={{
              minWidth: 78,
              flexShrink: 0,
              textAlign: "center",
              cursor: "pointer",

              transition: "all .25s ease",

              "&:hover": {
                transform: "translateY(-3px)",
              },
            }}
          >
            {/* IMAGE CIRCLE */}
            <Box
              sx={{
                width: 64,
                height: 64,

                mx: "auto",

                borderRadius: "50%",
                overflow: "hidden",

                border: `2px solid ${GOLD}`,

                background: "#111",

                boxShadow:
                  "0 3px 12px rgba(244,180,0,.15)",

                transition: "all .25s ease",

                "&:hover": {
                  boxShadow:
                    "0 0 20px rgba(244,180,0,.45)",

                  borderColor: "#FFD54F",
                },
              }}
            >
              <Box
                component="img"
                src={category.image}
                alt={category.name}
                loading="lazy"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* NAME */}
            <Typography
              sx={{
                color: "#fff",

                fontSize: 10,

                fontWeight: 700,

                mt: 0.8,

                lineHeight: 1.2,
              }}
            >
              {category.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}