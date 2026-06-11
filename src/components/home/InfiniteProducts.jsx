import React, { useEffect, useState, useRef, useCallback } from "react";
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
import SmallProductCard from "./SmallProductCard";

const PAGE_SIZE = 20;

export default function InfiniteProducts() {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      let q;

      if (!lastDoc) {
        q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, "products"),
          where("status", "in", ["active", "approved"]),
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

      /* ================= DEDUPLICATION ================= */
      setProducts(prev => {
        const map = new Map();

        [...prev, ...newDocs].forEach(item => {
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
      console.error("Infinite scroll error:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [lastDoc, hasMore]);

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= OBSERVER ================= */
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

  /* ================= SMART SORT (NO MUTATION BUG) ================= */
  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      const scoreA =
        (a.promoted ? 100 : 0) +
        (a.views || 0) * 0.2 +
        (a.price || 0) * 0.001 +
        (a.createdAt?.seconds || 0);

      const scoreB =
        (b.promoted ? 100 : 0) +
        (b.views || 0) * 0.2 +
        (b.price || 0) * 0.001 +
        (b.createdAt?.seconds || 0);

      return scoreB - scoreA;
    });
  }, [products]);

  return (
    <Box mt={3} px={1}>
      <Typography
        sx={{
          color: "#F4B400",
          fontWeight: 700,
          fontSize: 18,
          mb: 2
        }}
      >
        Recommended For You
      </Typography>

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
        {sortedProducts.map((product, index) => {
          const isLast = index === sortedProducts.length - 1;

          return (
            <Box
              key={product.id}
              ref={isLast ? lastProductRef : null}
            >
              <SmallProductCard product={product} />
            </Box>
          );
        })}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress sx={{ color: "#F4B400" }} />
        </Box>
      )}

      {!hasMore && (
        <Typography align="center" sx={{ color: "#777", mt: 3 }}>
          You've reached the end
        </Typography>
      )}
    </Box>
  );
}