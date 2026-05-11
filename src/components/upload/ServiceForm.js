import React, { useState } from "react";

import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import { db, auth } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import ImageUploader from "./ImageUploader";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

const GOLD = "#F4B400";
const BLACK = "#000";
const CARD = "#111";
const BORDER = "#222";

const categories = [
  "Cleaning",
  "Repair",
  "Plumbing",
  "Electrical",
  "Design",
  "Programming",
  "Photography",
  "Tutoring",
  "Beauty",
  "Transport",
  "Marketing",
  "Events",
  "Other"
];

const pricingTypes = [
  "Fixed Price",
  "Hourly",
  "Negotiable"
];

/* PROMOTION PLANS */

const promotionPlans = [
  { label: "No Promotion", value: "none" },
  { label: "Daily Boost - KES 50", value: "daily" },
  { label: "7 Days Boost - KES 250", value: "weekly" },
  { label: "30 Days Featured - KES 800", value: "monthly" }
];

export default function ServiceForm() {

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [price, setPrice] = useState("");
  const [pricingType, setPricingType] = useState("");

  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");

  const [description, setDescription] = useState("");
  const [qualifications, setQualifications] = useState("");

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");

  const [images, setImages] = useState([]);

  const [promotionPlan, setPromotionPlan] = useState("none");

  const [loading, setLoading] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);

  const addSkill = () => {

    if (skillInput && !skills.includes(skillInput)) {

      setSkills([...skills, skillInput]);

      setSkillInput("");

    }

  };

  const removeSkill = (skill) => {

    setSkills(skills.filter(s => s !== skill));

  };

  /* KEYWORDS */

  const generateKeywords = () => {

    const words = [
      title,
      category,
      subCategory,
      location,
      ...skills
    ]
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return [...new Set(words)].slice(0, 30);

  };

  /* SEO SLUG */

  const generateSlug = () => {

    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  };

  const handleSubmit = async () => {

    try {

      if (!title || !category || !location) {

        alert("Please fill required fields");

        return;

      }

      setLoading(true);

      const imageUrls = [];

      for (let img of images) {

        const url = await uploadToCloudinary(img);

        imageUrls.push(url);

      }

      const serviceRef = await addDoc(collection(db, "services"), {

        title,
        name,

        category,
        subCategory,

        description,
        qualifications,

        skills,

        location,
        availability,

        pricingType,
        price: Number(price || 0),

        phone,
        phone2,
        email,

        socialLinks: {
          instagram,
          facebook,
          twitter
        },

        images: imageUrls,

        providerId: auth.currentUser?.uid || null,

        createdAt: serverTimestamp(),

        status: "active",

        rating: 0,
        reviews: 0,

        promoted: promotionPlan !== "none",
        promotionPlan,

        seoSlug: generateSlug(),

        keywords: generateKeywords()

      });

      /* SEARCH INDEX */

      await addDoc(collection(db,"searchIndex"),{

/* TYPE */

type:"service",

refId: serviceRef.id,

/* BASIC INFO */

title:title,
titleLower:title.toLowerCase(),

providerName:name,

category:category,
subCategory:subCategory,

location:location,
locationLower:location.toLowerCase(),

/* IMAGE */

image:imageUrls[0] || "",

/* PRICING */

price:Number(price || 0),
priceNumber:Number(price || 0),
pricingType:pricingType,

/* SEARCH */

keywords:generateKeywords(),

searchText: `${title} ${category} ${subCategory} ${location} ${skills.join(" ")}`.toLowerCase(),

skills:skills,

/* PROMOTION */

promoted: promotionPlan !== "none",
featured: promotionPlan === "monthly",

/* ANALYTICS */

views:0,
rating:0,

/* STATUS */

status:"active",

/* META */

createdAt:serverTimestamp()

});

      alert("Service portfolio published successfully");

      setLoading(false);

    }

    catch (error) {

      console.error(error);

      alert("Upload failed");

      setLoading(false);

    }

  };

  /* HANDLE BUTTON */

  const handlePublish = () => {

    if (promotionPlan !== "none") {

      setOpenPromo(true);

    } else {

      handleSubmit();

    }

  };

  return (

    <Card sx={{ background: CARD, border: `1px solid ${BORDER}`, mt: 2 }}>

      <CardContent>

        <Typography variant="h6" sx={{ color: GOLD, mb: 2 }}>
          Create Service Portfolio
        </Typography>

        <ImageUploader images={images} setImages={setImages} />

        <Grid container spacing={2} mt={1}>

          <Grid item xs={12}>
            <TextField
              label="Service Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Your Name / Brand"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={inputStyle}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Sub Category"
              fullWidth
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Pricing Type"
              fullWidth
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
              sx={inputStyle}
            >
              {pricingTypes.map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Price (KES)"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Availability"
              fullWidth
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Location"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          {/* PROMOTION SELECT */}

          <Grid item xs={12}>
            <TextField
              select
              label="Promotion Plan"
              fullWidth
              value={promotionPlan}
              onChange={(e) => setPromotionPlan(e.target.value)}
              sx={inputStyle}
            >
              {promotionPlans.map(plan => (
                <MenuItem key={plan.value} value={plan.value}>
                  {plan.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Add Skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            {skills.map(skill => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => removeSkill(skill)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Qualifications / Experience"
              multiline
              rows={3}
              fullWidth
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Service Description"
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

        </Grid>

        <Box mt={3}>

          <Button
            fullWidth
            variant="contained"
            onClick={handlePublish}
            disabled={loading}
            sx={{
              background: GOLD,
              color: BLACK,
              fontWeight: "bold",
              height: 50
            }}
          >

            {loading
              ? <CircularProgress size={24} />
              : "Publish Service"}

          </Button>

        </Box>

      </CardContent>

      {/* PROMOTION WINDOW */}

      <Dialog open={openPromo} onClose={() => setOpenPromo(false)}>

        <DialogTitle>Confirm Promotion</DialogTitle>

        <DialogContent>

          <Typography>

            You selected <b>{promotionPlan}</b> promotion.

          </Typography>

          <Typography mt={1}>

            Pay using M-Pesa to activate promotion.

          </Typography>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpenPromo(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setOpenPromo(false);
              handleSubmit();
            }}
          >
            Confirm & Publish
          </Button>

        </DialogActions>

      </Dialog>

    </Card>

  );

}

const inputStyle = {

  input: { color: "#fff" },

  label: { color: "#aaa" },

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