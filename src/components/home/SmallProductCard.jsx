// src/components/home/SmallProductCard.js

import React from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StarIcon from "@mui/icons-material/Star";

import { useNavigate } from "react-router-dom";
import SellerBadge from "./SellerBadge";

const GOLD = "#F4B400";

function SmallProductCard({ product }) {
  const navigate = useNavigate();

  const image =
    product.images?.[0]?.thumb ||
    product.images?.[0]?.full ||
    product.images?.[0] ||
    "/images/product-placeholder.webp";

  const discount =
    product.markedPrice > product.price
      ? Math.round(
          ((product.markedPrice - product.price) /
            product.markedPrice) *
            100
        )
      : 0;

  const isNew =
    product.createdAt?.toMillis &&
    Date.now() - product.createdAt.toMillis() <
      7 * 24 * 60 * 60 * 1000;

  return (
    <Box
      onClick={() => navigate(`/post/product/${product.id}`)}
      sx={{
        width: 128,
        minWidth: 128,

        bgcolor: "#111",

        borderRadius: 3,

        overflow: "hidden",

        cursor: "pointer",

        border: "1px solid #222",

        transition: "all .25s ease",

        "&:hover": {
          borderColor: GOLD,
          transform: "translateY(-4px)",
          boxShadow:
            "0 6px 18px rgba(244,180,0,0.18)",
        },

        "&:hover img": {
          transform: "scale(1.05)",
        },
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          position: "relative",
          height: 118,
          bgcolor: "#000",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform .3s ease",
          }}
        />

        {/* Discount */}
        {discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: 6,

              bgcolor: "#FF1744",

              color: "#fff",

              px: 0.8,
              py: 0.25,

              borderRadius: 1,

              fontSize: 10,

              fontWeight: 700,
            }}
          >
            -{discount}%
          </Box>
        )}

        {/* New Badge */}
        {isNew && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: discount ? 48 : 6,

              bgcolor: "#00C853",

              color: "#fff",

              px: 0.8,
              py: 0.25,

              borderRadius: 1,

              fontSize: 10,

              fontWeight: 700,
            }}
          >
            NEW
          </Box>
        )}

        {/* Promoted */}
        {product.isPromoted && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,

              bgcolor: GOLD,

              color: "#000",

              px: 0.8,
              py: 0.25,

              borderRadius: 1,

              fontSize: 9,

              fontWeight: 700,
            }}
          >
            PROMOTED
          </Box>
        )}

        {/* Wishlist */}
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            right: 4,
            bottom: 4,

            bgcolor: "rgba(0,0,0,.65)",

            color: "#fff",

            p: 0.5,
          }}
        >
          <FavoriteBorderIcon
            sx={{
              fontSize: 15,
            }}
          />
        </IconButton>

        {/* Flash Sale */}
        {product.flashSale && (
          <Box
            sx={{
              position: "absolute",
              bottom: 6,
              left: 6,

              bgcolor: "#FF1744",

              color: "#fff",

              px: 0.8,
              py: 0.25,

              borderRadius: 1,

              fontSize: 9,

              fontWeight: 700,
            }}
          >
            FLASH SALE
          </Box>
        )}
      </Box>

      {/* CONTENT */}
      <Box p={1}>
        {/* Title */}
        <Typography
          sx={{
            color: "#fff",

            fontSize: 12,

            fontWeight: 600,

            lineHeight: 1.25,

            minHeight: 32,

            overflow: "hidden",

            display: "-webkit-box",

            WebkitLineClamp: 2,

            WebkitBoxOrient: "vertical",
          }}
        >
          {product.title}
        </Typography>

        {/* Category */}
        {product.category && (
          <Typography
            sx={{
              fontSize: 10,

              color: "#aaa",

              mt: 0.3,
            }}
          >
            {product.category}
          </Typography>
        )}

        {/* Rating */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            mt: 0.5,
          }}
        >
          <StarIcon
            sx={{
              color: GOLD,
              fontSize: 12,
            }}
          />

          <Typography
            sx={{
              fontSize: 10,

              color: "#aaa",

              ml: 0.3,
            }}
          >
            {(product.rating || 0).toFixed(1)}
            {" "}
            ({product.reviewCount || 0})
          </Typography>
        </Box>

        {/* Price */}
        <Typography
          sx={{
            color: GOLD,

            fontWeight: 700,

            fontSize: 14,

            mt: 0.6,
          }}
        >
          KES {Number(product.price || 0).toLocaleString()}
        </Typography>

        {/* Old Price */}
        {product.markedPrice > product.price && (
          <Typography
            sx={{
              fontSize: 10,

              color: "#888",

              textDecoration:
                "line-through",
            }}
          >
            KES{" "}
            {Number(
              product.markedPrice
            ).toLocaleString()}
          </Typography>
        )}

        {/* Seller */}
        <Box mt={0.6}>
          <SellerBadge
            sellerVerified={
              product.sellerVerified
            }
            sellerBadge={
              product.sellerBadge
            }
          />
        </Box>

        {/* Location */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            mt: 0.6,
          }}
        >
          <LocationOnIcon
            sx={{
              fontSize: 12,

              color: "#888",
            }}
          />

          <Typography
            sx={{
              fontSize: 10,

              color: "#888",

              ml: 0.2,
            }}
          >
            {product.location ||
              "Kenya"}
          </Typography>
        </Box>

        {/* Views / Sold */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            mt: 0.4,
          }}
        >
          <VisibilityIcon
            sx={{
              fontSize: 11,

              color: "#888",
            }}
          />

          <Typography
            sx={{
              fontSize: 10,

              color: "#888",

              ml: 0.4,
            }}
          >
            {product.soldCount > 0
              ? `${product.soldCount} sold`
              : `${product.views || 0} views`}
          </Typography>
        </Box>

        {/* Delivery */}
        {product.deliveryAvailable && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",

              mt: 0.4,
            }}
          >
            <LocalShippingIcon
              sx={{
                color: "#4CAF50",

                fontSize: 12,
              }}
            />

            <Typography
              sx={{
                fontSize: 10,

                color: "#4CAF50",

                fontWeight: 600,

                ml: 0.3,
              }}
            >
              Delivery
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default React.memo(SmallProductCard);