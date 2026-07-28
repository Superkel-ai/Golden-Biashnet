import React from "react";

import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

const formatPrice = (value) =>
  `KES ${Number(value || 0).toLocaleString()}`;

export default function Buy({
  product,
  visible = true,
}) {
  const navigate = useNavigate();

  if (!product || !visible) return null;

  const price = Number(product.price || 0);

  const markedPrice = Number(
    product.markedPrice || 0
  );

  const stock = Number(
    product.stock || 0
  );

  const hasDiscount =
    markedPrice > 0 &&
    markedPrice > price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((markedPrice - price) /
          markedPrice) *
          100
      )
    : 0;

  /* ==========================
     ADD TO CART
  ========================== */

  const handleAddToCart = () => {
    try {
      const cart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      const existing = cart.find(
        (item) =>
          item.productId === product.id
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          sellerId: product.sellerId,
          title: product.title,
          price: product.price,
          image:
            product.images?.[0]?.thumb ||
            product.images?.[0]?.full ||
            product.image ||
            "",
          quantity: 1,
        });
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      alert("Added to cart");
    } catch (err) {
      console.log(err);
    }
  };

  /* ==========================
     BUY NOW
  ========================== */

  const handleBuyNow = () => {
    navigate(`/pay/${product.id}`, {
      state: {
        product,
        quantity: 1,
        totalAmount: Number(
          product.price || 0
        ),
      },
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",

        bottom: {
          xs: 65,
          md: 20,
        },

        left: 0,
        right: 0,

        px: 1.5,

        zIndex: 1400,

        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          maxWidth: 900,

          mx: "auto",

          pointerEvents: "auto",

          backdropFilter: "blur(20px)",

          background:
            "rgba(15,15,15,.95)",

          border:
            "1px solid rgba(255,255,255,.08)",

          boxShadow:
            "0 8px 30px rgba(0,0,0,.45)",

          borderRadius: 4,

          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            p: 1.5,
          }}
        >
          {/* PRICE */}

          <Box
            sx={{
              minWidth: 120,

              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography
              sx={{
                color: "#888",
                fontSize: 11,
              }}
            >
              Price
            </Typography>

            <Typography
              sx={{
                color: GOLD,
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {formatPrice(price)}
            </Typography>
          </Box>

          {/* DISCOUNT */}

          {hasDiscount && (
            <Chip
              icon={<LocalOfferIcon />}
              label={`${discountPercent}% OFF`}
              size="small"
              sx={{
                bgcolor: GOLD,
                color: "#000",
                fontWeight: 800,

                display: {
                  xs: "none",
                  md: "flex",
                },
              }}
            />
          )}

          {/* STOCK */}

          {stock > 0 && (
            <Typography
              sx={{
                color: "#4CAF50",
                fontWeight: 700,
                fontSize: 12,

                display: {
                  xs: "none",
                  md: "block",
                },
              }}
            >
              {stock} Available
            </Typography>
          )}

          {/* CART BUTTON */}

          <Button
            startIcon={
              <ShoppingCartIcon />
            }
            onClick={handleAddToCart}
            sx={{
              minWidth: 120,

              height: 46,

              bgcolor: "#1a1a1a",

              color: "#fff",

              border:
                "1px solid #333",

              borderRadius: 3,

              fontWeight: 800,

              textTransform: "none",

              "&:hover": {
                bgcolor: "#222",
              },
            }}
          >
            Add To Cart
          </Button>

          {/* BUY NOW BUTTON */}

          <Button
            fullWidth
            startIcon={<FlashOnIcon />}
            onClick={handleBuyNow}
            sx={{
              height: 46,

              bgcolor: GOLD,

              color: "#000",

              fontWeight: 900,

              textTransform: "none",

              borderRadius: 3,

              "&:hover": {
                bgcolor: "#dca300",
              },
            }}
          >
            Buy Now
          </Button>
        </Stack>

        <Box
          sx={{
            px: 2,
            pb: 1,
          }}
        >
          <Typography
            sx={{
              color: "#999",
              fontSize: 11,
            }}
          >
            Secure checkout • M-Pesa • Card • Wallet • Delivery available
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}