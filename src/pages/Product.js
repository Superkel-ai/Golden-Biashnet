// src/pages/Product.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Rating,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";

import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import WatchIcon from "@mui/icons-material/Watch";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CategoryIcon from "@mui/icons-material/Category";
import DiamondIcon from "@mui/icons-material/Diamond"; // Jewelry
import RestaurantIcon from "@mui/icons-material/Restaurant"; // Foods
import BakeryDiningIcon from "@mui/icons-material/BakeryDining"; // Snacks
import ComputerIcon from "@mui/icons-material/Computer"; // Computers

export const CATEGORY_CONFIG = {
  Electronics: { icon: <LaptopMacIcon />, color: "#00E5FF" },
  Phones: { icon: <PhoneIphoneIcon />, color: "#00C853" },
  Fashion: { icon: <CheckroomIcon />, color: "#FF4081" },
  Vehicles: { icon: <DirectionsCarIcon />, color: "#FF9100" },
  Home: { icon: <HomeIcon />, color: "#FFD600" },
  Accessories: { icon: <WatchIcon />, color: "#7C4DFF" },
  Shoes: { icon: <ShoppingBagIcon />, color: "#FF6D00" },

  Jewelry: { icon: <DiamondIcon />, color: "#00BFA5" },
  Foods: { icon: <RestaurantIcon />, color: "#FF3D00" },
  Snacks: { icon: <BakeryDiningIcon />, color: "#FFAB00" },
  Computers: { icon: <ComputerIcon />, color: "#2979FF" },

  Other: { icon: <CategoryIcon />, color: "#9E9E9E" },
  All: { icon: <CategoryIcon />, color: "#F4B400" },
};
/* ================= THEME ================= */
const GOLD = "#F4B400";
const BG = "#000000";
const CARD = "#000000";
const BORDER = "#000000";

/* ================= FORMAT PRICE ================= */
const formatPrice = (price) =>
  price ? `KES ${Number(price).toLocaleString()}` : "";

/* ================= IMAGE ================= */
const getImage = (product) =>
  product.images?.[0]?.thumb ||
  product.images?.[0]?.full ||
  product.images?.[0] ||
  null;

