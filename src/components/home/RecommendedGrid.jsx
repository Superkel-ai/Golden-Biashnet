// src/components/home/RecommendedGrid.js

import React from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useNavigate } from "react-router-dom";

import SmallProductCard from "./SmallProductCard";

const GOLD = "#F4B400";

export default function RecommendedGrid({
  products = [],
}) {
  const navigate = useNavigate();

  if (!products?.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* HEADER */}
      <Box
        sx={{
          px: 1.5,
          mb: 1.5,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
          You May Also Like
          </Typography>

          <Typography
            sx={{
              color: "#888",
              fontSize: 11,
            }}
          >
            Trending products from trusted sellers
          </Typography>
        </Box>

        <Button
          size="small"
          endIcon={<ChevronRightIcon />}
          onClick={() =>
            navigate("/InfiniteProducts")
          }
          sx={{
            color: GOLD,
            fontWeight: 600,
          }}
        >
          View All
        </Button>
      </Box>

     {/* HORIZONTAL SCROLL */}
<Box
  sx={{
    px: 1,

    display: "flex",
    gap: 1.2,

    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",

    "&::-webkit-scrollbar": {
      display: "none",
    },
  }}
>
  {products.slice(0, 10).map((product) => (
    <Box
      key={product.id}
      sx={{
        minWidth: {
          xs: "45%",
          sm: "30%",
          md: "22%",
        },

        flexShrink: 0,
        scrollSnapAlign: "start",

        display: "flex",
        justifyContent: "center",
      }}
    >
      <SmallProductCard product={product} />
    </Box>
  ))}
</Box>
      {/* Bottom CTA */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() =>
            navigate("/InfiniteProducts")
          }
          sx={{
            borderColor: GOLD,
            color: GOLD,

            "&:hover": {
              borderColor: GOLD,
              bgcolor:
                "rgba(244,180,0,0.08)",
            },
          }}
        >
          Browse More Products
        </Button>
      </Box>
    </Box>
  );
}