// src/pages/Home.js

import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";

import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from "firebase/firestore";

import { db } from "../services/firebase";

import SearchBar from "../components/home/SearchBar";
import HeroSlider from "../components/home/HeroSlider";
import CategoryScroller from "../components/home/CategoryScroller";
import ProductRow from "../components/home/ProductRow";
import RecommendedGrid from "../components/home/RecommendedGrid";
import InfiniteProducts from "../components/home/InfiniteProducts";

const GOLD = "#F4B400";

const FlashSaleBanner = lazy(() =>
  import("../components/home/FlashSaleBanner")
);

/* ================= NORMALIZE ================= */
const normalize = (text) =>
  (text || "")
    .toLowerCase()
    .trim();

/* ================= CAPITALIZE ================= */
const capitalize = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export default function HomePage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {

    const loadProducts = async () => {

      try {

        const q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          orderBy("createdAt", "desc"), limit (5000)
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

  }, []);

  /* ================= GROUP BY CATEGORY (🔥 FIX) ================= */
  const categoryMap = useMemo(() => {

    const map = {};

    products.forEach((p) => {

      const cat = normalize(p.category || "Other");

      if (!map[cat]) {
        map[cat] = [];
      }

      map[cat].push(p);

    });

    return map;

  }, [products]);

  /* ================= ACTIVE CATEGORIES ================= */
  const activeCategories = useMemo(() => {
    return Object.keys(categoryMap);
  }, [categoryMap]);

  const visibleCategories = useMemo(() => {

  if (selectedCategory === "All") {

    return Object.entries(categoryMap);

  }

  return Object.entries(categoryMap)

    .filter(

      ([cat]) =>

        normalize(cat) ===

        normalize(selectedCategory)

    );

}, [

categoryMap,

selectedCategory

]);

  /* ================= FEATURED SECTIONS ================= */

  const promotedProducts = useMemo(() =>
    products.filter(p => p.promotion?.promoted === true).slice(0, 50),
    [products]
  );
  
  const latestProducts = useMemo(() =>
    [...products]
      .sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      )
      .slice(0, 50),
    [products]
  );

  const recommendedProducts = useMemo(() => {

    return [...products]
      .sort((a, b) => {

        const scoreA =
          (a.priorityScore || 0) +
          (a.promotion?.promoted === true ? 100 : 0) +
          (a.sellerVerified ? 50 : 0) +
          ((a.views || 0) * 0.1);

        const scoreB =
          (b.priorityScore || 0) +
          (b.promotion?.promoted === true ? 100 : 0) +
          (b.sellerVerified ? 50 : 0) +
          ((b.views || 0) * 0.1);

        return scoreB - scoreA;

      })
      .slice(0, 20);

  }, [products]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#000",
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
    <Box sx={{ background: "#000", minHeight: "100vh", pb: 10 }}>

      {/* SEARCH */}
      <SearchBar products={products} />

      {/* HERO */}
      <HeroSlider />

      {/* CATEGORY SCROLLER (NOW DYNAMIC) */}
      <CategoryScroller
        selected={selectedCategory}
        setSelected={setSelectedCategory}
        categories={["All", ...activeCategories.map(capitalize)]}
      />

      {/* FLASH BANNER */}
     <Suspense fallback={null}>
  <FlashSaleBanner />
</Suspense>

      {/* PROMOTED */}
      <ProductRow title="⭐ Promoted Products" products={promotedProducts} />

      {/* LATEST */}
      <ProductRow title="🆕 Latest Arrivals" products={latestProducts} />

      {/* 🔥 DYNAMIC CATEGORY RENDERING (IMPORTANT FIX) */}
     {visibleCategories

.sort(

(a,b)=>

b[1].length -

a[1].length

)

.map(

([category,items])=>(

<ProductRow

key={category}

title={

`📦 ${capitalize(category)} (${items.length})`

}

products={items}

showViewAll

category={category}

/>

)

)}
      {/* RECOMMENDED */}
      <RecommendedGrid products={recommendedProducts} />

      {/* ENDLESS FEED */}
      <InfiniteProducts />

    </Box>
  );
}