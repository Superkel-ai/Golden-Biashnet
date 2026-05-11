// src/pages/Subscription.js

import React, { useState, useEffect } from "react";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  doc,
  setDoc,
  getDoc,
  Timestamp
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";


// ==========================
// Golden Biashnet Design System
// ==========================

const COLORS = {

  BG: "#000000",

  CARD: "#0A0A0A",

  CARD_ELEVATED: "#111111",

  BORDER: "#222222",

  GOLD: "#F4B400",

  GOLD_LIGHT: "#FFD54F",

  TEXT: "#FFFFFF",

  TEXT_SECONDARY: "#eff8f8",

  TEXT_MUTED: "#edfdf8"

};


// ==========================
// Plans
// ==========================

const PLANS = {

  monthly: [

    {
      id: "monthly_basic",
      name: "Basic",
      price: 100,
      uploads: 10,
      durationDays: 30,
      popular: false
    },

    {
      id: "monthly_pro",
      name: "Pro",
      price: 300,
      uploads: 50,
      durationDays: 30,
      popular: true
    },

    {
      id: "monthly_unlimited",
      name: "Unlimited",
      price: 700,
      uploads: 999999,
      durationDays: 30,
      popular: false
    }

  ],

  yearly: [

    {
      id: "yearly_basic",
      name: "Basic",
      price: 1000,
      uploads: 120,
      durationDays: 365,
      popular: false
    },

    {
      id: "yearly_pro",
      name: "Pro",
      price: 3000,
      uploads: 600,
      durationDays: 365,
      popular: true
    },

    {
      id: "yearly_unlimited",
      name: "Unlimited",
      price: 7000,
      uploads: 999999,
      durationDays: 365,
      popular: false
    }

  ]

};


// ==========================
// Animation
// ==========================

const cardAnimation = {

  hidden: { opacity: 0, y: 40 },

  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }

};


// ==========================
// Component
// ==========================

export default function Subscription() {

  const navigate = useNavigate();

  const userId = auth.currentUser?.uid;

  const [billing, setBilling] = useState("monthly");

  const [loading, setLoading] = useState(false);

  const [currentSub, setCurrentSub] = useState(null);


  // ==========================
  // Load subscription
  // ==========================

  useEffect(() => {

    if (!userId) return;

    const load = async () => {

      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {

        setCurrentSub(userDoc.data().subscriptionStatus);

      }

    };

    load();

  }, [userId]);


  // ==========================
  // Subscribe
  // ==========================

  const subscribe = async (plan) => {

    try {

      setLoading(true);

      const subId = `${userId}_${plan.id}_${Date.now()}`;

      const start = new Date();

      const end = new Date();

      end.setDate(start.getDate() + plan.durationDays);


      await setDoc(doc(db, "subscriptions", subId), {

        id: subId,
        userId,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        uploadsLimit: plan.uploads,
        billingCycle: billing,
        status: "active",
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        createdAt: Timestamp.now()

      });


      await setDoc(doc(db, "users", userId), {

        subscriptionStatus: "active",
        subscriptionId: subId,
        uploadsRemaining: plan.uploads,
        uploadsLimit: plan.uploads

      }, { merge: true });


      navigate("/seller-dashboard");

    } catch (error) {

      console.error(error);

      alert("Subscription failed");

    }

    setLoading(false);

  };


  // ==========================
  // UI
  // ==========================

  return (

    <Box sx={{
      background: COLORS.BG,
      minHeight: "100vh",
      color: COLORS.TEXT
    }}>

      <Container maxWidth="lg" sx={{ py: 5 }}>


        {/* Header */}

        <Typography
          variant="h4"
          fontWeight="bold"
          mb={1}
        >
          Seller Subscription
        </Typography>


        <Typography
          sx={{ color: COLORS.TEXT_SECONDARY, mb: 4 }}
        >
          Choose a plan to unlock selling features and reach customers
        </Typography>



        {/* Billing Toggle */}

        <ToggleButtonGroup

          value={billing}

          exclusive

          onChange={(e, val) => val && setBilling(val)}

          sx={{
            mb: 5,

            "& .MuiToggleButton-root": {

              color: COLORS.TEXT,

              borderColor: COLORS.BORDER,

              px: 4

            },

            "& .Mui-selected": {

              background: COLORS.GOLD,

              color: "#000",

              fontWeight: "bold"

            }

          }}

        >

          <ToggleButton value="monthly">

            Monthly

          </ToggleButton>


          <ToggleButton value="yearly">

            Yearly

          </ToggleButton>

        </ToggleButtonGroup>



        {/* Active Chip */}

        {currentSub === "active" && (

          <Chip

            icon={<CheckCircleIcon />}

            label="Active Subscription"

            sx={{
              background: COLORS.GOLD,
              color: "#000",
              mb: 4,
              fontWeight: "bold"
            }}

          />

        )}



        {/* Plans */}

        <Grid container spacing={3}>

          {PLANS[billing].map((plan, index) => (

            <Grid item xs={12} md={4} key={plan.id}>

              <motion.div

                variants={cardAnimation}

                initial="hidden"

                animate="visible"

                transition={{ delay: index * 0.1 }}

              >

                <Card

                  sx={{

                    background: plan.popular
                      ? COLORS.CARD_ELEVATED
                      : COLORS.CARD,

                    border: plan.popular
                      ? `2px solid ${COLORS.GOLD}`
                      : `1px solid ${COLORS.BORDER}`,

                    borderRadius: "14px",

                    transition: "0.3s",

                    "&:hover": {

                      transform: "translateY(-6px)",

                      border: `1px solid ${COLORS.GOLD}`

                    }

                  }}

                >

                  <CardContent>


                    {plan.popular && (

                      <Chip

                        label="MOST POPULAR"

                        sx={{
                          background: COLORS.GOLD,
                          color: "#000",
                          fontWeight: "bold",
                          mb: 2
                        }}

                      />

                    )}



                    <Typography variant="h5" fontWeight="bold">

                      {plan.name}

                    </Typography>



                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color={COLORS.GOLD}
                    >

                      KES {plan.price}

                    </Typography>


                    <Typography color={COLORS.TEXT_MUTED} mb={2}>

                      per {billing}

                    </Typography>


                    <Divider sx={{
                      borderColor: COLORS.BORDER,
                      mb: 2
                    }} />


                    <Stack spacing={1.2} mb={3}>

                      <Typography>

                        ✓ {plan.uploads === 999999
                          ? "Unlimited uploads"
                          : `${plan.uploads} uploads`}

                      </Typography>

                      <Typography>
                        ✓ Seller dashboard access
                      </Typography>

                      <Typography>
                        ✓ Marketing boost
                      </Typography>

                      <Typography>
                        ✓ Customer reach
                      </Typography>

                    </Stack>



                    <Button

                      fullWidth

                      onClick={() => subscribe(plan)}

                      disabled={loading}

                      sx={{

                        background: COLORS.GOLD,

                        color: "#000",

                        fontWeight: "bold",

                        py: 1.4,

                        "&:hover": {

                          background: COLORS.GOLD_LIGHT

                        }

                      }}

                    >

                      {loading
                        ? <CircularProgress size={22} />
                        : "Subscribe"}

                    </Button>


                  </CardContent>

                </Card>

              </motion.div>

            </Grid>

          ))}

        </Grid>

      </Container>

    </Box>

  );

}