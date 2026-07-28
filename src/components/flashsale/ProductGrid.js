import React, { useMemo, useState } from "react";

import {
  Box,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  Typography,
  Chip,
  Stack,
  Button,
  Collapse,
  IconButton
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const GOLD = "#F4B400";

/* =========================
   ULTRA COMPACT PRODUCT GRID
========================= */

export default function ProductGrid({

  products = [],
  selected = [],
  setSelected,
  onProductClick,
  category

}) {

  const [openSections, setOpenSections] = useState({});

  /* =========================
     SORT BY LATEST FIRST
  ========================= */

  const sortedProducts = useMemo(() => {

    return [...products].sort((a, b) => {

      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;

      return bTime - aTime;

    });

  }, [products]);

  /* =========================
     GROUP BY CATEGORY
  ========================= */

  const grouped = useMemo(() => {

    const groups = {};

    sortedProducts.forEach(p => {

      const key = p.category || "Uncategorized";

      if (!groups[key]) groups[key] = [];

      groups[key].push(p);

    });

    return groups;

  }, [sortedProducts]);

  /* =========================
     TOGGLE SELECTION
  ========================= */

  const toggle = (id) => {

    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }

  };

  /* =========================
     TOGGLE SECTION
  ========================= */

  const toggleSection = (cat) => {

    setOpenSections(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));

  };

  /* =========================
     SELECT CATEGORY
  ========================= */

  const selectCategory = (cat) => {

    const ids = grouped[cat].map(p => p.id);

    setSelected(ids);

  };

  if (!products.length) return null;

  return (
    <Box>

      {/* ================= HEADER ================= */}
      <Stack
        direction="row"
        justifyContent="space-between"
        mb={2}
      >
        <Typography
          fontWeight={800}
          color={GOLD}
        >
          Products ({products.length})
        </Typography>

        <Typography
          fontSize={12}
          color="#888"
        >
          Sorted: Latest First
        </Typography>
      </Stack>

      {/* ================= CATEGORY GROUPS ================= */}
      {Object.keys(grouped).map(cat => {

        const isOpen = openSections[cat] ?? true;

        return (
          <Box key={cat} mb={2}>

            {/* ===== CATEGORY HEADER ===== */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                background: "#111",
                p: 1,
                borderRadius: 2,
                border: "1px solid #222"
              }}
            >

              <Typography
                fontWeight={700}
                color="#fff"
                fontSize={13}
              >
                {cat} ({grouped[cat].length})
              </Typography>

              <Stack direction="row" spacing={1}>

                <Button
                  size="small"
                  onClick={() => selectCategory(cat)}
                  sx={{
                    color: GOLD,
                    fontSize: 11
                  }}
                >
                  Select All
                </Button>

                <IconButton
                  size="small"
                  onClick={() => toggleSection(cat)}
                  sx={{ color: "#aaa" }}
                >
                  {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>

              </Stack>

            </Stack>

            {/* ===== COLLAPSIBLE GRID ===== */}
            <Collapse in={isOpen} timeout="auto">

              <Grid container spacing={1} sx={{ mt: 1 }}>

                {grouped[cat].map(product => (

                  <Grid
                    item
                    xs={3}
                    sm={2}
                    md={1.5}
                    key={product.id}
                  >

                    <Card
                      sx={{
                        background: "#111",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: selected.includes(product.id)
                          ? `2px solid ${GOLD}`
                          : "1px solid #222",
                        cursor: "pointer"
                      }}
                    >

                      {/* ================= IMAGE ================= */}
                      <Box position="relative">

                        <CardMedia
                          component="img"
                          image={
                            product.images?.[0]?.thumb ||
                            product.images?.[0]?.small ||
                            "/placeholder.jpg"
                          }
                          sx={{
                            height: 60,
                            objectFit: "cover"
                          }}
                          onClick={() => onProductClick(product)}
                        />

                        {/* CHECKBOX */}
                        <Checkbox
                          checked={selected.includes(product.id)}
                          onChange={() => toggle(product.id)}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -8,
                            left: -8,
                            color: GOLD
                          }}
                        />

                      </Box>

                      {/* ================= INFO ================= */}
                      <Box p={0.5}>

                        <Typography
                          fontSize={10}
                          fontWeight={700}
                          noWrap
                        >
                          {product.title}
                        </Typography>

                        <Typography
                          fontSize={10}
                          color="#999"
                        >
                          KES {Number(product.price).toLocaleString()}
                        </Typography>

                        {/* FLASH BADGE */}
                        {product.flashSale && (
                          <Chip
                            label={`${product.discount}%`}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 18,
                              fontSize: 10,
                              background: "#ff4444",
                              color: "#fff"
                            }}
                          />
                        )}

                      </Box>

                    </Card>

                  </Grid>

                ))}

              </Grid>

            </Collapse>

          </Box>
        );

      })}

    </Box>
  );
}