import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Button,
  Stack
} from "@mui/material";

import {
  WhatsApp,
  Phone
} from "@mui/icons-material";

import { useParams } from "react-router-dom";

import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const GOLD = "#F4B400";
const BLACK = "#000";
const CARD = "#111";
const BORDER = "#222";

export default function AdvertDetails() {

  const { id } = useParams();

  const [advert, setAdvert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {

    const loadAdvert = async () => {

      try {

        const ref = doc(db, "adverts", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {

          setAdvert({
            id: snap.id,
            ...snap.data()
          });

        }

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    loadAdvert();

  }, [id]);



  // ===============================
  // Loading
  // ===============================

  if (loading) {

    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }


  // ===============================
  // Not Found
  // ===============================

  if (!advert) {

    return (
      <Box textAlign="center" mt={6}>
        <Typography>Advertisement not found</Typography>
      </Box>
    );

  }



  // ===============================
  // Images
  // ===============================

  const images = advert.images || [];

  const getImageSrc = (img) => {
    if (!img) return "/placeholder.jpg";
    if (typeof img === "string") return img;
    return img.full || img.thumb || "/placeholder.jpg";
  };



  // ===============================
  // WhatsApp Contact
  // ===============================

  const whatsappLink = advert.phone
    ? `https://wa.me/${advert.phone.replace("+","")}?text=${encodeURIComponent(
        `Hello ${advert.organizerName || ""}, I am interested in your advert "${advert.title}" on Golden Biashnet.`
      )}`
    : null;



  return (

    <Box p={{ xs: 2, md: 4 }}>

      <Grid container spacing={3}>



        {/* =============================== */}
        {/* IMAGES */}
        {/* =============================== */}

        <Grid item xs={12} md={6}>

          <Card sx={{ background: CARD, border: `1px solid ${BORDER}` }}>

            <Box>

              <img
                src={getImageSrc(images[imageIndex])}
                alt="advert"
                style={{
                  width: "100%",
                  height: "350px",
                  objectFit: "cover"
                }}
              />

            </Box>


            {/* thumbnails */}

            <Box
              display="flex"
              gap={1}
              p={1}
              overflow="auto"
            >

              {images.map((img, i) => (

                <img
                  key={i}
                  src={getImageSrc(img)}
                  alt="thumb"
                  onClick={() => setImageIndex(i)}
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "cover",
                    border:
                      i === imageIndex
                        ? `2px solid ${GOLD}`
                        : "2px solid #333",
                    cursor: "pointer"
                  }}
                />

              ))}

            </Box>

          </Card>

        </Grid>



        {/* =============================== */}
        {/* DETAILS */}
        {/* =============================== */}

        <Grid item xs={12} md={6}>

          <Card sx={{ background: CARD, border: `1px solid ${BORDER}` }}>

            <CardContent>

              <Typography
                variant="h5"
                fontWeight="bold"
                color="#fff"
              >
                {advert.title}
              </Typography>


              <Box mt={1}>

                <Chip
                  label={advert.advertType}
                  sx={{
                    background: GOLD,
                    color: BLACK,
                    fontWeight: "bold"
                  }}
                />

              </Box>


              <Typography mt={2} color="#aaa">
                {advert.description}
              </Typography>


              <Divider sx={{ my: 2, borderColor: "#333" }} />


              {/* LOCATION */}

              <Typography color="#fff">
                📍 Location: <b>{advert.location}</b>
              </Typography>


              {/* PHONE */}

              {advert.phone && (

                <Typography color="#fff" mt={1}>
                  ☎ Phone: <b>{advert.phone}</b>
                </Typography>

              )}


              {/* SELLER */}

              {advert.organizerName && (

                <Typography color="#aaa" mt={1}>
                  Posted by: {advert.organizerName}
                </Typography>

              )}



              {/* =============================== */}
              {/* EVENT */}
              {/* =============================== */}

              {advert.advertType === "Event" && (

                <Box mt={2}>

                  <Typography color={GOLD}>
                    Event Details
                  </Typography>

                  <Typography color="#fff">
                    Venue: {advert.venue}
                  </Typography>

                  <Typography color="#fff">
                    Date: {advert.eventDate}
                  </Typography>

                  <Typography color="#fff">
                    Time: {advert.eventTime}
                  </Typography>

                  {advert.ticketRequired && (

                    <Typography
                      color={GOLD}
                      fontWeight="bold"
                    >
                      Ticket: KES {advert.price}
                    </Typography>

                  )}

                </Box>

              )}



              {/* =============================== */}
              {/* BUSINESS */}
              {/* =============================== */}

              {advert.advertType === "Business Advertisement" && (

                <Box mt={2}>

                  <Typography color={GOLD}>
                    Business Details
                  </Typography>

                  <Typography color="#fff">
                    Type: {advert.businessType}
                  </Typography>

                  <Typography color="#fff">
                    Address: {advert.businessAddress}
                  </Typography>

                  <Typography color="#fff">
                    Services: {advert.servicesOffered}
                  </Typography>

                </Box>

              )}



              {/* =============================== */}
              {/* JOB */}
              {/* =============================== */}

              {advert.advertType === "Job Opportunity" && (

                <Box mt={2}>

                  <Typography color={GOLD}>
                    Job Details
                  </Typography>

                  <Typography color="#fff">
                    Position: {advert.jobPosition}
                  </Typography>

                  <Typography color="#fff">
                    Salary: {advert.salary}
                  </Typography>

                </Box>

              )}



              <Divider sx={{ my: 3, borderColor: "#333" }} />



              {/* =============================== */}
              {/* CONTACT BUTTONS */}
              {/* =============================== */}

              <Stack spacing={2}>

                {/* WHATSAPP */}

                {whatsappLink && (

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<WhatsApp />}
                    href={whatsappLink}
                    target="_blank"
                    sx={{
                      background: "#25D366",
                      color: "#000",
                      fontWeight: "bold",
                      height: 50,
                      "&:hover": { background: "#1ebe5d" }
                    }}
                  >
                    WhatsApp Seller
                  </Button>

                )}


                {/* CALL */}

                {advert.phone && (

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Phone />}
                    href={`tel:${advert.phone}`}
                    sx={{
                      borderColor: GOLD,
                      color: GOLD,
                      height: 50
                    }}
                  >
                    Call Seller
                  </Button>

                )}

              </Stack>


            </CardContent>

          </Card>

        </Grid>

      </Grid>

    </Box>

  );

}