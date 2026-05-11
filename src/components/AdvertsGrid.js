import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  MenuItem,
  TextField
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../services/firebase";

// THEME
const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

const filters = [
  "All",
  "Event",
  "Business Advertisement",
  "Job Opportunity",
];

export default function AdvertsPage() {

  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {

    const fetchAdverts = async () => {

      try {
        const q = query(
          collection(db, "adverts"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAdverts(list);

      } catch (err) {
        console.error("Advert fetch error:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchAdverts();

  }, []);

  const filteredAdverts =
    filter === "All"
      ? adverts
      : adverts.filter(a => a.advertType === filter);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: BG
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        px: 1.5,
        pb: 4
      }}
    >

      {/* HEADER */}
      <Typography
        sx={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: "20px",
          my: 2
        }}
      >
        Explore Adverts
      </Typography>

      {/* FILTER */}
      <TextField
        select
        fullWidth
        size="small"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{
          mb: 2,
          input: { color: "#fff" },
          "& .MuiOutlinedInput-root": {
            background: "#111",
            "& fieldset": { borderColor: "#333" },
            "&:hover fieldset": { borderColor: GOLD },
            "&.Mui-focused fieldset": { borderColor: GOLD }
          }
        }}
      >
        {filters.map((f) => (
          <MenuItem key={f} value={f}>
            {f}
          </MenuItem>
        ))}
      </TextField>

      {/* 🔥 JUMIA GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",   // 🔥 mobile (KEY)
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)"
          },
          gap: 1.2
        }}
      >

        {filteredAdverts.map((ad) => {

          const image =
            ad.images?.length > 0
              ? ad.images[0].full
              : "/placeholder.jpg";

          return (

            <Box
              key={ad.id}
              onClick={() => navigate(`/post/advert/${ad.id}`)}
              sx={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                transition: "0.2s",
                display: "flex",
                flexDirection: "column",

                "&:hover": {
                  borderColor: GOLD,
                  transform: "translateY(-3px)"
                }
              }}
            >

              {/* 🔥 IMAGE (FIXED SQUARE) */}
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1/1", // 🔥 KEY FIX
                  overflow: "hidden",
                  background: "#000"
                }}
              >
                <img
                  src={image}
                  alt="advert"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </Box>

              {/* CONTENT */}
              <Box sx={{ p: 1 }}>

                {/* TYPE */}
                <Chip
                  label={ad.advertType}
                  size="small"
                  sx={{
                    background: GOLD,
                    color: "#000",
                    fontSize: 10,
                    height: 20,
                    mb: 0.5
                  }}
                />

                {/* PROMOTED */}
                {ad.promoted && (
                  <Chip
                    label="Promoted"
                    size="small"
                    sx={{
                      ml: 0.5,
                      background: "#ff9800",
                      color: "#000",
                      fontSize: 10,
                      height: 20
                    }}
                  />
                )}

                {/* TITLE (CLAMPED) */}
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    mt: 0.5,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {ad.title}
                </Typography>

                {/* LOCATION */}
                {ad.location && (
                  <Typography
                    sx={{
                      color: "#aaa",
                      fontSize: 11,
                      mt: 0.5
                    }}
                  >
                    📍 {ad.location}
                  </Typography>
                )}

                {/* PRICE / SALARY */}
                {(ad.price || ad.salary) && (
                  <Typography
                    sx={{
                      color: GOLD,
                      fontSize: 12,
                      fontWeight: "bold",
                      mt: 0.5
                    }}
                  >
                    {ad.salary
                      ? `KES ${ad.salary}`
                      : `KES ${ad.price}`}
                  </Typography>
                )}

              </Box>

            </Box>

          );

        })}

      </Box>

    </Box>
  );
}