import React from "react";

import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const GOLD = "#F4B400";

const BIASHNET_PHONE = "254758922614";

const formatPrice = (value) => {
  return `KES ${Number(value || 0).toLocaleString()}`;
};

export default function Buy({
  product,
  visible = true,
}) {
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

  /* =====================================
     ADD TO CART
  ===================================== */

  const handleAddToCart = () => {
    const cart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    const exists = cart.find(
      (item) =>
        item.postId === product.id
    );

    if (!exists) {
      cart.push({
        postId: product.id,
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

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );
    }

    alert("Added to cart");
  };

  /* =====================================
     BUY NOW
  ===================================== */

  const handleBuyNow = () => {
    handleAddToCart();

    const message = `
Hello Biashnet Service Providers,

I would like to order:

Product:
${product.title}

Price:
${formatPrice(product.price)}

Product ID:
${product.id}

Seller ID:
${product.sellerId}

Location:
${product.location || "Kenya"}

Please assist with delivery.
`;

    window.open(
      `https://wa.me/${BIASHNET_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
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
            "rgba(15,15,15,.92)",

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
            p: 1.2,
          }}
        >
          {/* PRICE */}
          <Box
            sx={{
              minWidth: 95,
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography
              sx={{
                color: "#777",
                fontSize: 11,
              }}
            >
              Price
            </Typography>

            <Typography
              sx={{
                color: GOLD,
                fontWeight: 900,
                fontSize: 18,
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
                fontSize: 12,
                fontWeight: 700,

                display: {
                  xs: "none",
                  md: "block",
                },
              }}
            >
              Only {stock} left
            </Typography>
          )}

          {/* ADD TO CART */}
          <Button
            startIcon={
              <ShoppingCartIcon />
            }
            onClick={handleAddToCart}
            sx={{
              minWidth: 110,
              height: 42,

              bgcolor: "#1a1a1a",

              color: "#fff",

              border:
                "1px solid #2a2a2a",

              textTransform: "none",

              fontWeight: 700,

              borderRadius: 3,

              "&:hover": {
                bgcolor: "#222",
              },
            }}
          >
            Cart
          </Button>

          {/* BUY NOW */}
          <Button
            fullWidth
            startIcon={
              <WhatsAppIcon />
            }
            onClick={handleBuyNow}
            sx={{
              height: 42,

              bgcolor: "#25D366",

              color: "#fff",

              textTransform: "none",

              fontWeight: 900,

              borderRadius: 3,

              "&:hover": {
                bgcolor: "#22c55e",
              },
            }}
          >
            Buy Now
          </Button>
        </Stack>

        {/* URGENCY */}
        {(hasDiscount || stock > 0) && (
          <Box
            sx={{
              px: 2,
              pb: 1,
            }}
          >
            <Typography
              sx={{
                color: "#aaa",
                fontSize: 11,
              }}
            >
              ⚡ Fast moving product • Secure
              ordering through Biashnet
              Service Providers
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}