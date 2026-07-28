// src/pages/HouseDetails.js

import React,{
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
 TextField,
 Stack,
 Avatar,
 IconButton,
 Dialog
}
from "@mui/material";

import {
 Verified,
 Bolt,
 LocationOn,
 Bed,
 Bathtub,
 WhatsApp,
 Chat,
 FavoriteBorder,
 Share,
 Shield,
 Wifi,
 LocalParking,
 WaterDrop,
 ChevronLeft,
 ChevronRight
}
from "@mui/icons-material";

import {
 useParams,
 useNavigate
}
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

/* ======================================================
THEME
====================================================== */

const GOLD="#F4B400";
const BG="#050505";
const CARD="#111";
const BORDER="rgba(255,255,255,.08)";

/* ======================================================
ADMINS
====================================================== */

const ADMINS=[
 "254758922614"
];

/* ======================================================
HELPERS
====================================================== */

const formatPrice=(price)=>
 `KES ${Number(price || 0).toLocaleString()}`;

const formatPhone=(phone="")=>{

 let cleaned=phone
  .replace(/\s/g,"")
  .replace(/\+/g,"");

 if(cleaned.startsWith("07"))
  cleaned=`254${cleaned.slice(1)}`;

 if(cleaned.startsWith("01"))
  cleaned=`254${cleaned.slice(1)}`;

 return cleaned;

};

const getImages=(images=[])=>

 images.map(img=>

  typeof img==="string"
   ? img
   : img?.full || img?.thumb || ""

 );

/* ======================================================
PAGE
====================================================== */

