// src/pages/HouseDetails.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  TextField
} from "@mui/material";

import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";


// THEME
const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";


// PRICE FORMAT
const formatPrice = (price) => {
  if (!price) return "";
  return "KES " + Number(price).toLocaleString();
};


// IMAGE HELPER
const getImages = (images) => {
  if (!images) return [];
  return images.map(img => img?.full || img?.thumb || img);
};


export default function HouseDetails() {

  const { id } = useParams();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [relocationDate, setRelocationDate] = useState("");
  const [sending, setSending] = useState(false);


  useEffect(() => {

    const fetchHouse = async () => {

      try {

        const ref = doc(db, "houses", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {

          setHouse({
            id: snap.id,
            ...snap.data()
          });

        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchHouse();

  }, [id]);


  const handleRequest = async () => {

    if (!relocationDate) {
      alert("Please select relocation date");
      return;
    }

    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    try {

      setSending(true);

      await addDoc(collection(db, "houseRequests"), {

        houseId: house.id,
        userId: auth.currentUser.uid,

        relocationDate,

        status: "pending",

        createdAt: serverTimestamp()

      });

      alert("Request sent. Admin will contact you.");

      setRelocationDate("");

    } catch (error) {

      console.error(error);
      alert("Failed to send request");

    }

    setSending(false);

  };


  if (loading) {

    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }


  if (!house) {

    return (
      <Box sx={{ p: 4 }}>
        <Typography color="white">
          House not found
        </Typography>
      </Box>
    );

  }


  const images = getImages(house.images);


  return (

    <Box sx={{ background: BG, minHeight: "100vh", pb: 6 }}>

      {/* IMAGE GALLERY */}

      {images.length > 0 && (

        <Box>

          <img
            src={images[activeImage]}
            alt="house"
            style={{
              width: "100%",
              height: "260px",
              objectFit: "cover"
            }}
          />

          {images.length > 1 && (

            <Box
              sx={{
                display: "flex",
                gap: 1,
                p: 1,
                overflowX: "auto"
              }}
            >

              {images.map((img, i) => (

                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: "70px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border:
                      activeImage === i
                        ? `2px solid ${GOLD}`
                        : "2px solid transparent",
                    cursor: "pointer"
                  }}
                />

              ))}

            </Box>

          )}

        </Box>

      )}


      {/* DETAILS */}

      <Box sx={{ p: 2 }}>

        {/* TITLE */}

        <Typography
          sx={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: "bold"
          }}
        >
          {house.title}
        </Typography>


        {/* RENT */}

        <Typography
          sx={{
            color: GOLD,
            fontSize: "24px",
            fontWeight: "bold",
            mt: 1
          }}
        >
          {formatPrice(house.rent)} / month
        </Typography>


        {/* HUNTING FEE */}

        {house.huntingFee && (
          <Typography sx={{ color: "#aaa", mt: 0.5 }}>
            Hunting Fee: {formatPrice(house.huntingFee)}
          </Typography>
        )}


        {/* LOCATION */}

        <Typography sx={{ color: "#aaa", mt: 1 }}>
          📍 {house.location}
        </Typography>


        {/* PROPERTY INFO */}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mt: 2
          }}
        >

          <Chip label={`${house.bedrooms} Bedrooms`} sx={{ background: CARD, color: "#fff" }} />

          <Chip label={`${house.bathrooms} Bathrooms`} sx={{ background: CARD, color: "#fff" }} />

          {house.propertyType && (
            <Chip label={house.propertyType} sx={{ background: CARD, color: "#fff" }} />
          )}

          {house.floor && (
            <Chip label={`Floor ${house.floor}`} sx={{ background: CARD, color: "#fff" }} />
          )}

          {house.furnished && (
            <Chip label={`Furnished: ${house.furnished}`} sx={{ background: CARD, color: "#fff" }} />
          )}

        </Box>


        {/* BUILDING */}

        <Box sx={{ mt: 3 }}>

          <Typography sx={{ color: GOLD, fontWeight: "bold", mb: 1 }}>
            Building Information
          </Typography>

          <Typography sx={{ color: "#ccc" }}>
            Building: {house.buildingName}
          </Typography>

          <Typography sx={{ color: "#ccc" }}>
            Street: {house.street}
          </Typography>

        </Box>


        {/* UTILITIES */}

        {house.utilities && (

          <Box sx={{ mt: 3 }}>

            <Typography sx={{ color: GOLD, fontWeight: "bold", mb: 1 }}>
              Utilities
            </Typography>

            <Typography sx={{ color: "#ccc" }}>
              {house.utilities}
            </Typography>

          </Box>

        )}


        {/* DESCRIPTION */}

        <Box sx={{ mt: 3 }}>

          <Typography sx={{ color: GOLD, fontWeight: "bold", mb: 1 }}>
            Description
          </Typography>

          <Typography sx={{ color: "#ccc", lineHeight: 1.6 }}>
            {house.description}
          </Typography>

        </Box>


        {/* BOOK HOUSE */}

        <Box
          sx={{
            mt: 4,
            p: 2,
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "10px"
          }}
        >

          <Typography
            sx={{
              color: "#fff",
              fontWeight: "bold",
              mb: 2
            }}
          >
            Interested in this house?
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: "13px",
              mb: 2
            }}
          >
            Select when you plan to relocate. Our admin team will contact you and arrange viewing.
          </Typography>

          <TextField
  fullWidth
  type="date"
  label="Relocation Date"
  InputLabelProps={{ shrink: true }}
  value={relocationDate}
  onChange={(e) => setRelocationDate(e.target.value)}
  sx={{
    mb: 4,

    input: {
      color: "#fff"
    },

    label: {
      color: "#aaa"
    },

    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#333"
      },
      "&:hover fieldset": {
        borderColor: "#F4B400"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#F4B400"
      }
    },

    /* Calendar icon color */
    "& input::-webkit-calendar-picker-indicator": {
      filter: "invert(1) brightness(2)"
    }
  }}
/>


          


          <Button
            fullWidth
            variant="contained"
            disabled={sending}
            onClick={handleRequest}
            sx={{
              background: GOLD,
              color: "#030303",
              fontWeight: "bold",
              height: 48,
              "&:hover": {
                background: "#FFD54F"
              }
            }}
          >
            {sending ? "Sending..." : "Book This House"}
          </Button>

        </Box>

      </Box>

    </Box>

  );

}