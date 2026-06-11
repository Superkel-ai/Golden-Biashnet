import React from "react";

import {
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";

import {
  Category,
  LocationOn,
  Bolt,
  AccessTime,
  TrendingUp,
  Person,
  Inventory2,
  WorkspacePremium,
} from "@mui/icons-material";

import SellerBadge from "../home/SellerBadge";

const GOLD = "#F4B400";

/* =========================================================
   SAFE HELPERS
========================================================= */

const safeText = (value, fallback = "") =>
  (typeof value === "string" ? value.trim() : value) || fallback;

/* =========================================================
   HEADER
========================================================= */

export default function Header({ product }) {
  if (!product) return null;

  const title = safeText(
    product?.title,
    "Untitled Product"
  );

  const category = safeText(
    product?.category,
    "Product"
  );

  const sellerName = safeText(
    product?.sellerName,
    "Golden Biashnet Seller"
  );

  const location = safeText(
    product?.location,
    "Kenya"
  );

  const views = Number(
    product?.views || 0
  );

  const stock = Number(
    product?.stock || 0
  );

  const createdAt =
    product?.createdAt?.seconds
      ? new Date(
          product.createdAt.seconds * 1000
        )
      : null;

  const daysAgo = createdAt
    ? Math.floor(
        (Date.now() -
          createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isTrending =
    views > 100;

  const isFlashSale =
    product?.flashSale === true;

  const isPromoted =
    product?.promotion?.promoted === true;

  return (
    <Box sx={{ mt: 2 }}>

      {/* CATEGORY */}

      <Chip
        icon={<Category />}
        label={category}
        sx={{
          bgcolor: "#111",
          color: GOLD,
          border: "1px solid #222",
          fontWeight: 700,
          mb: 1.5,
        }}
      />

      {/* TITLE */}

      <Typography
        sx={{
          color: "#fff",
          fontWeight: 900,
          lineHeight: 1.2,
          fontSize: {
            xs: 24,
            md: 32,
          },
        }}
      >
        {title}
      </Typography>

      {/* SELLER */}

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <Avatar
          src={product?.sellerPhoto || ""}
          sx={{
            bgcolor: GOLD,
            color: "#000",
            width: 38,
            height: 38,
          }}
        >
          <Person />
        </Avatar>

        <Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {sellerName}
            </Typography>

            <SellerBadge
              sellerVerified={
                product?.sellerVerified
              }
              sellerBadge={
                product?.sellerBadge
              }
            />
          </Stack>

          <Typography
            sx={{
              color: "#777",
              fontSize: 12,
            }}
          >
            Trusted Marketplace Seller
          </Typography>

        </Box>
      </Stack>

      {/* META INFO */}

      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        sx={{ mt: 2 }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          <LocationOn
            sx={{
              fontSize: 16,
              color: GOLD,
            }}
          />

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 13,
            }}
          >
            {location}
          </Typography>
        </Stack>

        {daysAgo !== null && (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
          >
            <AccessTime
              sx={{
                fontSize: 16,
                color: GOLD,
              }}
            />

            <Typography
              sx={{
                color: "#aaa",
                fontSize: 13,
              }}
            >
              {daysAgo === 0
                ? "Posted Today"
                : `${daysAgo} day${
                    daysAgo > 1
                      ? "s"
                      : ""
                  } ago`}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* PRODUCT BADGES */}

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 2 }}
      >

        {isPromoted && (
          <Chip
            icon={
              <WorkspacePremium />
            }
            label="Promoted"
            sx={{
              bgcolor:
                "rgba(244,180,0,.12)",
              color: GOLD,
              border:
                "1px solid rgba(244,180,0,.3)",
              fontWeight: 700,
            }}
          />
        )}

        {isFlashSale && (
          <Chip
            icon={<Bolt />}
            label="Flash Sale"
            sx={{
              bgcolor:
                "rgba(255,23,68,.12)",
              color: "#FF1744",
              border:
                "1px solid rgba(255,23,68,.3)",
              fontWeight: 700,
            }}
          />
        )}

        {isTrending && (
          <Chip
            icon={<TrendingUp />}
            label="Trending"
            sx={{
              bgcolor:
                "rgba(244,180,0,.12)",
              color: GOLD,
              border:
                "1px solid rgba(244,180,0,.3)",
              fontWeight: 700,
            }}
          />
        )}

        {stock > 0 && (
          <Chip
            icon={<Inventory2 />}
            label={`${stock} In Stock`}
            sx={{
              bgcolor: "#111",
              color: "#fff",
              border:
                "1px solid #222",
              fontWeight: 700,
            }}
          />
        )}

      </Stack>

      {/* CONDITION */}

      {product?.condition && (
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              color: "#777",
              fontSize: 12,
            }}
          >
            Condition
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {product.condition}
          </Typography>
        </Box>
      )}

      <Divider
        sx={{
          borderColor: "#1f1f1f",
          mt: 3,
        }}
      />

    </Box>
  );
}