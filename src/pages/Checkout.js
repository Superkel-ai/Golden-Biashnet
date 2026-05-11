import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Avatar,
  Grid,
  Chip
} from "@mui/material";

import {
  Payments,
  LocalShipping,
  AccountBalanceWallet,
  WhatsApp
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";
const BG = "#000";
const CARD = "#111";
const BORDER = "#222";

const formatPrice = (price) =>
  "KES " + Number(price || 0).toLocaleString();

export default function Checkout() {

  const navigate = useNavigate();
  const locationData = useLocation();

  const {
    cartItems = [],
    total = 0,
    location = "",
    station = ""
  } = locationData.state || {};

  const [method, setMethod] = useState("delivery");
  const [loading, setLoading] = useState(false);
  const [sellerPayments, setSellerPayments] = useState([]);

  // =============================
  // LOAD SELLER PAYMENT METHODS
  // =============================

  useEffect(() => {

    const loadSeller = async () => {

      if (!cartItems.length) return;

      const sellerId = cartItems[0].sellerId;

      if (!sellerId) return;

      const snap = await getDoc(doc(db, "sellers", sellerId));

      if (snap.exists()) {

        setSellerPayments(
          snap.data().paymentMethods || []
        );

      }

    };

    loadSeller();

  }, [cartItems]);



  const getPayNowAmount = () => {

    if (method === "delivery") return 0;
    if (method === "half") return total / 2;
    if (method === "full") return total;

    return 0;

  };



  // =============================
  // PLACE ORDER
  // =============================

  const placeOrder = async () => {

    try {

      if (!auth.currentUser) {

        alert("Login required");
        return;

      }

      setLoading(true);

      const orderRef = await addDoc(

        collection(db, "orders"),

        {

          userId: auth.currentUser.uid,

          
          items: cartItems.map(item => ({
  id: item.postId || item.id,
  title: item.title || "",
  image: item.image || "",
  price: item.price || 0,
  sellerId: item.sellerId || "",
  quantity: item.quantity || 1,
  category: item.category || ""
})),

          total,

          paymentMethod: method,

          paymentStatus:
            method === "delivery"
              ? "pending"
              : "manual_confirmation",

          amountPaid: getPayNowAmount(),

          deliveryLocation: location,

          pickupStation: station,

          orderStatus: "received",

          createdAt: serverTimestamp()

        }

      );


      for (const item of cartItems) {

        await deleteDoc(doc(db, "cart", item.id));

      }


      navigate(`/track-order/${orderRef.id}`);

    }

    catch (err) {

      console.error(err);
      alert("Failed to place order");

    }

    finally {

      setLoading(false);

    }

  };



  return (

    <Box sx={{ background: BG, minHeight: "100vh", color: "#fff" }}>

      <Container maxWidth="md" sx={{ py: 4 }}>

        <Typography variant="h5" fontWeight="bold" mb={3}>
          Checkout
        </Typography>

        <Grid container spacing={3}>

          {/* LEFT ITEMS */}

          <Grid item xs={12} md={7}>

            <Paper
              sx={{
                p: 3,
                background: CARD,
                border: `1px solid ${BORDER}`
              }}
            >

              <Typography variant="h6">
                Order Items
              </Typography>

              <Divider sx={{ my: 2, borderColor: BORDER }} />

              {cartItems.map(item => (

                <Stack
                  key={item.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  mb={2}
                >

                  <Avatar
                    src={item.image}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />

                  <Box flex={1}>

                    <Typography fontWeight="bold">
                      {item.title}
                    </Typography>

                    <Typography color={GOLD}>
                      {formatPrice(item.price)}
                    </Typography>

                  </Box>

                </Stack>

              ))}

            </Paper>

          </Grid>



          {/* RIGHT PAYMENT */}

          <Grid item xs={12} md={5}>

            <Paper
              sx={{
                p: 3,
                background: CARD,
                border: `1px solid ${BORDER}`
              }}
            >

              <Typography variant="h6" sx={{ color: GOLD }}>
                Payment Method
              </Typography>

              <Divider sx={{ my: 2, borderColor: BORDER }} />

              <RadioGroup
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value)
                }
              >

                <FormControlLabel
                  value="delivery"
                  control={<Radio sx={{ color: GOLD }} />}
                  label={
                    <Stack direction="row" spacing={1}>
                      <LocalShipping />
                      <span>Pay on Delivery</span>
                    </Stack>
                  }
                />

                <FormControlLabel
                  value="half"
                  control={<Radio sx={{ color: GOLD }} />}
                  label={
                    <Stack direction="row" spacing={1}>
                      <AccountBalanceWallet />
                      <span>
                        Pay Half ({formatPrice(total / 2)})
                      </span>
                    </Stack>
                  }
                />

                <FormControlLabel
                  value="full"
                  control={<Radio sx={{ color: GOLD }} />}
                  label={
                    <Stack direction="row" spacing={1}>
                      <Payments />
                      <span>
                        Pay Full ({formatPrice(total)})
                      </span>
                    </Stack>
                  }
                />

              </RadioGroup>



              {/* SELLER PAYMENT METHODS */}

              {sellerPayments.length > 0 && (

                <>

                  <Divider
                    sx={{ my: 2, borderColor: BORDER }}
                  />

                  <Typography mb={1}>
                    Manual Payment Options
                  </Typography>

                  {sellerPayments.map((p, i) => (

                    <Paper
                      key={i}
                      sx={{
                        p: 2,
                        mb: 1,
                        background: "#000",
                        border: `1px solid ${BORDER}`
                      }}
                    >

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >

                        <Box>

                          <Typography fontWeight="bold">
                            {p.label}
                          </Typography>

                          <Typography color={GOLD}>
                            {p.value}
                          </Typography>

                        </Box>

                        {p.type === "whatsapp" && (

                          <Button
                            startIcon={<WhatsApp />}
                            href={`https://wa.me/254${p.value.slice(1)}`}
                            target="_blank"
                            sx={{
                              background: "#25D366",
                              color: "#fff"
                            }}
                          >

                            Confirm

                          </Button>

                        )}

                      </Stack>

                    </Paper>

                  ))}

                </>

              )}



              <Divider sx={{ my: 2, borderColor: BORDER }} />

              <Stack
                direction="row"
                justifyContent="space-between"
              >

                <Typography>Total</Typography>

                <Typography fontWeight="bold">
                  {formatPrice(total)}
                </Typography>

              </Stack>


              <Stack
                direction="row"
                justifyContent="space-between"
                mb={2}
              >

                <Typography>Pay Now</Typography>

                <Typography>
                  {formatPrice(getPayNowAmount())}
                </Typography>

              </Stack>



              <Button
                fullWidth
                variant="contained"
                onClick={placeOrder}
                disabled={loading}
                sx={{
                  background: GOLD,
                  color: "#000",
                  fontWeight: "bold"
                }}
              >

                {loading
                  ? <CircularProgress size={24} />
                  : "Place Order"}

              </Button>

            </Paper>

          </Grid>

        </Grid>

      </Container>

    </Box>

  );

}