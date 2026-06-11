import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";

import { db } from "../../services/firebase";
import SmallProductCard from "../home/SmallProductCard";

const PAGE_SIZE = 12;
const GOLD = "#F4B400";

/* =========================================================
   RELATED PRODUCTS (INFINITE + SMART MATCHING ENGINE)
========================================================= */

export default function RelatedProducts({ product }) {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const category = product?.category;

  /* =========================================================
     RESET WHEN PRODUCT CHANGES
  ========================================================= */
  useEffect(() => {
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
  }, [product?.id]);

  /* =========================================================
     FETCH RELATED PRODUCTS
  ========================================================= */
  const loadProducts = useCallback(async () => {
    if (loadingRef.current || !hasMore || !category) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      let q;

      if (!lastDoc) {
        q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);

      const newDocs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      /* REMOVE CURRENT PRODUCT FROM RELATED LIST */
      const filtered = newDocs.filter(p => p.id !== product?.id);

      setProducts(prev => {
        const map = new Map();

        [...prev, ...filtered].forEach(item => {
          map.set(item.id, item);
        });

        return Array.from(map.values());
      });

      const lastVisible = snap.docs[snap.docs.length - 1];
      setLastDoc(lastVisible);

      if (snap.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }

    } catch (err) {
      console.error("Related products error:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [lastDoc, hasMore, category, product?.id]);

  useEffect(() => {
    loadProducts();
  }, [category]);

  /* =========================================================
     INFINITE SCROLL OBSERVER
  ========================================================= */
  const lastProductRef = useCallback((node) => {
    if (loadingRef.current) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadProducts();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [hasMore, loadProducts]);

  /* =========================================================
     SMART RANKING (PROMOTED + POPULAR FIRST)
  ========================================================= */
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const scoreA =
        (a.promoted ? 100 : 0) +
        (a.views || 0) * 0.2 +
        (a.rating || 0) * 10 +
        (a.createdAt?.seconds || 0);

      const scoreB =
        (b.promoted ? 100 : 0) +
        (b.views || 0) * 0.2 +
        (b.rating || 0) * 10 +
        (b.createdAt?.seconds || 0);

      return scoreB - scoreA;
    });
  }, [products]);

  /* =========================================================
     EMPTY STATE
  ========================================================= */
  if (!category) return null;

  return (
    <Box sx={{ mt: 4 }}>

      {/* HEADER */}
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 900,
          color: "#fff",
          mb: 2
        }}
      >
        Related Products
      </Typography>

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            sm: "repeat(3,1fr)",
            md: "repeat(4,1fr)"
          },
          gap: 1.5
        }}
      >
        {sortedProducts.map((productItem, index) => {
          const isLast = index === sortedProducts.length - 1;

          return (
            <Box
              key={productItem.id}
              ref={isLast ? lastProductRef : null}
            >
              <SmallProductCard product={productItem} />
            </Box>
          );
        })}
      </Box>

      {/* LOADING */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress sx={{ color: GOLD }} />
        </Box>
      )}

      {/* END STATE */}
      {!hasMore && sortedProducts.length > 0 && (
        <Typography
          align="center"
          sx={{ color: "#777", mt: 3, fontSize: 13 }}
        >
          You've reached the end
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && sortedProducts.length === 0 && (
        <Typography sx={{ color: "#777", fontSize: 13 }}>
          No related products found
        </Typography>
      )}
    </Box>
  );
}