import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore";

/* ================= THEME ================= */

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

/* ================= FORMAT PRICE ================= */

const formatPrice = (price) => {
  if (!price) return "";
  return "KES " + Number(price).toLocaleString();
};

/* ================= IMAGE ================= */

const getImage = (post) => {
  if (!post.images) return null;

  if (Array.isArray(post.images)) {
    return post.images[0]?.thumb || post.images[0]?.full || post.images[0];
  }

  if (post.image) {
    return post.image.thumb || post.image.full;
  }

  return null;
};

/* ================= COLLECTION MAP ================= */

const collectionsMap = {
  product: "products",
  service: "services",
  house: "houses",
  advert: "adverts"
};

/* ================= ROUTE MAP ================= */

const routeMap = {
  product: "/post/product",
  service: "/post/service",
  house: "/post/house",
  advert: "/post/advert"
};

export default function Promoted() {

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchPromoted = async () => {

      try {

        let allPosts = [];

        for (const type in collectionsMap) {

          const q = query(
            collection(db, collectionsMap[type]),
            where("promoted", "==", true),
            orderBy("createdAt", "desc")
          );

          const snap = await getDocs(q);

          const docs = snap.docs.map(doc => ({
            id: doc.id,
            type,
            ...doc.data()
          }));

          allPosts = [...allPosts, ...docs];
        }

        allPosts.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );

        setPosts(allPosts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };

    fetchPromoted();

  }, []);

  /* ================= FILTER ================= */

  const filteredPosts = useMemo(() => {
    if (category === "all") return posts;
    return posts.filter(p => p.type === category);
  }, [posts, category]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (

    <Box sx={{ px: isMobile ? 1 : 2, pb: 3 }}>

      {/* HEADER */}
      <Typography sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
        Promoted Listings
      </Typography>

      {/* TABS */}
      <Tabs
        value={category}
        onChange={(e, v) => setCategory(v)}
        variant="scrollable"
        sx={{
          mb: 2,
          ".MuiTab-root": { color: "#aaa" },
          ".Mui-selected": { color: GOLD }
        }}
      >
        <Tab label="All" value="all" />
        <Tab label="Products" value="product" />
        <Tab label="Services" value="service" />
        <Tab label="Houses" value="house" />
        <Tab label="Adverts" value="advert" />
      </Tabs>

      {/* 🔥 FIXED GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",   // mobile
            sm: "repeat(3, 1fr)",   // tablet
            md: "repeat(4, 1fr)"    // desktop
          },
          gap: 1.5
        }}
      >

        {filteredPosts.map(post => {

          const image = getImage(post);
          const price = post.price || post.rent || post.fee;

          return (

            <Box
              key={post.id}
              onClick={() =>
                navigate(`${routeMap[post.type]}/${post.id}`)
              }
              sx={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",

                display: "flex",
                flexDirection: "column",
                height: "100%", // 🔥 equal height cards

                transition: "all 0.2s ease",

                "&:hover": {
                  borderColor: GOLD,
                  transform: "translateY(-3px)"
                }
              }}
            >

              {/* 🔥 FIXED IMAGE RATIO */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1", // 🔥 PERFECT square like Jumia
                  background: "#000",
                  overflow: "hidden"
                }}
              >

                <Box
                  component="img"
                  src={image}
                  alt={post.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // 🔥 CRITICAL FIX
                    display: "block"
                  }}
                />

                <Chip
                  label="PROMOTED"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    background: GOLD,
                    fontSize: "10px",
                    fontWeight: "bold"
                  }}
                />

              </Box>

              {/* CONTENT */}
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1
                }}
              >

                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {post.title}
                </Typography>

                <Typography sx={{ fontSize: 11, color: "#777" }}>
                  {post.category || post.type}
                </Typography>

                {price && (
                  <Typography
                    sx={{
                      color: GOLD,
                      fontWeight: "bold",
                      fontSize: 14,
                      mt: "auto" // 🔥 pushes price to bottom
                    }}
                  >
                    {formatPrice(price)}
                  </Typography>
                )}

                <Typography sx={{ fontSize: 11, color: "#777" }}>
                  {post.location}
                </Typography>

              </Box>

            </Box>

          );

        })}

      </Box>

    </Box>

  );

}