import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  MenuItem,
  Stack,
  CircularProgress,
  Alert
} from "@mui/material";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

export default function AdminFlashSales() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    flashSale: false,
    flashSalePrice: "",
    flashSaleDuration: 24
  });

  const [search, setSearch] = useState("");

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "in", ["approved", "active"])
        );

        const snap = await getDocs(q);

        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setProducts(data);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= SELECT PRODUCT ================= */
  const selectedProduct = products.find(p => p.id === selectedId);

  /* ================= SAVE FLASH SALE ================= */
  const handleSave = async () => {

    if (!selectedId) return;

    setSaving(true);

    try {

      const endTime = new Date();
      endTime.setHours(
        endTime.getHours() + Number(form.flashSaleDuration || 24)
      );

      await updateDoc(doc(db, "products", selectedId), {
        flashSale: form.flashSale,
        flashSalePrice: Number(form.flashSalePrice),
        flashSaleStart: new Date(),
        flashSaleEnd: endTime
      });

      alert("Flash sale updated successfully");

    } catch (err) {
      console.log(err);
      alert("Error updating flash sale");
    } finally {
      setSaving(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: "#050505", minHeight: "100vh", color: "#fff" }}>

      <Typography sx={{ fontSize: 26, fontWeight: 900, color: GOLD, mb: 2 }}>
        Flash Sale Manager
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, background: "#111" }}
      />

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

        {/* LEFT: PRODUCT LIST */}
        <Paper sx={{ flex: 1, p: 2, background: "#111", maxHeight: 500, overflow: "auto" }}>

          <Typography sx={{ mb: 1, fontWeight: 700 }}>
            Select Product
          </Typography>

          {filteredProducts.map(p => (
            <Box
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setForm({
                  flashSale: p.flashSale || false,
                  flashSalePrice: p.flashSalePrice || ""
                });
              }}
              sx={{
                p: 1,
                mb: 1,
                cursor: "pointer",
                background: selectedId === p.id ? "#222" : "#000",
                border: "1px solid #333",
                borderRadius: 2
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {p.title}
              </Typography>

              <Typography sx={{ fontSize: 10, color: "#aaa" }}>
                KES {p.price}
              </Typography>
            </Box>
          ))}

        </Paper>

        {/* RIGHT: SETTINGS */}
        <Paper sx={{ flex: 1, p: 3, background: "#111" }}>

          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            Flash Sale Settings
          </Typography>

          {!selectedProduct && (
            <Alert severity="info">
              Select a product first
            </Alert>
          )}

          <Stack spacing={2} mt={2}>

            <FormControlLabel
              control={
                <Switch
                  checked={form.flashSale}
                  onChange={(e) =>
                    setForm({ ...form, flashSale: e.target.checked })
                  }
                />
              }
              label="Enable Flash Sale"
            />

            <TextField
              label="Flash Sale Price"
              type="number"
              value={form.flashSalePrice}
              onChange={(e) =>
                setForm({ ...form, flashSalePrice: e.target.value })
              }
            />

            <TextField
              select
              label="Duration (hours)"
              value={form.flashSaleDuration}
              onChange={(e) =>
                setForm({ ...form, flashSaleDuration: e.target.value })
              }
            
            >
              {[6, 12, 24, 48].map(h => (
                <MenuItem key={h} value={h}>
                  {h} Hours
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !selectedId}
              sx={{ background: GOLD, color: "#000", fontWeight: 700 }}
            >
              {saving ? "Saving..." : "Update Flash Sale"}
            </Button>

          </Stack>

        </Paper>

      </Box>
    </Box>
  );
}