/* ================= PRODUCT CARD ================= */
const ProductCard = React.memo(({ product }) => {
  const navigate = useNavigate();
  const image = getImage(product);
  if (!image) return null;

  return (
    <Box
      onClick={() => navigate(`/post/product/${product.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        transition: "all 0.2s ease",
        "&:hover": { borderColor: GOLD, transform: "translateY(-3px)" },
        "&:active": { transform: "scale(0.98)" },
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={image}
          alt={product.title}
          loading="lazy"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: 1, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
        </Typography>

        <Typography sx={{ fontSize: 11, color: "#aaa", mt: 0.3 }}>
          {product.category || "Other"} • {product.condition || "New"}
        </Typography>

        {product.discount && (
          <Typography sx={{ fontSize: 11, color: "#f44", fontWeight: "bold", mt: 0.5 }}>
            {product.discount}% OFF
          </Typography>
        )}

        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 14, mt: "auto" }}>
          {formatPrice(product.price)}{" "}
          {product.markedPrice && product.markedPrice > product.price && (
            <Typography
              component="span"
              sx={{
                textDecoration: "line-through",
                color: "#888",
                fontSize: 12,
                ml: 0.5,
              }}
            >
              {formatPrice(product.markedPrice)}
            </Typography>
          )}
        </Typography>

        {product.location && (
          <Typography sx={{ fontSize: 11, color: "#888" }}>
            {product.location}
          </Typography>
        )}

        <Box sx={{ mt: 0.5, display: "flex", alignItems: "center" }}>
          <Rating
            value={product.rating || 0}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography sx={{ fontSize: 10, color: "#888", ml: 0.5 }}>
            ({product.reviewCount || 0})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

/// Auto-scrolling row component
const AutoScrollRow = ({ items, renderItem }) => {
  const scrollRef = useRef();


useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  let direction = 1;
  let speed = 0.3;
  let interval;

  const scroll = () => {
    if (!el) return;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth) direction = -1;
    if (el.scrollLeft <= 0) direction = 1;

    el.scrollLeft += direction * speed;
  };

  // 🔥 60fps smooth loop
  interval = setInterval(scroll, 16);

  // 🔥 Interaction states
  const slowDown = () => {
    speed = 0.05; // user touching → slow
  };

  const speedUp = () => {
    speed = 0.6; // user hovering/interested → faster
  };

  const normalize = () => {
    speed = 0.3; // default
  };

  // 🔥 Mobile touch
  el.addEventListener("touchstart", slowDown);
  el.addEventListener("touchend", normalize);

  // 🔥 Desktop hover
  el.addEventListener("mouseenter", speedUp);
  el.addEventListener("mouseleave", normalize);

  return () => {
    clearInterval(interval);
    el.removeEventListener("touchstart", slowDown);
    el.removeEventListener("touchend", normalize);
    el.removeEventListener("mouseenter", speedUp);
    el.removeEventListener("mouseleave", normalize);
  };
}, []);
  return (
    <Box
      ref={scrollRef}
      sx={{
        display: "flex",
        gap: 1.5,
        overflowX: "auto",
        px: 1,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {items.map(renderItem)}
    </Box>
  );
};

/* ================= CATEGORY ROW ================= */
const AutoCategoryRow = ({ categories, selectedCategory, setSelectedCategory }) => {
  const scrollRef = React.useRef();

  // 🔥 Auto scroll back and forth
 React.useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  let direction = 1;
  let animationFrame;
  let isPaused = false;

  const scroll = () => {
    if (!el || isPaused) return;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth) direction = -1;
    if (el.scrollLeft <= 0) direction = 1;

    el.scrollLeft += direction * 0.3;

    animationFrame = requestAnimationFrame(scroll);
  };

  // 🔥 Pause when user clicks
  const handleClick = () => {
    isPaused = true;

    // Resume after 2 seconds
    setTimeout(() => {
      isPaused = false;
      animationFrame = requestAnimationFrame(scroll);
    }, 2000);
  };

  el.addEventListener("click", handleClick);

  animationFrame = requestAnimationFrame(scroll);

  return () => {
    cancelAnimationFrame(animationFrame);
    el.removeEventListener("click", handleClick);
  };
}, []);

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: "flex",
        gap: 1.5,
        overflowX: "auto",
        px: 1,
        py: 2,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {categories.map((cat) => {
        // ✅ THIS IS WHERE IT GOES
        const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG["Other"];
        const icon = config.icon;
        const color = config.color;

        const isActive = selectedCategory === cat;

        return (
          <Box
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            sx={{
              minWidth: 90,
              p: 1,
              borderRadius: 3,
              background: isActive ? color : "#111",
              color: isActive ? "#000" : "#fff",
              textAlign: "center",
              cursor: "pointer",
              transition: "0.3s",

              // 🔥 Hover effect
              "&:hover": {
                transform: "scale(1.1)",
                background: color,
                color: "#000",
              },

              // 🔥 ACTIVE pulse (heartbeat)
              animation: !isActive ? "pulse 2s ease-in-out infinite" : "none",
              "@keyframes pulse": {
  "0%": {
    transform: "scale(1)",
    background: "#111",
  },
  "50%": {
    transform: "scale(1.1)",
    background: color,
    color: "#000",
  },
  "100%": {
    transform: "scale(1)",
    background: "#111",
  },
},
            }}
          >
            <Box sx={{ fontSize: 26 }}>{icon}</Box>

            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
              {cat}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
/* ================= MAIN PAGE ================= */
export default function ProductPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [promoted, setPromoted] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
const [suggestions, setSuggestions] = useState([]);

/// Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);

        const getPromoted = async () => {
  const q = query(
    collection(db, "products"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const data = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((p) => p.isPromoted === true)
    .slice(0, 10);

  setPromoted(data);
};

        const cats = ["All", ...new Set(data.map((p) => p.category || "Other"))];
        setCategories(cats);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  useEffect(() => {
  if (!searchTerm) {
    setSuggestions([]);
    return;
  }

  const filtered = products
    .filter((p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5); // limit suggestions

  setSuggestions(filtered);
}, [searchTerm, products]);


  /* ================= FILTER ================= */
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (p.category || "Other") === selectedCategory;

    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.keywords?.some((k) =>
        k.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

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
      {/* 🔥 WELCOME + QUICK NAV */}
<Box sx={{ px: 1.5, pt: 2 }}>
  {/* Welcome Text */}
  <Typography
    sx={{
      color: GOLD,
      fontWeight: "bold",
      fontSize: 18,
    }}
  >
    Welcome to Golden Biashnet Marketplace
  </Typography>

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
  </Box>
</Box>
      {/* SEARCH */}
      <Box sx={{ px: 1, pt: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 🔥 SUGGESTIONS DROPDOWN */}
{suggestions.length > 0 && (
  <Box
    sx={{
      position: "absolute",
      top: 60,
      left: 8,
      right: 8,
      background: "#111",
      borderRadius: 2,
      zIndex: 10,
      boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
    }}
  >
    {suggestions.map((item) => (
      <Box
        key={item.id}
        onClick={() => navigate(`/post/product/${item.id}`)}
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid #222",
          cursor: "pointer",
          "&:hover": { background: "#222" }
        }}
      >
        <Typography sx={{ color: "#fff", fontSize: 13 }}>
          {item.title}
        </Typography>
      </Box>
    ))}
  </Box>
)}

   
      {/* 🔥 CATEGORY ROW (AUTO MOVING) */}
<AutoCategoryRow
  categories={categories}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
/>

      {/* 🔥 LIVE PRODUCTS (AUTO MOVING) */}
      <Box mt={2}>
        <Typography sx={{ color: GOLD, px: 1, mb: 1 }}>
          🔥 Live Products
        </Typography>

        <AutoScrollRow
          items={filteredProducts}
          renderItem={(product) => (
            <Box key={product.id} sx={{ minWidth: 160 }}>
              <ProductCard product={product} />
            </Box>
          )}
        />
      </Box>

      {/* GRID */}
      <Box
        sx={{
          px: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <Typography sx={{ color: "#888", mt: 4 }}>
            No products found.
          </Typography>
        )}
      </Box>
    </Box>
  );
}