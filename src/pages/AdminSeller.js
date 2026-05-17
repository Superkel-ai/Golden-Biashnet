// src/admin/AdminSellerFinder.js

import React,{useState} from "react";

import{
 Box,
 Paper,
 Stack,
 Typography,
 TextField,
 Button,
 Avatar,
 Chip,
 Divider,
 CircularProgress
}from "@mui/material";

import{
 Search,
 Storefront,
 ShoppingBag,
 WhatsApp,
 Phone,
 Sms,
 Chat,
 Verified,
 LocationOn
}from "@mui/icons-material";

import{
 db
}from "../services/firebase";

import{
 doc,
 getDoc,
 addDoc,
 collection,
 serverTimestamp,
 query,
 where,
 getDocs
}from "firebase/firestore";

import{useNavigate}from "react-router-dom";

/* =========================================================
THEME
========================================================= */

const GOLD="#F4B400";
const BG="#050505";
const CARD="#101010";
const BORDER="#232323";

/* =========================================================
PHONE FORMATTER
========================================================= */

const formatPhone=(phone="")=>{

 let cleaned=phone
  .replace(/\s/g,"")
  .replace(/\+/g,"");

 if(cleaned.startsWith("07")){
  cleaned=`254${cleaned.substring(1)}`;
 }

 if(cleaned.startsWith("01")){
  cleaned=`254${cleaned.substring(1)}`;
 }

 return cleaned;
};

/* =========================================================
COMPONENT
========================================================= */

