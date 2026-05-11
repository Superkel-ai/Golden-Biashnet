import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  Grid,
  LinearProgress
} from "@mui/material";

import {
  ShoppingBag,
  WhatsApp,
  Cancel,
  Replay
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";


const GOLD = "#F4B400";
const BG = "#000";
const CARD = "#111";
const BORDER = "#222";


const formatPrice = (price) =>
  "KES " + Number(price || 0).toLocaleString();


// ORDER PROGRESS
const getProgress = (status) => {

  switch (status) {

    case "pending":
      return 20;

    case "confirmed":
      return 40;

    case "processing":
      return 60;

    case "shipping":
      return 80;

    case "delivered":
      return 100;

    default:
      return 10;
  }

};


export default function MyOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);


  // =============================
  // DELIVERY COUNTDOWN
  // =============================

  const getCountdown = (timestamp) => {

    if (!timestamp) return "Processing";

    const orderDate = timestamp.toDate();

    const deliveryDate = new Date(orderDate);

    deliveryDate.setDate(orderDate.getDate() + 3);

    const now = new Date();

    const diff = deliveryDate - now;

    if (diff <= 0) return "Arriving today";

    const hours = Math.floor(diff / (1000 * 60 * 60));

    return `${hours} hrs remaining`;

  };


  // =============================
  // FETCH ORDERS
  // =============================

  const fetchOrders = async () => {

    if (!auth.currentUser) return;

    try {

      const q = query(
        collection(db, "orders"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  // =============================
  // FETCH SUGGESTIONS
  // =============================

  const fetchSuggestions = async () => {

    try {

      const q = query(
        collection(db, "products"),
        where("status", "==", "approved"),
        limit(4)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSuggestions(data);

    } catch (err) {

      console.error(err);

    }

  };


  // =============================
  // CANCEL ORDER
  // =============================

  const cancelOrder = async (orderId) => {

    try {

      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: "cancelled"
      });

      fetchOrders();

    } catch (err) {

      console.error(err);

    }

  };


  // =============================
  // CONTACT SELLER
  // =============================

  const contactSeller = (phone, title) => {

    const text = `Hello, I placed an order for "${title}" on your marketplace.`;

    const url =
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");

  };


  // =============================
  // REORDER
  // =============================

  const reorder = (productId) => {

    navigate(`/product/${productId}`);

  };


  useEffect(() => {

    fetchOrders();
    fetchSuggestions();

  }, []);



  if (loading) {

    return (

      <Box
        sx={{
          background: BG,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        <CircularProgress />

      </Box>

    );

  }


  return (

    <Box sx={{ background: BG, minHeight: "100vh", color: "#fff" }}>

      <Container maxWidth="md" sx={{ py: 4 }}>


        <Stack direction="row" spacing={1} mb={3} alignItems="center">

          <ShoppingBag sx={{ color: GOLD }} />

          <Typography variant="h5" fontWeight="bold">

            My Orders

          </Typography>

        </Stack>



        {orders.length === 0 ? (

          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              background: CARD,
              border: `1px solid ${BORDER}`
            }}
          >

            <Typography variant="h6">

              No orders yet

            </Typography>

            <Typography color="gray" mb={2}>

              Start shopping to see your orders.

            </Typography>

            <Button
              variant="contained"
              sx={{
                background: GOLD,
                color: "#000",
                fontWeight: "bold"
              }}
              onClick={() => navigate("/")}
            >

              Browse Products

            </Button>

          </Paper>

        ) : (

          <Stack spacing={3} mb={5}>

            {orders.map(order => {

              const item = order.items?.[0];

              return (

                <Paper
                  key={order.id}
                  sx={{
                    p: 2,
                    background: CARD,
                    border: `1px solid ${BORDER}`
                  }}
                >

                  <Stack direction="row" spacing={2}>

                    <Avatar
                      variant="rounded"
                      src={item?.image}
                      sx={{ width: 70, height: 70 }}
                    />

                    <Box flex={1}>

                      <Typography fontWeight="bold">

                        {item?.title}

                      </Typography>

                      <Typography color="gray" fontSize={13}>

                        {order.items?.length} item(s)

                      </Typography>

                      <Typography sx={{ color: GOLD }}>

                        {formatPrice(order.total)}

                      </Typography>

                      <Typography fontSize={12} color="gray">

                        {getCountdown(order.createdAt)}

                      </Typography>

                    </Box>

                  </Stack>



                  {/* PROGRESS BAR */}

                  <Box mt={2}>

                    <Typography fontSize={12} mb={1}>

                      Status: {order.orderStatus}

                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={getProgress(order.orderStatus)}
                      sx={{
                        height: 8,
                        borderRadius: 5
                      }}
                    />

                  </Box>


                  <Divider sx={{ my: 2, borderColor: BORDER }} />


                  {/* ACTION BUTTONS */}

                  <Stack spacing={1}>

                    <Button
                      variant="contained"
                      sx={{
                        background: GOLD,
                        color: "#000",
                        fontWeight: "bold"
                      }}
                      onClick={() =>
                        navigate(`/track-order/${order.id}`)
                      }
                    >

                      Track Order

                    </Button>


                    <Grid container spacing={1}>

                      <Grid item xs={4}>

                        <Button
                          fullWidth
                          startIcon={<WhatsApp />}
                          onClick={() =>
                            contactSeller(
                              item?.sellerPhone,
                              item?.title
                            )
                          }
                          sx={{
                            background: "#25D366",
                            color: "#fff"
                          }}
                        >

                          Seller

                        </Button>

                      </Grid>


                      <Grid item xs={4}>

                        <Button
                          fullWidth
                          startIcon={<Cancel />}
                          onClick={() =>
                            cancelOrder(order.id)
                          }
                          sx={{
                            background: "#b00020",
                            color: "#fff"
                          }}
                        >

                          Cancel

                        </Button>

                      </Grid>


                      <Grid item xs={4}>

                        <Button
                          fullWidth
                          startIcon={<Replay />}
                          onClick={() =>
                            reorder(item?.productId)
                          }
                          sx={{
                            background: "#444",
                            color: "#fff"
                          }}
                        >

                          Reorder

                        </Button>

                      </Grid>

                    </Grid>

                  </Stack>

                </Paper>

              );

            })}

          </Stack>

        )}



        {/* SUGGESTIONS */}

        <Typography variant="h6" mb={2}>

          You may also like

        </Typography>


        <Grid container spacing={2}>

          {suggestions.map(item => (

            <Grid item xs={6} key={item.id}>

              <Paper
                sx={{
                  p: 2,
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  cursor: "pointer"
                }}
                onClick={() =>
                  navigate(`/product/${item.id}`)
                }
              >

                <Avatar
                  src={item.images?.[0]?.thumb || item.images?.[0]?.full}
                  variant="rounded"
                  sx={{
                    width: "100%",
                    height: 120,
                    mb: 1
                  }}
                />

                <Typography
                  fontSize={14}
                  fontWeight="bold"
                >

                  {item.title}

                </Typography>

                <Typography sx={{ color: GOLD }}>

                  {formatPrice(item.price)}

                </Typography>

              </Paper>

            </Grid>

          ))}

        </Grid>


      </Container>

    </Box>

  );

}