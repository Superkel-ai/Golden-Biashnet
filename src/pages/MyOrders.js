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

/* =========================
   IMPORT INFINITE PRODUCTS
========================= */
import InfiniteProducts from "../components/home/InfiniteProducts";

const GOLD = "#F4B400";
const BG = "#000";
const CARD = "#111";
const BORDER = "#222";

const formatPrice = (price) =>
  "KES " + Number(price || 0).toLocaleString();

/* =============================
   ORDER PROGRESS
============================= */
const getProgress = (status) => {
  switch (status) {
    case "pending": return 20;
    case "confirmed": return 40;
    case "processing": return 60;
    case "shipping": return 80;
    case "delivered": return 100;
    default: return 10;
  }
};

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =============================
     FETCH ORDERS
  ============================= */
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

  /* =============================
     CANCEL ORDER
  ============================= */
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

  /* =============================
     CONTACT SELLER
  ============================= */
  const contactSeller = (phone, title) => {
    const text = `Hello, I placed an order for "${title}" on your marketplace.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  /* =============================
     REORDER
  ============================= */
  const reorder = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =============================
     LOADING STATE
  ============================= */
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
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* HEADER */}
        <Stack direction="row" spacing={1} mb={3} alignItems="center">
          <ShoppingBag sx={{ color: GOLD }} />
          <Typography variant="h5" fontWeight="bold">
            My Orders
          </Typography>
        </Stack>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <Paper sx={{
            p: 4,
            textAlign: "center",
            background: CARD,
            border: `1px solid ${BORDER}`
          }}>
            <Typography variant="h6">No orders yet</Typography>
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
              onClick={() => navigate("/InfiniteProducts")}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3} mb={5}>

            {/* ORDERS */}
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
                    </Box>
                  </Stack>

                  {/* PROGRESS */}
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

                  {/* ACTIONS */}
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
                          onClick={() => cancelOrder(order.id)}
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
                          onClick={() => reorder(item?.productId)}
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

        {/* =========================
           🔥 INFINITE SUGGESTIONS
        ========================= */}
        <Box sx={{ mt: 6 }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: GOLD,
              mb: 2
            }}
          >
            You May Also Like
          </Typography>

          <InfiniteProducts />
        </Box>

      </Container>
    </Box>
  );
}