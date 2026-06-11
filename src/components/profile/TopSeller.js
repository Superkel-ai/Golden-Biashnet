// src/components/profile/TopSeller.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";

import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../services/firebase";

const GOLD = "#F4B400";
const BG_CARD = "#0d0d0d";

export default function TopSeller() {
  const [loading, setLoading] = useState(true);
  const [topWeek, setTopWeek] = useState([]);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const calculateScore = (seller) => {
    return (
      (seller.listingsCount || 0) * 2 +
      (seller.completedOrders || 0) * 10 +
      (seller.sellerRating || 0) * 20 +
      (seller.referralCount || 0) * 3 +
      (seller.sellerVerified ? 50 : 0)
    );
  };

  const loadSellers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));

      const sellers = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          score: calculateScore(data),
        };
      });

      const ranked = [...sellers].sort((a, b) => b.score - a.score);

      // ONLY TOP 3 WEEKLY
      setTopWeek(ranked.slice(0, 3));

      const myUid = auth.currentUser?.uid;
      const myIndex = ranked.findIndex((s) => s.id === myUid);

      if (myIndex >= 0) {
        const me = ranked[myIndex];
        const leader = ranked[0];

        const progress = Math.min(
          100,
          Math.round((me.score / leader.score) * 100)
        );

        setMyRank({
          rank: myIndex + 1,
          score: me.score,
          progress,
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>

      {/* =========================
         YOUR PROGRESS
      ========================= */}

      {myRank && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: BG_CARD,
            border: "1px solid rgba(244,180,0,.15)",
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
            Your Weekly Progress
          </Typography>

          <Typography sx={{ fontSize: 12, color: "#aaa", mt: 0.5 }}>
            Rank: <b style={{ color: GOLD }}>#{myRank.rank}</b> • Score:{" "}
            <b style={{ color: GOLD }}>{myRank.score}</b>
          </Typography>

          {/* progress bar */}
          <Box
            sx={{
              mt: 1.5,
              height: 6,
              borderRadius: 10,
              bgcolor: "#1a1a1a",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${myRank.progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,#F4B400,#ffcc33)",
              }}
            />
          </Box>

          <Typography
            sx={{
              mt: 1,
              fontSize: 11,
              textAlign: "center",
              color: "#888",
            }}
          >
            {myRank.progress}% to{" "}
            <span style={{ color: GOLD, fontWeight: 900 }}>
              #1 Seller
            </span>
          </Typography>
        </Box>
      )}

      {/* =========================
         WEEKLY TOP 3
      ========================= */}

      <SectionTitle title="🏆 Weekly Top Sellers" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 1,
        }}
      >
        {topWeek.map((seller, i) => (
          <MiniCard key={seller.id} seller={seller} rank={i + 1} />
        ))}
      </Box>
    </Box>
  );
}

/* =========================
   SECTION TITLE
========================= */

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        mt: 3,
        mb: 1,
        fontWeight: 900,
        fontSize: 13,
        color: GOLD,
      }}
    >
      {title}
    </Typography>
  );
}

/* =========================
   MINI CARD (CLEAN & SMALL)
========================= */

function MiniCard({ seller, rank }) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 2,
        textAlign: "center",
        bgcolor: "#111",
        border: "1px solid rgba(255,255,255,.05)",
        transition: "0.2s",
        "&:active": { transform: "scale(0.97)" },
      }}
    >
      <Avatar
        src={seller.photoURL}
        sx={{
          width: 40,
          height: 40,
          mx: "auto",
          border: `2px solid ${GOLD}`,
        }}
      >
        {seller?.name?.[0]}
      </Avatar>

      <Typography sx={{ fontSize: 11, fontWeight: 900 }}>
        #{rank}
      </Typography>

      <Typography
        sx={{
          fontSize: 10,
          color: "#bbb",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {seller.name}
      </Typography>

      <Typography sx={{ fontSize: 10, color: GOLD, fontWeight: 900 }}>
        {seller.score}
      </Typography>
    </Box>
  );
}