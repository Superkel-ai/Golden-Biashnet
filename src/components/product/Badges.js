import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import BoltIcon from "@mui/icons-material/Bolt";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShieldIcon from "@mui/icons-material/Shield";

const GOLD = "#F4B400";

/* =========================
   PRODUCT BADGES
   (TRUST + URGENCY LAYER)
========================= */

export default function ProductBadges({
  stock = 0,
  sellerVerified = false,
  isPromoted = false,
  flashSale = false,
  fastDelivery = false,
  rating = 0,
  reviewsCount = 0
}) {

  const inStock = stock > 0;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid #1f1f1f"
      }}
    >

      {/* =========================
          BADGES ROW
      ========================= */}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >

        {/* STOCK */}
        <Chip
          icon={<Inventory2Icon />}
          label={inStock ? `${stock} in stock` : "Out of stock"}
          sx={{
            background: inStock ? "#1a1a1a" : "#2a0f0f",
            color: inStock ? "#ddd" : "#ff5252",
            border: "1px solid #2a2a2a",
            fontWeight: 700,
            fontSize: 12
          }}
        />

        {/* VERIFIED SELLER */}
        {sellerVerified && (
          <Chip
            icon={<VerifiedIcon />}
            label="Verified Seller"
            sx={{
              background: "#102a18",
              color: "#4caf50",
              border: "1px solid #1e3d29",
              fontWeight: 700,
              fontSize: 12
            }}
          />
        )}

        {/* PROMOTED */}
        {isPromoted && (
          <Chip
            icon={<BoltIcon />}
            label="Promoted"
            sx={{
              background: "#1a1a1a",
              color: GOLD,
              border: "1px solid #333",
              fontWeight: 700,
              fontSize: 12
            }}
          />
        )}

        {/* FLASH SALE */}
        {flashSale && (
          <Chip
            icon={<BoltIcon />}
            label="Flash Sale"
            sx={{
              background: "linear-gradient(90deg,#ff1744,#ff9100)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 12,
              animation: "pulse 1.5s infinite"
            }}
          />
        )}

        {/* FAST DELIVERY */}
        {fastDelivery && (
          <Chip
            icon={<LocalShippingIcon />}
            label="Fast Delivery"
            sx={{
              background: "#111",
              color: "#90caf9",
              border: "1px solid #1f1f1f",
              fontWeight: 700,
              fontSize: 12
            }}
          />
        )}

      </Stack>

      {/* =========================
          TRUST SUMMARY LINE
      ========================= */}
      {(sellerVerified || rating > 0) && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1
          }}
        >

          {/* RATING */}
          <Typography
            sx={{
              fontSize: 12,
              color: "#aaa"
            }}
          >
            ⭐ {rating?.toFixed?.(1) || "0.0"} rating
          </Typography>

          {/* REVIEWS */}
          <Typography
            sx={{
              fontSize: 12,
              color: "#777"
            }}
          >
            {reviewsCount} reviews
          </Typography>

          {/* TRUST NOTE */}
          <Typography
            sx={{
              fontSize: 11,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 0.5
            }}
          >
            <ShieldIcon sx={{ fontSize: 14, color: GOLD }} />
            Secure marketplace protected
          </Typography>

        </Box>
      )}

      {/* =========================
          URGENCY MESSAGE
      ========================= */}
      {flashSale && (
        <Typography
          sx={{
            mt: 1.5,
            fontSize: 12,
            color: "#ff5252",
            fontWeight: 600
          }}
        >
          ⚡ Limited flash deal — price may change anytime
        </Typography>
      )}

    </Box>
  );
}