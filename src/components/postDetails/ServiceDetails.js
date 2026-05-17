// src/pages/ServiceDetails.js

import React,
{
 useEffect,
 useMemo,
 useState
}
from "react";

import {
 Box,
 Typography,
 CircularProgress,
 Button,
 Chip,
 Dialog,
 Stack,
 Avatar,
 IconButton,
 Rating
}
from "@mui/material";

import {
 Verified,
 Shield,
 Share,
 WhatsApp,
 Chat,
 ChevronLeft,
 ChevronRight,
 LocationOn
}
from "@mui/icons-material";

import { useParams,useNavigate }
from "react-router-dom";

import {
 doc,
 getDoc,
 collection,
 addDoc,
 serverTimestamp,
 updateDoc,
 increment
}
from "firebase/firestore";

import {
 db,
 auth
}
from "../../services/firebase";

/* =========================================================
THEME
========================================================= */

const GOLD="#F4B400";
const BG="#050505";
const CARD="#111111";
const BORDER="rgba(255,255,255,.08)";
const TEXT="#ffffff";
const SUB="#aaaaaa";

/* =========================================================
ADMINS
========================================================= */

const ADMINS=[
 "254758922614"
];

/* =========================================================
HELPERS
========================================================= */

const formatPrice=(price)=>{

 if(!price) return "KES 0";

 return `KES ${Number(price)
  .toLocaleString()}`;

};

const formatPhone=(phone="")=>{

 let cleaned=phone
  .replace(/\s/g,"")
  .replace(/\+/g,"");

 if(cleaned.startsWith("07")){

  cleaned=
   `254${cleaned.slice(1)}`;

 }

 if(cleaned.startsWith("01")){

  cleaned=
   `254${cleaned.slice(1)}`;

 }

 return cleaned;

};

/* =========================================================
COMPONENT
========================================================= */

