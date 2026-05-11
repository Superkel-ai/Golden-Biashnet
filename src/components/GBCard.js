import React from "react";
import { Card, Box } from "@mui/material";

const COLORS = {
  CARD: "#111111",
  BORDER: "#2A2A2A",
  GOLD: "#F4B400",
  TEXT: "#FFFFFF"
};

export default function GBCard({
  children,
  sx = {},
  hover = true,
  image,
  imageHeight = 140,
  ...props
}) {

  return (
    <Card
      {...props}
      sx={{
        backgroundColor: COLORS.CARD,
        color: COLORS.TEXT,
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: "14px",

        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // 🔥 IMPORTANT for images

        height: "100%", // 🔥 makes grid cards equal height

        transition: "all 0.25s ease",

        ...(hover && {
          "&:hover": {
            border: `1px solid ${COLORS.GOLD}`,
            transform: "translateY(-4px)"
          }
        }),

        // TEXT CONTROL
        "& .MuiTypography-root": {
          color: COLORS.TEXT
        },

        "& .MuiChip-label": {
          color: COLORS.TEXT
        },

        ...sx
      }}
    >

      {/* ================= IMAGE ================= */}

      {image && (
        <Box
          sx={{
            width: "100%",
            height: imageHeight,
            overflow: "hidden",
            background: "#000"
          }}
        >
          <Box
            component="img"
            src={image}
            alt="card"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // 🔥 KEY FIX
              display: "block"
            }}
          />
        </Box>
      )}

      {/* ================= CONTENT ================= */}

      <Box
        sx={{
          p: 1.2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1, // 🔥 fills remaining space
          gap: 0.5
        }}
      >
        {children}
      </Box>

    </Card>
  );
}