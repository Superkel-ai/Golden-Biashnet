// src/components/GBButton.js

import React from "react";
import { Button, CircularProgress } from "@mui/material";

const COLORS = {
  GOLD: "#F4B400",
  GOLD_LIGHT: "#FFD54F",
  TEXT_DARK: "#000000"
};

export default function GBButton({
  children,
  loading = false,
  sx = {},
  ...props
}) {

  return (
    <Button
      {...props}
      variant="contained"
      disabled={loading || props.disabled}
      sx={{
        backgroundColor: COLORS.GOLD,
        color: COLORS.TEXT_DARK,

        fontWeight: 700,
        textTransform: "none",

        borderRadius: "10px",
        padding: "12px",

        boxShadow: "0 0 12px rgba(244,180,0,0.3)",

        "&:hover": {
          backgroundColor: COLORS.GOLD_LIGHT,
          boxShadow: "0 0 18px rgba(244,180,0,0.5)"
        },

        "&.Mui-disabled": {
          backgroundColor: "#333",
          color: "#888"
        },

        ...sx
      }}
    >
      {loading
        ? <CircularProgress size={22} sx={{ color: "#000" }} />
        : children
      }
    </Button>
  );
}