export default function HouseDetails(){

 const {id}=useParams();

 const navigate=useNavigate();

 const[house,setHouse]=
  useState(null);

 const[loading,setLoading]=
  useState(true);

 const[index,setIndex]=
  useState(0);

 const[preview,setPreview]=
  useState(null);

 const[relocationDate,setRelocationDate]=
  useState("");

 const[sending,setSending]=
  useState(false);

 /* ====================================================
 FETCH
 ==================================================== */

 useEffect(()=>{

  const fetchHouse=async()=>{

   try{

    const snap=await getDoc(
     doc(db,"houses",id)
    );

    if(snap.exists()){

     setHouse({
      id:snap.id,
      ...snap.data()
     });

    }

   }catch(err){

    console.log(err);

   }finally{

    setLoading(false);

   }

  };

  fetchHouse();

 },[id]);

 /* ====================================================
 MEMO IMAGES
 ==================================================== */

 const images=useMemo(
  ()=>getImages(house?.images),
  [house]
 );

 /* ====================================================
 SHARE
 ==================================================== */

 const handleShare=async()=>{

  try{

   const url=
`${window.location.origin}/house/${house.id}`;

   const text=
`${house.title}

${formatPrice(house.rent)} / month

📍 ${house.location}

View House:
${url}

Biashnet`;

   if(navigator.share){

    await navigator.share({

     title:house.title,
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

 /* ====================================================
 BOOK REQUEST
 ==================================================== */

 const handleRequest=async()=>{

  if(!relocationDate)
   return alert(
    "Select relocation date"
   );

  if(!auth.currentUser)
   return alert(
    "Login required"
   );

  try{

   setSending(true);

   await addDoc(

    collection(db,"houseRequests"),

    {

     houseId:house.id,

     userId:
      auth.currentUser.uid,

     ownerId:
      house.ownerId || "",

     title:
      house.title || "",

     rent:
      Number(house.rent || 0),

     relocationDate,

     status:"pending",

     createdAt:
      serverTimestamp()

    }

   );

   await addDoc(

    collection(
     db,
     "adminNotifications"
    ),

    {

     type:"house_request",

     houseId:house.id,

     userId:
      auth.currentUser.uid,

     title:
      "New House Request",

     message:
`${house.title} requested`,

     read:false,

     createdAt:
      serverTimestamp()

    }

   );

   if(house.ownerId){

    await updateDoc(

     doc(
      db,
      "users",
      house.ownerId
     ),

     {

      houseRequests:
       increment(1)

     }

    );

   }

   alert(
    "Viewing request sent"
   );

   setRelocationDate("");

  }catch(err){

   console.log(err);

   alert("Failed");

  }

  setSending(false);

 };

 /* ====================================================
 WHATSAPP ADMIN
 ==================================================== */

 const contactAdminsWhatsApp=
 async()=>{

  try{

   const admin=
    formatPhone(
     ADMINS[0]
    );

   const message=
`Hello Golden Biashnet Admin,

I am interested in this house.

HOUSE:
${house.title}

RENT:
${formatPrice(house.rent)}

LOCATION:
${house.location}

HOUSE ID:
${house.id}

Please assist me with viewing and booking.`;

   window.open(

`https://wa.me/${admin}?text=${encodeURIComponent(message)}`,

    "_blank"

   );

  }catch(err){

   console.log(err);

  }

 };

 /* ====================================================
 ADMIN CHAT
 ==================================================== */

 const startAdminChat=
 async()=>{

  try{

   if(!auth.currentUser)
    return alert(
     "Login required"
    );

   const user=
    auth.currentUser;

   const ref=
    await addDoc(

     collection(
      db,
      "adminChats"
     ),

     {

      userId:user.uid,

      buyerId:user.uid,

      houseId:house.id,

      ownerId:
       house.ownerId || "",

      houseTitle:
       house.title || "",

      houseImage:
       house.images?.[0]?.thumb ||

       house.images?.[0]?.full ||

       "",

      houseRent:
       Number(house.rent || 0),

      type:"house_support",

      status:"active",

      visibility:
       "admin_controlled",

      lastMessage:
`Interested in ${house.title}`,

      lastMessageSender:
       user.uid,

      createdAt:
       serverTimestamp(),

      updatedAt:
       serverTimestamp()

     }

    );

   await addDoc(

    collection(
     db,
     "adminNotifications"
    ),

    {

     type:"house_interest",

     houseId:house.id,

     buyerId:user.uid,

     chatId:ref.id,

     title:
      "New House Inquiry",

     message:
`${user.displayName || "User"} is interested in ${house.title}`,

     image:
      house.images?.[0]?.thumb ||

      "",

     read:false,

     createdAt:
      serverTimestamp()

    }

   );

   navigate(
    `/support-chat/${ref.id}`
   );

  }catch(err){

   console.log(err);

   alert(
    "Failed to start chat"
   );

  }

 };

 /* ====================================================
 LOADING
 ==================================================== */

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
     sx={{
      color:GOLD
     }}
    />

   </Box>

  );

 }

 if(!house){

  return(

   <Box
    sx={{
     background:BG,
     minHeight:"100vh",
     p:3
    }}
   >

    <Typography
     sx={{
      color:"#fff"
     }}
    >
     House not found
    </Typography>

   </Box>

  );

 }

 /* ====================================================
 UI
 ==================================================== */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
   color:"#fff",
   pb:10
  }}
 >

  {/* ==================================================
     HERO IMAGE
  ================================================== */}

  <Box
   sx={{
    position:"relative"
   }}
  >

   <Box
    component="img"

    src={images[index]}

    onClick={()=>
     setPreview(
      images[index]
     )
    }

    sx={{
     width:"100%",
     height:{
      xs:300,
      md:500
     },
     objectFit:"cover"
    }}
   />

   <Box
    sx={{
     position:"absolute",
     inset:0,
     background:
"linear-gradient(to top,rgba(0,0,0,.9),transparent)"
    }}
   />

   {/* ACTIONS */}

   <Stack
    direction="row"
    spacing={1}

    sx={{
     position:"absolute",
     top:15,
     right:15
    }}
   >

    <IconButton
     sx={{
      background:
       "rgba(0,0,0,.5)"
     }}
    >

     <FavoriteBorder
      sx={{
       color:"#fff"
      }}
     />

    </IconButton>

    <IconButton
     onClick={handleShare}

     sx={{
      background:
       "rgba(0,0,0,.5)"
     }}
    >

     <Share
      sx={{
       color:"#fff"
      }}
     />

    </IconButton>

   </Stack>

   {/* BADGES */}

   <Stack
    direction="row"
    spacing={1}

    sx={{
     position:"absolute",
     top:15,
     left:15
    }}
   >

    <Chip
     icon={<Verified />}
     label="Verified"

     sx={{
      background:"#1b5e20",
      color:"#fff"
     }}
    />

    <Chip
     icon={<Bolt />}
     label="Hot"

     sx={{
      background:GOLD,
      color:"#000",
      fontWeight:900
     }}
    />

   </Stack>

   {/* NAV */}

   {images.length>1 && (

   <>

   <IconButton
    onClick={()=>

     setIndex(prev=>

      prev===0
       ? images.length-1
       : prev-1

     )

    }

    sx={{
     position:"absolute",
     top:"50%",
     left:10,
     transform:
      "translateY(-50%)",

     background:
      "rgba(0,0,0,.5)"
    }}
   >

    <ChevronLeft
     sx={{
      color:"#fff"
     }}
    />

   </IconButton>

   <IconButton
    onClick={()=>

     setIndex(prev=>

      prev===images.length-1
       ? 0
       : prev+1

     )

    }

    sx={{
     position:"absolute",
     top:"50%",
     right:10,
     transform:
      "translateY(-50%)",

     background:
      "rgba(0,0,0,.5)"
    }}
   >

    <ChevronRight
     sx={{
      color:"#fff"
     }}
    />

   </IconButton>

   </>

   )}

  </Box>

  {/* ==================================================
     THUMBNAILS
  ================================================== */}

  {images.length>1 && (

  <Box
   sx={{
    display:"flex",
    gap:1,
    overflowX:"auto",
    p:1.5,

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
     setIndex(i)
    }

    sx={{
     width:75,
     height:65,
     borderRadius:2,
     objectFit:"cover",
     flexShrink:0,
     border:

      index===i

       ? `2px solid ${GOLD}`
       : "2px solid transparent"

    }}
   />

   ))}

  </Box>

  )}

  {/* ==================================================
     DETAILS
  ================================================== */}

  <Box
   sx={{
    p:2,
    maxWidth:850,
    mx:"auto"
   }}
  >

   <Typography
    sx={{
     fontSize:28,
     fontWeight:900
    }}
   >
    {house.title}
   </Typography>

   <Typography
    sx={{
     color:GOLD,
     fontWeight:900,
     fontSize:30,
     mt:1
    }}
   >
    {formatPrice(house.rent)}
    {" "}
    / month
   </Typography>

   <Typography
    sx={{
     color:"#00e676",
     fontWeight:700,
     mt:1
    }}
   >
    Hunting Fee:
    {" "}
    {formatPrice(
     house.huntingFee
    )}
   </Typography>

   <Stack
    direction="row"
    spacing={1}
    alignItems="center"

    sx={{
     mt:1
    }}
   >

    <LocationOn
     sx={{
      color:"#888"
     }}
    />

    <Typography
     sx={{
      color:"#aaa"
     }}
    >
     {house.location}
    </Typography>

   </Stack>

   {/* TRUST */}

   <Stack
    direction="row"
    spacing={1}
    flexWrap="wrap"

    sx={{
     mt:2
    }}
   >

    <Chip
     icon={<Shield />}
     label="Admin Verified"

     sx={{
      background:
       "rgba(0,188,212,.12)",

      color:"#4dd0e1"
     }}
    />

    <Chip
     label="Safe Process"

     sx={{
      background:
       "rgba(244,180,0,.12)",

      color:GOLD
     }}
    />

   </Stack>

   {/* INFO */}

   <Stack
    direction="row"
    spacing={3}

    sx={{
     mt:3
    }}
   >

    <Stack
     direction="row"
     spacing={1}
     alignItems="center"
    >

     <Bed
      sx={{
       color:"#888"
      }}
     />

     <Typography>
      {house.bedrooms}
      {" "}
      Beds
     </Typography>

    </Stack>

    <Stack
     direction="row"
     spacing={1}
     alignItems="center"
    >

     <Bathtub
      sx={{
       color:"#888"
      }}
     />

     <Typography>
      {house.bathrooms}
      {" "}
      Baths
     </Typography>

    </Stack>

   </Stack>

   {/* AMENITIES */}

   <Box sx={{mt:4}}>

    <Typography
     sx={{
      color:GOLD,
      fontWeight:900,
      mb:1.5
     }}
    >
     Amenities
    </Typography>

    <Stack
     direction="row"
     spacing={1}
     flexWrap="wrap"
     useFlexGap
    >

     {[
      {
       icon:<Wifi />,
       label:"WiFi"
      },

      {
       icon:<WaterDrop />,
       label:"Water"
      },

      {
       icon:<LocalParking />,
       label:"Parking"
      }

     ].map((item,i)=>(

     <Chip
      key={i}

      icon={item.icon}

      label={item.label}

      sx={{
       background:CARD,
       color:"#fff"
      }}
     />

     ))}

    </Stack>

   </Box>

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
     {house.description}
    </Typography>

   </Box>

   {/* CONTACT */}

   <Box
    sx={{
     mt:4,
     p:2.5,
     borderRadius:4,
     background:CARD,
     border:
      `1px solid ${BORDER}`
    }}
   >

    <Stack
     direction="row"
     spacing={1.5}
     alignItems="center"
    >

     <Avatar
      sx={{
       background:GOLD,
       color:"#000"
      }}
     >

      <Shield />

     </Avatar>

     <Box>

      <Typography
       sx={{
        fontWeight:900
       }}
      >
       Secure Admin Coordination
      </Typography>

      <Typography
       sx={{
        color:"#999",
        fontSize:13,
        mt:.5
       }}
      >
       Golden Biashnet helps
       verify houses, arrange
       viewings and coordinate
       safe communication.
      </Typography>

     </Box>

    </Stack>

    <Stack
     spacing={1.5}

     sx={{
      mt:3
     }}
    >

     <Button
      fullWidth

      startIcon={<Chat />}

      onClick={startAdminChat}

      sx={{
       height:54,
       borderRadius:3,
       fontWeight:900,
       background:
"linear-gradient(45deg,#F4B400,#FFD95A)",
       color:"#000",

       "&:hover":{
        background:
"linear-gradient(45deg,#FFD95A,#F4B400)"
       }
      }}
     >
      Chat With Admin
     </Button>

     <Button
      fullWidth

      startIcon={<WhatsApp />}

      onClick={
       contactAdminsWhatsApp
      }

      sx={{
       height:52,
       borderRadius:3,
       fontWeight:900,
       background:"#25D366",
       color:"#000"
      }}
     >
      WhatsApp Admin
     </Button>

    </Stack>

   </Box>

   {/* BOOKING */}

   <Box
    sx={{
     mt:4,
     p:2.5,
     borderRadius:4,
     background:CARD,
     border:
      `1px solid ${BORDER}`
    }}
   >

    <Typography
     sx={{
      fontWeight:900,
      fontSize:18
     }}
    >
     Book House Viewing
    </Typography>

    <Typography
     sx={{
      color:"#888",
      fontSize:13,
      mt:1,
      mb:2
     }}
    >
     Select your expected
     relocation date and
     admins will coordinate
     viewing and booking.
    </Typography>

    <TextField
     fullWidth

     type="date"

     value={relocationDate}

     onChange={(e)=>
      setRelocationDate(
       e.target.value
      )
     }

     sx={{

      mb:2,

      input:{
       color:"#fff"
      },

      "& .MuiOutlinedInput-root":{

       "& fieldset":{
        borderColor:"#333"
       },

       "&:hover fieldset":{
        borderColor:GOLD
       },

       "&.Mui-focused fieldset":{
        borderColor:GOLD
       }

      }

     }}
    />

    <Button
     fullWidth

     disabled={sending}

     onClick={handleRequest}

     sx={{
      height:54,
      borderRadius:3,
      fontWeight:900,
      background:GOLD,
      color:"#000"
     }}
    >
     {sending
      ? "Sending..."
      : "Book Viewing"}
    </Button>

   </Box>

  </Box>

  {/* ==================================================
     PREVIEW
  ================================================== */}

  <Dialog
   open={Boolean(preview)}

   onClose={()=>
    setPreview(null)
   }

   maxWidth="lg"
  >

   <img
    src={preview}
    alt="preview"

    style={{
     width:"100%",
     height:"auto"
    }}
   />

  </Dialog>

 </Box>

 );

}