export default function ServiceDetails(){

 const {id}=useParams();

 const navigate=useNavigate();

 const[service,setService]=
  useState(null);

 const[providerData,setProviderData]=
  useState(null);

 const[loading,setLoading]=
  useState(true);

 const[selectedIndex,setSelectedIndex]=
  useState(0);

 const[previewImage,setPreviewImage]=
  useState(null);

/* =========================================================
FETCH SERVICE
========================================================= */

 useEffect(()=>{

  const fetchService=async()=>{

   try{

    const ref=doc(
     db,
     "services",
     id
    );

    const snap=
     await getDoc(ref);

    if(snap.exists()){

     const data={
      id:snap.id,
      ...snap.data()
     };

     setService(data);

     /* =====================================
        FETCH PROVIDER
     ===================================== */

     if(data.providerId){

      const userRef=doc(
       db,
       "users",
       data.providerId
      );

      const userSnap=
       await getDoc(userRef);

      if(userSnap.exists()){

       setProviderData({

        id:userSnap.id,

        ...userSnap.data()

       });

      }

     }

    }

   }catch(err){

    console.log(err);

   }finally{

    setLoading(false);

   }

  };

  fetchService();

 },[id]);

/* =========================================================
IMAGES
========================================================= */

 const images=useMemo(()=>{

  if(!service?.images)
   return [];

  return service.images.map(img=>{

   if(typeof img==="string"){
    return img;
   }

   return (
    img.full ||
    img.thumb ||
    ""
   );

  });

 },[service]);

/* =========================================================
SHARE
========================================================= */

 const handleShare=async()=>{

  try{

   const url=
`${window.location.origin}/post/service/${service.id}`;

   const text=
`${service.title}

${formatPrice(service.price)}

📍 ${service.location || "Kenya"}

View Service:
${url}

Golden Biashnet`;

   if(navigator.share){

    await navigator.share({

     title:service.title,

     text,

     url

    });

   }else{

    await navigator.clipboard
     .writeText(text);

    alert("Link copied");

   }

  }catch(err){

   console.log(err);

  }

 };

/* =========================================================
NEXT IMAGE
========================================================= */

 const nextImage=()=>{

  if(images.length<=1) return;

  setSelectedIndex(prev=>

   prev===images.length-1
    ? 0
    : prev+1

  );

 };

 const prevImage=()=>{

  if(images.length<=1) return;

  setSelectedIndex(prev=>

   prev===0
    ? images.length-1
    : prev-1

  );

 };

/* =========================================================
TRUST
========================================================= */

 const trustScore=
  providerData?.trustScore || 72;

/* =========================================================
CONTACT ADMIN
========================================================= */

 const contactAdminsWhatsApp=
 async()=>{

  try{

   const admin=
    formatPhone(
     ADMINS[0]
    );

   const message=
`Hello Golden Biashnet Admin,

I am interested in this service.

SERVICE:
${service.title}

PRICE:
${formatPrice(service.price)}

SERVICE ID:
${service.id}

PROVIDER ID:
${service.providerId || "N/A"}

LOCATION:
${service.location || "N/A"}

Please assist me with booking this service.`;

   /* =====================================
      SAVE REQUEST
   ===================================== */

   await addDoc(
    collection(db,"serviceRequests"),
    {

     serviceId:service.id,

     providerId:
      service.providerId || "",

     buyerId:
      auth.currentUser?.uid || null,

     title:
      service.title || "",

     price:
      Number(service.price || 0),

     status:"pending",

     createdAt:
      serverTimestamp()

    }
   );

   /* =====================================
      ADMIN NOTIFICATION
   ===================================== */

   await addDoc(
    collection(
     db,
     "adminNotifications"
    ),
    {

     type:"service_request",

     serviceId:service.id,

     providerId:
      service.providerId || "",

     buyerId:
      auth.currentUser?.uid || null,

     title:
      "New Service Request",

     message:
`${service.title} service requested`,

     read:false,

     createdAt:
      serverTimestamp()

    }
   );

   /* =====================================
      TRACK ENGAGEMENT
   ===================================== */

   if(service.providerId){

    await updateDoc(

     doc(
      db,
      "users",
      service.providerId
     ),

     {

      serviceRequests:
       increment(1)

     }

    );

   }

   window.open(

`https://wa.me/${admin}?text=${encodeURIComponent(message)}`,

    "_blank"

   );

  }catch(err){

   console.log(err);

  }

 };

 /* =========================================================
START ADMIN CHAT FOR SERVICE
========================================================= */
const startServiceAdminChat = async () => {

  try {

    /* =========================================
       LOGIN CHECK
    ========================================= */

    if (!auth.currentUser) {

      alert("Login required");
      return;

    }

    const user = auth.currentUser;

    /* =========================================
       CREATE ADMIN CHAT
    ========================================= */

    const ref = await addDoc(
      collection(db, "adminChats"),
      {

        /* =====================================
           USER
        ===================================== */

        buyerId: user.uid,
        userId: user.uid,

        /* =====================================
           SERVICE
        ===================================== */

        serviceId: service.id,

        providerId:
          service.providerId || "",

        serviceTitle:
          service.title || "",

        serviceCategory:
          service.category || "",

        serviceImage:
          service.images?.[0]?.thumb ||
          service.images?.[0]?.full ||
          "",

        servicePrice:
          Number(service.price || 0),

        /* =====================================
           CHAT TYPE
        ===================================== */

        type: "service_support",

        status: "active",

        visibility: "admin_controlled",

        /* =====================================
           LAST MESSAGE
        ===================================== */

        lastMessage:
          `User interested in ${service.title}`,

        lastMessageSender:
          user.uid,

        /* =====================================
           TIMESTAMP
        ===================================== */

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()

      }
    );

    /* =========================================
       NOTIFY ADMINS
    ========================================= */

    await addDoc(
      collection(db, "adminNotifications"),
      {

        type: "service_interest",

        serviceId: service.id,

        providerId:
          service.providerId || "",

        buyerId: user.uid,

        chatId: ref.id,

        title:
          "New Service Inquiry",

        message:
          `${user.displayName || "A user"} is interested in "${service.title}"`,

        image:
          service.images?.[0]?.thumb || "",

        read: false,

        createdAt: serverTimestamp()

      }
    );

    /* =========================================
       OPTIONAL ANALYTICS
    ========================================= */

    await addDoc(
      collection(db, "serviceEvents"),
      {

        type: "admin_chat_started",

        serviceId: service.id,

        providerId:
          service.providerId || "",

        userId: user.uid,

        createdAt: serverTimestamp()

      }
    );

    /* =========================================
       SUCCESS
    ========================================= */

    alert(
      "Admins notified successfully."
    );

    /* =========================================
       NAVIGATE TO CHAT
    ========================================= */

    navigate(`/support-chat/${ref.id}`);

  } catch (err) {

    console.log(err);

    alert(
      "Failed to start admin chat"
    );

  }

};
/* =========================================================
LOADING
========================================================= */

 if(loading){

  return(

   <Box
    sx={{
     minHeight:"100vh",
     background:BG,
     display:"flex",
     justifyContent:"center",
     alignItems:"center"
    }}
   >

    <CircularProgress
     sx={{color:GOLD}}
    />

   </Box>

  );

 }

 if(!service){

  return(

   <Box
    sx={{
     background:BG,
     minHeight:"100vh",
     p:3
    }}
   >

    <Typography
     sx={{color:"#fff"}}
    >
     Service not found
    </Typography>

   </Box>

  );

 }

/* =========================================================
UI
========================================================= */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
   color:"#fff",
   pb:10
  }}
 >

 {/* =====================================================
    IMAGE SECTION
 ===================================================== */}

 <Box
  sx={{
   position:"relative",
   background:"#000"
  }}
 >

  <Box
   component="img"

   src={
    images[selectedIndex]
   }

   sx={{
    width:"100%",
    height:{
     xs:280,
     sm:450
    },
    objectFit:"cover"
   }}
  />

  {/* SHARE */}

  <IconButton
   onClick={handleShare}
   sx={{
    position:"absolute",
    top:14,
    left:14,

    background:
     "rgba(0,0,0,.6)",

    color:"#fff"
   }}
  >

   <Share />

  </IconButton>

  {/* IMAGE COUNT */}

  <Chip
   label={
`${selectedIndex+1}/${images.length}`
   }

   sx={{
    position:"absolute",
    top:14,
    right:14,

    background:
     "rgba(0,0,0,.6)",

    color:"#fff"
   }}
  />

  {/* PREV */}

  {images.length>1 && (

  <IconButton
   onClick={prevImage}
   sx={{
    position:"absolute",
    left:10,
    top:"50%",

    transform:
     "translateY(-50%)",

    background:
     "rgba(0,0,0,.6)",

    color:"#fff"
   }}
  >

   <ChevronLeft />

  </IconButton>

  )}

  {/* NEXT */}

  {images.length>1 && (

  <IconButton
   onClick={nextImage}
   sx={{
    position:"absolute",
    right:10,
    top:"50%",

    transform:
     "translateY(-50%)",

    background:
     "rgba(0,0,0,.6)",

    color:"#fff"
   }}
  >

   <ChevronRight />

  </IconButton>

  )}

 </Box>

 {/* =====================================================
    THUMBNAILS
 ===================================================== */}

 <Box
  sx={{
   display:"flex",
   gap:1,
   overflowX:"auto",
   p:1,

   "&::-webkit-scrollbar":{
    display:"none"
   }
  }}
 >

  {images.map((img,i)=>(

  <Box
   key={i}

   component="img"

   src={img}

   onClick={()=>
    setSelectedIndex(i)
   }

   sx={{
    width:75,
    height:75,

    borderRadius:2,

    objectFit:"cover",

    flexShrink:0,

    cursor:"pointer",

    border:
     selectedIndex===i
      ? `2px solid ${GOLD}`
      : "2px solid transparent"
   }}
  />

  ))}

 </Box>

 {/* =====================================================
    DETAILS
 ===================================================== */}

 <Box
  sx={{
   p:2,
   maxWidth:800,
   mx:"auto"
  }}
 >

  {/* CATEGORY */}

  <Stack
   direction="row"
   spacing={1}
   flexWrap="wrap"
   sx={{mb:1}}
  >

   <Chip
    label={service.category}
    size="small"
   />

   {service.status==="approved" && (

   <Chip
    label="Approved"
    size="small"
    color="success"
   />

   )}

   {service.featured && (

   <Chip
    label="Featured"
    size="small"

    sx={{
     background:GOLD,
     color:"#000"
    }}
   />

   )}

  </Stack>

  {/* TITLE */}

  <Typography
   sx={{
    fontSize:24,
    fontWeight:900,
    lineHeight:1.2
   }}
  >
   {service.title}
  </Typography>

  {/* PRICE */}

  <Typography
   sx={{
    color:GOLD,
    fontWeight:900,
    fontSize:28,
    mt:1
   }}
  >
   {formatPrice(service.price)}
  </Typography>

  {/* LOCATION */}

  <Stack
   direction="row"
   spacing={1}
   alignItems="center"
   sx={{mt:1}}
  >

   <LocationOn
    sx={{
     color:"#777",
     fontSize:18
    }}
   />

   <Typography
    sx={{
     color:"#aaa",
     fontSize:14
    }}
   >
    {service.location}
   </Typography>

  </Stack>

  {/* TRUST */}

  <Stack
   direction="row"
   spacing={1}
   flexWrap="wrap"
   sx={{mt:2}}
  >

   {providerData
    ?.sellerVerified && (

   <Chip
    icon={<Verified />}
    label="Verified Provider"

    sx={{
     background:
      "rgba(76,175,80,.15)",

     color:"#4caf50"
    }}
   />

   )}

   <Chip
    icon={<Shield />}
    label={`Trust ${trustScore}%`}

    sx={{
     background:
      "rgba(244,180,0,.12)",

     color:GOLD
    }}
   />

  </Stack>

  {/* RATING */}

  {service.rating>0 && (

  <Stack
   direction="row"
   spacing={1}
   alignItems="center"
   sx={{mt:2}}
  >

   <Rating
    value={service.rating}
    precision={0.5}
    readOnly
   />

   <Typography
    sx={{
     color:"#aaa",
     fontSize:13
    }}
   >
    ({service.reviews || 0}
    reviews)
   </Typography>

  </Stack>

  )}

  {/* SKILLS */}

  {service.skills?.length>0 && (

  <Box
   sx={{
    display:"flex",
    gap:1,
    flexWrap:"wrap",
    mt:3
   }}
  >

   {service.skills.map(
    (skill,i)=>(

   <Chip
    key={i}
    label={skill}

    sx={{
     background:CARD,
     color:"#fff"
    }}
   />

   ))}

  </Box>

  )}

  {/* DESCRIPTION */}

  <Box sx={{mt:4}}>

   <Typography
    sx={{
     color:GOLD,
     fontWeight:900,
     mb:1
    }}
   >
    Description
   </Typography>

   <Typography
    sx={{
     color:"#ccc",
     lineHeight:1.8
    }}
   >
    {service.description}
   </Typography>

  </Box>

  {/* SERVICE INFO */}

  <Box sx={{mt:4}}>

   <Typography
    sx={{
     color:GOLD,
     fontWeight:900,
     mb:1
    }}
   >
    Service Information
   </Typography>

   {service.availability && (

   <Typography
    sx={{
     color:"#ccc",
     mb:1
    }}
   >
    Availability:
    {" "}
    {service.availability}
   </Typography>

   )}

   {service.pricingType && (

   <Typography
    sx={{
     color:"#ccc"
    }}
   >
    Pricing:
    {" "}
    {service.pricingType}
   </Typography>

   )}

  </Box>

  {/* CONTACT ADMIN */}

  <Box
   sx={{
    mt:4,
    p:2,

    background:CARD,

    border:
     `1px solid ${BORDER}`,

    borderRadius:4
   }}
  >

   <Typography
    sx={{
     fontWeight:900,
     fontSize:16
    }}
   >
    Contact Golden Biashnet
   </Typography>

   <Typography
    sx={{
     color:"#aaa",
     fontSize:13,
     mt:1,
     lineHeight:1.6
    }}
   >
    Golden Biashnet helps
    coordinate services safely
    between customers and
    providers.
   </Typography>

   <Button
    fullWidth

    variant="contained"

    startIcon={<WhatsApp />}

    onClick={
     contactAdminsWhatsApp
    }

    sx={{
     mt:2,
     height:52,

     background:"#25D366",

     color:"#000",

     fontWeight:900,

     borderRadius:3,

     textTransform:"none"
    }}
   >
    Contact Admin
   </Button>

   {/* =========================================================
CONTACT ADMINS SECTION
========================================================= */}

