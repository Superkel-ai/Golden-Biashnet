import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
} from "@mui/material";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import GBCard from "../components/GBCard";
import GBButton from "../components/GBButton";

const GOLD = "#F4B400";
const GREEN = "#00C853";
const RED = "#ff4444";
const BORDER = "#222";

export default function AdminSub() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH PENDING SUBSCRIPTIONS
  useEffect(() => {
    const fetchSubscriptions = async () => {
      const q = query(
        collection(db, "subscriptions"),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      let results = [];

      for (let docSnap of snapshot.docs) {
        const subData = docSnap.data();

        // Fetch user details
        const userSnap = await getDoc(doc(db, "users", subData.userId));

        const userData = userSnap.exists()
          ? userSnap.data()
          : null;

        results.push({
          id: docSnap.id,
          ...subData,
          user: userData,
        });
      }

      setSubscriptions(results);
      setLoading(false);
    };

    fetchSubscriptions();
  }, []);

  // ✅ APPROVE SUBSCRIPTION
  const handleApprove = async (sub) => {
    const startDate = new Date();
    const endDate = new Date();

    // Example: 30-day subscription (adjust if you have plans)
    endDate.setDate(startDate.getDate() + 30);

    try {
      // 1️⃣ Update subscription status
      await updateDoc(doc(db, "subscriptions", sub.id), {
        status: "approved",
        approvedAt: Timestamp.now(),
      });

      // 2️⃣ Update user subscription
      await updateDoc(doc(db, "users", sub.userId), {
        subscription: {
          active: true,
          plan: sub.planName,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
        },
      });

      // Remove from UI
      setSubscriptions((prev) =>
        prev.filter((item) => item.id !== sub.id)
      );

      alert("Subscription Approved!");
    } catch (error) {
      console.error("Approval Error:", error);
    }
  };

  // ❌ REJECT SUBSCRIPTION
  const handleReject = async (sub) => {
    try {
      await updateDoc(doc(db, "subscriptions", sub.id), {
        status: "rejected",
        rejectedAt: Timestamp.now(),
      });

      setSubscriptions((prev) =>
        prev.filter((item) => item.id !== sub.id)
      );

      alert("Subscription Rejected.");
    } catch (error) {
      console.error("Rejection Error:", error);
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
        Subscription Approval Center
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 4 }}>
        Review subscription payments and activate user plans.
      </Typography>

      {subscriptions.length === 0 && (
        <Typography sx={{ color: "#777" }}>
          No pending subscriptions.
        </Typography>
      )}

      <Grid container spacing={3}>
        {subscriptions.map((sub) => (
          <Grid item xs={12} key={sub.id}>
            <GBCard>
              <Grid container spacing={3}>

                {/* USER INFO */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{ bgcolor: GOLD, mr: 2 }}
                    >
                      {sub.user?.name?.charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography>
                        {sub.user?.name}
                      </Typography>

                      <Typography sx={{ color: "#aaa" }}>
                        {sub.user?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={`Plan: ${sub.planName}`}
                    sx={{
                      background: GOLD,
                      color: "#000",
                      mb: 2,
                    }}
                  />

                  <Typography sx={{ color: GOLD, fontWeight: 600 }}>
                    Amount: KES {sub.amount}
                  </Typography>

                  <Typography sx={{ color: "#aaa", mt: 1 }}>
                    Payment Ref: {sub.paymentReference}
                  </Typography>
                </Grid>

                {/* PAYMENT PROOF */}
                <Grid item xs={12} md={6}>
                  {sub.paymentProofUrl && (
                    <Box
                      component="img"
                      src={sub.paymentProofUrl}
                      alt="Payment Proof"
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: `1px solid ${BORDER}`,
                        mb: 2,
                      }}
                    />
                  )}

                  <Divider sx={{ borderColor: BORDER, mb: 2 }} />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <GBButton
                      onClick={() => handleApprove(sub)}
                      sx={{
                        backgroundColor: GREEN,
                        "&:hover": {
                          backgroundColor: "#00a843",
                        },
                      }}
                    >
                      Approve
                    </GBButton>

                    <GBButton
                      onClick={() => handleReject(sub)}
                      sx={{
                        backgroundColor: RED,
                        "&:hover": {
                          backgroundColor: "#cc0000",
                        },
                      }}
                    >
                      Reject
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