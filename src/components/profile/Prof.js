// src/components/profile/Prof.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";

import {
  Verified,
  People,
  MonetizationOn,
  LocationOn,
} from "@mui/icons-material";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../services/firebase";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

import SellerBadge from "../home/SellerBadge";

const GOLD = "#F4B400";

export default function Prof() {

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] =
    useState(null);
 const navigate = useNavigate();
  useEffect(() => {

    loadProfile();

  }, []);

  const loadProfile = async () => {

    try {

      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      const userRef =
        doc(db, "users", uid);

      const userSnap =
        await getDoc(userRef);

      if (userSnap.exists()) {

        setUserData({
          id: userSnap.id,
          ...userSnap.data(),
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

      <Box
        sx={{
          py: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          sx={{ color: GOLD }}
        />
      </Box>

    );

  }

  if (!userData) return null;

  const joinedDate =
    userData?.createdAt?.toDate
      ? userData.createdAt
          .toDate()
          .toLocaleDateString()
      : "Recently";

  return (

    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        background:
          "linear-gradient(180deg,#151515,#090909)",
        border:
          "1px solid rgba(255,255,255,.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* GOLD GLOW */}

      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "rgba(244,180,0,.08)",
          filter: "blur(60px)",
        }}
      />

      {/* EDIT BUTTON */}
<IconButton
  onClick={() => navigate("/edit")}
  sx={{
    position: "absolute",
    top: 12,
    right: 12,
    bgcolor: "rgba(244,180,0,.12)",
    color: GOLD,
    border: "1px solid rgba(244,180,0,.3)",
    "&:hover": {
      bgcolor: "rgba(244,180,0,.25)",
      transform: "scale(1.05)",
    },
  }}
>
  <EditIcon fontSize="small" />
</IconButton>

      <Stack
        spacing={2}
        alignItems="center"
      >

        {/* PHOTO */}

        <Avatar
          src={userData?.photoURL || ""}
          sx={{
            width: 100,
            height: 100,
            border:
              `3px solid ${GOLD}`,
            fontSize: 38,
            fontWeight: 800,
          }}
        >
          {userData?.name?.charAt(0)}
        </Avatar>

        {/* NAME */}

        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 900,
            textAlign: "center",
          }}
        >
          {userData?.name ||
            "Golden Biashnet User"}
        </Typography>

        {/* BADGES */}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
        >

          {userData?.verified && (

            <Chip
              icon={<Verified />}
              label="Verified"
              sx={{
                bgcolor:
                  "rgba(0,200,83,.15)",
                color: "#00C853",
                fontWeight: 700,
              }}
            />

          )}

          <SellerBadge
            badge={
              userData?.sellerBadge ||
              userData?.badgeLevel
            }
          />

        </Stack>

        {/* LOCATION */}

        {userData?.location && (

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
          >
            <LocationOn
              sx={{
                color: GOLD,
                fontSize: 18,
              }}
            />

            <Typography
              sx={{
                color: "#aaa",
                fontSize: 13,
              }}
            >
              {userData.location}
            </Typography>
          </Stack>

        )}

        {/* MEMBER SINCE */}

        <Typography
          sx={{
            color: "#888",
            fontSize: 13,
          }}
        >
          Member Since {joinedDate}
        </Typography>

      </Stack>

      {/* STATS */}

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 1,
        }}
      >

        <MiniStat
          icon={<People />}
          title="Referrals"
          value={
            userData?.referralsCount ||
            0
          }
        />

        <MiniStat
          icon={<MonetizationOn />}
          title="Bonus Coins"
          value={
            userData?.bonusCoins ||
            0
          }
        />

      </Box>

    </Paper>

  );

}

/* ========================= */

function MiniStat({
  icon,
  title,
  value,
}) {

  return (

    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: "#111",
        borderRadius: 3,
        border:
          "1px solid rgba(255,255,255,.05)",
        textAlign: "center",
      }}
    >

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 1,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: "#888",
          fontSize: 12,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: 18,
        }}
      >
        {value}
      </Typography>

    </Paper>

  );

}