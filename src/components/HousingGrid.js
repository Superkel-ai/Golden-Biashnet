// src/components/HousingGrid.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";
const GREEN = "#00C853";

// ================= FORMAT PRICE =================

const formatPrice = (rent) => {
  if (!rent) return "";
  return "KES " + Number(rent).toLocaleString();
};

// ================= SAFE IMAGE =================

const getImage = (house) => {

  const img =
    house.images?.[0]?.thumb ||
    house.images?.[0]?.full ||
    house.images?.[0];

  if (!img) return null;

  return img;
};

// ================= HOUSE CARD =================

const HouseCard = React.memo(({ house, navigate, promoted }) => {

  const image = getImage(house);

  if (!image) return null;

  return (

    <Box
      onClick={() => navigate(`/post/house/${house.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${promoted ? GOLD : BORDER}`,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",

        "&:hover": {
          border: `1px solid ${GOLD}`
        },

        "&:active": {
          transform: "scale(0.98)"
        }
      }}
    >

      {/* IMAGE */}
      <Box sx={{ position: "relative" }}>

        <img
          src={image}
          alt={house.title}
          loading="lazy"
          style={{
            width: "100%",
            height: "170px",
            objectFit: "cover"
          }}
        />

        {/* PROMOTED */}
        {promoted && (

          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              background: GOLD,
              color: "#000",
              fontSize: "10px",
              fontWeight: "bold",
              px: 1,
              py: 0.3,
              borderRadius: "6px"
            }}
          >
            ⭐ PROMOTED
          </Box>

        )}

        {/* AVAILABLE */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            background: BG,
            color: "#8eee11",
            fontSize: "10px",
            fontWeight: "bold",
            px: 1,
            py: 0.3,
            borderRadius: "6px"
          }}
        >
          AVAILABLE
        </Box>

      </Box>


      {/* CONTENT */}
      <Box sx={{ p: 1.5 }}>

        {/* TITLE */}
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#fff",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {house.title}
        </Typography>


        {/* PRICE */}
        <Typography
          sx={{
            color: GOLD,
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {formatPrice(house.rent)} / month
        </Typography>


        {/* LOCATION */}
        {house.location && (
          <Typography
            sx={{
              fontSize: "11px",
              color: "#777",
              mt: 0.5
            }}
          >
            📍 {house.location}
          </Typography>
        )}


        {/* FEATURES */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
            flexWrap: "wrap"
          }}
        >

          {house.bedrooms !== undefined && (

            <Box
              sx={{
                background: "#1e1e1e",
                color: "#ccc",
                fontSize: "10px",
                px: 1,
                py: 0.3,
                borderRadius: "6px"
              }}
            >
              🛏 {house.bedrooms} Bed
            </Box>

          )}

          {house.bathrooms !== undefined && (

            <Box
              sx={{
                background: "#1e1e1e",
                color: "#ccc",
                fontSize: "10px",
                px: 1,
                py: 0.3,
                borderRadius: "6px"
              }}
            >
              🚿 {house.bathrooms} Bath
            </Box>

          )}

        </Box>

      </Box>

    </Box>

  );

});


// ================= HOUSING GRID =================

export default function HousingGrid() {

  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [promoted, setPromoted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchHouses = async () => {

      try {

        // ⭐ PROMOTED
        const promotedQuery = query(
          collection(db, "houses"),
          where("status", "==", "available"),
          where("promoted", "==", true),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        const promotedSnap = await getDocs(promotedQuery);

        const promotedData = promotedSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


        // 🏠 NORMAL HOUSES
        const houseQuery = query(
          collection(db, "houses"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(40)
        );

        const snap = await getDocs(houseQuery);

        const houseData = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


        // remove duplicates
        const promotedIds = new Set(promotedData.map(h => h.id));

        const filtered = houseData.filter(
          h => !promotedIds.has(h.id)
        );

        setPromoted(promotedData);
        setHouses(filtered);

      } catch (error) {

        console.error("HousingGrid error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchHouses();

  }, []);


  if (loading) {

    return (

      <Box
        sx={{
          minHeight: "40vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>

    );

  }


  return (

    <Box sx={{ background: BG, pb: 4 }}>

      {/* ⭐ PROMOTED */}
      {promoted.length > 0 && (

        <Box sx={{ mb: 4 }}>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: "18px",
              mb: 1,
              px: 1
            }}
          >
            ⭐ Promoted Houses
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "12px",
              px: 1
            }}
          >

            {promoted.map(house => (

              <HouseCard
                key={house.id}
                house={house}
                navigate={navigate}
                promoted
              />

            ))}

          </Box>

        </Box>

      )}


      {/* 🏠 AVAILABLE */}
      <Typography
        sx={{
          color: GOLD,
          fontWeight: "bold",
          fontSize: "18px",
          mb: 1,
          px: 1
        }}
      >
        Available Houses
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "12px",
          px: 1
        }}
      >

        {houses.map(house => (

          <HouseCard
            key={house.id}
            house={house}
            navigate={navigate}
          />

        ))}

      </Box>

    </Box>

  );

}