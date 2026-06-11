import React, { useEffect, useState, useMemo } from "react";

import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Stack,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel
} from "@mui/material";

import {
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
  LocationOn
} from "@mui/icons-material";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  limit
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

import { useNavigate } from "react-router-dom";
import InfiniteProducts from "../components/home/InfiniteProducts";


// ======================================================
// THEME
// ======================================================

const THEME = {

  pageBg: "#000",
  cardBg: "#111",
  cardBorder: "#222",

  primary: "#F4B400",
  primaryHover: "#FFD54F",

  textPrimary: "#FFF",
  textSecondary: "#AAA",

  inputBg: "#000",
  inputBorder: "#333",

  danger: "#ff4444"

};


// ======================================================
// PRICE FORMAT
// ======================================================

const formatPrice = (price) =>
  "KES " + Number(price || 0).toLocaleString();


// ======================================================
// COMPONENT
// ======================================================

export default function Cart() {

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [stations, setStations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedStation, setSelectedStation] = useState("");

  const [delivery, setDelivery] = useState({

    gate: "",
    landmark: "",
    building: "",
    room: "",
    doorDelivery: false

  });


  // ======================================================
  // FETCH CART
  // ======================================================

  useEffect(() => {

    if (!auth.currentUser) return;

    const fetchCart = async () => {

      const q = query(
        collection(db, "cart"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        quantity: 1,
        ...doc.data()
      }));

      setCartItems(data);

      setLoading(false);

    };

    fetchCart();

  }, []);


  // ======================================================
  // FETCH PICKUP STATIONS
  // ======================================================

  useEffect(() => {

    const fetchStations = async () => {

      const snap = await getDocs(collection(db, "pickupStations"));

      setStations(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    };

    fetchStations();

  }, []);


  // ======================================================
  // FETCH SUGGESTIONS
  // ======================================================

  useEffect(() => {

    if (!cartItems.length) return;

    const fetchSuggestions = async () => {

      const category = cartItems[0]?.category;

      const q = query(
        collection(db, "products"),
        where("category", "==", category),
        where("status", "==", "approved")
      );

      const snap = await getDocs(q);

      setSuggestions(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    };

    fetchSuggestions();

  }, [cartItems]);


  // ======================================================
  // UPDATE QUANTITY
  // ======================================================

  const updateQuantity = async (id, qty) => {

    if (qty < 1) return;

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );

    await updateDoc(doc(db, "cart", id), {
      quantity: qty
    });

  };


  // ======================================================
  // REMOVE ITEM
  // ======================================================

  const removeItem = async (id) => {

    await deleteDoc(doc(db, "cart", id));

    setCartItems(prev =>
      prev.filter(item => item.id !== id)
    );

  };


  // ======================================================
  // TOTAL
  // ======================================================

  const total = useMemo(() => {

    return cartItems.reduce(

      (sum, item) =>
        sum + Number(item.price || 0) * (item.quantity || 1),

      0

    );

  }, [cartItems]);


  // ======================================================
  // PAYMENT
  // ======================================================

  const handlePayment = () => {

    if (!delivery.gate)
      return alert("Enter your gate or area");

    if (!selectedStation)
      return alert("Select pickup station");

    navigate("/checkout", {

      state: {
        cartItems,
        total,
        delivery,
        station: selectedStation
      }

    });

  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: THEME.primary }} />
      </Box>
    );


  // ======================================================
  // UI
  // ======================================================

  return (

    <Box sx={{
      background: THEME.pageBg,
      minHeight: "100vh",
      color: THEME.textPrimary
    }}>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        <Typography variant="h5" fontWeight="bold" mb={3}>
          My Cart
        </Typography>

        {cartItems.length === 0 ? (

          <Typography color={THEME.textSecondary}>
            Your cart is empty
          </Typography>

        ) : (

          <Grid container spacing={3}>


            {/* LEFT SIDE */}
            <Grid item xs={12} md={8}>

              {cartItems.map(item => (

                <Paper
                  key={item.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    background: THEME.cardBg,
                    border: `1px solid ${THEME.cardBorder}`
                  }}
                >

                  <Stack direction="row" spacing={2} alignItems="center">

                    {/* IMAGE */}
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      onClick={() =>
                        navigate(`/product/${item.postId}`)
                      }
                      sx={{
                        width: 80,
                        height: 80,
                        cursor: "pointer"
                      }}
                    />

                    {/* INFO */}
                    <Box flex={1}>

                      <Typography fontWeight="bold">
                        {item.title}
                      </Typography>

                      <Typography sx={{ color: THEME.primary }}>
                        {formatPrice(item.price)}
                      </Typography>

                    </Box>


                    {/* QUANTITY */}
                    <Stack direction="row" alignItems="center">

                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Remove sx={{ color: "#fff" }} />
                      </IconButton>

                      <Typography>
                        {item.quantity}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Add sx={{ color: "#fff" }} />
                      </IconButton>

                    </Stack>


                    {/* DELETE */}
                    <IconButton
                      onClick={() => removeItem(item.id)}
                      sx={{ color: THEME.danger }}
                    >
                      <Delete />
                    </IconButton>

                  </Stack>

                </Paper>

              ))}

            </Grid>


            {/* RIGHT SIDE */}
            <Grid item xs={12} md={4}>

              <Paper
                sx={{
                  p: 3,
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.cardBorder}`
                }}
              >

                <Typography variant="h6">
                  Delivery Details
                </Typography>

                <Divider sx={{ my: 2 }} />


                <TextField
                  label="Gate / Area"
                  fullWidth
                  sx={{ mb: 2 }}
                  onChange={e =>
                    setDelivery({ ...delivery, gate: e.target.value })
                  }
                />

                <TextField
                  label="Near where (Landmark)"
                  fullWidth
                  sx={{ mb: 2 }}
                  onChange={e =>
                    setDelivery({ ...delivery, landmark: e.target.value })
                  }
                />

                <TextField
                  label="Building"
                  fullWidth
                  sx={{ mb: 2 }}
                  onChange={e =>
                    setDelivery({ ...delivery, building: e.target.value })
                  }
                />

                <TextField
                  label="Room Number"
                  fullWidth
                  sx={{ mb: 2 }}
                  onChange={e =>
                    setDelivery({ ...delivery, room: e.target.value })
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      onChange={e =>
                        setDelivery({
                          ...delivery,
                          doorDelivery: e.target.checked
                        })
                      }
                    />
                  }
                  label="Deliver to Door"
                />

                <Divider sx={{ my: 2 }} />


                {/* PICKUP STATION */}

                <Select
                  fullWidth
                  value={selectedStation}
                  displayEmpty
                  onChange={e =>
                    setSelectedStation(e.target.value)
                  }
                  sx={{ mb: 2 }}
                >

                  <MenuItem value="">
                    Select Pickup Station
                  </MenuItem>

                  {stations.map(station => (

                    <MenuItem
                      key={station.id}
                      value={station.name}
                    >
                      {station.name} — {station.location}
                    </MenuItem>

                  ))}

                </Select>


                {/* TOTAL */}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography>Total</Typography>

                  <Typography
                    sx={{
                      color: THEME.primary,
                      fontWeight: "bold"
                    }}
                  >
                    {formatPrice(total)}
                  </Typography>

                </Stack>


                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCartCheckout />}
                  onClick={handlePayment}
                  sx={{
                    mt: 3,
                    background: THEME.primary,
                    color: "#000",
                    fontWeight: "bold"
                  }}
                >

                  Make Payment

                </Button>

              </Paper>

            </Grid>

          </Grid>

        )}


        {/* =========================
   YOU MAY ALSO LIKE
========================= */}
<Box mt={6}>

  <Typography variant="h6" mb={2}>
    You may also like
  </Typography>

  <InfiniteProducts
    category={cartItems?.[0]?.category}
    limitCount={10}
    grid={true}
  />

</Box>
      </Container>

    </Box>

  );

}