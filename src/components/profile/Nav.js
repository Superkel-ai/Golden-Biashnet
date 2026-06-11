// src/components/profile/Nav.js

import React from "react";

import {
  Box,
  Typography,
  Avatar,
} from "@mui/material";

import {
  Inventory2,
  ShoppingBag,
  Campaign,
  Verified,
  Edit,
  Analytics,
  TrendingUp,
  SupportAgent,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

export default function Nav() {

  const navigate = useNavigate();

  const menus = [

    {
      title: "Uploads",
      icon: <Inventory2 />,
      route: "/myuploads",
    },

    {
      title: "Orders",
      icon: <ShoppingBag />,
      route: "/seller-orders",
    },

    {
      title: "Promote",
      icon: <Campaign />,
      route: "/promote",
    },

    {
      title: "Verify",
      icon: <Verified />,
      route: "/verify",
    },

    {
      title: "Edit",
      icon: <Edit />,
      route: "/edit-listings",
    },

    {
      title: "Analytics",
      icon: <Analytics />,
      route: "/analytics",
    },

    {
      title: "Top Seller",
      icon: <TrendingUp />,
      route: "/top-seller",
    },

    {
      title: "Support",
      icon: <SupportAgent />,
      route: "/requests",
    },

  ];

  return (

    <Box sx={{ mt: 2 }}>

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 18,
          mb: 2,
        }}
      >
        Seller Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 2,
        }}
      >

        {menus.map((item) => (

          <Box
            key={item.title}
            onClick={() =>
              navigate(item.route)
            }
            sx={{
              textAlign: "center",
              cursor: "pointer",

              "&:active": {
                transform: "scale(.95)",
              },
            }}
          >

            <Avatar
              sx={{
                width: 58,
                height: 58,

                mx: "auto",

                bgcolor:
                  "rgba(244,180,0,.12)",

                color: GOLD,

                border:
                  "1px solid rgba(244,180,0,.2)",

                transition: ".2s",

                "&:hover": {
                  bgcolor:
                    "rgba(244,180,0,.2)",
                },
              }}
            >
              {item.icon}
            </Avatar>

            <Typography
              sx={{
                mt: 1,
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {item.title}
            </Typography>

          </Box>

        ))}

      </Box>

    </Box>

  );

}