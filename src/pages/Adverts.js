// src/pages/Adverts.js

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
  Button,
  Skeleton,
} from "@mui/material";

import {
  Home as HomeIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility,
  Bolt,
  Verified,
  Campaign,
} from "@mui/icons-material";

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

/* ================= TIME ================= */

const timeAgo = (timestamp) => {

  if (!timestamp?.seconds) return "Recently";

  const now = Date.now();
  const created = timestamp.seconds * 1000;

  const diff = now - created;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return `${days}d ago`;

};

/* ================= CARD ================= */

const AdvertCard = ({ ad }) => {

  const navigate = useNavigate();

  const image = getImage(ad);

  return (

    <Box
      onClick={() => navigate(`/post/advert/${ad.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${ad.promoted ? GOLD : BORDER}`,
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.25s",
        display: "flex",
        flexDirection: "column",
        position: "relative",

        boxShadow: ad.promoted
          ? "0 0 20px rgba(244,180,0,.15)"
          : "none",

        "&:hover": {
          borderColor: GOLD,
          transform: "translateY(-3px)",
        },
      }}
    >

      {/* IMAGE */}

      <Box
        sx={{
          width: "100%",
          aspectRatio: "1/1",
          background: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >

        <Box
          component="img"
          src={image}
          alt={ad.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />

        {/* OVERLAY */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,.8), transparent)",
          }}
        />

        {/* PROMOTED */}

        {ad.promoted && (

          <Chip
            label="PROMOTED"
            size="small"
            icon={<Bolt sx={{ color: "#000 !important" }} />}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              background: GOLD,
              color: "#000",
              fontWeight: "bold",
              height: 22,
            }}
          />

        )}

      </Box>

      {/* CONTENT */}

      <Box sx={{ p: 1.2, flex: 1 }}>

        {/* CATEGORY */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >

          <Chip
            label={ad.advertType}
            size="small"
            sx={{
              background: "#222",
              color: GOLD,
              fontSize: 10,
              height: 20,
            }}
          />

          <Typography
            sx={{
              color: "#777",
              fontSize: 10,
            }}
          >
            {timeAgo(ad.createdAt)}
          </Typography>

        </Box>

        {/* TITLE */}

        <Typography
          sx={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            mt: 1,

            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: 34,
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
              mt: 0.5,
            }}
          >
            📍 {ad.location}
          </Typography>

        )}

        {/* PRICE */}

        {(ad.price || ad.salary) && (

          <Typography
            sx={{
              color: GOLD,
              fontSize: 13,
              fontWeight: "bold",
              mt: 0.6,
            }}
          >
            {ad.salary
              ? `KES ${Number(ad.salary).toLocaleString()}`
              : `KES ${Number(ad.price).toLocaleString()}`}
          </Typography>

        )}

        {/* ENGAGEMENT */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 1,
          }}
        >

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Visibility sx={{ fontSize: 14, color: "#777" }} />
            <Typography sx={{ color: "#777", fontSize: 10 }}>
              {ad.views || 0}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Campaign sx={{ fontSize: 14, color: "#777" }} />
            <Typography sx={{ color: "#777", fontSize: 10 }}>
              {ad.clicks || 0}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Verified sx={{ color: GOLD, fontSize: 15 }} />

        </Box>

      </Box>

    </Box>

  );

};

/* ================= SKELETON ================= */

const SkeletonCard = () => (

  <Box
    sx={{
      background: CARD,
      borderRadius: 3,
      overflow: "hidden",
      border: `1px solid ${BORDER}`,
    }}
  >
    <Skeleton
      variant="rectangular"
      width="100%"
      height={180}
      sx={{ bgcolor: "#222" }}
    />

    <Box sx={{ p: 1 }}>
      <Skeleton width="40%" sx={{ bgcolor: "#222" }} />
      <Skeleton width="90%" sx={{ bgcolor: "#222" }} />
      <Skeleton width="60%" sx={{ bgcolor: "#222" }} />
    </Box>
  </Box>

);

/* ================= PAGE ================= */

