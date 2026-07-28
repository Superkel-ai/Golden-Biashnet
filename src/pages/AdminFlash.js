// src/pages/AdminFlash.js

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  CircularProgress,
  Fab,
  Stack,
  Typography,
  Chip,
  Button
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../services/firebase";

import Filters from "../components/flashsale/Filters";
import ProductGrid from "../components/flashsale/ProductGrid";
import BulkActions from "../components/flashsale/BulkActions";
import EmptyState from "../components/flashsale/EmptyState";

/* =========================
   ADMIN FLASH DASHBOARD
========================= */

export default function AdminFlash() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [selectMode, setSelectMode] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, "products"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(data);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================
     FILTERS (OPTIMIZED)
  ========================= */

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map(p => p.category)
          .filter(Boolean)
      )
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {

    return products.filter(product => {

      const matchSearch =
        product.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchCategory =
        !category || product.category === category;

      return matchSearch && matchCategory;

    });

  }, [products, search, category]);

  /* =========================
     PRODUCT CLICK HANDLER
  ========================= */

  const handleProductClick = (product) => {

    if (selectMode) {

      const exists = selected.includes(product.id);

      setSelected(
        exists
          ? selected.filter(id => id !== product.id)
          : [...selected, product.id]
      );

    } else {

      setCurrentProduct(product);
      setBulkOpen(true);

    }
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#050505"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <Box
      sx={{
        background: "#050505",
        minHeight: "100vh",
        p: 2,
        position: "relative"
      }}
    >

      {/* ================= FILTERS ================= */}
      <Filters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      {/* ================= SELECT MODE TOGGLE ================= */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography sx={{ color: "#aaa", fontSize: 13 }}>
          {filteredProducts.length} products
        </Typography>

        <Button
          size="small"
          variant={selectMode ? "contained" : "outlined"}
          onClick={() => {
            setSelectMode(!selectMode);
            setSelected([]);
          }}
          sx={{
            borderColor: "#444",
            color: "#fff"
          }}
        >
          {selectMode ? "Exit Select" : "Select Mode"}
        </Button>
      </Stack>

      {/* ================= GRID ================= */}
      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <ProductGrid
          products={filteredProducts}
          selected={selected}
          setSelected={setSelected}
          selectMode={selectMode}
          onProductClick={handleProductClick}
        />
      )}

      {/* ================= FLOATING BULK ACTION ================= */}
      {selectMode && selected.length > 0 && (
        <Fab
          variant="extended"
          color="primary"
          onClick={() => setBulkOpen(true)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            bgcolor: "#F4B400",
            color: "#000",
            fontWeight: 800,
            "&:hover": { bgcolor: "#dca300" }
          }}
        >
          Apply Flash ({selected.length})
        </Fab>
      )}

      {/* ================= FLASH MODAL ================= */}
      <BulkActions
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        product={currentProduct}
        selected={selected}
        products={products}
        reload={loadProducts}
        selectMode={selectMode}
        setSelected={setSelected}
      />

    </Box>
  );
}