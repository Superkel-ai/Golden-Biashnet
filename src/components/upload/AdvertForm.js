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
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import { db, auth } from "../../services/firebase";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import ImageUploader from "./ImageUploader";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

const GOLD = "#F4B400";
const BLACK = "#000";
const CARD = "#111";
const BORDER = "#222";

const advertTypes = [
  "Events",
  "Business Advertisement",
  "Job Opportunity",
  ];

const businessTypes = [
  "Retail Shop",
  "Supermarket",
  "Wholesale Shop",
  "Mall",
  "Restaurant",
  "Service Provider",
  "Company",
  "Startup",
  "Online Store",
  "Vending Shop",
  "Other"
];

const promotionPlans = [
  { label: "No Promotion", value: "none" },
  { label: "Daily Boost - KES 50", value: "daily" },
  { label: "7 Days Boost - KES 250", value: "weekly" },
  { label: "30 Days Featured - KES 800", value: "monthly" }
];

export default function EventForm() {

  const [advertType, setAdvertType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [images, setImages] = useState([]);

  const [promotionPlan, setPromotionPlan] = useState("none");

  const [loading, setLoading] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);

  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [ticketRequired, setTicketRequired] = useState(false);
  const [price, setPrice] = useState("");

  const [businessType, setBusinessType] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");

  const [jobPosition, setJobPosition] = useState("");
  const [salary, setSalary] = useState("");

  


  /* KEYWORDS */

  const generateKeywords = () => {

    const words = [
      title,
      advertType,
      location,
      venue,
      businessType,
      jobPosition
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



  const publishAdvert = async () => {

    try {

      if (!title || !advertType) {
        alert("Please fill required fields");
        return;
      }

      if (images.length === 0) {
        alert("Upload at least one image");
        return;
      }

      setLoading(true);

      const imageUrls = [];

      for (const img of images) {

        const url = await uploadToCloudinary(img);
        imageUrls.push(url);

      }

      const advertRef = await addDoc(collection(db, "adverts"), {

        advertType,
        title,
        description,
        location,
        phone,

        images: imageUrls,

        venue,
        eventDate,
        eventTime,

        ticketRequired,
        price: Number(price || 0),

        businessType,
        businessAddress,
        servicesOffered,

        jobPosition,
        salary,

        
        userId: auth.currentUser?.uid || null,
        userName: auth.currentUser?.displayName || null,
        sellerVerified: true,
        sellerBadge: "golden",

        promoted: promotionPlan !== "none",
        promotionPlan,

        seoSlug: generateSlug(),
        keywords: generateKeywords(),

        views: 0,
        clicks: 0,

        status: "active",

        createdAt: serverTimestamp()

      });


      /* SEARCH INDEX */

      await addDoc(collection(db,"searchIndex"),{

/* TYPE */

type:"advert",

refId: advertRef.id,

/* BASIC INFO */

title:title,
titleLower:title.toLowerCase(),

advertType:advertType,

location:location,
locationLower:location.toLowerCase(),

sellerId: auth.currentUser.uid,



category:"adverts",

/* IMAGE */

image:imageUrls[0] || "",

/* PRICE (for tickets or services) */

price:Number(price || 0),
priceNumber:Number(price || 0),

/* SEARCH */

keywords:generateKeywords(),

searchText: `${title} ${advertType} ${venue} ${location} ${jobPosition} ${businessType}`.toLowerCase(),

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

      alert("Advertisement published successfully");

      /* RESET FORM */

      setAdvertType("");
      setTitle("");
      setDescription("");
      setLocation("");
      setPhone("");
      setImages([]);

      setVenue("");
      setEventDate("");
      setEventTime("");

      setTicketRequired(false);
      setPrice("");

      setBusinessType("");
      setBusinessAddress("");
      setServicesOffered("");

      setJobPosition("");
      setSalary("");

      setPromotionPlan("none");

      setLoading(false);

    }

    catch (err) {

      console.error(err);
      alert("Failed to publish advert");
      setLoading(false);

    }

  };


  const handleSubmit = () => {

    if (promotionPlan !== "none") {

      setOpenPromo(true);

    } else {

      publishAdvert();

    }

  };


  return (

    <>

    <Card
      sx={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        mt: 2
      }}
    >

      <CardContent>

        <Typography variant="h6" sx={{ color: GOLD, mb: 2 }}>
          Create Advertisement
        </Typography>

        <ImageUploader images={images} setImages={setImages} />

        <Grid container spacing={2} mt={1}>

          <Grid item xs={12}>

            <TextField
              select
              label="Advertisement Type"
              fullWidth
              value={advertType}
              onChange={(e)=>setAdvertType(e.target.value)}
              sx={inputStyle}
            >

              {advertTypes.map((type)=>(
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}

            </TextField>

          </Grid>


          <Grid item xs={12}>

            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              sx={inputStyle}
            />

          </Grid>


          {/* PROMOTION PLAN */}

          <Grid item xs={12}>

            <TextField
              select
              label="Promotion Plan"
              fullWidth
              value={promotionPlan}
              onChange={(e)=>setPromotionPlan(e.target.value)}
              sx={inputStyle}
            >

              {promotionPlans.map((plan)=>(
                <MenuItem key={plan.value} value={plan.value}>
                  {plan.label}
                </MenuItem>
              ))}

            </TextField>

          </Grid>


          {/* EVENT FIELDS */}

          {advertType === "Event" && (

            <>

            <Grid item xs={6}>
              <TextField
                label="Venue"
                fullWidth
                value={venue}
                onChange={(e)=>setVenue(e.target.value)}
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Event Date"
                type="date"
                InputLabelProps={{ shrink:true }}
                fullWidth
                value={eventDate}
                onChange={(e)=>setEventDate(e.target.value)}
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Event Time"
                type="time"
                InputLabelProps={{ shrink:true }}
                fullWidth
                value={eventTime}
                onChange={(e)=>setEventTime(e.target.value)}
                sx={inputStyle}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ticketRequired}
                    onChange={(e)=>setTicketRequired(e.target.checked)}
                  />
                }
                label="Ticket Required"
                sx={{color:"#fff"}}
              />
            </Grid>

            {ticketRequired && (

              <Grid item xs={12}>
                <TextField
                  label="Ticket Price"
                  type="number"
                  fullWidth
                  value={price}
                  onChange={(e)=>setPrice(e.target.value)}
                  sx={inputStyle}
                />
              </Grid>

            )}

            </>

          )}


          <Grid item xs={12}>
            <TextField
              label="Location"
              fullWidth
              value={location}
              onChange={(e)=>setLocation(e.target.value)}
              sx={inputStyle}
            />
          </Grid>


          <Grid item xs={12}>
            <TextField
              label="Phone"
              fullWidth
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              sx={inputStyle}
            />
          </Grid>


          <Grid item xs={12}>
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

        </Grid>


        <Box mt={3}>

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              background:GOLD,
              color:BLACK,
              fontWeight:"bold",
              height:50
            }}
          >

            {loading
              ? <CircularProgress size={24}/>
              : "Publish Advertisement"}

          </Button>

        </Box>

      </CardContent>

    </Card>



    {/* PROMOTION WINDOW */}

    <Dialog open={openPromo} onClose={()=>setOpenPromo(false)}>

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

        <Button onClick={()=>setOpenPromo(false)}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={()=>{
            setOpenPromo(false);
            publishAdvert();
          }}
        >
          Confirm & Publish
        </Button>

      </DialogActions>

    </Dialog>

    </>

  );

}


const inputStyle={

  input:{color:"#fff"},

  label:{color:"#aaa"},

  "& .MuiOutlinedInput-root":{

    "& fieldset":{borderColor:"#333"},

    "&:hover fieldset":{borderColor:"#F4B400"},

    "&.Mui-focused fieldset":{borderColor:"#F4B400"}

  }

};