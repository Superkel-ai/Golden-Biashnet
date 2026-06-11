import React from "react";

import {
  Box,
  Typography,
  Stack,
  Chip,
  Button
} from "@mui/material";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const GOLD = "#F4B400";

const BIASHNET_PHONE = "254758922614";

const formatPrice = (value) => {
  const num = Number(value || 0);
  return "KES " + num.toLocaleString();
};

export default function ProductPrice({ product }) {

  if (!product) return null;

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

  const savedAmount = hasDiscount
    ? markedPrice - price
    : 0;

  /* =========================
     ADD TO CART
  ========================= */

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

        sellerId:
          product.sellerId,

        title:
          product.title,

        price:
          product.price,

        image:
          product.images?.[0]?.thumb ||
          product.images?.[0]?.full ||
          "",

        quantity: 1

      });

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );
    }

    alert(
      "Added to cart successfully"
    );
  };

  /* =========================
     BUY NOW
  ========================= */

  const handleBuyNow = () => {

    handleAddToCart();

    const message = `
Hello Biashnet Service Providers,

I would like to buy:

Product:
${product.title}

Price:
${formatPrice(product.price)}

Product ID:
${product.id}

Location:
${product.location || "Kenya"}

Please assist me with ordering and delivery.
`;

    window.open(
      `https://wa.me/${BIASHNET_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (

    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        background:
          "linear-gradient(180deg,#0f0f0f,#0a0a0a)",
        border:
          "1px solid #1f1f1f",
      }}
    >

      {/* PRICE */}

      <Stack
        direction="row"
        spacing={2}
        alignItems="baseline"
        flexWrap="wrap"
      >

        <Typography
          sx={{
            fontSize: {
              xs: 30,
              md: 38
            },
            fontWeight: 900,
            color: GOLD,
          }}
        >
          {formatPrice(price)}
        </Typography>

        {hasDiscount && (

          <Typography
            sx={{
              color: "#777",
              textDecoration:
                "line-through",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {formatPrice(markedPrice)}
          </Typography>

        )}

      </Stack>

      {/* DISCOUNT */}

      {hasDiscount && (

        <Stack
          direction="row"
          spacing={1}
          mt={1.5}
          flexWrap="wrap"
        >

          <Chip
            icon={<LocalOfferIcon />}
            label={`${discountPercent}% OFF`}
            sx={{
              bgcolor: GOLD,
              color: "#000",
              fontWeight: 800,
            }}
          />

          <Chip
            label={`Save ${formatPrice(savedAmount)}`}
            sx={{
              bgcolor: "#1a1a1a",
              color: "#ddd",
            }}
          />

        </Stack>

      )}

      {/* STOCK */}

      <Typography
        sx={{
          mt: 2,
          color:
            stock > 0
              ? "#4CAF50"
              : "#FF5252",
          fontWeight: 700,
        }}
      >
        {stock > 0
          ? `${stock} items available`
          : "Out of Stock"}
      </Typography>

      {/* URGENCY */}

      {hasDiscount && (

        <Typography
          sx={{
            mt: 1,
            color: "#aaa",
            fontSize: 12,
          }}
        >
          ⚡ Limited offer — grab
          this deal before it ends
        </Typography>

      )}

      {/* ACTION BUTTONS */}

      <Stack
        spacing={1.5}
        sx={{ mt: 3 }}
      >

        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={
            <WhatsAppIcon />
          }
          onClick={handleBuyNow}
          sx={{
            bgcolor: "#25D366",
            color: "#fff",
            fontWeight: 800,
            py: 1.5,
          }}
        >
          Buy Now via WhatsApp
        </Button>

        <Button
          fullWidth
          size="large"
          variant="outlined"
          startIcon={
            <ShoppingCartIcon />
          }
          onClick={handleAddToCart}
          sx={{
            borderColor: GOLD,
            color: GOLD,
            py: 1.5,
          }}
        >
          Add To Cart
        </Button>

      </Stack>

    </Box>
  );
}