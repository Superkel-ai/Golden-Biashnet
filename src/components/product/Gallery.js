import React, { useMemo, useState, useEffect } from "react";

import {
  Box,
  IconButton,
  Typography,
  Stack,
  Chip,
  Tooltip
} from "@mui/material";

import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Share,
  Bolt,
  WorkspacePremium,
  LocalOffer
} from "@mui/icons-material";

import { shareProduct } from "../product/Share";

const GOLD = "#F4B400";

export default function Gallery({ product }) {

  const images = useMemo(() => {

    if (
      !product?.images ||
      !Array.isArray(product.images)
    ) {
      return [];
    }

    return product.images
      .filter(Boolean)
      .map((img) => ({
        full:
          img?.full ||
          img?.original ||
          img?.thumb ||
          "",
        thumb:
          img?.thumb ||
          img?.small ||
          img?.full ||
          img?.original ||
          ""
      }))
      .filter((img) => img.full);

  }, [product]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [product?.id]);


const handleShare = () => {
  shareProduct({
    post: product,
  });
};

  const markedPrice =
    Number(product?.markedPrice || 0);

  const price =
    Number(product?.price || 0);

  const hasDiscount =
    markedPrice > price &&
    markedPrice > 0;

  const discountPercent = hasDiscount
    ? Math.round(
        ((markedPrice - price) /
          markedPrice) *
          100
      )
    : 0;

  const isPromoted =
    product?.promotion?.promoted === true;

  const isFlashSale =
    product?.flashSale === true;

  if (!images.length) {

    return (
      <Box
        sx={{
          height: 350,
          bgcolor: "#111",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 4
        }}
      >
        <ImageIcon
          sx={{
            fontSize: 70,
            color: "#444"
          }}
        />

        <Typography
          sx={{
            color: "#777",
            mt: 1
          }}
        >
          No Images Available
        </Typography>
      </Box>
    );

  }

  const current = images[index];

  return (

    <Box>

      {/* MAIN IMAGE */}

      <Box
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden"
        }}
      >

        <Box
          component="img"
          src={current.full}
          alt={product?.title || "Product"}
          sx={{
            width: "100%",
            height: {
              xs: 340,
              md: 500
            },
            objectFit: "cover",
            display: "block",
            bgcolor: "#111"
          }}
        />

        {/* IMAGE COUNT */}

        <Chip
          label={`${index + 1}/${images.length}`}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor:
              "rgba(0,0,0,.75)",
            color: "#fff"
          }}
        />

        {/* SHARE */}

        <Tooltip title="Share Product">

          <IconButton
            onClick={handleShare}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor:
                "rgba(0,0,0,.75)",
              color: "#fff"
            }}
          >
            <Share />
          </IconButton>

        </Tooltip>

        {/* BADGES */}

        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            left: 12,
            bottom: 12
          }}
        >

          {isPromoted && (

            <Chip
              icon={
                <WorkspacePremium />
              }
              label="Promoted"
              sx={{
                bgcolor: GOLD,
                color: "#000",
                fontWeight: 800
              }}
            />

          )}

          {isFlashSale && (

            <Chip
              icon={<Bolt />}
              label="Flash Sale"
              sx={{
                bgcolor: "#FF1744",
                color: "#fff",
                fontWeight: 800
              }}
            />

          )}

          {hasDiscount && (

            <Chip
              icon={<LocalOffer />}
              label={`${discountPercent}% OFF`}
              sx={{
                bgcolor: "#00C853",
                color: "#fff",
                fontWeight: 800
              }}
            />

          )}

        </Stack>

        {/* PREV */}

        {images.length > 1 && (

          <IconButton
            onClick={() =>
              setIndex((prev) =>
                prev === 0
                  ? images.length - 1
                  : prev - 1
              )
            }
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform:
                "translateY(-50%)",
              bgcolor:
                "rgba(0,0,0,.6)",
              color: "#fff"
            }}
          >
            <ChevronLeft />
          </IconButton>

        )}

        {/* NEXT */}

        {images.length > 1 && (

          <IconButton
            onClick={() =>
              setIndex((prev) =>
                prev ===
                images.length - 1
                  ? 0
                  : prev + 1
              )
            }
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform:
                "translateY(-50%)",
              bgcolor:
                "rgba(0,0,0,.6)",
              color: "#fff"
            }}
          >
            <ChevronRight />
          </IconButton>

        )}

      </Box>

      {/* THUMBNAILS */}

      {images.length > 1 && (

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.5,
            overflowX: "auto",
            pb: 1
          }}
        >

          {images.map(
            (img, i) => (

              <Box
                key={i}
                component="img"
                src={img.thumb}
                onClick={() =>
                  setIndex(i)
                }
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 2,
                  objectFit: "cover",
                  cursor: "pointer",
                  flexShrink: 0,
                  border:
                    i === index
                      ? `2px solid ${GOLD}`
                      : "1px solid #222"
                }}
              />

            )
          )}

        </Stack>

      )}

    </Box>

  );

}