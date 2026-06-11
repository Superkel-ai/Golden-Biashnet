import React, { useState, useMemo } from "react";

import {
  Box,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Inventory2Icon from "@mui/icons-material/Inventory2";

const GOLD = "#F4B400";

export default function Description({ product }) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const description = useMemo(() => {
    const raw = product?.description;

    if (!raw) return "No description provided.";

    if (typeof raw === "string") return raw;

    return String(raw);
  }, [product]);

  const isLong = description.length > 350;

  const displayText =
    expanded || !isLong
      ? description
      : description.slice(0, 350) + "...";

  const createdAt =
    product?.createdAt?.seconds
      ? new Date(product.createdAt.seconds * 1000)
      : null;

  const postedDate = createdAt
    ? createdAt.toLocaleDateString()
    : "Unknown";

  const deliveryFee =
    Number(product?.deliveryFee || 0);

  return (
    <Box
      sx={{
        mt: 2,
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #222",
        bgcolor: "#111",
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <DescriptionIcon sx={{ color: GOLD }} />

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Product Details
          </Typography>
        </Stack>

        <IconButton sx={{ color: GOLD }}>
          {open ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </IconButton>
      </Box>

      <Collapse in={open}>

        <Divider sx={{ borderColor: "#222" }} />

        {/* =====================================
            DESCRIPTION
        ===================================== */}

        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Description
          </Typography>

          <Typography
            sx={{
              color: "#ccc",
              lineHeight: 1.9,
              fontSize: 14,
              whiteSpace: "pre-wrap",
            }}
          >
            {displayText}
          </Typography>

          {isLong && (
            <Typography
              onClick={() =>
                setExpanded(!expanded)
              }
              sx={{
                mt: 1.5,
                color: GOLD,
                fontWeight: 700,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              {expanded
                ? "Show Less"
                : "Read More"}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "#1f1f1f" }} />

        {/* =====================================
            SPECIFICATIONS
        ===================================== */}

        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mb={2}
          >
            <Inventory2Icon
              sx={{ color: GOLD }}
            />

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Specifications
            </Typography>
          </Stack>

          <Stack spacing={1.2}>
            <InfoRow
              label="Product ID"
              value={product?.id}
            />

            <InfoRow
              label="Category"
              value={product?.category}
            />

            <InfoRow
              label="Condition"
              value={
                product?.condition ||
                "Not specified"
              }
            />

            <InfoRow
              label="Location"
              value={
                product?.location ||
                "Not specified"
              }
            />

            <InfoRow
              label="Stock"
              value={
                product?.stock
                  ? `${product.stock} Available`
                  : "Contact Seller"
              }
            />

            <InfoRow
              label="Delivery Fee"
              value={
                deliveryFee > 0
                  ? `KES ${deliveryFee.toLocaleString()}`
                  : "Not specified"
              }
            />

            <InfoRow
              label="Posted"
              value={postedDate}
            />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#1f1f1f" }} />

        {/* =====================================
            SELLER INFO
        ===================================== */}

        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Seller Information
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 14,
            }}
          >
            {product?.sellerName ||
              "Golden Biashnet Seller"}
          </Typography>

          <Typography
            sx={{
              color: "#666",
              fontSize: 12,
              mt: 0.5,
            }}
          >
            Seller ID:{" "}
            {product?.sellerId || "N/A"}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#1f1f1f" }} />

        {/* =====================================
            DELIVERY
        ===================================== */}

        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 1,
            }}
          >
            Delivery & Payment
          </Typography>

          <Typography
            sx={{
              color: "#999",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            Orders are processed through
            Golden Biashnet Service Providers.
            Delivery charges may apply
            depending on location.
          </Typography>
        </Box>

      </Collapse>
    </Box>
  );
}

/* =========================================
   INFO ROW COMPONENT
========================================= */

function InfoRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Typography
        sx={{
          color: "#777",
          fontSize: 13,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value || "N/A"}
      </Typography>
    </Stack>
  );
}