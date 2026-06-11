import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography
} from "@mui/material";

import FlashOnIcon from "@mui/icons-material/FlashOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

export default function FlashSaleBanner() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [now, setNow] = useState(Date.now());

  /* CLOCK */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* FETCH */
  useEffect(() => {

    const load = async () => {

      const q = query(
        collection(db, "products"),
        where("flashSale", "==", true),
        where("status", "in", ["active", "approved"])
      );

      const snap = await getDocs(q);

      setProducts(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    };

    load();

  }, []);

  /* ACTIVE ONLY */
  const active = useMemo(() => {
    return products.filter(p => {

      const end =
        p.flashSaleEnd?.seconds
          ? p.flashSaleEnd.seconds * 1000
          : new Date(p.flashSaleEnd).getTime();

      return end > now;
    });
  }, [products, now]);

  if (!active.length) return null;

  const nearestEnd = Math.min(
    ...active.map(p =>
      p.flashSaleEnd?.seconds
        ? p.flashSaleEnd.seconds * 1000
        : new Date(p.flashSaleEnd).getTime()
    )
  );

  const remaining = nearestEnd - now;

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <Box sx={{ mt: 1, px: 1.5 }}>

      {/* HEADER */}
      <Box
  sx={{
    mx: 1,
    mb: 1,
    px: 1.2,
    py: 0.6,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    borderRadius: 2,

    background:
      "linear-gradient(90deg, #ff1744 0%, #ff9100 50%, #ff1744 100%)",

    boxShadow: "0 4px 12px rgba(255,23,68,0.25)",

    position: "relative",
    overflow: "hidden",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-60%",
      width: "60%",
      height: "100%",
      background:
        "linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent)",
      animation: "shine 2.5s infinite",
    },

    "@keyframes shine": {
      "0%": { left: "-60%" },
      "100%": { left: "120%" },
    },
  }}
>
  {/* LEFT SIDE */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <FlashOnIcon
      sx={{
        fontSize: 16,
        color: "#fff",
        filter: "drop-shadow(0 0 6px rgba(255,255,255,0.7))",
      }}
    />

    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 900,
        color: "#fff",
        letterSpacing: 0.5,
      }}
    >
      FLASH DEALS
    </Typography>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        ml: 1,
        px: 1,
        py: 0.2,
        borderRadius: 2,
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <AccessTimeIcon sx={{ fontSize: 12, color: "#fff" }} />

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        {String(h).padStart(2, "0")}:
        {String(m).padStart(2, "0")}:
        {String(s).padStart(2, "0")}
      </Typography>
    </Box>

    <Typography
      sx={{
        fontSize: 10,
        color: "rgba(255,255,255,0.85)",
        ml: 1,
        display: { xs: "none", sm: "block" },
      }}
    >
      Limited time offers 🔥
    </Typography>
  </Box>

  {/* RIGHT SIDE */}
  <Box
    onClick={() => navigate("/flash-sales")}
    sx={{
      px: 1.2,
      py: 0.3,
      borderRadius: 2,
      bgcolor: "#020000",
      color: "#ff1744",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer",
      transition: "0.2s ease",

      "&:hover": {
        transform: "scale(1.05)",
      },
    }}
  >
    View Deals →
  </Box>
</Box>


        

      {/* SCROLL */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 1,
          pb: 1,

          "&::-webkit-scrollbar": {
            display: "none"
          }
        }}
      >

        {active.map(product => {

          const end =
            product.flashSaleEnd?.seconds
              ? product.flashSaleEnd.seconds * 1000
              : new Date(product.flashSaleEnd).getTime();

          const remaining = end - now;

          const discount = Math.round(
            ((product.price - (product.flashSalePrice || product.price)) /
              product.price) *
            100
          );

          return (
            <Box
              key={product.id}
              onClick={() =>
                navigate(`/post/product/${product.id}`)
              }
              sx={{
                minWidth: 150,
                bgcolor: "#111",
                borderRadius: 2,
                p: 1,
                cursor: "pointer",
                border: "1px solid #222",
                transition: "0.2s",

                "&:hover": {
                  borderColor: GOLD,
                  transform: "scale(1.02)"
                }
              }}
            >

              {/* TOP ROW */}
              <Box sx={{ display: "flex", gap: 1 }}>

                {/* CIRCLE IMAGE */}
                <Box sx={{ position: "relative" }}>

                  <Box
                    component="img"
                    src={product.images?.[0]?.thumb}
                    sx={{
                      width: 55,
                      height: 55,
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />

                  {/* DISCOUNT BADGE */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      bgcolor: "#ff1744",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 900,
                      px: 0.6,
                      borderRadius: 1
                    }}
                  >
                    -{discount}%
                  </Box>

                </Box>

                {/* INFO */}
                <Box sx={{ flex: 1 }}>

                  {/* TITLE */}
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#fff",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      height: 28,
                      overflow: "hidden"
                    }}
                  >
                    {product.title}
                  </Typography>

                  {/* FLASH PRICE */}
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: GOLD
                    }}
                  >
                    KES {product.flashSalePrice || product.price}
                  </Typography>

                  {/* OLD PRICE */}
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "#777",
                      textDecoration: "line-through"
                    }}
                  >
                    KES {product.price}
                  </Typography>

                </Box>

              </Box>

              {/* URGENCY LINE */}
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10,
                  color: "#ff5252",
                  fontWeight: 700,
                  textAlign: "center"
                }}
              >
                 Click to Buy Now
              </Typography>

            </Box>
          );

        })}

      </Box>
    </Box>
  );
}