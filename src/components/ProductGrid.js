// src/components/products/ProductGrid.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

/* ================= THEME ================= */
const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

/* ================= FORMAT PRICE ================= */
const formatPrice = (price) => (price ? `KES ${Number(price).toLocaleString()}` : "");

/* ================= IMAGE ================= */
const getImage = (product) =>
  product.images?.[0]?.thumb || product.images?.[0]?.full || product.images?.[0] || null;

/* ================= PRODUCT CARD ================= */
const ProductCard = React.memo(({ product, navigate, promoted }) => {
  const image = getImage(product);
  if (!image) return null;

  return (
    <Box
      onClick={() => navigate(`/post/product/${product.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${promoted ? GOLD : BORDER}`,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.2s ease",
        "&:hover": { borderColor: GOLD, transform: "translateY(-3px)" },
        "&:active": { transform: "scale(0.98)" },
        flexShrink: 0, // keeps horizontal scroll working
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          position: "relative",
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
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {promoted && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              background: GOLD,
              color: "#000",
              fontSize: 10,
              fontWeight: "bold",
              px: 1,
              py: 0.3,
              borderRadius: "6px",
            }}
          >
            ⭐ PROMOTED
          </Box>
        )}
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: 1, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Title */}
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

        {/* Category & Condition */}
        <Typography sx={{ fontSize: 11, color: "#aaa", mt: 0.3 }}>
          {product.category || "Other"} • {product.condition || "New"}
        </Typography>

        {/* Description */}
        {product.description && (
          <Typography
            sx={{
              fontSize: 11,
              color: "#888",
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Discount */}
        {product.discount && (
          <Typography sx={{ fontSize: 11, color: "#f44", fontWeight: "bold", mt: 0.5 }}>
            {product.discount}% OFF
          </Typography>
        )}

        {/* Price */}
        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 14, mt: "auto" }}>
          {formatPrice(product.price)}{" "}
          {product.markedPrice && product.markedPrice > product.price && (
            <Typography
              component="span"
              sx={{ textDecoration: "line-through", color: "#888", fontSize: 12, ml: 0.5 }}
            >
              {formatPrice(product.markedPrice)}
            </Typography>
          )}
        </Typography>

        {/* Location */}
        {product.location && <Typography sx={{ fontSize: 11, color: "#888" }}>{product.location}</Typography>}

        {/* Rating */}
        <Box sx={{ mt: 0.5, display: "flex", alignItems: "center" }}>
          <Rating name="read-only" value={product.rating || 0} readOnly size="small" precision={0.5} />
          <Typography sx={{ fontSize: 10, color: "#888", ml: 0.5 }}>
            ({product.reviewCount || 0})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

/* ================= MAIN GRID ================= */
export default function ProductGrid() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [products, setProducts] = useState([]);
  const [promoted, setPromoted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const now = new Date();

        // Promoted products
        const promotedQuery = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          where("promotion.promoted", "==", true)
        );
        const promotedSnap = await getDocs(promotedQuery);
        const promotedData = promotedSnap.docs
          .map((doc) => {
            const data = doc.data();
            if (data.promotion?.endDate?.toDate) {
              const end = data.promotion.endDate.toDate();
              if (end < now) return null;
            }
            return { id: doc.id, ...data };
          })
          .filter(Boolean);

        // All products
        const allQuery = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          orderBy("createdAt", "desc")
        );
        const allSnap = await getDocs(allQuery);
        const allProducts = allSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Remove duplicates
        const promotedIds = new Set(promotedData.map((p) => p.id));
        const normalProducts = allProducts.filter((p) => !promotedIds.has(p.id));

        setPromoted(promotedData);
        setProducts(normalProducts);
      } catch (error) {
        console.error("ProductGrid error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "40vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, pb: 4 }}>
      {/* ⭐ Promoted Products */}
      {promoted.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18, mb: 1, px: 1 }}>
            ⭐ Promoted Products
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              overflowX: "auto",
              pb: 1,
              px: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {promoted.map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} promoted />
            ))}
          </Box>
        </Box>
      )}

      {/* 🛒 All Products */}
      <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18, mb: 1, px: 1 }}>
        All Products
      </Typography>

      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(2, 1fr)",
      sm: "repeat(3, 1fr)",
      md: "repeat(4, 1fr)",
      lg: "repeat(5, 1fr)",
    },
    gap: 1,
    px: 0.5,
  }}
>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} navigate={navigate} />
        ))}
      </Box>
    </Box>
  );
}