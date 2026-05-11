import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
  TextField,
} from "@mui/material";
import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // adjust if needed

const BADGES = [
  {
    key: "regular",
    name: "Regular Seller",
    price: 250,
    color: "#2196F3",
    image: "/badges/regular.png", // 🔥 you will add image
    requirements: [
      "At least 10 product uploads",
      "Active account",
      "Valid phone number",
    ],
  },
  {
    key: "trusted",
    name: "Trusted Seller",
    price: 500,
    color: "#9C27B0",
    image: "/badges/trusted.png",
    requirements: [
      "At least 25 product uploads",
      "At least 5 completed orders",
      "Good customer rating",
    ],
  },
  {
    key: "partner",
    name: "Partner",
    price: 1000,
    color: "#FFD700",
    image: "/badges/partner.png",
    requirements: [
      "At least 50 product uploads",
      "Trusted Seller status",
      "Verified business identity",
      "Consistent activity",
    ],
  },
];

export default function VerificationPage() {
  const [open, setOpen] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth(); // current user

  const toggle = (key) => {
    setOpen(open === key ? null : key);
  };

  // 🔥 Submit verification request
  const submitRequest = async (badgeKey) => {
    if (!user) return;

    try {
      const ref = doc(db, "members", user.uid);

      await updateDoc(ref, {
        verificationRequest: {
          badge: badgeKey,
          status: "pending",
          requestedAt: new Date(),
          note: message,
        },
      });

      alert("Request submitted! Await admin confirmation.");
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        Get Verified Badge
      </Typography>

      <Typography sx={{ color: "#aaa", mb: 3 }}>
        Increase trust, visibility, and sales by getting verified.
      </Typography>

      {BADGES.map((badge) => {
        const isOpen = open === badge.key;

        return (
          <Box
            key={badge.key}
            sx={{
              border: "1px solid #333",
              borderRadius: 2,
              mb: 2,
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <Box
              onClick={() => toggle(badge.key)}
              sx={{
                p: 2,
                background: "#111",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography fontWeight="bold" color={badge.color}>
                {badge.name} — KES {badge.price}
              </Typography>

              <Typography>{isOpen ? "▲" : "▼"}</Typography>
            </Box>

            {/* CONTENT */}
            <Collapse in={isOpen}>
              <Box sx={{ p: 2, background: "#000" }}>
                {/* BADGE IMAGE */}
                <Box
                  component="img"
                  src={badge.image}
                  alt={badge.name}
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    borderRadius: "50%",
                    border: `2px solid ${badge.color}`,
                  }}
                />

                {/* REQUIREMENTS */}
                <Typography fontWeight="bold" mb={1}>
                  Requirements:
                </Typography>

                {badge.requirements.map((req, i) => (
                  <Typography key={i} sx={{ fontSize: 13, color: "#ccc" }}>
                    • {req}
                  </Typography>
                ))}

                {/* PAYMENT */}
                <Typography mt={2} fontWeight="bold">
                  How to Purchase:
                </Typography>

                <Typography sx={{ fontSize: 13, color: "#aaa", mt: 1 }}>
                  1. Go to M-Pesa
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                  2. Lipa na M-Pesa → Buy Goods & Services
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                  3. Till Number: <b>3141192</b>
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                  4. Enter Amount: KES {badge.price}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                  5. Complete Payment
                </Typography>

                {/* NOTE */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Optional message (e.g. payment code)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mt: 2 }}
                />

                {/* BUTTON */}
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    background: badge.color,
                    color: "#000",
                  }}
                  onClick={() => submitRequest(badge.key)}
                >
                  I Have Paid — Submit Request
                </Button>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}