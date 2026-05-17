import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Chip,
  Divider,
  Button,
  Stack,
  IconButton,
  Dialog
} from "@mui/material";

import {
  WhatsApp,
  Chat,
  Share,
  ChevronLeft,
  ChevronRight,
  LocationOn,
  Verified,
  Shield,
  Campaign,
  Work,
  Storefront,
  Event
} from "@mui/icons-material";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  db,
  auth
} from "../../services/firebase";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore";

/* =====================================================
THEME
===================================================== */

const GOLD = "#F4B400";
const BG = "#050505";
const CARD = "#111111";
const BORDER = "rgba(255,255,255,.08)";
const TEXT = "#ffffff";
const SUB = "#aaaaaa";

/* =====================================================
ADMINS
===================================================== */

const ADMINS = [
  "254758922614"
];

/* =====================================================
HELPERS
===================================================== */

const formatPhone = (phone = "") => {

  let cleaned = phone
    .replace(/\s/g, "")
    .replace(/\+/g, "");

  if (cleaned.startsWith("07")) {
    cleaned = `254${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("01")) {
    cleaned = `254${cleaned.slice(1)}`;
  }

  return cleaned;

};

const getImageSrc = (img) => {

  if (!img) return "/placeholder.jpg";

  if (typeof img === "string") {
    return img;
  }

  return (
    img.full ||
    img.thumb ||
    img.small ||
    "/placeholder.jpg"
  );

};

/* =====================================================
PAGE
===================================================== */

export default function AdvertDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [advert, setAdvert] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [imageIndex, setImageIndex] =
    useState(0);

  const [previewImage, setPreviewImage] =
    useState(null);

  /* ===================================================
     FETCH
  =================================================== */

  useEffect(() => {

    const loadAdvert = async () => {

      try {

        const ref =
          doc(db, "adverts", id);

        const snap =
          await getDoc(ref);

        if (snap.exists()) {

          const data = {
            id: snap.id,
            ...snap.data()
          };

          setAdvert(data);

          /* ===============================
             TRACK VIEWS
          =============================== */

          await updateDoc(ref, {
            views: increment(1)
          });

        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

    loadAdvert();

  }, [id]);

  /* ===================================================
     IMAGES
  =================================================== */

  const images = useMemo(() => {

    if (!advert?.images) {
      return [];
    }

    return advert.images.map(
      (img) => getImageSrc(img)
    );

  }, [advert]);

  /* ===================================================
     SHARE
  =================================================== */

  const handleShare = async () => {

    try {

      const url =
`${window.location.origin}/post/advert/${advert.id}`;

      const text =
`${advert.title}

📍 ${advert.location || "Kenya"}

View Advert:
${url}

Golden Biashnet`;

      if (navigator.share) {

        await navigator.share({
          title: advert.title,
          text,
          url
        });

      } else {

        await navigator.clipboard
          .writeText(text);

        alert("Link copied");

      }

    } catch (err) {

      console.log(err);

    }

  };

  /* ===================================================
     WHATSAPP ADMIN
  =================================================== */

  const contactAdminWhatsApp =
    async () => {

    try {

      const admin =
        formatPhone(ADMINS[0]);

      const message =
`Hello Golden Biashnet Admin,

I am interested in this advert.

TITLE:
${advert.title}

ADVERT ID:
${advert.id}

USER ID:
${auth.currentUser?.uid || "Guest"}

TYPE:
${advert.advertType || "Advert"}

LOCATION:
${advert.location || "N/A"}

Please assist me with this advert.`;

      /* ===============================
         SAVE REQUEST
      =============================== */

      await addDoc(
        collection(db, "advertRequests"),
        {

          advertId: advert.id,

          organizerId:
            advert.organizerId || "",

          userId:
            auth.currentUser?.uid || null,

          title:
            advert.title || "",

          advertType:
            advert.advertType || "",

          status: "pending",

          createdAt:
            serverTimestamp()

        }
      );

      /* ===============================
         ADMIN NOTIFICATION
      =============================== */

      await addDoc(
        collection(
          db,
          "adminNotifications"
        ),
        {

          type: "advert_interest",

          advertId: advert.id,

          organizerId:
            advert.organizerId || "",

          buyerId:
            auth.currentUser?.uid || null,

          title:
            "New Advert Inquiry",

          message:
`${advert.title} advert inquiry`,

          read: false,

          createdAt:
            serverTimestamp()

        }
      );

      window.open(
`https://wa.me/${admin}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

    } catch (err) {

      console.log(err);

    }

  };

  /* ===================================================
     START ADMIN CHAT
  =================================================== */

  const startAdminChat =
    async () => {

    try {

      if (!auth.currentUser) {

        alert("Login required");
        return;

      }

      const user =
        auth.currentUser;

      const ref =
        await addDoc(
          collection(
            db,
            "adminChats"
          ),
          {

            userId:
              user.uid,

            buyerId:
              user.uid,

            advertId:
              advert.id,

            organizerId:
              advert.organizerId || "",

            advertTitle:
              advert.title || "",

            advertType:
              advert.advertType || "",

            advertImage:
              images[0] || "",

            status: "active",

            visibility:
              "admin_controlled",

            type:
              "advert_support",

            lastMessage:
`User interested in ${advert.title}`,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );

      await addDoc(
        collection(
          db,
          "adminNotifications"
        ),
        {

          type:
            "advert_chat_started",

          advertId:
            advert.id,

          userId:
            user.uid,

          title:
            "Advert Chat Started",

          message:
`${user.displayName || "User"} started advert chat`,

          read: false,

          createdAt:
            serverTimestamp()

        }
      );

      navigate(
        `/support-chat/${ref.id}`
      );

    } catch (err) {

      console.log(err);

      alert(
        "Failed to start chat"
      );

    }

  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {

    return (

      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: BG
        }}
      >

        <CircularProgress
          sx={{
            color: GOLD
          }}
        />

      </Box>

    );

  }

  /* ===================================================
     NOT FOUND
  =================================================== */

  if (!advert) {

    return (

      <Box
        sx={{
          minHeight: "100vh",
          background: BG,
          p: 4
        }}
      >

        <Typography
          sx={{
            color: "#fff"
          }}
        >
          Advertisement not found
        </Typography>

      </Box>

    );

  }

  /* ===================================================
     TYPE ICON
  =================================================== */

  const typeIcon =
    advert.advertType === "Event"
      ? <Event />
      : advert.advertType === "Job Opportunity"
      ? <Work />
      : advert.advertType === "Business Advertisement"
      ? <Storefront />
      : <Campaign />;

  /* ===================================================
     UI
  =================================================== */

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        color: TEXT,
        pb: 10
      }}
    >

      <Grid container>

        {/* =================================================
           IMAGE SECTION
        ================================================= */}

        <Grid item xs={12} md={7}>

          <Box
            sx={{
              position: "relative",
              background: "#000"
            }}
          >

            <Box
              component="img"
              src={images[imageIndex]}
              onClick={() =>
                setPreviewImage(
                  images[imageIndex]
                )
              }
              sx={{
                width: "100%",
                height: {
                  xs: 300,
                  md: "100vh"
                },
                objectFit: "cover",
                cursor: "pointer"
              }}
            />

            {/* OVERLAY */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
"linear-gradient(to top,rgba(0,0,0,.85),transparent 40%)"
              }}
            />

            {/* TOP ACTIONS */}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                top: 15,
                right: 15
              }}
            >

              <IconButton
                onClick={handleShare}
                sx={{
                  background:
                    "rgba(0,0,0,.55)",
                  color: "#fff"
                }}
              >

                <Share />

              </IconButton>

            </Stack>

            {/* BADGES */}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                top: 15,
                left: 15
              }}
            >

              <Chip
                icon={typeIcon}
                label={
                  advert.advertType ||
                  "Advert"
                }
                sx={{
                  background: GOLD,
                  color: "#000",
                  fontWeight: 900
                }}
              />

              <Chip
                icon={<Verified />}
                label="Verified"
                sx={{
                  background:
                    "rgba(76,175,80,.15)",
                  color: "#4caf50"
                }}
              />

            </Stack>

            {/* IMAGE NAV */}

            {images.length > 1 && (

              <>

                <IconButton
                  onClick={() =>
                    setImageIndex((prev) =>
                      prev === 0
                        ? images.length - 1
                        : prev - 1
                    )
                  }
                  sx={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    background:
                      "rgba(0,0,0,.5)",
                    color: "#fff"
                  }}
                >

                  <ChevronLeft />

                </IconButton>

                <IconButton
                  onClick={() =>
                    setImageIndex((prev) =>
                      prev === images.length - 1
                        ? 0
                        : prev + 1
                    )
                  }
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    background:
                      "rgba(0,0,0,.5)",
                    color: "#fff"
                  }}
                >

                  <ChevronRight />

                </IconButton>

              </>

            )}

            {/* IMAGE COUNT */}

            <Chip
              label={
`${imageIndex + 1}/${images.length}`
              }
              sx={{
                position: "absolute",
                bottom: 15,
                right: 15,
                background:
                  "rgba(0,0,0,.6)",
                color: "#fff"
              }}
            />

          </Box>

          {/* THUMBNAILS */}

          {images.length > 1 && (

            <Box
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                p: 1,
                background: "#080808",

                "&::-webkit-scrollbar": {
                  display: "none"
                }
              }}
            >

              {images.map((img, i) => (

                <Box
                  key={i}
                  component="img"
                  src={img}
                  onClick={() =>
                    setImageIndex(i)
                  }
                  sx={{
                    width: 80,
                    height: 70,
                    borderRadius: 2,
                    objectFit: "cover",
                    cursor: "pointer",
                    border:
                      imageIndex === i
                        ? `2px solid ${GOLD}`
                        : "2px solid transparent"
                  }}
                />

              ))}

            </Box>

          )}

        </Grid>

        {/* =================================================
           DETAILS
        ================================================= */}

        <Grid item xs={12} md={5}>

          <Box
            sx={{
              p: {
                xs: 2,
                md: 4
              }
            }}
          >

            {/* TITLE */}

            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 900,
                lineHeight: 1.2
              }}
            >
              {advert.title}
            </Typography>

            {/* LOCATION */}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 2 }}
            >

              <LocationOn
                sx={{
                  color: "#777",
                  fontSize: 20
                }}
              />

              <Typography
                sx={{
                  color: SUB
                }}
              >
                {advert.location ||
                  "Kenya"}
              </Typography>

            </Stack>

            {/* STATS */}

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              sx={{ mt: 2 }}
            >

              <Chip
                label={`Views ${advert.views || 0}`}
                sx={{
                  background: CARD,
                  color: "#fff"
                }}
              />

              <Chip
                icon={<Shield />}
                label="Admin Protected"
                sx={{
                  background:
                    "rgba(244,180,0,.12)",
                  color: GOLD
                }}
              />

            </Stack>

            {/* DESCRIPTION */}

            <Box sx={{ mt: 4 }}>

              <Typography
                sx={{
                  color: GOLD,
                  fontWeight: 900,
                  mb: 1
                }}
              >
                Description
              </Typography>

              <Typography
                sx={{
                  color: "#ccc",
                  lineHeight: 1.8
                }}
              >
                {advert.description}
              </Typography>

            </Box>

            {/* EVENT */}

            {advert.advertType ===
              "Event" && (

              <Box sx={{ mt: 4 }}>

                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: 900,
                    mb: 1
                  }}
                >
                  Event Details
                </Typography>

                {!!advert.venue && (
                  <Typography sx={{ color: "#ccc", mb: 1 }}>
                    Venue: {advert.venue}
                  </Typography>
                )}

                {!!advert.eventDate && (
                  <Typography sx={{ color: "#ccc", mb: 1 }}>
                    Date: {advert.eventDate}
                  </Typography>
                )}

                {!!advert.eventTime && (
                  <Typography sx={{ color: "#ccc" }}>
                    Time: {advert.eventTime}
                  </Typography>
                )}

              </Box>

            )}

            {/* JOB */}

            {advert.advertType ===
              "Job Opportunity" && (

              <Box sx={{ mt: 4 }}>

                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: 900,
                    mb: 1
                  }}
                >
                  Job Details
                </Typography>

                {!!advert.jobPosition && (
                  <Typography sx={{ color: "#ccc", mb: 1 }}>
                    Position: {advert.jobPosition}
                  </Typography>
                )}

                {!!advert.salary && (
                  <Typography sx={{ color: "#ccc" }}>
                    Salary: {advert.salary}
                  </Typography>
                )}

              </Box>

            )}

            {/* BUSINESS */}

            {advert.advertType ===
              "Business Advertisement" && (

              <Box sx={{ mt: 4 }}>

                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: 900,
                    mb: 1
                  }}
                >
                  Business Details
                </Typography>

                {!!advert.businessType && (
                  <Typography sx={{ color: "#ccc", mb: 1 }}>
                    Type: {advert.businessType}
                  </Typography>
                )}

                {!!advert.businessAddress && (
                  <Typography sx={{ color: "#ccc", mb: 1 }}>
                    Address: {advert.businessAddress}
                  </Typography>
                )}

                {!!advert.servicesOffered && (
                  <Typography sx={{ color: "#ccc" }}>
                    Services: {advert.servicesOffered}
                  </Typography>
                )}

              </Box>

            )}

            <Divider
              sx={{
                my: 4,
                borderColor: BORDER
              }}
            />

            {/* CONTACT */}

           <Box
              sx={{
                background: CARD,
                border:
                  `1px solid ${BORDER}`,
                borderRadius: 4,
                p: 2.5
              }}
            >

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 18
                }}
              >
                Contact Golden Biashnet
              </Typography>

              <Typography
                sx={{
                  color: SUB,
                  mt: 1,
                  lineHeight: 1.7,
                  fontSize: 14
                }}
              >
                For safety and trusted
                communication, advert
                owner contacts are hidden.

                Admins help verify,
                coordinate and connect
                interested users.
              </Typography>

              <Stack
                spacing={2}
                sx={{ mt: 3 }}
              >

                {/* CHAT */}

                <Button
                  fullWidth
                  startIcon={<Chat />}
                  onClick={
                    startAdminChat
                  }
                  sx={{
                    height: 54,
                    borderRadius: 3,
                    fontWeight: 900,
                    background:
"linear-gradient(45deg,#F4B400,#FFD95A)",
                    color: "#000",

                    "&:hover": {
                      background:
"linear-gradient(45deg,#FFD95A,#F4B400)"
                    }
                  }}
                >
                  Chat With Admin
                </Button>

                {/* WHATSAPP */}

                <Button
                  fullWidth
                  startIcon={<WhatsApp />}
                  onClick={
                    contactAdminWhatsApp
                  }
                  sx={{
                    height: 54,
                    borderRadius: 3,
                    fontWeight: 900,
                    background: "#25D366",
                    color: "#000",

                    "&:hover": {
                      background: "#1ebe5d"
                    }
                  }}
                >
                  WhatsApp Admin
                </Button>

              </Stack>

            </Box>

          </Box>

        </Grid>

      </Grid>

      {/* =================================================
         PREVIEW
      ================================================= */}

      <Dialog
        open={Boolean(previewImage)}
        onClose={() =>
          setPreviewImage(null)
        }
        maxWidth="lg"
      >

        <img
          src={previewImage}
          alt="preview"
          style={{
            width: "100%",
            maxHeight: "90vh",
            objectFit: "contain"
          }}
        />

      </Dialog>

    </Box>

  );

}