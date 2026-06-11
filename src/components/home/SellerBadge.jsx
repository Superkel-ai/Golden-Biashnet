// src/components/home/SellerBadge.js

import React from "react";
import { Box, Typography } from "@mui/material";

import VerifiedIcon from "@mui/icons-material/Verified";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const GOLD = "#F4B400";

function SellerBadge({
  sellerVerified,
  sellerBadge,
}) {
  if (!sellerVerified) return null;

  let bg = "#1B5E20";
  let color = "#4CAF50";
  let icon = (
    <VerifiedIcon
      sx={{
        fontSize: 12,
        color,
      }}
    />
  );
  let label = "Verified";

  switch (sellerBadge) {
    case "premium":
      bg = "#0D47A1";
      color = "#42A5F5";

      icon = (
        <WorkspacePremiumIcon
          sx={{
            fontSize: 12,
            color,
          }}
        />
      );

      label = "Premium";
      break;

    case "golden":
      bg = "rgba(244,180,0,0.15)";
      color = GOLD;

      icon = (
        <EmojiEventsIcon
          sx={{
            fontSize: 12,
            color,
          }}
        />
      );

      label = "Golden";
      break;

    default:
      break;
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,

        px: 0.8,
        py: 0.3,

        borderRadius: 10,

        background: bg,

        border: `1px solid ${color}`,

        maxWidth: "fit-content",
      }}
    >
      {icon}

      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default React.memo(SellerBadge);