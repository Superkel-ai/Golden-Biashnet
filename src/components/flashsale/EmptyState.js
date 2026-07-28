import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";

const GOLD = "#F4B400";

export default function EmptyState() {
  return (
    <Paper
      sx={{
        p: 5,
        textAlign: "center",
        bgcolor: "#111",
        border: "1px solid #222",
        borderRadius: 3
      }}
    >
      <Inventory2Icon
        sx={{
          fontSize: 60,
          color: GOLD,
          mb: 2
        }}
      />

      <Typography
        variant="h5"
        fontWeight={700}
        color="white"
      >
        No Products Found
      </Typography>

      <Typography
        sx={{
          color: "#aaa",
          mt: 1,
          mb: 3
        }}
      >
        Upload products to start creating flash sales.
      </Typography>

      <Button
        variant="contained"
        sx={{
          bgcolor: GOLD,
          color: "#000",
          fontWeight: 700
        }}
      >
        Upload Products
      </Button>
    </Paper>
  );
}