// src/pages/Houses.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../services/firebase";

/* ================= THEME ================= */
const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

/* ================= FORMAT PRICE ================= */
const formatPrice = (rent) =>
  rent ? `KES ${Number(rent).toLocaleString()}` : "";

/* ================= IMAGE ================= */
const getImage = (house) =>
  house.images?.[0]?.thumb ||
  house.images?.[0]?.full ||
  house.images?.[0] ||
  null;

/* ================= HOUSE CARD ================= */
const HouseCard = ({ house }) => {
  const navigate = useNavigate();
  const image = getImage(house);
  if (!image) return null;

  return (
    <Box
      onClick={() => navigate(`/post/house/${house.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { borderColor: GOLD, transform: "translateY(-2px)" },
      }}
    >
      {/* IMAGE */}
      <Box sx={{ width: "100%", aspectRatio: "1/1" }}>
        <Box
          component="img"
          src={image}
          alt={house.title}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: "6px" }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "#fff",
            fontWeight: 600,
            height: "28px",
            overflow: "hidden",
          }}
        >
          {house.title}
        </Typography>

        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 13 }}>
          {formatPrice(house.rent)} / month
        </Typography>

        {house.location && (
          <Typography sx={{ fontSize: 11, color: "#888" }}>
            📍 {house.location}
          </Typography>
        )}

        <Typography sx={{ fontSize: 11, color: "#aaa" }}>
          {house.bedrooms || 0} Bed • {house.bathrooms || 0} Bath
        </Typography>
      </Box>
    </Box>
  );
};

/* ================= PAGE ================= */
export default function HousesPage() {
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const q = query(
          collection(db, "houses"),
          where("status", "in", ["available", "approved"]),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHouses(data);
        setFiltered(data);

        // categories based on bedrooms
        const cats = ["All", ...new Set(data.map((h) => `${h.bedrooms || 0} Bedroom`))];
        setCategories(cats);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = houses;

    if (selectedCategory !== "All") {
      result = result.filter(
        (h) => `${h.bedrooms || 0} Bedroom` === selectedCategory
      );
    }

    if (search) {
      result = result.filter(
        (h) =>
          h.title?.toLowerCase().includes(search.toLowerCase()) ||
          h.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, selectedCategory, houses]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, pb: 4 }}>

      {/* 🔥 HEADER */}
      <Box sx={{ px: 1.5, pt: 2 }}>
        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18 }}>
          Find Your Perfect Home
        </Typography>
        <Typography sx={{ color: "#aaa", fontSize: 12 }}>
          Browse available houses near you
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
            onClick={() => navigate("/adverts")}
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
            <CampaignIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              Adverts
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

      {/* 🔍 SEARCH */}
      <Box sx={{ px: 1, mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by location or title..."
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

      {/* 🏷 CATEGORY */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          px: 1,
          py: 2,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {categories.map((cat) => (
          <Box
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            sx={{
              px: 2,
              py: 0.6,
              borderRadius: 2,
              background: selectedCategory === cat ? GOLD : "#222",
              color: selectedCategory === cat ? "#000" : "#fff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </Box>
        ))}
      </Box>

      {/* 🏠 GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "8px",
          px: "6px",
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))
        ) : (
          <Typography sx={{ color: "#888", mt: 4 }}>
            No houses found
          </Typography>
        )}
      </Box>

    </Box>
  );
}