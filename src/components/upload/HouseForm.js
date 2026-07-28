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
Divider,
Dialog,
DialogContent,
DialogTitle
} from "@mui/material";

import { db, auth } from "../../services/firebase";

import {
collection,
addDoc,
serverTimestamp
} from "firebase/firestore";

import ImageUploader from "./ImageUploader";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

const GOLD="#F4B400"
const BLACK="#000"
const CARD="#111"
const BORDER="#222"

const TILL="3141192"

const propertyTypes=[
"Bedsitter",
"Single Room",
"Studio",
"1 Bedroom",
"2 Bedroom",
"3 Bedroom",
"4 Bedroom",
"Villa",
"Airbnb",
"Office",
"Shop",
"Land"
]

const promotionPlans=[
{label:"No Promotion",value:"none",price:0,days:0},
{label:"Daily Boost (KES 50)",value:"daily",price:50,days:1},
{label:"Weekly Boost (KES 250)",value:"weekly",price:250,days:7},
{label:"Featured Monthly (KES 800)",value:"featured",price:800,days:30}
]

export default function HouseForm(){

const [title,setTitle]=useState("")
const [rent,setRent]=useState("")
const [huntingFee,setHuntingFee]=useState("")

const [location,setLocation]=useState("")
const [buildingName,setBuildingName]=useState("")
const [street,setStreet]=useState("")
const [floor,setFloor]=useState("")

const [propertyType,setPropertyType]=useState("")
const [bedrooms,setBedrooms]=useState("")
const [bathrooms,setBathrooms]=useState("")

const [utilities,setUtilities]=useState("")
const [furnished,setFurnished]=useState("")

const [phone,setPhone]=useState("")
const [description,setDescription]=useState("")

const [images,setImages]=useState([])

const [promotionPlan,setPromotionPlan]=useState("none")
const [mpesaCode,setMpesaCode]=useState("")
const [promoOpen,setPromoOpen]=useState(false)

const [loading,setLoading]=useState(false)

const createKeywords=(text)=>{

const words=text
.toLowerCase()
.replace(/[^\w\s]/gi,"")
.split(" ")

const unique=[...new Set(words)]

return unique.slice(0,15)

}

const handleSubmit = async () => {
  try {
    // Validation
    if (
      !title ||
      !rent ||
      !location ||
      !propertyType ||
      !bedrooms ||
      !bathrooms ||
      !description ||
      images.length === 0
    ) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    // Upload images
   const imageUrls = await Promise.all(
  images.map(img => uploadToCloudinary(img.file))
);
    // Create keywords
    const keywords = createKeywords(`${title} ${location} ${propertyType}`);
    const plan = promotionPlans.find((p) => p.value === promotionPlan);

    // Promotion data
    let promotionData = null;
    if (plan.value !== "none") {
      promotionData = {
        plan: plan.value,
        price: plan.price,
        days: plan.days,
        mpesaCode,
        featured: plan.value === "featured",
        status: "pending",
      };
    }

    // Determine house status
    const houseStatus = plan.value === "none" ? "approved" : "pending";

    // Add to houses collection
    const houseRef = await addDoc(collection(db, "houses"), {
      title,
      rent: Number(rent),
      huntingFee: Number(huntingFee || 0),
      location,
      buildingName,
      street,
      floor,
      propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      utilities,
      furnished,
      phone,
      description,
      images: imageUrls,
      userId: auth.currentUser?.uid || null,
      promotion: promotionData,
      status: houseStatus,
      sellerVerified: true,
        sellerBadge: "golden",

      seo: {
        title: `${title} for rent in ${location}`,
        description: description.slice(0, 160),
      },
      keywords,
      createdAt: serverTimestamp(),
    });

    // Add to search index
    await addDoc(collection(db, "searchIndex"), {
      type: "house",
      refId: houseRef.id,
      title,
      titleLower: title.toLowerCase(),
      price: Number(rent),
      priceNumber: Number(rent),
      location,
      locationLower: location.toLowerCase(),
      category: "houses",
      propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      image: imageUrls[0] || "",
      keywords,
      searchText: `${title} ${propertyType} ${bedrooms} bedroom house rent ${location}`.toLowerCase(),
      promoted: promotionData?.plan !== "none",
      sellerId: auth.currentUser.uid,
      featured: promotionData?.featured || false,
      views: 0,
      rating: 0,
      status: houseStatus, // ensure consistent status in search index
      createdAt: serverTimestamp(),
    });

    alert("Property submitted successfully!");
    resetForm();
    setLoading(false);
  } catch (err) {
    console.error(err);
    alert("Upload failed");
    setLoading(false);
  }
}

const handleUploadClick=()=>{

if(promotionPlan==="none"){
handleSubmit()
}else{
setPromoOpen(true)
}

}

const resetForm=()=>{

setTitle("")
setRent("")
setHuntingFee("")
setLocation("")
setBuildingName("")
setStreet("")
setFloor("")
setPropertyType("")
setBedrooms("")
setBathrooms("")
setUtilities("")
setFurnished("")
setPhone("")
setDescription("")
setImages([])
setPromotionPlan("none")
setMpesaCode("")

}

return(

<Card sx={{background:CARD,border:`1px solid ${BORDER}`,mt:2}}>

<CardContent>

<Typography variant="h6" sx={{color:GOLD,mb:2}}>
Upload House / Property
</Typography>

<ImageUploader images={images} setImages={setImages}/>

<Grid container spacing={2} mt={1}>

<Grid item xs={12}>
<TextField
label="Property Title *"
fullWidth
value={title}
onChange={(e)=>setTitle(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={6}>
<TextField
label="Rent Per Month (KES) *"
type="number"
fullWidth
value={rent}
onChange={(e)=>setRent(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={6}>
<TextField
label="House Hunting Fee"
type="number"
fullWidth
value={huntingFee}
onChange={(e)=>setHuntingFee(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={6}>
<TextField
label="Bedrooms *"
type="number"
fullWidth
value={bedrooms}
onChange={(e)=>setBedrooms(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={6}>
<TextField
label="Bathrooms *"
type="number"
fullWidth
value={bathrooms}
onChange={(e)=>setBathrooms(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={12}>
<TextField
label="Location *"
fullWidth
value={location}
onChange={(e)=>setLocation(e.target.value)}
sx={inputStyle}
/>
</Grid>

<Grid item xs={12}>
<TextField
select
label="Property Type *"
fullWidth
value={propertyType}
onChange={(e)=>setPropertyType(e.target.value)}
sx={inputStyle}
>

{propertyTypes.map(type=>(
<MenuItem key={type} value={type}>
{type}
</MenuItem>
))}

</TextField>
</Grid>

<Grid item xs={12}>
<TextField
label="Description *"
multiline
rows={4}
fullWidth
value={description}
onChange={(e)=>setDescription(e.target.value)}
sx={inputStyle}
/>
</Grid>

</Grid>

<Divider sx={{my:3,borderColor:"#222"}}/>

<Typography sx={{color:GOLD}}>
Promote Listing
</Typography>

<TextField
select
fullWidth
value={promotionPlan}
onChange={(e)=>setPromotionPlan(e.target.value)}
sx={{...inputStyle,mt:1}}
>

{promotionPlans.map(plan=>(
<MenuItem key={plan.value} value={plan.value}>
{plan.label}
</MenuItem>
))}

</TextField>

<Box mt={3}>

<Button
fullWidth
variant="contained"
onClick={handleUploadClick}
disabled={loading}
sx={{
background:GOLD,
color:BLACK,
height:50,
fontWeight:"bold"
}}
>

{loading?<CircularProgress size={24}/>:"Upload Property"}

</Button>

</Box>

</CardContent>

<Dialog open={promoOpen} fullWidth>

<DialogTitle sx={{background:"#111",color:GOLD}}>
Promote Property
</DialogTitle>

<DialogContent sx={{background:"#111"}}>

<Typography sx={{color:"#aaa"}}>
Pay via M-Pesa Buy Goods & Services
</Typography>

<Typography sx={{color:"#fff",fontSize:22,fontWeight:"bold"}}>
Till Number: {TILL}
</Typography>

<Typography sx={{color:"#aaa",mt:2}}>
After payment paste confirmation code
</Typography>

<TextField
fullWidth
placeholder="Example QGH7H2K9L"
value={mpesaCode}
onChange={(e)=>setMpesaCode(e.target.value)}
sx={inputStyle}
/>

<Button
fullWidth
sx={{mt:3,background:GOLD,color:BLACK,fontWeight:"bold"}}
onClick={()=>{
setPromoOpen(false)
handleSubmit()
}}
>
Confirm Payment
</Button>

</DialogContent>

</Dialog>

</Card>

)

}

const inputStyle={

input:{color:"#fff"},

label:{color:"#aaa"},

"& .MuiOutlinedInput-root":{

"& fieldset":{borderColor:"#333"},

"&:hover fieldset":{borderColor:"#F4B400"},

"&.Mui-focused fieldset":{borderColor:"#F4B400"}

}

}