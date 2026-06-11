import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Avatar,
  Rating,
  Stack,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Collapse,
  IconButton
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../services/firebase";

const GOLD = "#F4B400";
const CARD = "#111";
const BORDER = "#222";

export default function Reviews({ productId }) {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  const [lastDoc, setLastDoc] = useState(null);
  const [moreLoading, setMoreLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    if (!productId) return;

    fetchReviews(true);
  }, [productId]);

  const fetchReviews = async (initial = false) => {

    try {

      if (initial) setLoading(true);
      else setMoreLoading(true);

      let q = query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc"),
        limit(6)
      );

      if (!initial && lastDoc) {
        q = query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(6)
        );
      }

      const snap = await getDocs(q);

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setLastDoc(snap.docs[snap.docs.length - 1] || null);

      setReviews(prev =>
        initial ? data : [...prev, ...data]
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  /* =========================
     SUBMIT REVIEW
  ========================= */
  const submitReview = async () => {

    if (!comment.trim()) return;

    try {

      const newReview = {
        productId,
        userId: "guest",
        userName: "Customer",
        rating,
        comment,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "reviews"), newReview);

      setComment("");
      setRating(5);

      // refresh reviews
      setReviews([]);
      setLastDoc(null);
      fetchReviews(true);

    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <Paper sx={{ background: CARD, border: `1px solid ${BORDER}`, p: 2 }}>
        <CircularProgress size={20} sx={{ color: GOLD }} />
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Typography sx={{ fontWeight: 800, color: "#fff" }}>
          ⭐ Customer Reviews
        </Typography>

        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ExpandLessIcon sx={{ color: "#fff" }} /> : <ExpandMoreIcon sx={{ color: "#fff" }} />}
        </IconButton>
      </Box>

      <Collapse in={open}>

        {/* =========================
           WRITE REVIEW
        ========================= */}
        <Paper sx={{ p: 2, mt: 2, background: CARD, border: `1px solid ${BORDER}` }}>

          <Typography sx={{ color: "#fff", fontWeight: 700, mb: 1 }}>
            Write a Review
          </Typography>

          <Rating
            value={rating}
            onChange={(e, v) => setRating(v)}
            sx={{ mb: 1, "& .MuiRating-iconFilled": { color: GOLD } }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            sx={{
              input: { color: "#fff" },
              textarea: { color: "#fff" },
              bgcolor: "#0d0d0d",
              borderRadius: 2
            }}
          />

          <Button
            onClick={submitReview}
            fullWidth
            sx={{
              mt: 1,
              background: GOLD,
              color: "#000",
              fontWeight: 800
            }}
          >
            Submit Review
          </Button>

        </Paper>

        {/* =========================
           LIST REVIEWS
        ========================= */}
        <Stack spacing={1.5} sx={{ mt: 2 }}>

          {reviews.map((r) => (
            <Paper key={r.id} sx={{ p: 2, background: CARD, border: `1px solid ${BORDER}` }}>

              <Stack direction="row" spacing={1.5} alignItems="center">

                <Avatar sx={{ bgcolor: "#222" }}>
                  {r.userName?.charAt(0) || "U"}
                </Avatar>

                <Box>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                    {r.userName}
                  </Typography>

                  <Rating value={r.rating} readOnly size="small"
                    sx={{ "& .MuiRating-iconFilled": { color: GOLD } }}
                  />
                </Box>

              </Stack>

              <Typography sx={{ color: "#bbb", mt: 1, fontSize: 13 }}>
                {r.comment}
              </Typography>

            </Paper>
          ))}

        </Stack>

        {/* =========================
           LOAD MORE
        ========================= */}
        {reviews.length >= 6 && (
          <Button
            onClick={() => fetchReviews(false)}
            fullWidth
            sx={{ mt: 2, color: GOLD, border: `1px solid ${BORDER}` }}
          >
            {moreLoading ? "Loading..." : "Load More"}
          </Button>
        )}

      </Collapse>

    </Box>
  );
}