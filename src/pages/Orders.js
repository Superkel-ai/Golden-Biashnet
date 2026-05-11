import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Avatar,
  Divider,
} from "@mui/material";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const sellerId = auth.currentUser?.uid;

  // ============================
  // LOAD ORDERS
  // ============================

  const loadOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("sellerId", "==", sellerId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // ============================
  // UPDATE STATUS
  // ============================

  const updateStatus = async (orderId, newStatus) => {
    try {

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

    } catch (error) {
      console.error(error);
    }
  };

  // ============================
  // WHATSAPP CONTACT
  // ============================

  const contactBuyer = (phone, name, product) => {

    const message =
      `Hello ${name}, regarding your order of "${product}" on Triple F Market.`;

    const url =
      `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  useEffect(() => {

    if (!sellerId) return;

    loadOrders();

  }, [sellerId]);

  // ============================
  // STATUS COLOR
  // ============================

  const statusColor = status => {

    switch (status) {

      case "received":
        return "warning";

      case "confirmed":
        return "info";

      case "out_for_delivery":
        return "primary";

      case "delivered":
        return "success";

      default:
        return "default";
    }
  };

  // ============================
  // UI
  // ============================

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ background: "#000", minHeight: "100vh", color: "#fff" }}>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Seller Orders
        </Typography>

        {orders.length === 0 && (
          <Typography color="gray">
            No orders yet
          </Typography>
        )}

        <Grid container spacing={3}>

          {orders.map(order => (

            <Grid item xs={12} key={order.id}>

              <Card sx={{ background: "#111", border: "1px solid #222" }}>

                <CardContent>

                  <Grid container spacing={2} alignItems="center">

                    {/* Product image */}

                    <Grid item>
                      <Avatar
                        src={order.productImage}
                        variant="rounded"
                        sx={{ width: 70, height: 70 }}
                      />
                    </Grid>

                    {/* Product info */}

                    <Grid item xs={12} md={3}>

                      <Typography variant="h6">
                        {order.productTitle}
                      </Typography>

                      <Typography color="#F4B400">
                        KES {order.total}
                      </Typography>

                      <Typography color="gray">
                        Qty: {order.quantity}
                      </Typography>

                    </Grid>

                    {/* Buyer info */}

                    <Grid item xs={12} md={3}>

                      <Typography>
                        Buyer: {order.buyerName}
                      </Typography>

                      <Typography color="gray">
                        {order.buyerLocation}
                      </Typography>

                      <Button
                        startIcon={<WhatsAppIcon />}
                        onClick={() =>
                          contactBuyer(
                            order.buyerPhone,
                            order.buyerName,
                            order.productTitle
                          )
                        }
                        sx={{
                          mt: 1,
                          color: "#25D366",
                          borderColor: "#25D366",
                        }}
                        variant="outlined"
                      >
                        WhatsApp
                      </Button>

                    </Grid>

                    {/* Status */}

                    <Grid item xs={12} md={3}>

                      <Chip
                        label={order.status}
                        color={statusColor(order.status)}
                        sx={{ mb: 1 }}
                      />

                      <Select
                        fullWidth
                        size="small"
                        value={order.status}
                        onChange={e =>
                          updateStatus(order.id, e.target.value)
                        }
                        sx={{
                          background: "#000",
                          color: "#fff",
                        }}
                      >

                        <MenuItem value="received">
                          Received
                        </MenuItem>

                        <MenuItem value="confirmed">
                          Confirmed
                        </MenuItem>

                        <MenuItem value="out_for_delivery">
                          Out for delivery
                        </MenuItem>

                        <MenuItem value="delivered">
                          Delivered
                        </MenuItem>

                      </Select>

                    </Grid>

                    {/* Payment */}

                    <Grid item xs={12} md={3}>

                      <Typography>
                        Payment: {order.paymentMethod}
                      </Typography>

                      <Typography color="gray">
                        {order.paymentStatus}
                      </Typography>

                    </Grid>

                  </Grid>

                </CardContent>

              </Card>

            </Grid>

          ))}

        </Grid>

      </Container>

    </Box>
  );
};

export default Orders;