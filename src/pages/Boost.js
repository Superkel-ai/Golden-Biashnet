import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";


import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import ImageUploader from "../components/upload/ImageUploader";

const GOLD = "#F4B400";
const CARD = "#111";
const BORDER = "#222";

export default function Boost() {

  const uid = auth.currentUser?.uid;

  /* ================= STATE ================= */

  const [lenders, setLenders] = useState([]);
  const [openLender, setOpenLender] = useState(false);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLender, setSelectedLender] = useState(null);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    reason: "",
    duration: ""
  });

  const [idFront, setIdFront] = useState([]);
  const [idBack, setIdBack] = useState([]);

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {

      // LENDERS
      const lenderSnap = await getDocs(collection(db, "lenders"));
      const lenderList = lenderSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLenders(lenderList);
      setFilteredLenders(lenderList);

      // USER APPLICATIONS
      const q = query(
        collection(db, "boost"),
        where("userId", "==", uid)
      );

      const snap = await getDocs(q);
      const apps = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setApplications(apps);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) fetchData();
  }, [uid]);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const filtered = lenders.filter(l =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLenders(filtered);
  }, [search, lenders]);

  /* ================= FAVORITES ================= */

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    if (!selectedLender) {
      alert("Select a lender first");
      return;
    }

    if (!form.name || !form.amount) {
      alert("Fill required fields");
      return;
    }

    try {

      // Upload images
      const uploadedFront = await Promise.all(
        idFront.map(file => uploadToCloudinary(file))
      );

      const uploadedBack = await Promise.all(
        idBack.map(file => uploadToCloudinary(file))
      );

      await addDoc(collection(db, "boost"), {
        ...form,
        lenderId: selectedLender.userId, // 🔥 FIXED
        lenderName: selectedLender.name,
        userId: uid,

        idFront: uploadedFront,
        idBack: uploadedBack,

        interest: selectedLender.interestRate || 0.1,
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("Application sent ✅");

      setForm({
        name: "",
        amount: "",
        reason: "",
        duration: ""
      });

      setIdFront([]);
      setIdBack([]);
      setSelectedLender(null);

      fetchData(); // 🔥 refresh

    } catch (err) {
      console.error(err);
    }

  };

  /* ================= COUNTDOWN ================= */

  const getProgress = (loan) => {

    if (!loan.createdAt || loan.status !== "approved") return 0;

    const start = loan.createdAt.seconds * 1000;
    const now = Date.now();
    const durationMs = Number(loan.duration) * 24 * 60 * 60 * 1000;

    const progress = ((now - start) / durationMs) * 100;

    return Math.min(progress, 100);
  };

  /* ================= MARK PAID ================= */

  const markAsPaid = async (loan) => {
    await updateDoc(doc(db, "boost", loan.id), {
      status: "completed"
    });
    fetchData();
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (

    <Box sx={{ p: 2, color: "#fff", pb: 10 }}>

      {/* HEADER */}
      <Typography sx={{ fontSize: 22, color: GOLD, mb: 2 }}>
        💸 Boost - Get a Loan
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search lenders..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, input: { color: "#fff" }, "& .MuiOutlinedInput-root": { background: "#111" } }}
      />

      {/* LENDERS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {filteredLenders.map(lender => {

          const isFav = favorites.includes(lender.id);

          return (

            <Card
              key={lender.id}
              onClick={() => {
  setSelectedLender(lender);
  setOpenLender(true);
}}
              sx={{
                background: CARD,
                border:
                  selectedLender?.id === lender.id
                    ? `1px solid ${GOLD}`
                    : `1px solid ${BORDER}`
              }}
            >

              <CardContent>

                <Stack direction="row" justifyContent="space-between">

                  <Box>

                    <Typography fontWeight="bold">
                      {lender.name}
                    </Typography>

                    <Typography fontSize={12} color="#aaa">
                      {lender.location}
                    </Typography>

                    <Typography>
                      KES {lender.amountMin} - {lender.amountMax}
                    </Typography>

                    <Typography fontSize={11} color={GOLD}>
                      {lender.interestRate}% interest
                    </Typography>

                    <Dialog open={openLender} onClose={() => setOpenLender(false)} fullWidth>

  <DialogTitle>
    {selectedLender?.name}
  </DialogTitle>

  <DialogContent>

    <Typography>
      Location: {selectedLender?.location}
    </Typography>

    <Typography>
      Amount: KES {selectedLender?.amountMin} - {selectedLender?.amountMax}
    </Typography>

    <Typography>
      Interest: {selectedLender?.interestRate}%
    </Typography>

    <Typography>
      Duration: {selectedLender?.duration} days
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography fontWeight="bold">
      Terms & Conditions
    </Typography>

    <Typography sx={{ fontSize: 13, color: "#aaa" }}>
      {selectedLender?.terms || "No terms provided"}
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography fontWeight="bold">
      Requirements
    </Typography>

    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">

      {selectedLender?.phone && <Chip label="Phone" />}
      {selectedLender?.id && <Chip label="ID" />}
      {selectedLender?.mpesa && <Chip label="M-Pesa" />}
      {selectedLender?.bank && <Chip label="Bank" />}
      {selectedLender?.collateral && <Chip label="Collateral" />}

    </Stack>

  </DialogContent>

  <DialogActions>

    <Button onClick={() => setOpenLender(false)}>
      Cancel
    </Button>

    <Button
      sx={{ background: GOLD, color: "#000" }}
      onClick={() => {
        setOpenLender(false);
      }}
    >
      Apply with this Lender
    </Button>

  </DialogActions>

</Dialog>

                  </Box>

                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(lender.id);
                  }}>
                    {isFav
                      ? <StarIcon sx={{ color: GOLD }} />
                      : <StarBorderIcon sx={{ color: "#777" }} />}
                  </IconButton>

                </Stack>

              </CardContent>

            </Card>

          );

        })}

      </Box>

      {/* FORM */}
      <Divider sx={{ my: 3, borderColor: "#333" }} />

      <Typography>Apply for Loan</Typography>

      <TextField fullWidth label="Your Name" sx={{ mb: 2 }}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <TextField fullWidth label="Amount" sx={{ mb: 2 }}
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <TextField fullWidth label="Reason" multiline rows={2} sx={{ mb: 2 }}
        value={form.reason}
        onChange={(e) => setForm({ ...form, reason: e.target.value })}
      />

      <TextField fullWidth label="Duration (days)" sx={{ mb: 2 }}
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />

      <Typography>ID Front</Typography>
      <ImageUploader images={idFront} setImages={setIdFront} />

      <Typography>ID Back</Typography>
      <ImageUploader images={idBack} setImages={setIdBack} />

      <Button
        fullWidth
        sx={{ mt: 3, background: GOLD, color: "#000" }}
        onClick={handleSubmit}
      >
        Submit Application
      </Button>

      {/* MY LOANS */}
      <Typography sx={{ mt: 4, mb: 2 }}>
        My Loans
      </Typography>

      {applications.map(app => {

        const total =
          Number(app.amount) +
          Number(app.amount) * (app.interest || 0.1);

        return (

          <Card key={app.id} sx={{ background: CARD, mb: 2 }}>
            <CardContent>

              <Typography fontWeight="bold">
                {app.lenderName}
              </Typography>

              <Typography>KES {app.amount}</Typography>

              <Chip label={app.status} size="small" sx={{ mt: 1 }} />

              {app.status === "approved" && (

                <>
                  <Typography sx={{ mt: 1 }}>
                    Repay: KES {total}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={getProgress(app)}
                    sx={{ mt: 1 }}
                  />

                  <Button sx={{ mt: 1 }} onClick={() => markAsPaid(app)}>
                    Mark as Paid
                  </Button>
                </>

              )}

            </CardContent>
          </Card>

        );

      })}

    </Box>

  );
}