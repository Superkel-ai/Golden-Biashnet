import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

import ProductDetails from "../components/postDetails/ProductDetails";
import HouseDetails from "../components/postDetails/HouseDetails";
import AdvertDetails from "../components/postDetails/AdvertDetails";
import ServiceDetails from "../components/postDetails/ServiceDetails";

const GOLD = "#F4B400";
const BG = "#0a0a0a";

export default function PostDetails() {

  const { type, id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchPost = async () => {

      try {

        const ref = doc(db, type + "s", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {

          setPost({
            id: snap.id,
            type,
            ...snap.data()
          });

        }

      } catch (error) {

        console.error("PostDetails error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchPost();

  }, [type, id]);


  if (loading) {

    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }

  if (!post) {

    return (
      <Typography sx={{ textAlign: "center", mt: 10 }}>
        Item not found
      </Typography>
    );

  }


  return (

    <Box sx={{ background: BG, minHeight: "100vh", color: "#fff", p: 2 }}>

      <IconButton
        onClick={() => navigate(-1)}
        sx={{ color: "#fff", mb: 2 }}
      >
        <ArrowBack />
      </IconButton>

      {type === "product" && <ProductDetails post={post} />}

      {type === "house" && <HouseDetails post={post} />}

      {type === "advert" && <AdvertDetails post={post} />}

      {type === "service" && <ServiceDetails post={post} />}

    </Box>

  );

}