export default function AdvertsPage() {

  const navigate = useNavigate();

  const [adverts, setAdverts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [promoted, setPromoted] = useState([]);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

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

        setPromoted(
          data.filter((a) => a.promoted)
        );

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

      result = result.filter(
        (a) => a.advertType === filter
      );

    }

    if (search) {

      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(search.toLowerCase()) ||
          a.location?.toLowerCase().includes(search.toLowerCase())
      );

    }

    setFiltered(
      result.filter((a) => !a.promoted)
    );

  }, [search, filter, adverts]);

  /* ================= STATS ================= */

  const stats = useMemo(() => {

    return {
      total: adverts.length,
      jobs: adverts.filter(
        (a) => a.advertType === "Job Opportunity"
      ).length,

      events: adverts.filter(
        (a) => a.advertType === "Event"
      ).length,

      business: adverts.filter(
        (a) => a.advertType === "Business Advertisement"
      ).length,
    };

  }, [adverts]);

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 12,
      }}
    >

      {/* HERO */}

      <Box
        sx={{
          p: 2,
        }}
      >

        <Box
          sx={{
            background:
              "linear-gradient(135deg,#111,#1b1b1b)",
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            p: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >

          <Box
            sx={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(244,180,0,.08)",
              top: -80,
              right: -80,
            }}
          />

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            Explore Adverts
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              mt: 1,
              fontSize: 13,
              maxWidth: 500,
            }}
          >
            Discover events, businesses, jobs, and opportunities around you.
          </Typography>

          {/* STATS */}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              flexWrap: "wrap",
            }}
          >

            <Chip
              label={`${stats.total} Total`}
              sx={{
                background: "#222",
                color: "#fff",
              }}
            />

            <Chip
              label={`${stats.events} Events`}
              sx={{
                background: "#222",
                color: "#fff",
              }}
            />

            <Chip
              label={`${stats.jobs} Jobs`}
              sx={{
                background: "#222",
                color: "#fff",
              }}
            />

            <Chip
              label={`${stats.business} Businesses`}
              sx={{
                background: "#222",
                color: "#fff",
              }}
            />

          </Box>

          {/* CTA */}

          <Button
            onClick={() => navigate("/uploads")}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              mt: 3,
              background:
                "linear-gradient(45deg,#F4B400,#FFD54F)",
              color: "#000",
              fontWeight: "bold",
              borderRadius: 3,
              px: 3,
              py: 1,
              "&:hover": {
                background:
                  "linear-gradient(45deg,#FFD54F,#F4B400)",
              },
            }}
          >
            Upload Advert
          </Button>

        </Box>

      </Box>

      {/* QUICK LINKS */}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >

        {[
          {
            label: "Houses",
            icon: <HomeIcon />,
            route: "/houses",
          },
          {
            label: "Services",
            icon: <BuildIcon />,
            route: "/services",
          },
          {
            label: "Products",
            icon: <ShoppingCartIcon />,
            route: "/product",
          },
        ].map((item) => (

          <Box
            key={item.label}
            onClick={() => navigate(item.route)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "#181818",
              border: `1px solid ${BORDER}`,
              px: 2,
              py: 1,
              borderRadius: 3,
              minWidth: "fit-content",
              cursor: "pointer",

              "&:hover": {
                borderColor: GOLD,
              },
            }}
          >

            {item.icon}

            <Typography
              sx={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {item.label}
            </Typography>

          </Box>

        ))}

      </Box>

      {/* SEARCH */}

      <Box sx={{ px: 2, mt: 2 }}>

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

            sx: {
              background: "#181818",
              color: "#fff",
              borderRadius: 3,
            },
          }}
        />

      </Box>

      {/* FILTER CHIPS */}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          px: 2,
          mt: 2,
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >

        {filters.map((f) => (

          <Chip
            key={f}
            label={f}
            onClick={() => setFilter(f)}
            sx={{
              background:
                filter === f ? GOLD : "#181818",

              color:
                filter === f ? "#000" : "#fff",

              fontWeight: "bold",
              borderRadius: 2,
            }}
          />

        ))}

      </Box>

      {/* PROMOTED */}

      {promoted.length > 0 && (

        <Box sx={{ mt: 3 }}>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              px: 2,
              mb: 1,
            }}
          >
            ⭐ Promoted Adverts
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              overflowX: "auto",
              px: 2,

              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >

            {promoted.map((ad) => (

              <Box
                key={ad.id}
                sx={{
                  minWidth: 180,
                }}
              >
                <AdvertCard ad={ad} />
              </Box>

            ))}

          </Box>

        </Box>

      )}

      {/* GRID */}

      <Box
        sx={{
          mt: 3,
          px: 2,

          display: "grid",

          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            sm: "repeat(3,1fr)",
            md: "repeat(4,1fr)",
          },

          gap: 1.5,
        }}
      >

        {loading ? (

          [...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))

        ) : filtered.length > 0 ? (

          filtered.map((ad) => (
            <AdvertCard key={ad.id} ad={ad} />
          ))

        ) : (

          <Box
            sx={{
              gridColumn: "1/-1",
              textAlign: "center",
              py: 8,
            }}
          >

            <Typography
              sx={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              No adverts found
            </Typography>

            <Typography
              sx={{
                color: "#777",
                mt: 1,
                fontSize: 13,
              }}
            >
              Be the first to upload an advert
            </Typography>

            <Button
              onClick={() => navigate("/uploads")}
              sx={{
                mt: 2,
                background: GOLD,
                color: "#000",
                fontWeight: "bold",
                "&:hover": {
                  background: "#FFD54F",
                },
              }}
            >
              Upload Advert
            </Button>

          </Box>

        )}

      </Box>

      {/* FLOATING BUTTON */}

      <Fab
        onClick={() => navigate("/uploads")}
        sx={{
          position: "fixed",
          bottom: 85,
          right: 16,

          width: 62,
          height: 62,

          background:
            "linear-gradient(45deg,#F4B400,#FFD54F)",

          color: "#000",

          boxShadow:
            "0 10px 30px rgba(244,180,0,.35)",

          zIndex: 1200,

          "&:hover": {
            transform: "scale(1.05)",
            background:
              "linear-gradient(45deg,#FFD54F,#F4B400)",
          },
        }}
      >
        <AddIcon />
      </Fab>

    </Box>

  );

}