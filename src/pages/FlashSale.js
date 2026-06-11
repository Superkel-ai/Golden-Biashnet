import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../services/firebase";

import SearchBar from "../components/home/SearchBar";
import HeroSlider from "../components/home/HeroSlider";
import CategoryScroller from "../components/home/CategoryScroller";
import SmallProductCard from "../components/home/SmallProductCard";
import InfiniteProducts from "../components/home/InfiniteProducts";

const GOLD = "#F4B400";

export default function FlashSalesPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [now, setNow] = useState(Date.now());

  /* LIVE TIMER */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* FETCH FLASH SALES ONLY */
  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("flashSale", "==", true),
          where("status", "in", ["approved", "active"])
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(data);

      } catch (err) {
        console.error("Flash Sales Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* FILTER ACTIVE FLASH SALES ONLY */
  const activeFlashSales = useMemo(() => {
    return products.filter(p => {
      const end =
        p.flashSaleEnd?.seconds
          ? p.flashSaleEnd.seconds * 1000
          : new Date(p.flashSaleEnd).getTime();

      return end > now;
    });
  }, [products, now]);

  /* CATEGORY GROUPING */
  const categories = useMemo(() => {
    const map = {};

    activeFlashSales.forEach(p => {
      const cat = p.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });

    return map;
  }, [activeFlashSales]);

  const categoryList = Object.keys(categories);

  /* LOADING */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#000", minHeight: "100vh", pb: 10 }}>

      {/* HEADER */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 24 }}>
          🔥 Flash Sales
        </Typography>

        <Typography sx={{ color: "#999", fontSize: 12 }}>
          Limited time deals • Grab before countdown ends
        </Typography>
      </Box>

      {/* SEARCH */}
      <SearchBar products={activeFlashSales} />

      {/* HERO */}
      <HeroSlider />

      {/* CATEGORIES */}
      <CategoryScroller
        selected={selectedCategory}
        setSelected={setSelectedCategory}
        categories={["All", ...categoryList]}
      />

      {/* FLASH SALE GRID */}
      <Box
        sx={{
          px: 1.5,
          mt: 2,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 1.2
        }}
      >
        {activeFlashSales
          .filter(p =>
            selectedCategory === "All"
              ? true
              : p.category === selectedCategory
          )
          .map(product => (
            <SmallProductCard
              key={product.id}
              product={product}
            />
          ))}
      </Box>

      {/* INFINITE FEED (OPTIONAL EXTRA LAYER) */}
      <Box sx={{ mt: 3 }}>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            px: 2,
            mb: 1
          }}
        >
          More Flash Deals
        </Typography>

        <InfiniteProducts
          filter={{ flashSale: true }}
        />
      </Box>

    </Box>
  );
}