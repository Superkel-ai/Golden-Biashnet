import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import GBCard from "../components/GBCard";
import GBButton from "../components/GBButton";

const GOLD = "#F4B400";
const GREEN = "#00C853";
const BORDER = "#222";

const COLLECTIONS = ["products", "services", "events", "houses"];

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [durationMap, setDurationMap] = useState({});

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      let allPosts = [];

      for (let colName of COLLECTIONS) {
        const q = query(
          collection(db, colName),
          where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((docSnap) => {
          allPosts.push({
            id: docSnap.id,
            collection: colName,
            ...docSnap.data(),
          });
        });
      }

      setPosts(allPosts);
      setLoading(false);
    };

    fetchApprovedPosts();
  }, []);

  const handlePromote = async (post) => {
    const durationDays = parseInt(durationMap[post.id]);

    if (!durationDays || durationDays <= 0) {
      alert("Enter valid promotion duration (days)");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    try {
      await updateDoc(doc(db, post.collection, post.id), {
        promotion: {
          isPromoted: true,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          durationDays: durationDays,
        },
      });

      alert("Promotion Activated!");

      // Update UI instantly
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                promotion: {
                  isPromoted: true,
                  durationDays,
                },
              }
            : p
        )
      );
    } catch (error) {
      console.error("Promotion error:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: GOLD, fontWeight: 700, mb: 3 }}
      >
        Promotion Center
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 4 }}>
        Promote approved posts and set promotion duration.
      </Typography>

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <GBCard>
              <Grid container spacing={3}>

                {/* IMAGE */}
                <Grid item xs={12} md={4}>
                  <Box
                    component="img"
                    src={post.imageUrl}
                    alt={post.title}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: `1px solid ${BORDER}`,
                    }}
                  />
                </Grid>

                {/* DETAILS */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {post.title}
                  </Typography>

                  <Typography sx={{ color: "#aaa", mb: 1 }}>
                    {post.description}
                  </Typography>

                  <Typography
                    sx={{ color: GOLD, fontWeight: 600, mb: 1 }}
                  >
                    KES {post.price}
                  </Typography>

                  <Chip
                    label={post.collection.toUpperCase()}
                    size="small"
                    sx={{
                      background: GOLD,
                      color: "#000",
                      mb: 2,
                    }}
                  />

                  <Divider sx={{ borderColor: BORDER, mb: 2 }} />

                  {/* PROMOTION STATUS */}
                  {post.promotion?.isPromoted ? (
                    <Chip
                      label={`Promoted (${post.promotion.durationDays} days)`}
                      sx={{
                        background: GREEN,
                        color: "#fff",
                        mb: 2,
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: "#777", mb: 2 }}>
                      Not Promoted
                    </Typography>
                  )}

                  {/* PROMOTION CONTROLS */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      type="number"
                      label="Duration (days)"
                      variant="outlined"
                      size="small"
                      value={durationMap[post.id] || ""}
                      onChange={(e) =>
                        setDurationMap({
                          ...durationMap,
                          [post.id]: e.target.value,
                        })
                      }
                      sx={{
                        input: { color: "#fff" },
                        label: { color: "#aaa" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: GOLD,
                          },
                        },
                      }}
                    />

                    <GBButton
                      onClick={() => handlePromote(post)}
                    >
                      Promote
                    </GBButton>
                  </Box>
                </Grid>
              </Grid>
            </GBCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}