<Box
  sx={{
    mt:4,
    p:2,
    background:CARD,
    border:`1px solid ${BORDER}`,
    borderRadius:4
  }}
>

  <Typography
    sx={{
      color:"#fff",
      fontWeight:900,
      fontSize:18
    }}
  >
    Contact Golden Biashnet
  </Typography>

  <Typography
    sx={{
      color:"#aaa",
      mt:1,
      fontSize:13,
      lineHeight:1.6
    }}
  >
    For safety and trusted connections,
    service provider contacts are hidden.

    Our admins will connect you with
    the provider after confirming
    availability and legitimacy.
  </Typography>

  <Button
    fullWidth
    variant="contained"
    onClick={startServiceAdminChat}
    sx={{

      mt:2,

      height:52,

      borderRadius:3,

      fontWeight:900,

      fontSize:15,

      background:
        "linear-gradient(45deg,#F4B400,#FFD95A)",

      color:"#000",

      "&:hover":{
        background:
          "linear-gradient(45deg,#FFD95A,#F4B400)"
      }

    }}
  >
    Chat with Admin 
  </Button>


  </Box>

 </Box>

 {/* =====================================================
    IMAGE PREVIEW
 ===================================================== */}

 <Dialog
  open={Boolean(previewImage)}
  onClose={()=>
   setPreviewImage(null)
  }
  maxWidth="lg"
 >

  <img
   src={previewImage}
   alt="preview"

   style={{
    width:"100%",
    height:"auto"
   }}
  />

 </Dialog>

 </Box>
</Box>
 );

}