import React,{useEffect,useMemo,useState} from "react";

import {
 Box,
 Paper,
 Stack,
 Typography,
 Avatar,
 TextField,
 InputAdornment,
 Chip,
 Tabs,
 Tab,
 Divider,
 Button,
 Badge
} from "@mui/material";

import {
 Search,
 Person,
 SupportAgent,
 Storefront,
 LocationOn,
 Phone,
 Shield,
   ManageSearch,
 Chat,
 ShoppingCart
} from "@mui/icons-material";

import {
 collection,
 query,
 orderBy,
 onSnapshot,
 doc,
 getDoc,
 where,
 getDocs,
 addDoc,
 serverTimestamp
} from "firebase/firestore";

import {useNavigate} from "react-router-dom";

import {db} from "../services/firebase";

/* =========================================================
THEME
========================================================= */

const GOLD="#F4B400",
BG="#050505",
CARD="#101010",
BORDER="#232323";

/* =========================================================
COMPONENT
========================================================= */

export default function AdminSupportList(){

 const navigate=useNavigate();

 const [loading,setLoading]=useState(true);

 const [search,setSearch]=useState("");

 const [tab,setTab]=useState(0);

 const [chats,setChats]=useState([]);

 /* =========================================================
 LOAD CHATS
 ========================================================= */

 useEffect(()=>{

  const q=query(
   collection(db,"adminChats"),
   orderBy("createdAt","desc")
  );

  const unsub=onSnapshot(q,async(snap)=>{

   try{

    const data=await Promise.all(

     snap.docs.map(async(item)=>{

      const chat={id:item.id,...item.data()};

      const buyerSnap=chat.buyerId
       ? await getDoc(doc(db,"users",chat.buyerId))
       : null;

      const sellerSnap=chat.sellerId
       ? await getDoc(doc(db,"users",chat.sellerId))
       : null;

      

      const buyer=buyerSnap?.data?.() || {};
      const seller=sellerSnap?.data?.() || {};

      return{
       ...chat,

       buyerName:
        buyer.fullName ||
        buyer.name ||
        "Buyer",

       buyerPhone:
        buyer.phone || "",

       buyerLocation:
        buyer.location || "",

       sellerName:
        seller.fullName ||
        seller.name ||
        "Seller",

       sellerPhone:
        seller.phone || "",

       sellerLocation:
        seller.location || "",

       sellerVerified:
        seller.sellerVerified || false
      };

     })

    );

    setChats(data);

   }catch(err){

    console.log(err);

   }finally{

    setLoading(false);

   }

  });

  return()=>unsub();

 },[]);


 /* =========================================================
 OPEN SELLER CHAT
========================================================= */

const openSellerChat=async(chat)=>{

 try{

  /* =====================================
     CHECK EXISTING CHAT
  ===================================== */

  const q=query(
   collection(db,"adminSellerChats"),
   where("sellerId","==",chat.sellerId)
  );

  const existing=await getDocs(q);

  /* =====================================
     CHAT EXISTS
  ===================================== */

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
    sellerId:chat.sellerId,

    sellerName:
     chat.sellerName || "",

    sellerPhone:
     chat.sellerPhone || "",

    sellerLocation:
     chat.sellerLocation || "",

    productId:
     chat.productId || "",

    productTitle:
     chat.productTitle || "",

    productImage:
     chat.productImage || "",

    createdAt:serverTimestamp(),

    lastMessage:"",

    status:"active"
   }
  );

  /* =====================================
     OPEN CHAT
  ===================================== */

  navigate(
   `/admin/seller-chat/${newChat.id}`
  );

 }catch(err){

  console.log(err);

 }

};

 /* =========================================================
 FILTERS
 ========================================================= */

 const filteredChats=useMemo(()=>{

  let list=[...chats];

  if(tab===1){
   list=list.filter(x=>x.status==="active");
  }

  if(tab===2){
   list=list.filter(x=>x.status==="resolved");
  }

  if(search){

   list=list.filter(chat=>`

    ${chat.productTitle}
    ${chat.buyerName}
    ${chat.sellerName}

   `.toLowerCase().includes(
    search.toLowerCase()
   ));

  }

  return list;

 },[search,chats,tab]);

 /* =========================================================
 UI
 ========================================================= */

 return(

 <Box sx={{
  background:BG,
  minHeight:"100vh",
  color:"#fff"
 }}>

 {/* =====================================================
 HEADER
 ===================================================== */}

 <Box sx={{
  p:2,
  position:"sticky",
  top:0,
  zIndex:20,
  background:CARD,
  borderBottom:`1px solid ${BORDER}`
 }}>

 <Stack
  direction="row"
  spacing={1.5}
  alignItems="center"
  mb={2}
 >

 <SupportAgent sx={{color:GOLD}} />

 <Typography sx={{
  fontWeight:900,
  fontSize:22
 }}>
  Admin Support Center
 </Typography>

 <Chip
  label={`${filteredChats.length} Chats`}
  sx={{
   ml:"auto",
   background:"rgba(244,180,0,.12)",
   color:GOLD,
   border:`1px solid ${GOLD}`
  }}
 />
<Stack
 direction={{xs:"column",md:"row"}}
 spacing={1.5}
 mb={2}
>

 <TextField
  fullWidth
  placeholder="Search product, buyer or seller..."
  value={search}
  onChange={(e)=>setSearch(e.target.value)}
  InputProps={{
   startAdornment:(
    <InputAdornment position="start">
     <Search sx={{color:"#777"}} />
    </InputAdornment>
   )
  }}
  sx={{

   "& .MuiOutlinedInput-root":{
    background:"#0b0b0b",
    color:"#fff",
    borderRadius:4,

    "& fieldset":{
     borderColor:BORDER
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
  startIcon={<ManageSearch />}
  onClick={()=>
   navigate("/admin/seller")
  }
  sx={{
   background:GOLD,
   color:"#000",
   fontWeight:900,
   borderRadius:3,
   minWidth:220,
   height:56,

   "&:hover":{
    background:"#ffd54f"
   }
  }}
 >

  Seller Finder

 </Button>
</Stack>
</Stack>

 <Tabs
  value={tab}
  onChange={(e,v)=>setTab(v)}
  variant="fullWidth"
  sx={{
   "& .MuiTabs-indicator":{
    background:GOLD
   }
  }}
 >

 <Tab label="All Chats" sx={{color:"#fff"}} />

 <Tab label="Active" sx={{color:"#fff"}} />

 <Tab label="Resolved" sx={{color:"#fff"}} />

 </Tabs>

 </Box>

 {/* =====================================================
 CHAT LIST
 ===================================================== */}

 <Box p={2}>

 <Stack spacing={2}>

 {filteredChats.map(chat=>(

 <Paper
  key={chat.id}
  sx={{
   p:2,
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5
  }}
 >

 {/* =====================================
    TOP
 ===================================== */}

 <Stack
  direction="row"
  spacing={2}
  alignItems="center"
 >

 <Badge
  overlap="circular"
  badgeContent={
   <Avatar sx={{
    width:22,
    height:22,
    background:GOLD,
    color:"#000"
   }}>
    <Shield sx={{fontSize:14}} />
   </Avatar>
  }
 >

 <Avatar
  src={chat.productImage}
  sx={{
   width:70,
   height:70,
   border:`2px solid ${BORDER}`
  }}
 >
  <ShoppingCart />
 </Avatar>

 </Badge>

 <Box flex={1}>

 <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  mb={1}
 >

 <Typography sx={{
  fontWeight:900,
  fontSize:16
 }}>
  {chat.productTitle}
 </Typography>

 <Chip
  size="small"
  label={chat.status || "active"}
  sx={{
   background:
    chat.status==="resolved"
     ? "rgba(76,175,80,.12)"
     : "rgba(244,180,0,.12)",

   color:
    chat.status==="resolved"
     ? "#4caf50"
     : GOLD,

   border:`1px solid ${
    chat.status==="resolved"
     ? "#4caf50"
     : GOLD
   }`
  }}
 />

 </Stack>

 {/* =====================================
    BUYER
 ===================================== */}

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mb={0.7}
 >

 <Person sx={{
  fontSize:16,
  color:"#42a5f5"
 }} />

 <Typography sx={{
  fontSize:13,
  color:"#ddd",
  fontWeight:700
 }}>
  {chat.buyerName}
 </Typography>

 <Typography sx={{
  fontSize:12,
  color:"#777"
 }}>
  {chat.buyerPhone}
 </Typography>

 </Stack>

 {/* =====================================
    SELLER
 ===================================== */}

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mb={0.7}
 >

 <Storefront sx={{
  fontSize:16,
  color:GOLD
 }} />

 <Typography sx={{
  fontSize:13,
  color:"#ddd",
  fontWeight:700
 }}>
  {chat.sellerName}
 </Typography>

 {chat.sellerVerified && (

 <Chip
  size="small"
  label="Verified"
  sx={{
   height:20,
   fontSize:10,
   background:"rgba(66,165,245,.12)",
   color:"#42a5f5",
   border:"1px solid #42a5f5"
  }}
 />

 )}

 </Stack>

 {/* =====================================
    LOCATION
 ===================================== */}

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
 >

 <LocationOn sx={{
  fontSize:15,
  color:"#ff7043"
 }} />

 <Typography sx={{
  fontSize:12,
  color:"#888"
 }}>
  {chat.buyerLocation ||
   "Location not available"}
 </Typography>

 </Stack>

 </Box>

 </Stack>

 <Divider sx={{
  my:2,
  borderColor:BORDER
 }} />

 {/* =====================================
    ACTIONS
 ===================================== */}

 <Stack
  direction={{
   xs:"column",
   sm:"row"
  }}
  spacing={1.5}
 >

 <Button
  fullWidth
  startIcon={<Chat />}
  onClick={()=>
   navigate(`/admin/chat/${chat.id}?role=buyer`)
  }
  sx={{
   background:GOLD,
   color:"#000",
   fontWeight:800,
   borderRadius:3,

   "&:hover":{
    background:"#ffd54f"
   }
  }}
 >
  Chat With Buyer
 </Button>

 <Button
 fullWidth
 startIcon={<Storefront />}
 onClick={()=>
  openSellerChat(chat)
 }
 sx={{
  border:`1px solid ${GOLD}`,
  color:GOLD,
  fontWeight:800,
  borderRadius:3
 }}
>
 Chat With Seller
</Button>



 </Stack>

 </Paper>

 ))}

 {/* =====================================
    EMPTY
 ===================================== */}

 {!loading &&
  filteredChats.length===0 && (

 <Paper sx={{
  p:6,
  background:CARD,
  border:`1px solid ${BORDER}`,
  borderRadius:5,
  textAlign:"center"
 }}>

 <SupportAgent sx={{
  fontSize:60,
  color:GOLD,
  mb:2
 }} />

 <Typography sx={{
  fontWeight:900,
  fontSize:20
 }}>
  No Chats Found
 </Typography>

 <Typography sx={{
  color:"#888",
  mt:1
 }}>
  Buyer and seller support chats
  will appear here automatically.
 </Typography>

 </Paper>

 )}

 </Stack>

 </Box>

 </Box>

 );

}