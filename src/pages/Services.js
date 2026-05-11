// src/pages/Services.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/Campaign";
import HomeIcon from "@mui/icons-material/Home";
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

/* ================= IMAGE ================= */
const getImage = (service) =>
  service.images?.[0]?.thumb ||
  service.images?.[0]?.full ||
  service.images?.[0] ||
  null;

/* ================= PRICE ================= */
const formatPrice = (price) =>
  price ? `KES ${Number(price).toLocaleString()}` : "";

/* ================= CARD ================= */
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const image = getImage(service);
  if (!image) return null;

  return (
    <Box
      onClick={() => navigate(`/post/service/${service.id}`)}
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
          alt={service.title}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: "6px" }}>
        {/* TITLE */}
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            height: "28px",
            overflow: "hidden",
          }}
        >
          {service.title}
        </Typography>

        {/* PROVIDER */}
        {service.name && (
          <Typography sx={{ fontSize: 11, color: "#aaa" }}>
            by {service.name}
          </Typography>
        )}

        {/* CATEGORY */}
        <Typography sx={{ fontSize: 10, color: "#777" }}>
          {service.category} • {service.subCategory}
        </Typography>

        {/* PRICE */}
        {service.price && (
          <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 13 }}>
            {formatPrice(service.price)}
          </Typography>
        )}

        {/* LOCATION */}
        {service.location && (
          <Typography sx={{ fontSize: 10, color: "#888" }}>
            📍 {service.location}
          </Typography>
        )}

        {/* SKILLS */}
        {service.skills?.length > 0 && (
          <Box sx={{ mt: 0.5, display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {service.skills.slice(0, 2).map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                size="small"
                sx={{
                  background: "#222",
                  color: "#ccc",
                  fontSize: "9px",
                  height: "18px",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ================= PAGE ================= */
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServices(data);
        setFiltered(data);

        // categories auto
        const cats = [
          "All",
          ...new Set(data.map((s) => s.category || "Other")),
        ];
        setCategories(cats);
      } catch (err) {
        console.error("Services fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = services;

    if (selectedCategory !== "All") {
      result = result.filter(
        (s) => (s.category || "Other") === selectedCategory
      );
    }

    if (search) {
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          s.category?.toLowerCase().includes(search.toLowerCase()) ||
          s.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, selectedCategory, services]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, pb: 4 }}>
      {/* HEADER */}
      <Box sx={{ px: 1.5, pt: 2 }}>
        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18 }}>
          Find Trusted Services
        </Typography>
        <Typography sx={{ color: "#aaa", fontSize: 12 }}>
          Hire professionals near you
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
          placeholder="Search services..."
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

      {/* CATEGORY BAR */}
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

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "8px",
          px: "6px",
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        ) : (
          <Typography sx={{ color: "#888", mt: 4 }}>
            No services found
          </Typography>
        )}
      </Box>
    </Box>
  );
}