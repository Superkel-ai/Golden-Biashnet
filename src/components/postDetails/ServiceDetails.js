// src/pages/ServiceDetails.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Dialog
} from "@mui/material";

import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  updateDoc,
  increment,
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
  if (!price) return "Contact for price";
  return "KES " + Number(price).toLocaleString();
};


// IMAGE HELPER
const getImages = (images) => {
  if (!images) return [];
  return images.map(img => img?.full || img?.thumb || img);
};



export default function ServiceDetails() {

  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);


  useEffect(() => {

    const fetchService = async () => {

      try {

        const ref = doc(db, "services", id);

        const snap = await getDoc(ref);

        if (snap.exists()) {

          setService({
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

    fetchService();

  }, [id]);

  const formatKenyanPhone = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\s+/g, "").trim();

  if (cleaned.startsWith("07")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("7") && cleaned.length === 9) return "254" + cleaned;
  if (cleaned.startsWith("+254")) return cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;

  return cleaned;
};

  /* ===================================== */
  /* WHATSAPP LINK */
  /* ===================================== */
const sellerPhone = formatKenyanPhone(service?.providerPhone);

const whatsappLink = sellerPhone
  ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(
      `Hello ${service.name || "there"}, I saw your service "${
        service.title
      }" on Golden Biashnet and I am interested. Kindly share more details.`
    )}`
  : null;
 
  // Track contact attempts
const trackContact = async (type) => {
  try {
    await addDoc(collection(db, "contactEvents"), {
      serviceId: service.id,
      providerId: service.providerId,
      userId: auth.currentUser?.uid || null,
      type, // whatsapp / call / sms
      createdAt: serverTimestamp()
    });

    // 🔥 increment seller engagement
    if (service.providerId) {
      const ref = doc(db, "users", service.providerId);

      await updateDoc(ref, {
        chatRequests: increment(1)
      });
    }

  } catch (err) {
    console.error(err);
  }
};

 

  if (loading) {

    return (

      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: BG
        }}
      >

        <CircularProgress sx={{ color: GOLD }} />

      </Box>

    );

  }


  if (!service) {

    return (

      <Box sx={{ p: 4 }}>
        <Typography color="white">
          Service not found
        </Typography>
      </Box>

    );

  }


  const images = getImages(service.images);



  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 6
      }}
    >


      {/* IMAGE GALLERY */}

      {images.length > 0 && (

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 1,
            p: 1,
            scrollSnapType: "x mandatory"
          }}
        >

          {images.map((img, i) => (

            <Box
              key={i}
              onClick={() => setPreviewImage(img)}
              sx={{
                minWidth: "100%",
                height: 300,
                borderRadius: "8px",
                overflow: "hidden",
                scrollSnapAlign: "start",
                background: "#000",
                cursor: "pointer"
              }}
            >

              <img
                src={img}
                alt="service"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />

            </Box>

          ))}

        </Box>

      )}



      {/* DETAILS */}

      <Box
        sx={{
          p: 2,
          maxWidth: 700,
          mx: "auto"
        }}
      >


        {/* TITLE */}

        <Typography
          sx={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "bold"
          }}
        >
          {service.title}
        </Typography>



        {/* PRICE */}

        <Typography
          sx={{
            color: GOLD,
            fontSize: 24,
            fontWeight: "bold",
            mt: 1
          }}
        >
          {formatPrice(service.price)}
        </Typography>



        {/* PRICING TYPE */}

        {service.pricingType && (

          <Typography sx={{ color: "#aaa", mt: 0.5 }}>
            Pricing: {service.pricingType}
          </Typography>

        )}



        {/* LOCATION */}

        <Typography sx={{ color: "#aaa", mt: 1 }}>
          📍 {service.location}
        </Typography>



        {/* CATEGORY */}

        <Typography sx={{ color: "#aaa", mt: 1 }}>
          {service.category} • {service.subCategory}
        </Typography>



        {/* SKILLS */}

        {service.skills?.length > 0 && (

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: 2
            }}
          >

            {service.skills.map((skill, i) => (

              <Chip
                key={i}
                label={skill}
                sx={{
                  background: CARD,
                  color: "#fff"
                }}
              />

            ))}

          </Box>

        )}



        {/* SERVICE INFO */}

        <Box sx={{ mt: 3 }}>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              mb: 1
            }}
          >
            Service Information
          </Typography>

          {service.availability && (

            <Typography sx={{ color: "#ccc" }}>
              Availability: {service.availability}
            </Typography>

          )}

        </Box>



        {/* PROVIDER */}

        <Box sx={{ mt: 3 }}>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              mb: 1
            }}
          >
            Service Provider
          </Typography>

          <Typography sx={{ color: "#ccc" }}>
            {service.name}
          </Typography>

          {service.qualifications && (

            <Typography sx={{ color: "#ccc" }}>
              Qualifications: {service.qualifications}
            </Typography>

          )}

          {service.rating > 0 && (

            <Typography sx={{ color: "#ccc" }}>
              ⭐ {service.rating} ({service.reviews} reviews)
            </Typography>

          )}

        </Box>



        {/* DESCRIPTION */}

        <Box sx={{ mt: 3 }}>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              mb: 1
            }}
          >
            Description
          </Typography>

          <Typography
            sx={{
              color: "#ccc",
              lineHeight: 1.6
            }}
          >
            {service.description}
          </Typography>

        </Box>
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
    Contact Service Provider
  </Typography>

  <Typography
    sx={{
      color: "#aaa",
      fontSize: 13,
      mb: 2
    }}
  >
    Chat directly with the provider to get more details, pricing, and availability.
  </Typography>

  {/* WHATSAPP */}
  <Button
    fullWidth
    variant="contained"
    href={whatsappLink}
    target="_blank"
    onClick={() => trackContact("whatsapp")}
    sx={{
      background: "#25D366",
      color: "#000",
      fontWeight: "bold",
      height: 48
    }}
  >
    Chat on WhatsApp
  </Button>

</Box>

      <Button
  fullWidth
  variant="outlined"
  href={`tel:${sellerPhone}`}
  onClick={() => trackContact("call")}
  sx={{
    mt: 1,
    borderColor: GOLD,
    color: GOLD
  }}
>
  Call Provider
</Button>

</Box>

      {/* FULL IMAGE PREVIEW */}

      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
      >

        <img
          src={previewImage}
          alt="preview"
          style={{
            width: "100%",
            height: "auto"
          }}
        />

      </Dialog>


    </Box>

  );

}