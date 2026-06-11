import React, { Suspense } from "react";

import {
  Box,
  CircularProgress,
  Typography,
  IconButton
} from "@mui/material";

import { ArrowBack } from "@mui/icons-material";

import { useParams, useNavigate } from "react-router-dom";

/* =========================================================
DETAIL COMPONENTS
========================================================= */
import HouseDetails from "../components/postDetails/HouseDetails";
import ServiceDetails from "../components/postDetails/ServiceDetails";
import AdvertDetails from "../components/postDetails/AdvertDetails";

/* =========================================================
PRODUCT PAGE
========================================================= */
const Product = React.lazy(() =>
  import("../pages/Product")
);

const GOLD = "#F4B400";
const BG = "#0a0a0a";

export default function PostDetails() {

  const { type, id } = useParams();
  const navigate = useNavigate();

  const renderContent = () => {

    switch (type) {

      case "product":
        return (
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 8
                }}
              >
                <CircularProgress
                  sx={{ color: GOLD }}
                />
              </Box>
            }
          >
            <Product />
          </Suspense>
        );

      case "house":
        return (
          <HouseDetails
            id={id}
          />
        );

      case "service":
        return (
          <ServiceDetails
            id={id}
          />
        );

      case "advert":
        return (
          <AdvertDetails
            id={id}
          />
        );

      default:
        return (
          <Typography
            sx={{
              color: "#fff",
              textAlign: "center",
              mt: 5
            }}
          >
            Item not found
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        color: "#fff"
      }}
    >

      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          color: "#fff",
          position: "sticky",
          top: 10,
          zIndex: 1000,
          ml: 1,
          mt: 1,
          background:
            "rgba(0,0,0,0.5)"
        }}
      >
        <ArrowBack />
      </IconButton>

      {renderContent()}

    </Box>
  );
}