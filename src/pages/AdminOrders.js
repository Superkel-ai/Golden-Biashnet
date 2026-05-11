import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  TextField,
  Collapse,
  Button,
  Divider,
  Avatar,
  IconButton,
  MenuItem
} from "@mui/material";

import {
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Phone,
  WhatsApp,
  Inventory2
} from "@mui/icons-material";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";

// ================= THEME =================

const BG = "#000";
const CARD = "#111";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUB = "#aaa";

// ================= COMPONENT =================

export default function AdminOrders() {

  // ================= STATES =================

  const [orders, setOrders] = useState([]);

  const [usersMap, setUsersMap] = useState({});

  const [showOrders, setShowOrders] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ================= FETCH USERS =================

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const map = {};

        snapshot.forEach((doc) => {
          map[doc.id] = doc.data();
        });

        setUsersMap(map);

      }
    );

    return () => unsub();

  }, []);

  // ================= FETCH ORDERS =================

  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const list = [];

      snapshot.forEach((doc) => {

        list.push({
          id: doc.id,
          ...doc.data()
        });

      });

      setOrders(list);

    });

    return () => unsub();

  }, []);

  // ================= ANALYTICS =================

  const analytics = useMemo(() => {

    let totalRevenue = 0;

    let pending = 0;
    let received = 0;
    let delivered = 0;
    let cancelled = 0;

    let totalProducts = 0;

    const customers = new Set();
    const sellers = new Set();

    orders.forEach((order) => {

      totalRevenue += order.total || 0;

      customers.add(order.userId);

      if (order.items?.length > 0) {

        order.items.forEach((item) => {

          totalProducts += item.quantity || 0;

          if (item.sellerId) {
            sellers.add(item.sellerId);
          }

        });

      }

      switch (order.orderStatus) {

        case "pending":
          pending++;
          break;

        case "received":
          received++;
          break;

        case "delivered":
          delivered++;
          break;

        case "cancelled":
          cancelled++;
          break;

        default:
          break;

      }

    });

    return {
      totalRevenue,
      pending,
      received,
      delivered,
      cancelled,
      totalProducts,
      customers: customers.size,
      sellers: sellers.size
    };

  }, [orders]);

  // ================= FILTER =================

  const filteredOrders = orders.filter((order) => {

    const buyer =
      usersMap[order.userId]?.name || "";

    const product =
      order.items?.[0]?.title || "";

    const seller =
      usersMap[
        order.items?.[0]?.sellerId
      ]?.name || "";

    const matchesSearch =
      buyer.toLowerCase().includes(
        search.toLowerCase()
      ) ||
      seller.toLowerCase().includes(
        search.toLowerCase()
      ) ||
      product.toLowerCase().includes(
        search.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all"
        ? true
        : order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;

  });

  // ================= UPDATE STATUS =================

  const updateStatus = async (
    orderId,
    status
  ) => {

    try {

      await updateDoc(
        doc(db, "orders", orderId),
        {
          orderStatus: status
        }
      );

    } catch (err) {

      console.error(err);

    }

  };

  // ================= FORMAT DATE =================

  const formatDate = (timestamp) => {

    if (!timestamp?.seconds) return "-";

    return new Date(
      timestamp.seconds * 1000
    ).toLocaleString();

  };

  // ================= STATUS CHIP =================

  const getStatusColor = (status) => {

    switch (status) {

      case "pending":
        return "#ff9800";

      case "received":
        return "#2196f3";

      case "delivered":
        return "#2e7d32";

      case "cancelled":
        return "#d32f2f";

      default:
        return "#555";

    }

  };

  // ================= UI =================

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 5
      }}
    >

      <Container maxWidth="lg">

        {/* HEADER */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={3}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: 24
            }}
          >
            Orders Analytics Dashboard
          </Typography>

          <IconButton
            onClick={() =>
              setShowOrders(!showOrders)
            }
            sx={{ color: GOLD }}
          >

            {showOrders
              ? <ExpandLess />
              : <ExpandMore />}

          </IconButton>

        </Box>

        <Collapse in={showOrders}>

          {/* KPI */}

          <Grid container spacing={2}>

            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: CARD
                }}
              >

                <Typography
                  sx={{ color: SUB }}
                >
                  Total Orders
                </Typography>

                <Typography
                  sx={{
                    color: TEXT,
                    fontWeight: "bold",
                    fontSize: 22
                  }}
                >
                  {orders.length}
                </Typography>

              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: CARD
                }}
              >

                <Typography
                  sx={{ color: SUB }}
                >
                  Revenue
                </Typography>

                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: "bold",
                    fontSize: 22
                  }}
                >
                  Ksh{" "}
                  {analytics.totalRevenue.toLocaleString()}
                </Typography>

              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: CARD
                }}
              >

                <Typography
                  sx={{ color: SUB }}
                >
                  Customers
                </Typography>

                <Typography
                  sx={{
                    color: TEXT,
                    fontWeight: "bold",
                    fontSize: 22
                  }}
                >
                  {analytics.customers}
                </Typography>

              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: CARD
                }}
              >

                <Typography
                  sx={{ color: SUB }}
                >
                  Products Ordered
                </Typography>

                <Typography
                  sx={{
                    color: TEXT,
                    fontWeight: "bold",
                    fontSize: 22
                  }}
                >
                  {analytics.totalProducts}
                </Typography>

              </Paper>
            </Grid>

          </Grid>

          {/* STATUS CARDS */}

          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
          >

            {[
              {
                label: "Pending",
                value: analytics.pending,
                color: "#ff9800",
                icon: <ShoppingCart />
              },
              {
                label: "Received",
                value: analytics.received,
                color: "#2196f3",
                icon: <Inventory2 />
              },
              {
                label: "Delivered",
                value: analytics.delivered,
                color: "#2e7d32",
                icon: <CheckCircle />
              },
              {
                label: "Cancelled",
                value: analytics.cancelled,
                color: "#d32f2f",
                icon: <Cancel />
              }
            ].map((item, i) => (

              <Grid
                item
                xs={6}
                md={3}
                key={i}
              >

                <Paper
                  sx={{
                    p: 2,
                    background: CARD,
                    border:
                      `1px solid ${item.color}`
                  }}
                >

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >

                    <Box>

                      <Typography
                        sx={{
                          color: SUB,
                          fontSize: 13
                        }}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        sx={{
                          color: item.color,
                          fontSize: 24,
                          fontWeight: "bold"
                        }}
                      >
                        {item.value}
                      </Typography>

                    </Box>

                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>

                  </Box>

                </Paper>

              </Grid>

            ))}

          </Grid>

          {/* FILTERS */}

          <Paper
            sx={{
              p: 2,
              mt: 3,
              background: CARD
            }}
          >

            <Grid container spacing={2}>

              <Grid item xs={12} md={8}>

                <TextField
                  fullWidth
                  placeholder="Search buyer, seller or product..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  InputProps={{
                    style: {
                      color: TEXT
                    }
                  }}
                />

              </Grid>

              <Grid item xs={12} md={4}>

                <TextField
                  fullWidth
                  select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  InputProps={{
                    style: {
                      color: TEXT
                    }
                  }}
                >

                  <MenuItem value="all">
                    All Orders
                  </MenuItem>

                  <MenuItem value="pending">
                    Pending
                  </MenuItem>

                  <MenuItem value="received">
                    Received
                  </MenuItem>

                  <MenuItem value="delivered">
                    Delivered
                  </MenuItem>

                  <MenuItem value="cancelled">
                    Cancelled
                  </MenuItem>

                </TextField>

              </Grid>

            </Grid>

          </Paper>

          {/* ORDERS LIST */}

          {filteredOrders.map((order) => {

            const buyer =
              usersMap[order.userId] || {};

            return (

              <Paper
                key={order.id}
                sx={{
                  p: 2,
                  mt: 3,
                  background: CARD,
                  border:
                    "1px solid #222"
                }}
              >

                {/* TOP */}

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >

                  <Box>

                    <Typography
                      sx={{
                        color: GOLD,
                        fontWeight: "bold"
                      }}
                    >
                      Order #{order.id.slice(0, 8)}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 12
                      }}
                    >
                      {formatDate(
                        order.createdAt
                      )}
                    </Typography>

                  </Box>

                  <Chip
                    label={order.orderStatus}
                    sx={{
                      background:
                        getStatusColor(
                          order.orderStatus
                        ),
                      color: "#fff",
                      fontWeight: "bold"
                    }}
                  />

                </Box>

                <Divider sx={{ my: 2 }} />

                {/* BUYER */}

                <Grid container spacing={2}>

                  <Grid item xs={12} md={6}>

                    <Typography
                      sx={{
                        color: GOLD,
                        fontWeight: "bold",
                        mb: 1
                      }}
                    >
                      Buyer Information
                    </Typography>

                    <Typography
                      sx={{ color: TEXT }}
                    >
                      {buyer.name ||
                        "Unknown Buyer"}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 13
                      }}
                    >
                      {buyer.phone ||
                        "No phone"}
                    </Typography>

                    <Box
                      display="flex"
                      gap={1}
                      mt={1}
                    >

                      <Button
                        size="small"
                        startIcon={<Phone />}
                        href={`tel:${buyer.phone}`}
                        sx={{
                          background: "#222",
                          color: TEXT
                        }}
                      >
                        Call
                      </Button>

                      <Button
                        size="small"
                        startIcon={<WhatsApp />}
                        href={`https://wa.me/${buyer.phone}`}
                        target="_blank"
                        sx={{
                          background:
                            "#25D366",
                          color: "#fff"
                        }}
                      >
                        WhatsApp
                      </Button>

                    </Box>

                  </Grid>

                  {/* PAYMENT */}

                  <Grid item xs={12} md={6}>

                    <Typography
                      sx={{
                        color: GOLD,
                        fontWeight: "bold",
                        mb: 1
                      }}
                    >
                      Payment Details
                    </Typography>

                    <Typography
                      sx={{ color: TEXT }}
                    >
                      Total: Ksh{" "}
                      {order.total?.toLocaleString()}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 13
                      }}
                    >
                      Paid: Ksh{" "}
                      {order.amountPaid?.toLocaleString()}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 13
                      }}
                    >
                      Method:{" "}
                      {order.paymentMethod}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          order.paymentStatus ===
                          "paid"
                            ? "#4caf50"
                            : "#ff9800",
                        fontSize: 13
                      }}
                    >
                      Payment Status:{" "}
                      {order.paymentStatus}
                    </Typography>

                  </Grid>

                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* PRODUCTS */}

                <Typography
                  sx={{
                    color: GOLD,
                    mb: 2,
                    fontWeight: "bold"
                  }}
                >
                  Ordered Products
                </Typography>

                {order.items?.map(
                  (item, index) => {

                    const seller =
                      usersMap[
                        item.sellerId
                      ] || {};

                    return (

                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          mb: 2,
                          background: "#0d0d0d"
                        }}
                      >

                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                        >

                          {/* IMAGE */}

                          <Grid
                            item
                            xs={3}
                            md={2}
                          >

                            <Avatar
                              src={item.image}
                              variant="rounded"
                              sx={{
                                width: 70,
                                height: 70
                              }}
                            />

                          </Grid>

                          {/* PRODUCT */}

                          <Grid
                            item
                            xs={9}
                            md={4}
                          >

                            <Typography
                              sx={{
                                color: TEXT,
                                fontWeight:
                                  "bold"
                              }}
                            >
                              {item.title}
                            </Typography>

                           <Typography
                              sx={{
                                color: SUB,
                                fontSize: 12
                              }}
                            >
                              Qty:{" "}
                              {item.quantity}
                            </Typography>

                            <Typography
                              sx={{
                                color: GOLD,
                                fontSize: 13
                              }}
                            >
                              Ksh {item.price}
                            </Typography>

                          </Grid>

                          {/* SELLER */}

                          <Grid
                            item
                            xs={12}
                            md={4}
                          >

                            <Typography
                              sx={{
                                color: GOLD,
                                fontSize: 13
                              }}
                            >
                              Seller
                            </Typography>

                            <Typography
                              sx={{
                                color: TEXT
                              }}
                            >
                              {seller.name ||
                                "Unknown"}
                            </Typography>

                            <Typography
                              sx={{
                                color: SUB,
                                fontSize: 12
                              }}
                            >
                              {seller.phone ||
                                "No phone"}
                            </Typography>

                          </Grid>

                          {/* ACTIONS */}

                          <Grid
                            item
                            xs={12}
                            md={2}
                          >

                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={1}
                            >

                              <Button
                                size="small"
                                startIcon={
                                  <WhatsApp />
                                }
                                href={`https://wa.me/${seller.phone}`}
                                target="_blank"
                                sx={{
                                  background:
                                    "#25D366",
                                  color: "#fff"
                                }}
                              >
                                Seller
                              </Button>

                              <Button
                                size="small"
                                startIcon={
                                  <Phone />
                                }
                                href={`tel:${seller.phone}`}
                                sx={{
                                  background:
                                    "#222",
                                  color: TEXT
                                }}
                              >
                                Call
                              </Button>

                            </Box>

                          </Grid>

                        </Grid>

                      </Paper>

                    );

                  }
                )}

                {/* DELIVERY */}

                <Paper
                  sx={{
                    p: 2,
                    background: "#0d0d0d"
                  }}
                >

                  <Typography
                    sx={{
                      color: GOLD,
                      fontWeight: "bold",
                      mb: 1
                    }}
                  >
                    Delivery Information
                  </Typography>

                  <Typography
                    sx={{
                      color: TEXT,
                      fontSize: 13
                    }}
                  >
                    Pickup:{" "}
                    {order.pickupStation ||
                      "None"}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 13
                    }}
                  >
                    Delivery Location:{" "}
                    {order.deliveryLocation ||
                      "Not provided"}
                  </Typography>

                </Paper>

                {/* ADMIN ACTIONS */}

                <Box
                  display="flex"
                  gap={1}
                  flexWrap="wrap"
                  mt={2}
                >

                  <Button
                    size="small"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "pending"
                      )
                    }
                    sx={{
                      background: "#ff9800",
                      color: "#fff"
                    }}
                  >
                    Pending
                  </Button>

                  <Button
                    size="small"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "received"
                      )
                    }
                    sx={{
                      background: "#2196f3",
                      color: "#fff"
                    }}
                  >
                    Received
                  </Button>

                  <Button
                    size="small"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "delivered"
                      )
                    }
                    sx={{
                      background: "#2e7d32",
                      color: "#fff"
                    }}
                  >
                    Delivered
                  </Button>

                  <Button
                    size="small"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "cancelled"
                      )
                    }
                    sx={{
                      background: "#d32f2f",
                      color: "#fff"
                    }}
                  >
                    Cancel
                  </Button>

                </Box>

              </Paper>

            );

          })}

        </Collapse>

      </Container>

    </Box>

  );

}