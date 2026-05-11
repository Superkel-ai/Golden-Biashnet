// src/components/GBInput.js

import React from "react";
import { TextField } from "@mui/material";

const COLORS = {
  BG: "#111111",
  BORDER: "#333333",
  GOLD: "#F4B400",
  TEXT: "#FFFFFF",
  PLACEHOLDER: "#888888"
};

export default function GBInput(props) {

  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      sx={{

        "& .MuiOutlinedInput-root": {

          backgroundColor: COLORS.BG,
          color: COLORS.TEXT,

          borderRadius: "10px",

          "& fieldset": {
            borderColor: COLORS.BORDER
          },

          "&:hover fieldset": {
            borderColor: COLORS.GOLD
          },

          "&.Mui-focused fieldset": {
            borderColor: COLORS.GOLD,
            borderWidth: "2px"
          }

        },

        "& .MuiInputBase-input": {
          color: COLORS.TEXT
        },

        "& .MuiInputLabel-root": {
          color: COLORS.PLACEHOLDER
        },

        "& .MuiInputLabel-root.Mui-focused": {
          color: COLORS.GOLD
        }

      }}
    />
  );
}