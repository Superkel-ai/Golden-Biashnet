// src/components/forms/ProductForm.js

import React, { useEffect, useState } from "react";

import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  LinearProgress,
  Stack
} from "@mui/material";

import {
  CheckCircle,
  LocalFireDepartment,
  Star,
  Sell,
  Image,
  ArrowForward,
  ArrowBack
} from "@mui/icons-material";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";

import ImageUploader from "./ImageUploader";

import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

/* =====================================================
THEME
===================================================== */

const GOLD = "#F4B400";
const BLACK = "#000";
const CARD = "#111";
const BORDER = "#222";
const TEXT = "#fff";
const SUB = "#aaa";
const GREEN = "#22c55e";

const TILL = "3141192";

/* =====================================================
CATEGORIES
===================================================== */

const categories = [
  "Electronics",
  "Fashion",
  "Home",
  "Shoes",
  "Jewelry",
  "Watches",
  "Foods",
  "Snacks",
  "Vehicles",
  "Phones",
  "Computers",
  "Accessories",
  "Other"
];

/* =====================================================
PROMOTION PLANS
===================================================== */

const promotionPlans = [
  {
    label: "No Promotion",
    value: "none",
    price: 0,
    days: 0
  },
  {
    label: "Daily Boost - KES 50",
    value: "daily",
    price: 50,
    days: 1
  },
  {
    label: "7 Days Boost - KES 250",
    value: "weekly",
    price: 250,
    days: 7
  },
  {
    label: "30 Days Featured - KES 800",
    value: "monthly",
    price: 800,
    days: 30
  }
];

const steps = [
  "Photos",
  "Basic Info",
  "Details",
  "Promotion"
];

/* =====================================================
PHONE FORMATTER
===================================================== */

const formatKenyanPhone = (phone) => {

  if (!phone) return "";

  let cleaned = phone.replace(/\s+/g, "").trim();

  if (cleaned.startsWith("07")) {
    return "254" + cleaned.slice(1);
  }

  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return "254" + cleaned;
  }

  if (cleaned.startsWith("+254")) {
    return cleaned.slice(1);
  }

  if (cleaned.startsWith("254")) {
    return cleaned;
  }

  return cleaned;
};

/* =====================================================
MAIN COMPONENT
===================================================== */

