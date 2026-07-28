import React, { useEffect, useState } from "react";

import {
  Paper,
  Grid,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  Chip,
  Stack,
  Button,
  Box
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

const GOLD = "#F4B400";

/* =========================
   MARKETPLACE FILTER PANEL
========================= */

export default function Filters({

  search = "",
  setSearch,

  category = "",
  setCategory,

  categories = [],

  flashFilter = "all",
  setFlashFilter,

  minPrice = "",
  setMinPrice,

  maxPrice = "",
  setMaxPrice,

}) {

  const [localSearch, setLocalSearch] = useState(search);

  /* =========================
     DEBOUNCE SEARCH
  ========================= */

  useEffect(() => {

    const delay = setTimeout(() => {
      setSearch(localSearch);
    }, 400);

    return () => clearTimeout(delay);

  }, [localSearch]);

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setLocalSearch("");
    setSearch("");
    setCategory("");
    setFlashFilter?.("all");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 4,
        background: "#111",
        border: "1px solid rgba(244,180,0,0.12)"
      }}
    >

      {/* ================= HEADER ================= */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          sx={{
            color: GOLD,
            fontWeight: 800,
            fontSize: 20
          }}
        >
          Flash Sale Filters
        </Typography>

        <Button
          size="small"
          onClick={clearFilters}
          sx={{
            color: "#aaa",
            border: "1px solid #333"
          }}
        >
          Clear
        </Button>
      </Stack>

      {/* ================= SEARCH ================= */}
      <TextField
        fullWidth
        placeholder="Search products..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            background: "#090909",
            color: "#fff",
            borderRadius: 3
          },
          "& fieldset": { borderColor: "#333" },
          "&:hover fieldset": { borderColor: GOLD },
          "&.Mui-focused fieldset": { borderColor: GOLD }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#777" }} />
            </InputAdornment>
          )
        }}
      />

      {/* ================= CATEGORY + FLASH FILTER ================= */}
      <Grid container spacing={2}>

        {/* CATEGORY */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "#090909",
                color: "#fff",
                borderRadius: 3
              },
              "& .MuiInputLabel-root": { color: "#888" },
              "& fieldset": { borderColor: "#333" }
            }}
          >
            <MenuItem value="">All Categories</MenuItem>

            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* FLASH STATUS */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Flash Status"
            value={flashFilter}
            onChange={(e) => setFlashFilter?.(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "#090909",
                color: "#fff",
                borderRadius: 3
              },
              "& .MuiInputLabel-root": { color: "#888" },
              "& fieldset": { borderColor: "#333" }
            }}
          >
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="active">Flash Sale Active</MenuItem>
            <MenuItem value="inactive">No Flash Sale</MenuItem>
          </TextField>
        </Grid>

      </Grid>

      {/* ================= PRICE FILTER ================= */}
      <Grid container spacing={2} mt={1}>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "#090909",
                color: "#fff",
                borderRadius: 3
              }
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "#090909",
                color: "#fff",
                borderRadius: 3
              }
            }}
          />
        </Grid>

      </Grid>

      {/* ================= QUICK CATEGORY CHIPS ================= */}
      <Box mt={2}>
        <Typography sx={{ color: "#888", fontSize: 12, mb: 1 }}>
          Quick Categories
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => setCategory(cat)}
              sx={{
                bgcolor: "#222",
                color: "#fff",
                "&:hover": { bgcolor: GOLD, color: "#000" }
              }}
            />
          ))}
        </Stack>
      </Box>

    </Paper>
  );
}