import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Chip,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../services/firebase";

import GBCard from "../components/GBCard";
import GBButton from "../components/GBButton";

const GOLD = "#F4B400";
const RED = "#ff4444";
const GREEN = "#00C853";
const BORDER = "#222";

const COLLECTIONS = [
  "products",
  "houses",
  "services",
  "events",
  "adverts",
];

export default function AdminDashboard() {

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PROMOTION REQUESTS ================= */

  useEffect(() => {

    const fetchUploads = async () => {

      try {

        let allPosts = [];

        await Promise.all(

          COLLECTIONS.map(async (colName) => {

            const q = query(
              collection(db, colName),
              where("status", "==", "pendingPromotion")
            );

            const snapshot = await getDocs(q);

            for (let document of snapshot.docs) {

              const postData = document.data();

              let sellerData = null;

              if (postData.sellerId) {

                const sellerSnap = await getDoc(
                  doc(db, "users", postData.sellerId)
                );

                sellerData = sellerSnap.exists()
                  ? sellerSnap.data()
                  : null;

              }

              allPosts.push({
                id: document.id,
                collection: colName,
                ...postData,
                seller: sellerData,
              });

            }

          })

        );

        setUploads(allPosts);

      } catch (error) {

        console.error("Admin fetch error:", error);

      }

      setLoading(false);

    };

    fetchUploads();

  }, []);

  /* ================= UPDATE SEARCH INDEX ================= */

  const updateSearchIndexStatus = async (postId, status) => {

    const q = query(
      collection(db, "searchIndex"),
      where("refId", "==", postId)
    );

    const snapshot = await getDocs(q);

    for (let d of snapshot.docs) {

      await updateDoc(
        doc(db, "searchIndex", d.id),
        { status }
      );

    }

  };

  /* ================= APPROVE PROMOTION ================= */

  const handleApprove = async (post) => {

    try {

      await updateDoc(
        doc(db, post.collection, post.id),
        {
          status: "approved",
          "promotion.status": "approved"
        }
      );

      await updateSearchIndexStatus(post.id, "approved");

      setUploads(prev =>
        prev.filter(item => item.id !== post.id)
      );

    } catch (error) {

      console.error("Approve error:", error);

    }

  };

  /* ================= REJECT PROMOTION ================= */

  const handleReject = async (post) => {

    try {

      await updateDoc(
        doc(db, post.collection, post.id),
        {
          status: "approved",
          "promotion.status": "rejected",
          "promotion.promoted": false,
          "promotion.featured": false
        }
      );

      await updateSearchIndexStatus(post.id, "approved");

      setUploads(prev =>
        prev.filter(item => item.id !== post.id)
      );

    } catch (error) {

      console.error("Reject error:", error);

    }

  };

  /* ================= VALIDATION ================= */

  const validatePost = (post) => {

    const issues = [];

    if (!post.images || post.images.length === 0)
      issues.push("Missing Image");

    if (!post.description || post.description.length < 15)
      issues.push("Weak Description");

    if (post.price && post.price <= 0)
      issues.push("Invalid Price");

    return issues;

  };

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }

  /* ================= PAGE ================= */

  return (

    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>

      <Typography
        variant="h4"
        sx={{ color: GOLD, fontWeight: 700, mb: 1 }}
      >
        Promotion Review Center
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 4 }}>
        Review promotion payments before boosting listings.
      </Typography>

      {uploads.length === 0 && (

        <Typography sx={{ color: "#777" }}>
          No promotion requests pending.
        </Typography>

      )}

      <Grid container spacing={3}>

        {uploads.map((post) => {

          const issues = validatePost(post);

          const image =
            post.images?.[0]?.thumb ||
            post.images?.[0]?.full ||
            post.images?.[0] ||
            "/placeholder.png";

          return (

            <Grid item xs={12} key={post.id}>

              <GBCard>

                <Grid container spacing={3}>

                  {/* IMAGE */}

                  <Grid item xs={12} md={4}>

                    <Box
                      component="img"
                      src={image}
                      alt={post.title}
                      sx={{
                        width: "100%",
                        height: 240,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: `1px solid ${BORDER}`,
                      }}
                    />

                  </Grid>

                  {/* DETAILS */}

                  <Grid item xs={12} md={8}>

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {post.title}
                    </Typography>

                    <Typography sx={{ color: "#aaa", mb: 2 }}>
                      {post.description}
                    </Typography>

                    {post.price && (

                      <Typography
                        sx={{ color: GOLD, fontWeight: 700 }}
                      >
                        KES {post.price}
                      </Typography>

                    )}

                    <Box sx={{ mt: 2 }}>

                      <Chip
                        label={post.collection.toUpperCase()}
                        size="small"
                        sx={{
                          background: GOLD,
                          color: "#000",
                          mr: 1,
                        }}
                      />

                      {post.promotion?.promoted && (

                        <Chip
                          label={`PROMOTION (${post.promotion.plan})`}
                          size="small"
                          sx={{
                            background: GREEN,
                            color: "#fff",
                          }}
                        />

                      )}

                    </Box>

                    {/* MPESA */}

                    {post.promotion?.mpesaCode && (

                      <Typography
                        sx={{ color: "#ccc", mt: 2 }}
                      >
                        M-Pesa Code: {post.promotion.mpesaCode}
                      </Typography>

                    )}

                    <Divider sx={{ borderColor: BORDER, my: 2 }} />

                    {/* SELLER */}

                    {post.seller && (

                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>

                        <Avatar sx={{ mr: 2, bgcolor: GOLD }}>
                          {post.seller.name?.charAt(0)}
                        </Avatar>

                        <Box>

                          <Typography>
                            {post.seller.name}
                          </Typography>

                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>

                            {post.seller.sellerVerified && (

                              <Chip
                                label="Verified"
                                size="small"
                                sx={{
                                  background: GREEN,
                                  color: "#fff",
                                }}
                              />

                            )}

                            <Chip
                              label={`Rating ${post.seller.sellerRating || 0}`}
                              size="small"
                              sx={{
                                background: GOLD,
                                color: "#000",
                              }}
                            />

                          </Box>

                        </Box>

                      </Box>

                    )}

                    {/* VALIDATION */}

                    {issues.length > 0 && (

                      <Box sx={{ mb: 2 }}>

                        <Typography sx={{ color: RED }}>
                          Issues detected
                        </Typography>

                        {issues.map((issue, i) => (

                          <Chip
                            key={i}
                            label={issue}
                            size="small"
                            sx={{
                              background: RED,
                              color: "#fff",
                              mr: 1,
                              mt: 1,
                            }}
                          />

                        ))}

                      </Box>

                    )}

                    {/* ACTION BUTTONS */}

                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>

                      <GBButton
                        onClick={() => handleApprove(post)}
                        sx={{
                          backgroundColor: GREEN,
                          "&:hover": {
                            backgroundColor: "#00a843",
                          },
                        }}
                      >
                        Approve Promotion
                      </GBButton>

                      <GBButton
                        onClick={() => handleReject(post)}
                        sx={{
                          backgroundColor: RED,
                          "&:hover": {
                            backgroundColor: "#cc0000",
                          },
                        }}
                      >
                        Reject Promotion
                      </GBButton>

                    </Box>

                  </Grid>

                </Grid>

              </GBCard>

            </Grid>

          );

        })}

      </Grid>

    </Box>

  );

}