// src/pages/TrackOrder.js

import React, { useEffect, useState, useMemo } from "react";

import {
  Box,
  Typography,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Avatar,
  Stack,
  Chip,
  Grid
} from "@mui/material";

import {
  CheckCircle,
  LocalShipping,
  Inventory,
  DoneAll
} from "@mui/icons-material";

import { useParams } from "react-router-dom";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  getDocs
} from "firebase/firestore";

import { db } from "../services/firebase";

import { motion } from "framer-motion";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import ProductGrid from "../components/ProductGrid";


// =========================
// THEME
// =========================

const THEME = {
  GOLD: "#F4B400",
  BG: "#000",
  CARD: "#111",
  BORDER: "#222",
  TEXT: "#fff",
  MUTED: "#aaa"
};


// =========================
// ORDER STEPS
// =========================

const steps = [
  { label: "Order Received", icon: <Inventory /> },
  { label: "Confirmed", icon: <CheckCircle /> },
  { label: "Dispatched", icon: <LocalShipping /> },
  { label: "Delivered", icon: <DoneAll /> }
];


function getStepIndex(status) {

  const map = {
    received: 0,
    confirmed: 1,
    dispatched: 2,
    delivered: 3
  };

  return map[status] ?? 0;

}


// =========================
// COMPONENT
// =========================

export default function TrackOrder() {

  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [countdown, setCountdown] = useState("");



  // =========================
  // FETCH ORDER LIVE
  // =========================

  useEffect(() => {

    if (!id) return;

    const ref = doc(db, "orders", id);

    const unsub = onSnapshot(ref, (snap) => {

      if (snap.exists()) {

        setOrder({
          id: snap.id,
          ...snap.data()
        });

      }

      setLoading(false);

    });

    return () => unsub();

  }, [id]);



  // =========================
  // DELIVERY COUNTDOWN
  // =========================

  useEffect(() => {

    if (!order?.createdAt) return;

    const created = order.createdAt.toDate();

    const deliveryDeadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {

      const now = new Date();

      const diff = deliveryDeadline - now;

      if (diff <= 0) {

        setCountdown("Arriving soon");

        clearInterval(interval);

      } else {

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setCountdown(`${hours}h ${minutes}m remaining`);

      }

    }, 1000);

    return () => clearInterval(interval);

  }, [order]);



  // =========================
  // FETCH SUGGESTIONS
  // =========================

  useEffect(() => {

    if (!order?.items?.length) return;

    const fetchSuggestions = async () => {

      const category = order.items[0]?.category;

      const q = query(
        collection(db, "marketListings"),
        where("category", "==", category),
        where("status", "==", "approved"),
        limit(8)
      );

      const snap = await getDocs(q);

      setSuggestions(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );

    };

    fetchSuggestions();

  }, [order]);



  // =========================
  // MAP POSITION
  // =========================

  const riderPosition = useMemo(() => {

    if (!order?.riderLocation) return null;

    if (order.riderLocation.latitude) {

      return [
        order.riderLocation.latitude,
        order.riderLocation.longitude
      ];

    }

    return order.riderLocation;

  }, [order]);



  const center = riderPosition || [-1.2921, 36.8219]; // Nairobi fallback


  const stepIndex = getStepIndex(order?.orderStatus);



  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress sx={{ color: THEME.GOLD }} />
      </Box>

    );

  }



  // =========================
  // MAIN UI
  // =========================

  return (

    <Box sx={{ background: THEME.BG, minHeight: "100vh" }}>

      <Container maxWidth="md" sx={{ py: 4 }}>


        {/* TITLE */}

        <Typography variant="h5" color={THEME.TEXT} fontWeight="bold" mb={3}>
          Track Your Order
        </Typography>



        {/* STEPS */}

        <Paper sx={{
          background: THEME.CARD,
          border: `1px solid ${THEME.BORDER}`,
          p: 3,
          mb: 3
        }}>

          <Stepper activeStep={stepIndex} alternativeLabel>

            {steps.map((step, index) => (

              <Step key={index}>

                <StepLabel>

                  <motion.div animate={{ scale: index <= stepIndex ? 1.2 : 1 }}>
                    {step.icon}
                  </motion.div>

                  <Typography color={THEME.TEXT}>
                    {step.label}
                  </Typography>

                </StepLabel>

              </Step>

            ))}

          </Stepper>

          <Box textAlign="center" mt={2}>

            <Chip
              label={order?.orderStatus || "received"}
              sx={{
                background: THEME.GOLD,
                color: "#000",
                fontWeight: "bold"
              }}
            />

          </Box>

        </Paper>



        {/* DELIVERY TIMER */}

        <Paper sx={{
          background: THEME.CARD,
          border: `1px solid ${THEME.BORDER}`,
          p: 3,
          mb: 3
        }}>

          <Typography color={THEME.TEXT}>
            Estimated Delivery
          </Typography>

          <Typography sx={{
            color: THEME.GOLD,
            fontSize: 24,
            fontWeight: "bold"
          }}>
            {countdown}
          </Typography>

        </Paper>



        {/* ORDERED PRODUCTS */}

        <Paper sx={{
          background: THEME.CARD,
          border: `1px solid ${THEME.BORDER}`,
          p: 3,
          mb: 3
        }}>

          <Typography color={THEME.TEXT} mb={2}>
            Items Ordered
          </Typography>

          {order?.items?.map((item, i) => (

            <Stack key={i} direction="row" spacing={2} mb={2}>

              <Avatar
                variant="rounded"
                src={item.image}
                sx={{ width: 60, height: 60 }}
              />

              <Box>

                <Typography color={THEME.TEXT}>
                  {item.title}
                </Typography>

                <Typography color={THEME.MUTED}>
                  Qty: {item.quantity}
                </Typography>

              </Box>

            </Stack>

          ))}

        </Paper>



        {/* MAP */}

        <Paper sx={{
          background: THEME.CARD,
          border: `1px solid ${THEME.BORDER}`,
          p: 2,
          mb: 3
        }}>

          <Typography color={THEME.TEXT} mb={2}>
            Live Rider Location
          </Typography>

          <MapContainer
            center={center}
            zoom={14}
            style={{ height: 300, borderRadius: 12 }}
          >

            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {riderPosition && (

              <Marker position={riderPosition}>

                <Popup>
                  Rider is here
                </Popup>

              </Marker>

            )}

          </MapContainer>

        </Paper>



        {/* RIDER INFO */}

        {order?.riderName && (

          <Paper sx={{
            background: THEME.CARD,
            border: `1px solid ${THEME.BORDER}`,
            p: 3,
            mb: 3
          }}>

            <Typography color={THEME.TEXT} mb={2}>
              Delivery Rider
            </Typography>

            <Stack direction="row" spacing={2}>

              <Avatar src={order.riderPhoto} />

              <Box>

                <Typography color={THEME.TEXT}>
                  {order.riderName}
                </Typography>

                <Typography color={THEME.MUTED}>
                  {order.riderPhone}
                </Typography>

              </Box>

            </Stack>

          </Paper>

        )}



        {/* PRODUCT SUGGESTIONS */}

        {suggestions.length > 0 && (

          <Box mt={6}>

            <Typography
              variant="h6"
              color={THEME.TEXT}
              mb={2}
            >
              You may also like
            </Typography>

            <Grid container spacing={2}>

              {suggestions.map(item => (

                <Grid item xs={6} md={3} key={item.id}>

                  <ProductGrid product={item} />

                </Grid>

              ))}

            </Grid>

          </Box>

        )}

      </Container>

    </Box>

  );

}