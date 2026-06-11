// src/components/home/ProductRow.js

import React, { useRef } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import SmallProductCard from "./SmallProductCard";

const GOLD = "#F4B400";



function ProductRow({
  title,
  subtitle,
  products = [],
  onViewAll,
}) {
  const scrollRef = useRef();

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  if (!products?.length) return null;

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          px: 1.5,
          mb: 1.2,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#888",
              fontSize: 11,
            }}
          >
            {subtitle ||
              `${products.length} products available`}
          </Typography>
        </Box>

        <Button
          size="small"
          endIcon={<ChevronRightIcon />}
          onClick={onViewAll}
          sx={{
            color: GOLD,
            fontWeight: 600,
            minWidth: "auto",
          }}
        >
          View All
        </Button>
      </Box>

      {/* WRAPPER */}
      <Box
        sx={{
          position: "relative",
        }}
      >
        {/* LEFT ARROW */}
        {!isMobile && (
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              position: "absolute",
              left: 5,
              top: "40%",
              zIndex: 3,

              bgcolor: "#111",

              color: "#fff",

              "&:hover": {
                bgcolor: GOLD,
                color: "#000",
              },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* RIGHT ARROW */}
        {!isMobile && (
          <IconButton
            onClick={() => scroll("right")}
            sx={{
              position: "absolute",
              right: 5,
              top: "40%",
              zIndex: 3,

              bgcolor: "#111",

              color: "#fff",

              "&:hover": {
                bgcolor: GOLD,
                color: "#000",
              },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}

        {/* LEFT FADE */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,

            width: 25,

            zIndex: 2,

            pointerEvents: "none",

            background:
              "linear-gradient(to right, #000, transparent)",
          }}
        />

        {/* RIGHT FADE */}
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,

            width: 25,

            zIndex: 2,

            pointerEvents: "none",

            background:
              "linear-gradient(to left, #000, transparent)",
          }}
        />

        {/* PRODUCTS */}
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",

            gap: 1.2,

            px: 1.5,

            overflowX: "auto",

            scrollBehavior: "smooth",

            scrollSnapType: "x mandatory",

            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                scrollSnapAlign: "start",
              }}
            >
              <SmallProductCard
                product={product}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default React.memo(ProductRow);