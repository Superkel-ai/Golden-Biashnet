// src/pages/Adverts.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  MenuItem,
    TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../services/firebase";

/* ================= THEME ================= */
const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

/* ================= FILTERS ================= */
const filters = [
  "All",
  "Event",
  "Business Advertisement",
  "Job Opportunity",
];

/* ================= IMAGE ================= */
const getImage = (ad) =>
  ad.images?.[0]?.thumb ||
  ad.images?.[0]?.full ||
  ad.images?.[0] ||
  "/placeholder.jpg";

/* ================= CARD ================= */
const AdvertCard = ({ ad }) => {
  const navigate = useNavigate();
  const image = getImage(ad);

  return (
    <Box
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
        "&:hover": { borderColor: GOLD, transform: "translateY(-2px)" },
      }}
    >
      {/* IMAGE */}
      <Box sx={{ width: "100%", aspectRatio: "1/1", background: "#000" }}>
        <Box
          component="img"
          src={image}
          alt={ad.title}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: 1 }}>
        {/* TAGS */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          <Chip
            label={ad.advertType}
            size="small"
            sx={{
              background: GOLD,
              color: "#000",
              fontSize: 9,
              height: 18,
            }}
          />

          {ad.promoted && (
            <Chip
              label="Promoted"
              size="small"
              sx={{
                background: "#ff9800",
                color: "#000",
                fontSize: 9,
                height: 18,
              }}
            />
          )}
        </Box>

        {/* TITLE */}
        <Typography
          sx={{
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            mt: 0.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {ad.title}
        </Typography>

        {/* LOCATION */}
        {ad.location && (
          <Typography sx={{ color: "#aaa", fontSize: 10 }}>
            📍 {ad.location}
          </Typography>
        )}

        {/* PRICE */}
        {(ad.price || ad.salary) && (
          <Typography
            sx={{
              color: GOLD,
              fontSize: 12,
              fontWeight: "bold",
              mt: 0.3,
            }}
          >
            {ad.salary
              ? `KES ${Number(ad.salary).toLocaleString()}`
              : `KES ${Number(ad.price).toLocaleString()}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/* ================= PAGE ================= */
export default function AdvertsPage() {
  const [adverts, setAdverts] = useState([]);
  const navigate = useNavigate();
  const [filtered, setFiltered] = useState([]);
  const [promoted, setPromoted] = useState([]);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const q = query(
          collection(db, "adverts"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAdverts(data);

        // separate promoted
        const promo = data.filter((a) => a.promoted);
        const normal = data.filter((a) => !a.promoted);

        setPromoted(promo);
        setFiltered(normal);

      } catch (err) {
        console.error("Advert fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdverts();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = adverts;

    if (filter !== "All") {
      result = result.filter((a) => a.advertType === filter);
    }

    if (search) {
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(search.toLowerCase()) ||
          a.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result.filter((a) => !a.promoted));
  }, [search, filter, adverts]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center", background: BG }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, minHeight: "100vh", pb: 4 }}>

      {/* HEADER */}
      <Box sx={{ px: 1.5, pt: 2 }}>
        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18 }}>
          Explore Adverts
        </Typography>
        <Typography sx={{ color: "#aaa", fontSize: 12 }}>
          Events, jobs, and business promotions near you
        </Typography>
      </Box>
        <Box sx={{ px: 1.5, mt: 1 }}>
  <Typography
    sx={{
      color: "#aaa",
      fontSize: 12,
      mt: 0.5,
    }}
  >
    Buy, sell, and explore everything in one place
  </Typography>

  {/* Buttons */}
  <Box
    sx={{
      display: "flex",
      gap: 1,
      mt: 2,
      overflowX: "auto",
      "&::-webkit-scrollbar": { display: "none" },
    }}
  >
    {/* Houses */}
    <Box
      onClick={() => navigate("/houses")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        background: "#222",
        px: 2,
        py: 1,
        borderRadius: 2,
        cursor: "pointer",
        minWidth: "fit-content",
        transition: "0.2s",
        "&:hover": { background: GOLD, color: "#000" },
      }}
    >
      <HomeIcon sx={{ fontSize: 18 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
        Houses
      </Typography>
    </Box>

    {/* Services */}
    <Box
      onClick={() => navigate("/services")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        background: "#222",
        px: 2,
        py: 1,
        borderRadius: 2,
        cursor: "pointer",
        minWidth: "fit-content",
        transition: "0.2s",
        "&:hover": { background: GOLD, color: "#000" },
      }}
    >
      <BuildIcon sx={{ fontSize: 18 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
        Services
      </Typography>
    </Box>

    {/* Adverts */}
    <Box
      onClick={() => navigate("/product")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        background: "#222",
        px: 2,
        py: 1,
        borderRadius: 2,
        cursor: "pointer",
        minWidth: "fit-content",
        transition: "0.2s",
        "&:hover": { background: GOLD, color: "#000" },
      }}
    >
      <ShoppingCartIcon sx={{ fontSize: 18 }} />
      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
        Products
      </Typography>
    </Box>
  </Box>
</Box>

      {/* SEARCH */}
      <Box sx={{ px: 1, mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search adverts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon sx={{ color: GOLD }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { background: "#222", color: "#fff" },
          }}
        />
      </Box>

      {/* FILTER */}
      <Box sx={{ px: 1, mt: 2 }}>
        <TextField
          select
          fullWidth
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              background: "#111",
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: GOLD },
              "&.Mui-focused fieldset": { borderColor: GOLD },
            },
          }}
        >
          {filters.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* ⭐ PROMOTED */}
      {promoted.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ color: GOLD, fontWeight: "bold", px: 1 }}>
            ⭐ Promoted
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              px: 1,
              py: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {promoted.map((ad) => (
              <Box key={ad.id} sx={{ minWidth: 150 }}>
                <AdvertCard ad={ad} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* GRID */}
      <Box
        sx={{
          mt: 2,
          px: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 1.2,
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((ad) => <AdvertCard key={ad.id} ad={ad} />)
        ) : (
          <Typography sx={{ color: "#888", mt: 4 }}>
            No adverts found
          </Typography>
        )}
      </Box>
    </Box>
  );
}