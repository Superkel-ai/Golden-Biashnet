import React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Grid
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import HandymanIcon from "@mui/icons-material/Handyman";
import CampaignIcon from "@mui/icons-material/Campaign";

// Theme
const GOLD = "#F4B400";
const BLACK = "#000";
const CARD = "#111";
const BORDER = "#222";

// Upload Types (shorter text 🔥)
const uploadTypes = [
  {
    id: "product",
    title: "Product",
    desc: "Sell items",
    icon: <StorefrontIcon sx={{ fontSize: 26 }} />
  },
  {
    id: "house",
    title: "House",
    desc: "Post rentals",
    icon: <HomeIcon sx={{ fontSize: 26 }} />
  },
  {
    id: "service",
    title: "Service",
    desc: "Offer skills",
    icon: <HandymanIcon sx={{ fontSize: 26 }} />
  },
  {
    id: "advert",
    title: "Advert",
    desc: "Promote biz",
    icon: <CampaignIcon sx={{ fontSize: 26 }} />
  }
];

export default function UploadTypeSelector({ selectedType, setSelectedType }) {
  return (
    <Box>

      {/* TITLE */}
      <Typography
        sx={{
          color: GOLD,
          mb: 1.5,
          fontWeight: 700,
          fontSize: 14, // 🔥 smaller
        }}
      >
        Choose Type
      </Typography>

      {/* GRID */}
      <Grid container spacing={1.2}>

        {uploadTypes.map((type) => {
          const selected = selectedType === type.id;

          return (
            <Grid item xs={6} key={type.id}>
              
              <Card
                sx={{
                  background: selected ? GOLD : CARD,
                  border: `1px solid ${selected ? GOLD : BORDER}`,
                  color: selected ? BLACK : "#fff",
                  borderRadius: 2,
                  height: 80, // 🔥 compact height
                  transition: "0.2s",
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedType(type.id)}
                  sx={{
                    height: "100%",
                    px: 1,
                    py: 1,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    
                    {/* ICON */}
                    <Box
                      sx={{
                        color: selected ? BLACK : GOLD,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {type.icon}
                    </Box>

                    {/* TEXT */}
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          lineHeight: 1.2,
                        }}
                      >
                        {type.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 10,
                          opacity: 0.7,
                        }}
                      >
                        {type.desc}
                      </Typography>
                    </Box>

                  </Box>
                </CardActionArea>
              </Card>

            </Grid>
          );
        })}

      </Grid>

    </Box>
  );
}