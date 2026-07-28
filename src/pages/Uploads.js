import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from "@mui/material";

import UploadTypeSelector from "../components/upload/UploadTypeSelector";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/upload/ProductForm";
import HouseForm from "../components/upload/HouseForm";
import ServiceForm from "../components/upload/ServiceForm";
import AdvertForm from "../components/upload/AdvertForm";

import { uploadToCloudinary } from "../utils/cloudinaryUpload";

import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";


// Theme
const GOLD = "#F4B400";
const CARD = "#111";


// ============================================
// MAIN COMPONENT
// ============================================

export default function Uploads() {

  // =============================
  // STATE
  // =============================
  const [checkingVerification, setCheckingVerification] = useState(true);

const [verifiedUser, setVerifiedUsers] = useState(false);

const [UserPlan, setUserPlan] = useState(null);

  const [type, setType] = useState("product");

  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({});

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  const [showGuide, setShowGuide] = useState(false);

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  
  // =============================

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);


useEffect(() => {
  if (!user) {
    setShowGuide(true);
  }
}, [user]);

const isLoggedIn = !!user;
//verify
useEffect(() => {

  const checkVerification = async () => {

    if (!user) {
      setCheckingVerification(false);
      return;
    }

    try {

      const verifyRef = doc(
        db,
        "verifiedUsers",
        user.uid
      );

      const verifySnap = await getDoc(verifyRef);

      if (
        verifySnap.exists() &&
        verifySnap.data().status === "approved"
      ) {

        setVerifiedUsers(true);

        setUserPlan(
          verifySnap.data().plan
        );

      } else {

        setVerifiedUsers(false);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setCheckingVerification(false);

    }

  };

  checkVerification();

}, [user]);



  // HANDLE TYPE CHANGE
  // Reset form when type changes
  // =============================

  const handleTypeChange = (newType) => {

    setType(newType);

    setImages([]);

    setFormData({});

  };


  // =============================
  // HANDLE FORM CHANGE
  // =============================

  const handleFormChange = useCallback((data) => {

    setFormData(data);

  }, []);



  // =============================
  // VALIDATION
  // =============================

  const validate = () => {

    if (!auth.currentUser) {
      setError("Please login first");
      return false;
    }

    if (images.length === 0) {
      setError("Please upload at least one image");
      return false;
    }

    if (!formData.title) {
      setError("Title is required");
      return false;
    }

    return true;

  };



  // =============================
  // CLOUDINARY MULTI UPLOAD
  // =============================

 const uploadImages = async () => {

  const uploadedImages = [];

  for (const image of images) {

    const result = await uploadToCloudinary(image);

    uploadedImages.push({
      full: result.full,
      thumb: result.thumb
    });

  }

  return uploadedImages;

};



  // =============================
  // GET COLLECTION NAME
  // =============================

  const getCollectionName = () => {

    switch (type) {

      case "product":
        return "products";

      case "house":
        return "houses";

      case "service":
        return "services";

      case "advert":
        return "advert";

      default:
        return "products";

    }

  };



  // =============================
  // SUBMIT
  // =============================

  const handleSubmit = async () => {

    if (loading) return;

    if (!validate()) return;

    try {

      setLoading(true);


      // Upload images
      const imageUrls = await uploadImages();


      // Build document
      const document = {

        ...formData,

        images: imageUrls,

        userId: auth.currentUser.uid,

        type: type,

        promoted: false,

        status: "active",

        views: 0,

        createdAt: serverTimestamp()

      };


      // Save to firestore
      await addDoc(
        collection(db, getCollectionName()),
        document
      );


      // Reset
      setImages([]);

      setFormData({});

      setSuccess(true);

    }

    catch (err) {

      console.error(err);

      setError("Upload failed. Try again.");

    }

    finally {

      setLoading(false);

    }

  };





  // =============================
  // RENDER FORM
  // =============================

  const renderForm = () => {

    const props = {

      data: formData,

      onChange: handleFormChange

    };

    switch (type) {

      case "product":
        return <ProductForm {...props} />;

      case "house":
        return <HouseForm {...props} />;

      case "service":
        return <ServiceForm {...props} />;

      case "advert":
        return <AdvertForm {...props} />;

      default:
        return null;

    }

  };

  /* =========================================
VERIFY FIRST
========================================= */

if (checkingVerification) {

  return (

    <Box
      sx={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <CircularProgress />

    </Box>

  );

}

if (user && !verifiedUser) {

  return (

    <Box
      sx={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2
      }}
    >

      <Paper
        sx={{
          background: "#111",
          p: 3,
          maxWidth: 420,
          borderRadius: 3,
          border: "1px solid #333"
        }}
      >

        <Typography
          sx={{
            color: GOLD,
            fontWeight: "bold",
            fontSize: 22,
            mb: 2
          }}
        >
          Seller Verification Required
        </Typography>

        <Typography
          sx={{
            color: "#ccc",
            mb: 3,
            fontSize: 14
          }}
        >
         FREE OFFER FOR LIMITED TIME:
        Verify your account for free and start posting today!
      
          To keep Golden Biashnet secure,
          all sellers must verify first
          before posting products,
          houses, services or adverts. 
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/verify")}
          sx={{
            background: GOLD,
            color: "#000",
            fontWeight: "bold",
            height: 48
          }}
        >
          Verify Account for Free
        </Button>

      </Paper>

    </Box>

  );

}


  // =============================
  // UI
  // =============================

  return (

    <Box
  sx={{
    background: "#000",
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden", // 🔥 prevents horizontal scroll
    pb: { xs: "90px", md: 4 }, // 🔥 space for bottom nav
  }}
>

      <Container
  maxWidth="sm"
  disableGutters
  sx={{
    px: { xs: 1.5, sm: 2 },
  }}
>

{!isLoggedIn && (
  <Paper
    sx={{
      background: "#1a1a1a",
      p: 2,
      mb: 2,
      borderRadius: 2.5,
      border: "1px solid #333"
    }}
  >

    <Typography
      sx={{
        color: "#fff",
        fontSize: 13,
        mb: 1
      }}
    >
      You need an account to post listings
    </Typography>

    <Typography
      sx={{
        color: "#aaa",
        fontSize: 12,
        mb: 2
      }}
    >
      Create an account to start uploading and reaching customers
    </Typography>

    <Button
      fullWidth
      variant="contained"
      onClick={() => navigate("/signup")}
      sx={{
        background: GOLD,
        color: "#000",
        fontWeight: "bold",
        height: 45,
        "&:hover": {
          background: "#ffd54f"
        }
      }}
    >
      Create Account
    </Button>

  </Paper>
)}

        {/* HEADER */}
        <Typography
  variant="h5"
  sx={{
    color: GOLD,
    fontWeight: "bold",
    pt: 3,
    pb: 2
  }}
>
          Create Listing
        </Typography>

        <Paper
  sx={{
    background: "#111",
    p: 2,
    mb: 2,
    borderRadius: 2.5
  }}
>

  {/* HEADER */}
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
  >
    <Typography
      sx={{
        color: GOLD,
        fontWeight: "bold",
        fontSize: 14
      }}
    >
      How to Post
    </Typography>

    <Button
      size="small"
      onClick={() => setShowGuide(!showGuide)}
      sx={{ color: GOLD }}
    >
      {showGuide ? "Hide" : "Open Guide"} 
    </Button>
  </Box>

  {/* CONTENT */}
  {showGuide && (
    <Box mt={1.5}>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        1. Create an account to start posting
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        2. Choose what you want to post (Product, House, Service, Advert)
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        3. Upload clear, high-quality images
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        4. Fill in all details correctly to attract customers
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        5. Select the correct category
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        6. Add a clear and attractive description
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        7. Optional: Select promotion (admin approval required)
      </Typography>

      <Typography sx={{ fontSize: 12 }}>
        8. Submit — your listing goes live instantly 
      </Typography>

    </Box>
  )}

</Paper>



        {/* TYPE SELECTOR */}
      <Paper
  sx={{
    background: CARD,
    p: { xs: 1.5, sm: 2 },
    mb: 2,
    borderRadius: 2.5,
    overflow: "hidden", // 🔥 prevents child overflow
  }}
>

          <UploadTypeSelector
            selectedType={type}
            setSelectedType={handleTypeChange}
          />

        </Paper>

        {/* FORM */}
        <Paper
  sx={{
    background: CARD,
    p: { xs: 1.5, sm: 2 },
    mb: 2,
    borderRadius: 2.5,
    overflow: "hidden", // 🔥 prevents child overflow
  }}
>

          {renderForm()}

        </Paper>



        <Divider sx={{ mb: 2 }} />


      </Container>



      {/* SUCCESS */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Listing published successfully
        </Alert>
      </Snackbar>



      {/* ERROR */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>

    </Box>

  );

}