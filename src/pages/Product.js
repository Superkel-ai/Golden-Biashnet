import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

/* PRODUCT COMPONENTS */
import Gallery from "../components/product/Gallery";
import Header from "../components/product/Header";
import Price from "../components/product/Price";
import Purchase from "../components/product/Purchase";
import Description from "../components/product/Description";
import Actions from "../components/product/Actions";
import Buy from "../components/product/Buy";
import Related from "../components/product/Related";
import Review from "../components/product/Review";
import Report from "../components/product/Report";

const BG = "#0a0a0a";

export default function Product({
  product: initialProduct
}) {

  const [product, setProduct] =
    useState(initialProduct || null);

  const [loading, setLoading] =
    useState(!initialProduct);

  const [reportOpen, setReportOpen] =
    useState(false);

  const productId =
    window.location.pathname
      .split("/")
      .pop();

  useEffect(() => {

    const fetchProduct = async () => {

      if (initialProduct) return;

      try {

        setLoading(true);

        const ref = doc(
          db,
          "products",
          productId
        );

        const snap =
          await getDoc(ref);

        if (snap.exists()) {

          setProduct({
            id: snap.id,
            ...snap.data()
          });

        } else {

          setProduct(null);

        }

      } catch (err) {

        console.error(err);
        setProduct(null);

      } finally {

        setLoading(false);

      }

    };

    fetchProduct();

  }, [productId, initialProduct]);

  /* LOADING */

  if (loading) {

    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: BG
        }}
      >
        <CircularProgress
          sx={{
            color: "#F4B400"
          }}
        />
      </Box>
    );

  }

  /* NOT FOUND */

  if (!product) {

    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: BG
        }}
      >
        <Typography color="white">
          Product not found
        </Typography>
      </Box>
    );

  }

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 12
      }}
    >
      {/* GALLERY */}
      <Box sx={{ px: 2, mt: 1 }}>
        <Gallery product={product} />
      </Box>

      
      {/* PRICE */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Price product={product} />
      </Box>

      {/* HEADER */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Header product={product} />
      </Box>

      {/* PURCHASE */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Purchase product={product} />
      </Box>

      {/* DESCRIPTION */}
      <Box sx={{ px: 2, mt: 3 }}>
        <Description product={product} />
      </Box>

      {/* ACTIONS */}
      <Box sx={{ px: 2, mt: 3 }}>
        <Actions
          product={product}
          onReport={() =>
            setReportOpen(true)
          }
        />
      </Box>

      {/* REVIEWS */}
      <Box sx={{ px: 2, mt: 4 }}>
        <Review
          productId={product.id}
        />
      </Box>

      {/* RELATED */}
      <Box sx={{ px: 2, mt: 4 }}>
        <Related product={product} />
      </Box>

      {/* FLOATING BUY BAR */}
      <Buy product={product} />

      {/* REPORT */}
      <Report
        open={reportOpen}
        onClose={() =>
          setReportOpen(false)
        }
        productId={product.id}
        sellerId={product.sellerId}
        productTitle={product.title}
      />

    </Box>

  );
}