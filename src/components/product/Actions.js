import React, { useState } from "react";

import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import ReportIcon from "@mui/icons-material/Report";
import ChatIcon from "@mui/icons-material/Chat";

const GOLD = "#F4B400";

const BIASHNET_PHONE = "254758922614";

export default function Actions({
  product,
  onReport,
}) {
  const [liked, setLiked] =
    useState(false);

  const [snack, setSnack] =
    useState({
      open: false,
      message: "",
    });

  if (!product) return null;

  const showSnack = (
    message
  ) => {
    setSnack({
      open: true,
      message,
    });
  };

  /* =========================
     LIKE
  ========================= */

  const handleLike = () => {
    setLiked((prev) => !prev);

    showSnack(
      liked
        ? "Removed from favorites"
        : "Saved to favorites"
    );
  };

  /* =========================
     SHARE
  ========================= */

  const handleShare =
    async () => {
      const url =
        window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title:
              product.title,
            text:
              product.title,
            url,
          });
        } else {
          await navigator.clipboard.writeText(
            url
          );

          showSnack(
            "Link copied"
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

  /* =========================
     WHATSAPP BIASHNET
  ========================= */

  const handleWhatsApp =
    () => {
      const message = `Hello Biashnet,

I am interested in:

${product.title}

Product ID:
${product.id}

Price:
KES ${Number(
        product.price || 0
      ).toLocaleString()}
`;

      window.open(
        `https://wa.me/${BIASHNET_PHONE}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    };

  /* =========================
     CALL SELLER
  ========================= */

  const handleCall =
    () => {
      if (
        !product?.sellerPhone
      ) {
        showSnack(
          "Phone unavailable"
        );

        return;
      }

      window.location.href =
        `tel:${product.sellerPhone}`;
    };

  /* =========================
     CHAT SELLER
  ========================= */

  const handleChat =
    () => {
      const phone =
        product?.sellerWhatsapp ||
        product?.sellerPhone;

      if (!phone) {
        showSnack(
          "WhatsApp unavailable"
        );

        return;
      }

      const message = `Hello,

I found your product on Golden Biashnet.

Product:
${product.title}

Product ID:
${product.id}
`;

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    };

  return (
    <>
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 3,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",

          background:
            "rgba(255,255,255,0.02)",

          border:
            "1px solid #1f1f1f",
        }}
      >
        {/* LEFT */}

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Tooltip title="Save">
            <IconButton
              onClick={
                handleLike
              }
              sx={{
                color: liked
                  ? "#ff1744"
                  : "#fff",
              }}
            >
              {liked ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton
              onClick={
                handleShare
              }
              sx={{
                color: "#fff",
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="WhatsApp Biashnet">
            <IconButton
              onClick={
                handleWhatsApp
              }
              sx={{
                color:
                  "#25D366",
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* RIGHT */}

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Tooltip title="Call Seller">
            <IconButton
              onClick={
                handleCall
              }
              sx={{
                color: GOLD,
              }}
            >
              <PhoneIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chat Seller">
            <IconButton
              onClick={
                handleChat
              }
              sx={{
                color:
                  "#90caf9",
              }}
            >
              <ChatIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Report Product">
            <IconButton
              onClick={() =>
                onReport?.(
                  product
                )
              }
              sx={{
                color:
                  "#ff5252",
              }}
            >
              <ReportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={
          1800
        }
        onClose={() =>
          setSnack({
            ...snack,
            open: false,
          })
        }
        anchorOrigin={{
          vertical:
            "bottom",
          horizontal:
            "center",
        }}
      >
        <Alert
          severity="success"
          sx={{
            bgcolor:
              "#111",
            color:
              "#fff",
            border:
              "1px solid #2a2a2a",
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}