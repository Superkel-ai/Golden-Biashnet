// src/components/ServiceGrid.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Chip
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


// ================= THEME =================

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";

const GREEN = "#00C853";
const RED = "#ff4444";


// ================= SAFE IMAGE =================

const getImage = (service) => {

  if (!service.images) return null;

  const img =
    service.images?.[0]?.thumb ||
    service.images?.[0]?.full ||
    service.images?.[0];

  if (!img) return null;

  return img;
};


// ================= PRICE FORMAT =================

const formatPrice = (price) => {

  if (!price) return "";

  return "KES " + Number(price).toLocaleString();

};


// ================= SERVICE CARD =================

const ServiceCard = React.memo(({ service, navigate, promoted }) => {

  const image = getImage(service);

  if (!image) return null;

  const availability = service.availability || "Available";

  return (

    <Box
      onClick={() => navigate(`/post/service/${service.id}`)}

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
          alt={service.title}
          loading="lazy"
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover"
          }}
        />


        {/* PROMOTED BADGE */}

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


        {/* AVAILABILITY */}

        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            background:
              availability === "available" ? GREEN : BG,
            color: "#11daf5",
            fontSize: "10px",
            fontWeight: "bold",
            px: 1,
            py: 0.3,
            borderRadius: "6px"
          }}
        >
          {availability}
        </Box>

      </Box>


      {/* CONTENT */}

      <Box sx={{ p: 1.5 }}>

        {/* TITLE */}

        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {service.title}
        </Typography>


        {/* PROVIDER */}

        {service.name && (

          <Typography
            sx={{
              fontSize: "12px",
              color: "#aaa"
            }}
          >
            by {service.name}
          </Typography>

        )}


        {/* CATEGORY */}

        <Typography
          sx={{
            fontSize: "11px",
            color: "#777",
            mt: 0.5
          }}
        >
          {service.category} • {service.subCategory}
        </Typography>


        {/* PRICE */}

        {service.price && (

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: "14px",
              mt: 0.5
            }}
          >
            {formatPrice(service.price)}
            {" "}
            <span style={{ fontSize: "11px", color: "#999" }}>
              ({service.pricingType})
            </span>
          </Typography>

        )}


        {/* SKILLS */}

        {service.skills && service.skills.length > 0 && (

          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: "4px"
            }}
          >

            {service.skills.slice(0, 2).map((skill, i) => (

              <Chip
                key={i}
                label={skill}
                size="small"
                sx={{
                  background: "#222",
                  color: "#ccc",
                  fontSize: "10px"
                }}
              />

            ))}

          </Box>

        )}


        {/* LOCATION */}

        {service.location && (

          <Typography
            sx={{
              fontSize: "11px",
              color: "#777",
              mt: 1
            }}
          >
            📍 {service.location}
          </Typography>

        )}


        {/* RATING */}

        {service.rating > 0 && (

          <Typography
            sx={{
              fontSize: "11px",
              color: "#aaa"
            }}
          >
            ⭐ {service.rating} ({service.reviews})
          </Typography>

        )}

      </Box>

    </Box>

  );

});


// ================= MAIN GRID =================

export default function ServiceGrid() {

  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [promoted, setPromoted] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchServices = async () => {

      try {

        // PROMOTED SERVICES

        const promotedQuery = query(

          collection(db, "services"),

          where("status", "==", "active"),

          where("promoted", "==", true)

        );

        const promotedSnap = await getDocs(promotedQuery);

        const promotedData = promotedSnap.docs.map(doc => ({

          id: doc.id,

          ...doc.data()

        }));


        // LATEST SERVICES

        const latestQuery = query(

          collection(db, "services"),

          where("status", "==", "active"),

          orderBy("createdAt", "desc"),

          limit(40)

        );

        const latestSnap = await getDocs(latestQuery);

        const latestData = latestSnap.docs.map(doc => ({

          id: doc.id,

          ...doc.data()

        }));


        // REMOVE DUPLICATES

        const promotedIds = new Set(promotedData.map(s => s.id));

        const filteredLatest = latestData.filter(

          s => !promotedIds.has(s.id)

        );


        setPromoted(promotedData);

        setServices(filteredLatest);

      }

      catch (error) {

        console.error("ServiceGrid error:", error);

      }

      finally {

        setLoading(false);

      }

    };

    fetchServices();

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


      {/* PROMOTED SERVICES */}

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
            ⭐ Promoted Services
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

            {promoted.map(service => (

              <ServiceCard
                key={service.id}
                service={service}
                navigate={navigate}
                promoted
              />

            ))}

          </Box>

        </Box>

      )}


      {/* LATEST SERVICES */}

      <Typography
        sx={{
          color: GOLD,
          fontWeight: "bold",
          fontSize: "18px",
          mb: 1,
          px: 1
        }}
      >
        Latest Services
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

        {services.map(service => (

          <ServiceCard
            key={service.id}
            service={service}
            navigate={navigate}
          />

        ))}

      </Box>

    </Box>

  );

}