export default function ProductForm() {

  /* =====================================================
  FORM STATE
  ===================================================== */

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [markedPrice, setMarkedPrice] = useState("");

  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("New");

  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(1);

  const [location, setLocation] = useState("");

  const [promotionPlan, setPromotionPlan] = useState("none");

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [promoOpen, setPromoOpen] = useState(false);

  const [mpesaCode, setMpesaCode] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  /* =====================================================
  LOAD DRAFT
  ===================================================== */

  useEffect(() => {

    const draft = localStorage.getItem("productDraft");

    if (draft) {

      const data = JSON.parse(draft);

      setTitle(data.title || "");
      setPrice(data.price || "");
      setMarkedPrice(data.markedPrice || "");
      setCategory(data.category || "");
      setCondition(data.condition || "New");
      setDescription(data.description || "");
      setStock(data.stock || 1);
      setLocation(data.location || "");
      setPromotionPlan(data.promotionPlan || "none");

    }

  }, []);

  /* =====================================================
  SAVE DRAFT
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "productDraft",
      JSON.stringify({
        title,
        price,
        markedPrice,
        category,
        condition,
        description,
        stock,
        location,
        promotionPlan
      })
    );

  }, [
    title,
    price,
    markedPrice,
    category,
    condition,
    description,
    stock,
    location,
    promotionPlan
  ]);

  /* =====================================================
  VALIDATION
  ===================================================== */

  const validateStep = () => {

    if (step === 0 && images.length === 0) {
      setError("Upload at least one image");
      return false;
    }

    if (step === 1) {

      if (!title || !price) {
        setError("Enter title and price");
        return false;
      }

    }

    if (step === 2) {

      if (!category || !location) {
        setError("Select category and location");
        return false;
      }

    }

    setError("");

    return true;

  };

  /* =====================================================
  STEP NAVIGATION
  ===================================================== */

  const handleNext = () => {

    if (!validateStep()) return;

    setStep((prev) => prev + 1);

  };

  const handleBack = () => {

    setStep((prev) => prev - 1);

  };

  /* =====================================================
  KEYWORDS
  ===================================================== */

  const generateKeywords = () => {

    const words = [
      title,
      category,
      condition,
      location
    ]
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return [...new Set(words)].slice(0, 30);

  };

  /* =====================================================
  SEO SLUG
  ===================================================== */

  const generateSlug = () => {

    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  };

  /* =====================================================
  AI DESCRIPTION
  ===================================================== */

  const generateDescription = () => {

    const text = `
${title} available in ${condition.toLowerCase()} condition.

✔ Quality guaranteed
✔ Available in ${location || "Juja"}
✔ Affordable pricing
✔ Fast response from seller

Contact Biashnet Admin for more details.
`;

    setDescription(text);

  };

  /* =====================================================
  MAIN SUBMIT
  ===================================================== */

  const handleSubmit = async () => {

    try {

      setLoading(true);

      if (!auth.currentUser) {

  alert("Please login first");

  setLoading(false);

  return;

}

      const userRef = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const userSnap = await getDoc(userRef);

      const seller = userSnap.exists()
        ? userSnap.data()
        : {};

      const sellerPhone = formatKenyanPhone(
        seller.phone || ""
      );

      const sellerWhatsapp = formatKenyanPhone(
        seller.whatsapp || seller.phone || ""
      );

      /* =====================================================
      IMAGE UPLOAD
      ===================================================== */

      const uploadedImages = [];

      for (let i = 0; i < images.length; i++) {

        const img = images[i];

        const url = await uploadToCloudinary(img);

        uploadedImages.push(url);

        setUploadProgress(
          Math.round(((i + 1) / images.length) * 100)
        );

      }

      /* =====================================================
      DISCOUNT
      ===================================================== */

      const productPrice = Number(price);

      const marked = Number(
        markedPrice || price
      );

      let discount = 0;

      if (marked > productPrice) {

        discount = Math.round(
          ((marked - productPrice) / marked) * 100
        );

      }

      /* =====================================================
      PROMOTION
      ===================================================== */

      let promotion = null;

      if (promotionPlan !== "none") {

        const plan = promotionPlans.find(
          (p) => p.value === promotionPlan
        );

        promotion = {
          plan: plan.value,
          price: plan.price,
          days: plan.days,
          mpesaCode,
          promoted: true,
          featured:
            plan.value === "monthly",
          status: "pending",
          paidAt: serverTimestamp()
        };

      }

      /* =====================================================
      CREATE PRODUCT
      ===================================================== */

      if (!auth.currentUser) {

  alert("Please login first");

  return;

}

      const productRef = await addDoc(
        collection(db, "products"),
        {

          title,
          description,

          category,
          condition,

          price: productPrice,

          markedPrice: marked,

          discount,

          stock: Number(stock || 1),

          location,

          images: uploadedImages,

          userId: auth.currentUser.uid,

          sellerName: seller.name || "",
          sellerVerified: true,
        sellerBadge: "golden",

          sellerPhoto:
            seller.photoURL || "",

          sellerPhone,

          sellerWhatsapp,

          keywords: generateKeywords(),

          seoSlug: generateSlug(),

          promotion: promotion || {

  promoted: false,

  plan: null,

  promotedAt: null,

},

    

          views: 0,
          rating: 0,
          reviewCount: 0,

          status: promotion
            ? "pendingPromotion"
            : "approved",

          isActive: true,

          createdAt: serverTimestamp()

        }
      );

      /* =====================================================
      SEARCH INDEX
      ===================================================== */

      await addDoc(
        collection(db, "searchIndex"),
        {

          type: "product",

          refId: productRef.id,

          title,

          titleLower:
            title.toLowerCase(),

          price: Number(price),

          location,

          locationLower:
            location.toLowerCase(),

          category,

          condition,

          image:
            uploadedImages[0] || "",

          sellerId:
            auth.currentUser.uid,

          keywords: generateKeywords(),

          searchText:
            `${title} ${category} ${condition} ${location}`.toLowerCase(),

          promoted:
            promotion?.promoted || false,

          featured:
            promotion?.featured || false,

          views: 0,

          rating: 0,

          status: promotion
            ? "pendingPromotion"
            : "approved",

          createdAt:
            serverTimestamp()

        }
      );

      /* =====================================================
      UPDATE SELLER STATS
      ===================================================== */

      await updateDoc(userRef, {

        listingsCount: increment(1)

      });

      /* =====================================================
      SUCCESS
      ===================================================== */

      localStorage.removeItem(
        "productDraft"
      );

      setSuccess(
        "Product uploaded successfully!"
      );

      setLoading(false);

      /* RESET */

      setTitle("");
      setPrice("");
      setMarkedPrice("");
      setCategory("");
      setDescription("");
      setLocation("");
      setImages([]);
      setStock(1);

      setStep(0);

    } catch (err) {

      console.error(err);

      setError("Upload failed - please try again");

      setLoading(false);

    }

  };

  /* =====================================================
  PROMOTION CONFIRM
  ===================================================== */

  const confirmPromotion = () => {

    if (!mpesaCode) {

      setError(
        "Enter M-Pesa confirmation code"
      );

      return;

    }

    setPromoOpen(false);

    handleSubmit();

  };

  /* =====================================================
  FINAL SUBMIT
  ===================================================== */

  const handleFinalSubmit = () => {

    if (promotionPlan === "none") {

      handleSubmit();

    } else {

      setPromoOpen(true);

    }

  };

  /* =====================================================
  UI
  ===================================================== */

  return (

    <Card
      sx={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        mt: 2
      }}
    >

      <CardContent>

        {/* =====================================================
        HEADER
        ===================================================== */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >

          <Box>

            <Typography
              variant="h5"
              sx={{
                color: GOLD,
                fontWeight: "bold"
              }}
            >
              Upload Product
            </Typography>

            <Typography
              sx={{
                color: SUB,
                fontSize: 13
              }}
            >
              Reach thousands of buyers in Juja
            </Typography>

          </Box>

          <Chip
            icon={<LocalFireDepartment />}
            label="Fast Selling"
            sx={{
              background: "#2e7d32",
              color: "#fff"
            }}
          />

        </Box>

        {/* =====================================================
        STEPPER
        ===================================================== */}

        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{ mb: 4 }}
        >

          {steps.map((label) => (

            <Step key={label}>
              <StepLabel>
                {label}
              </StepLabel>
            </Step>

          ))}

        </Stepper>

        {/* =====================================================
        ALERTS
        ===================================================== */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {/* =====================================================
        STEP 1
        ===================================================== */}

        {step === 0 && (

          <Box>

            <Typography
              sx={{
                color: TEXT,
                mb: 2,
                fontWeight: "bold"
              }}
            >
              Add Product Photos
            </Typography>

            <ImageUploader
              images={images}
              setImages={setImages}
            />

            <Typography
              sx={{
                color: SUB,
                mt: 2,
                fontSize: 13
              }}
            >
              Products with 3+ images
              sell faster 🔥
            </Typography>

          </Box>

        )}

        {/* =====================================================
        STEP 2
        ===================================================== */}

        {step === 1 && (

          <Grid container spacing={2}>

            <Grid item xs={12}>

              <TextField
                fullWidth
                label="Product Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                sx={inputStyle}
              />

            </Grid>

            <Grid item xs={6}>

              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                sx={inputStyle}
              />

            </Grid>

            <Grid item xs={6}>

              <TextField
                fullWidth
                label="Market Price"
                type="number"
                value={markedPrice}
                onChange={(e) =>
                  setMarkedPrice(
                    e.target.value
                  )
                }
                sx={inputStyle}
              />

            </Grid>

            <Grid item xs={12}>

              <Box
                display="flex"
                gap={1}
                flexWrap="wrap"
              >

                <Chip
                  icon={<Star />}
                  label="Affordable"
                  sx={{
                    background: "#222",
                    color: TEXT
                  }}
                />

                <Chip
                  icon={<Sell />}
                  label="High Demand"
                  sx={{
                    background: "#222",
                    color: TEXT
                  }}
                />

              </Box>

            </Grid>

          </Grid>

        )}

        {/* =====================================================
        STEP 3
        ===================================================== */}

        {step === 2 && (

          <Grid container spacing={2}>

            <Grid item xs={12}>

              <Typography
                sx={{
                  color: SUB,
                  mb: 1
                }}
              >
                Choose Category
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
              >

                {categories.map((cat) => (

                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    onClick={() =>
                      setCategory(cat)
                    }
                    sx={{
                      mb: 1,
                      background:
                        category === cat
                          ? GOLD
                          : "#222",
                      color:
                        category === cat
                          ? "#000"
                          : "#fff"
                    }}
                  />

                ))}

              </Stack>

            </Grid>

            <Grid item xs={6}>

              <TextField
                select
                fullWidth
                label="Condition"
                value={condition}
                onChange={(e) =>
                  setCondition(
                    e.target.value
                  )
                }
                sx={inputStyle}
              >

                <MenuItem value="New">
                  New
                </MenuItem>

                <MenuItem value="Used">
                  Used
                </MenuItem>

              </TextField>

            </Grid>

            <Grid item xs={6}>

              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                sx={inputStyle}
              />

            </Grid>

            <Grid item xs={12}>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                sx={inputStyle}
              />

            </Grid>

            <Grid item xs={12}>

              <Button
                onClick={
                  generateDescription
                }
                sx={{
                  color: GOLD
                }}
              >
                Generate Description
              </Button>

            </Grid>

          </Grid>

        )}

        {/* =====================================================
        STEP 4
        ===================================================== */}

        {step === 3 && (

          <Grid container spacing={2}>

            <Grid item xs={12}>

              <TextField
                select
                fullWidth
                label="Promotion Plan"
                value={promotionPlan}
                onChange={(e) =>
                  setPromotionPlan(
                    e.target.value
                  )
                }
                sx={inputStyle}
              >

                {promotionPlans.map(
                  (plan) => (

                    <MenuItem
                      key={plan.value}
                      value={plan.value}
                    >
                      {plan.label}
                    </MenuItem>

                  )
                )}

              </TextField>

            </Grid>

            <Grid item xs={12}>

              <PaperCard>

                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: "bold"
                  }}
                >
                  Listing Preview
                </Typography>

                <Divider
                  sx={{ my: 2 }}
                />

                <Typography
                  sx={{
                    color: TEXT,
                    fontWeight: "bold"
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    color: GREEN,
                    fontSize: 20,
                    mt: 1
                  }}
                >
                  KES {price}
                </Typography>

                <Typography
                  sx={{
                    color: SUB,
                    mt: 1
                  }}
                >
                  {location}
                </Typography>

              </PaperCard>

            </Grid>

          </Grid>

        )}

        {/* =====================================================
        PROGRESS
        ===================================================== */}

        {loading && (

          <Box mt={3}>

            <Typography
              sx={{
                color: GOLD,
                mb: 1
              }}
            >
              Uploading... {uploadProgress}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={uploadProgress}
            />

          </Box>

        )}

        {/* =====================================================
        ACTIONS
        ===================================================== */}

        <Box
          display="flex"
          justifyContent="space-between"
          mt={4}
        >

          <Button
            disabled={step === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{
              color: "#fff"
            }}
          >
            Back
          </Button>

          {step < 3 ? (

            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{
                background: GOLD,
                color: "#000",
                fontWeight: "bold"
              }}
            >
              Continue
            </Button>

          ) : (

            <Button
              variant="contained"
              onClick={
                handleFinalSubmit
              }
              disabled={loading}
              startIcon={
                loading
                  ? (
                    <CircularProgress
                      size={20}
                    />
                  )
                  : (
                    <CheckCircle />
                  )
              }
              sx={{
                background: GOLD,
                color: "#000",
                fontWeight: "bold"
              }}
            >
              Publish Product
            </Button>

          )}

        </Box>

      </CardContent>

      {/* =====================================================
      PROMOTION DIALOG
      ===================================================== */}

      <Dialog
        open={promoOpen}
        fullWidth
      >

        <DialogTitle
          sx={{
            background: "#111",
            color: GOLD
          }}
        >
          Promotion Payment
        </DialogTitle>

        <DialogContent
          sx={{
            background: "#111"
          }}
        >

          <Typography
            sx={{
              color: SUB
            }}
          >
            Pay using M-Pesa Buy Goods
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 28,
              mt: 2
            }}
          >
            Till {TILL}
          </Typography>

          <TextField
            fullWidth
            label="M-Pesa Code"
            value={mpesaCode}
            onChange={(e) =>
              setMpesaCode(
                e.target.value
              )
            }
            sx={{
              ...inputStyle,
              mt: 3
            }}
          />

          <Button
            fullWidth
            onClick={
              confirmPromotion
            }
            sx={{
              mt: 3,
              background: GOLD,
              color: "#000",
              fontWeight: "bold",
              height: 50
            }}
          >
            Confirm Payment
          </Button>

        </DialogContent>

      </Dialog>

    </Card>

  );

}

/* =====================================================
PAPER CARD
===================================================== */

function PaperCard({ children }) {

  return (

    <Box
      sx={{
        background: "#181818",
        border: "1px solid #222",
        p: 2,
        borderRadius: 3
      }}
    >
      {children}
    </Box>

  );

}

/* =====================================================
INPUT STYLE
===================================================== */

const inputStyle = {

  input: {
    color: "#fff"
  },

  label: {
    color: "#aaa"
  },

  "& .MuiOutlinedInput-root": {

    "& fieldset": {
      borderColor: "#333"
    },

    "&:hover fieldset": {
      borderColor: "#F4B400"
    },

    "&.Mui-focused fieldset": {
      borderColor: "#F4B400"
    }

  }

};
