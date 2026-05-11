// src/pages/EditListing.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

export default function EditListing() {

  const { collection, id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  // ================= LOAD ITEM =================

  useEffect(() => {

    const fetchItem = async () => {

      try {

        const ref = doc(db, collection, id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setData(snap.data());
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };

    fetchItem();

  }, [collection, id]);

  // ================= HANDLE CHANGE =================

  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ================= SAVE =================

  const handleSave = async () => {

    try {

      await updateDoc(doc(db, collection, id), data);

      alert("Updated successfully");

      navigate("/my-uploads");

    } catch (err) {
      console.error(err);
    }

  };

  // ================= LOADING =================

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ================= UI =================

  return (

    <Box sx={{ p: 2, background: "#000", minHeight: "100vh" }}>

      <Typography sx={{ color: "#fff", mb: 2 }}>
        Edit {collection}
      </Typography>

      {/* TITLE */}
      <TextField
        label="Title"
        fullWidth
        value={data.title || ""}
        onChange={(e) => handleChange("title", e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* PRICE */}
      {(collection === "products" || collection === "services") && (
        <TextField
          label="Price"
          fullWidth
          value={data.price || ""}
          onChange={(e) => handleChange("price", e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {/* RENT */}
      {collection === "houses" && (
        <TextField
          label="Rent"
          fullWidth
          value={data.rent || ""}
          onChange={(e) => handleChange("rent", e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {/* LOCATION */}
      <TextField
        label="Location"
        fullWidth
        value={data.location || ""}
        onChange={(e) => handleChange("location", e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* DESCRIPTION */}
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* SAVE BUTTON */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        sx={{
          background: GOLD,
          color: "#000",
          fontWeight: "bold"
        }}
      >
        Save Changes
      </Button>

    </Box>

  );

}