export default function AdminSellerFinder(){

 const navigate=useNavigate();

 const[sellerId,setSellerId]=useState("");
 const[productId,setProductId]=useState("");

 const[seller,setSeller]=useState(null);
 const[product,setProduct]=useState(null);

 const[loading,setLoading]=useState(false);

 /* =========================================================
 SEARCH SELLER
 ========================================================= */

 const searchSeller=async()=>{

  if(!sellerId.trim()) return;

  try{

   setLoading(true);

   setSeller(null);

   const sellerRef=doc(
    db,
    "users",
    sellerId.trim()
   );

   const sellerSnap=await getDoc(
    sellerRef
   );

   if(!sellerSnap.exists()){

    alert("Seller not found");

    return;
   }

   setSeller({
    id:sellerSnap.id,
    ...sellerSnap.data()
   });

  }catch(err){

   console.log(err);

   alert("Failed to load seller");

  }finally{

   setLoading(false);

  }

 };

 /* =========================================================
 SEARCH PRODUCT
 ========================================================= */

 const searchProduct=async()=>{

  if(!productId.trim()) return;

  try{

   setLoading(true);

   setProduct(null);

   const productRef=doc(
    db,
    "products",
    productId.trim()
   );

   const productSnap=await getDoc(
    productRef
   );

   if(!productSnap.exists()){

    alert("Product not found");

    return;
   }

   const productData={
    id:productSnap.id,
    ...productSnap.data()
   };

   setProduct(productData);

   /* =====================================
      LOAD SELLER
   ===================================== */

   if(productData.sellerId){

    setSellerId(productData.sellerId);

    const sellerRef=doc(
     db,
     "users",
     productData.sellerId
    );

    const sellerSnap=await getDoc(
     sellerRef
    );

    if(sellerSnap.exists()){

     setSeller({
      id:sellerSnap.id,
      ...sellerSnap.data()
     });

    }

   }

  }catch(err){

   console.log(err);

   alert("Failed to load product");

  }finally{

   setLoading(false);

  }

 };

 /* =========================================================
 OPEN ADMIN CHAT
 ========================================================= */

 const openSellerChat=async()=>{

  if(!seller) return;

  try{

   /* =====================================
      CHECK EXISTING CHAT
   ===================================== */

   const q=query(
    collection(db,"adminSellerChats"),
    where("sellerId","==",seller.id)
   );

   const existing=await getDocs(q);

   if(!existing.empty){

    navigate(
     `/admin/seller-chat/${existing.docs[0].id}`
    );

    return;
   }

   /* =====================================
      CREATE CHAT
   ===================================== */

   const newChat=await addDoc(
    collection(db,"adminSellerChats"),
    {
     sellerId:seller.id,

     sellerName:
      seller.name || "",

     sellerPhone:
      seller.phone || "",

     sellerLocation:
      seller.location || "",

     sellerVerified:
      seller.sellerVerified || false,

     productId:
      product?.id || "",

     productTitle:
      product?.title || "",

     productImage:
      product?.images?.[0]?.thumb || "",

     createdAt:serverTimestamp(),

     lastMessage:"",

     status:"active",

     adminOnline:true
    }
   );

   navigate(
    `/admin/seller-chat/${newChat.id}`
   );

  }catch(err){

   console.log(err);

   alert("Failed to create seller chat");

  }

 };

 /* =========================================================
SELLER PHONE
========================================================= */

const sellerPhone=formatPhone(
 seller?.phone ||
 product?.sellerPhone ||
 ""
);

/* =========================================================
WHATSAPP MESSAGE
========================================================= */

const whatsappMessage=encodeURIComponent(

`Hello ${seller?.name || "Seller"},

A customer on Golden Biashnet is interested in your product.

Product:
${product?.title || "Product"}

Price:
KES ${product?.price || "N/A"}

Product ID:
${product?.id || "N/A"}

Customer Request:
Please prepare and deliver the product as soon as possible within 24 hours if available.

Thank you,
Golden Biashnet Admin Team`

);

/* =========================================================
WHATSAPP LINK
========================================================= */

const whatsappLink=sellerPhone
 ? `https://wa.me/${sellerPhone}?text=${whatsappMessage}`
 : "#";
 /* =========================================================
 UI
 ========================================================= */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
   p:{xs:2,md:3},
   color:"#fff"
  }}
 >

 <Typography
  sx={{
   fontSize:28,
   fontWeight:900,
   mb:1
  }}
 >
  Seller Finder
 </Typography>

 <Typography
  sx={{
   color:"#888",
   mb:3
  }}
 >
  Search sellers or products and
  instantly reach sellers.
 </Typography>

 {/* =====================================================
 SEARCH
 ===================================================== */}

 <Paper
  sx={{
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   p:2,
   mb:3
  }}
 >

 <Stack spacing={2}>

 <Stack
  direction={{xs:"column",md:"row"}}
  spacing={1.5}
 >

 <TextField
  fullWidth
  label="Seller ID"
  value={sellerId}
  onChange={(e)=>
   setSellerId(e.target.value)
  }
  sx={fieldStyle}
 />

 <Button
  onClick={searchSeller}
  startIcon={<Search />}
  sx={goldBtn}
 >

  Find Seller

 </Button>

 </Stack>

 <Stack
  direction={{xs:"column",md:"row"}}
  spacing={1.5}
 >

 <TextField
  fullWidth
  label="Product ID"
  value={productId}
  onChange={(e)=>
   setProductId(e.target.value)
  }
  sx={fieldStyle}
 />

 <Button
  onClick={searchProduct}
  startIcon={<ShoppingBag />}
  sx={goldBtn}
 >

  Find Product

 </Button>

 </Stack>

 </Stack>

 </Paper>

 {/* =====================================================
 LOADING
 ===================================================== */}

 {loading && (

 <Box textAlign="center" py={5}>

 <CircularProgress
  sx={{color:GOLD}}
 />

 </Box>

 )}

 {/* =====================================================
 PRODUCT
 ===================================================== */}

 {product && (

 <Paper
  sx={{
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   p:2,
   mb:3
  }}
 >

 <Stack
  direction="row"
  spacing={2}
 >

 <Avatar
  variant="rounded"
  src={product.images?.[0]?.thumb}
  sx={{
   width:90,
   height:90
  }}
 />

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  {product.title}
 </Typography>

 <Typography
  sx={{
   color:GOLD,
   fontWeight:900,
   mt:.5
  }}
 >
  KES {product.price}
 </Typography>

 <Stack
  direction="row"
  spacing={1}
  mt={1}
  flexWrap="wrap"
 >

 <Chip
  label={product.category}
 />

 <Chip
  label={product.condition}
 />

 <Chip
  label={`Stock ${product.stock}`}
 />

 </Stack>

 <Typography
  sx={{
   color:"#aaa",
   mt:1.5
  }}
 >
  {product.location}
 </Typography>

 </Box>

 </Stack>

 </Paper>

 )}

 {/* =====================================================
 SELLER
 ===================================================== */}

 {seller && (

 <Paper
  sx={{
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   p:2
  }}
 >

 <Stack
  direction={{xs:"column",md:"row"}}
  spacing={2}
 >

 <Avatar
  src={seller.photoURL}
  sx={{
   width:85,
   height:85
  }}
 >
  <Storefront />
 </Avatar>

 <Box flex={1}>

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
 >

 <Typography
  sx={{
   fontSize:20,
   fontWeight:900
  }}
 >
  {seller.name}
 </Typography>

 {seller.sellerVerified && (

 <Verified
  sx={{
   color:"#42a5f5"
  }}
 />

 )}

 </Stack>

 <Typography
  sx={{
   color:"#888",
   mt:.5
  }}
 >
  Seller ID: {seller.id}
 </Typography>

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mt={1}
 >

 <Phone
  sx={{
   color:"#4caf50",
   fontSize:18
  }}
 />

 <Typography>
  {seller.phone || "No phone"}
 </Typography>

 </Stack>

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mt={1}
 >

 <LocationOn
  sx={{
   color:"#ff7043",
   fontSize:18
  }}
 />

 <Typography>
  {seller.location || "No location"}
 </Typography>

 </Stack>

 <Divider
  sx={{
   borderColor:BORDER,
   my:2
  }}
 />

 <Stack
  direction={{
   xs:"column",
   md:"row"
  }}
  spacing={1.5}
 >

 <Button
  startIcon={<Chat />}
  onClick={openSellerChat}
  sx={goldBtn}
 >

  Open Admin Chat

 </Button>

 <Button
  startIcon={<WhatsApp />}
  href={whatsappLink}
  target="_blank"
  sx={whatsappBtn}
 >

  WhatsApp Seller

 </Button>

 <Button
  startIcon={<Phone />}
  href={`tel:${sellerPhone}`}
  sx={darkBtn}
 >

  Call

 </Button>

 <Button
  startIcon={<Sms />}
  href={`sms:${sellerPhone}`}
  sx={darkBtn}
 >

  SMS

 </Button>

 </Stack>

 </Box>

 </Stack>

 </Paper>

 )}

 </Box>

 );

}

/* =========================================================
STYLES
========================================================= */

const fieldStyle={

 "& .MuiOutlinedInput-root":{

  color:"#fff",
  background:"#0b0b0b",

  "& fieldset":{
   borderColor:"#232323"
  },

  "&:hover fieldset":{
   borderColor:"#F4B400"
  },

  "&.Mui-focused fieldset":{
   borderColor:"#F4B400"
  }

 },

 "& .MuiInputLabel-root":{
  color:"#888"
 }

};

const goldBtn={
 background:"#F4B400",
 color:"#000",
 fontWeight:900,
 borderRadius:3,
 minWidth:180,

 "&:hover":{
  background:"#ffd54f"
 }
};

const whatsappBtn={
 background:"#25D366",
 color:"#000",
 fontWeight:900,
 borderRadius:3
};

const darkBtn={
 border:"1px solid #232323",
 color:"#fff",
 fontWeight:800,
 borderRadius:3
};