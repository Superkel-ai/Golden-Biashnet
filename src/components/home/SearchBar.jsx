// src/components/home/SearchBar.js

import React, {
  useState,
  useMemo,
} from "react";

import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

export default function SearchBar({
  products = [],
}) {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];

    return products
      .filter((item) =>
        item.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .slice(0, 6);
  }, [search, products]);

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(
      `/search?q=${encodeURIComponent(
        search
      )}`
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        px: 1.5,
        pt: 1.5,
        mb: 2,
      }}
    >
      {/* SEARCH INPUT */}
      <TextField
        fullWidth
        value={search}
        placeholder="Search for products, services, houses..."
        onChange={(e) =>
          setSearch(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        size="small"
        InputProps={{
          sx: {
            bgcolor: "#111",

            borderRadius: 3,

            color: "#fff",

            "& fieldset": {
              borderColor: "#222",
            },

            "&:hover fieldset": {
              borderColor: GOLD,
            },

            "&.Mui-focused fieldset": {
              borderColor: GOLD,
            },
          },

          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color: GOLD,
                }}
              />
            </InputAdornment>
          ),

          endAdornment: (
            <InputAdornment position="end">
              {search && (
                <IconButton
                  size="small"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  <CloseIcon
                    sx={{
                      color:
                        "#888",
                    }}
                  />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      {/* SUGGESTIONS */}
      {suggestions.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            mt: 0.5,

            bgcolor: "#111",

            border:
              "1px solid #222",

            borderRadius: 3,

            overflow: "hidden",

            position:
              "absolute",

            left: 12,

            right: 12,

            zIndex: 100,
          }}
        >
          {suggestions.map(
            (item) => (
              <Box
                key={item.id}
                onClick={() =>
                  navigate(
                    `/post/product/${item.id}`
                  )
                }
                sx={{
                  px: 2,
                  py: 1.2,

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: 1,

                  borderBottom:
                    "1px solid #222",

                  "&:hover": {
                    bgcolor:
                      "#1a1a1a",
                  },
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color:
                      GOLD,
                    fontSize: 18,
                  }}
                />

                <Typography
                  sx={{
                    color:
                      "#fff",
                    fontSize: 13,
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            )
          )}
        </Paper>
      )}
    </Box>
  );
}