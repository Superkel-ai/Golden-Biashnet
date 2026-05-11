import React, { useEffect, useState } from "react";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Avatar,
  Button,
  Tabs,
  Tab,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";

import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";
const CARD = "#111";
const BORDER = "#222";

/* ================= PROMOTION PLANS ================= */
const PROMOTION_PLANS = [
  { label: "Daily - KES 50", value: "daily", days: 1 },
  { label: "Weekly - KES 250", value: "weekly", days: 7 },
  { label: "Monthly - KES 800", value: "monthly", days: 30 },
];

export default function MyUploads() {

  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [houses, setHouses] = useState([]);
  const [events, setEvents] = useState([]);

  const [deleteItem, setDeleteItem] = useState(null);

  const [promoteItem, setPromoteItem] = useState(null);
  const [plan, setPlan] = useState("daily");

  /* ================= LOAD ================= */
  const loadCollection = async (name, setter) => {
    const q = query(collection(db, name), where("sellerId", "==", uid));
    const snap = await getDocs(q);
    setter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadUploads = async () => {
    await Promise.all([
      loadCollection("products", setProducts),
      loadCollection("services", setServices),
      loadCollection("houses", setHouses),
      loadCollection("events", setEvents)
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (uid) loadUploads();
  }, []);

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {

      // 🔥 OPTIONAL: delete cloudinary images here

      await deleteDoc(doc(db, deleteItem.collection, deleteItem.id));

      loadUploads();

    } catch (err) {
      console.error(err);
    }

    setDeleteItem(null);
  };

  /* ================= PROMOTION ================= */
  const handlePromote = async () => {

    const selectedPlan = PROMOTION_PLANS.find(p => p.value === plan);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.days);

    try {

      await updateDoc(doc(db, promoteItem.collection, promoteItem.id), {
        promotion: {
          plan: plan,
          startDate: new Date(),
          endDate,
          status: "pending"
        }
      });

      alert("Promotion request sent!");

    } catch (err) {
      console.error(err);
    }

    setPromoteItem(null);
  };

  /* ================= CARD ================= */
  const ListingCard = ({ item, collection }) => {

    const image =
      item.images?.[0]?.thumb ||
      item.images?.[0]?.full ||
      item.image ||
      "";

    return (
      <Grid item xs={6} sm={4} md={3}>
        <Card sx={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          p: 1,
          borderRadius: 2
        }}>

          {/* SMALL IMAGE */}
          <Avatar
            variant="rounded"
            src={image}
            sx={{
              width: "100%",
              height: 100, // 🔥 SMALLER
              mb: 1
            }}
          />

          <Typography fontSize={13} fontWeight="bold" noWrap>
            {item.title || item.name}
          </Typography>

          <Typography sx={{ color: GOLD, fontSize: 13 }}>
            KES {Number(item.price || item.rent || 0).toLocaleString()}
          </Typography>

          <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
            {item.promoted && (
              <Chip label="Promoted" size="small" sx={{ background: GOLD }} />
            )}
            {item.status && <Chip label={item.status} size="small" />}
          </Stack>

          {/* ACTIONS */}
          <Stack direction="row" spacing={1} mt={1}>

            <Button
              size="small"
              onClick={() => navigate(`/edit/${collection}/${item.id}`)}
            >
              <EditIcon fontSize="small" />
            </Button>

            <Button
              size="small"
              color="error"
              onClick={() => setDeleteItem({ id: item.id, collection })}
            >
              <DeleteIcon fontSize="small" />
            </Button>

            <Button
              size="small"
              onClick={() => setPromoteItem({ ...item, collection })}
              sx={{ color: GOLD }}
            >
              <StarIcon fontSize="small" />
            </Button>

          </Stack>

        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#000", minHeight: "100vh", color: "#fff" }}>

      <Container maxWidth="lg" sx={{ py: 3 }}>

        <Typography variant="h6" mb={2}>
          My Uploads
        </Typography>

        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label={`Products (${products.length})`} />
          <Tab label={`Services (${services.length})`} />
          <Tab label={`Houses (${houses.length})`} />
          <Tab label={`Events (${events.length})`} />
        </Tabs>

        <Grid container spacing={1.5} mt={1}>
          {(tab === 0 ? products :
            tab === 1 ? services :
            tab === 2 ? houses :
            events
          ).map(item => (
            <ListingCard
              key={item.id}
              item={item}
              collection={
                tab === 0 ? "products" :
                tab === 1 ? "services" :
                tab === 2 ? "houses" :
                "events"
              }
            />
          ))}
        </Grid>

      </Container>

      {/* DELETE */}
      <Dialog open={!!deleteItem}>
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* PROMOTION */}
      <Dialog open={!!promoteItem}>
        <DialogTitle>Choose Promotion Plan</DialogTitle>

        <DialogContent>

          <TextField
            select
            fullWidth
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            sx={{ mt: 2 }}
          >
            {PROMOTION_PLANS.map(p => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPromoteItem(null)}>Cancel</Button>
          <Button onClick={handlePromote} sx={{ color: GOLD }}>
            Request
          </Button>
        </DialogActions>

      </Dialog>

    </Box>
  );
}