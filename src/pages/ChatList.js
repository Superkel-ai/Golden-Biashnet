import React,{useEffect,useMemo,useState} from "react";

import {
 Box,
 Paper,
 Stack,
 Typography,
 Avatar,
 Tabs,
 Tab,
 Chip,
 TextField,
 InputAdornment,
 Badge
} from "@mui/material";

import {
 Search,
 SupportAgent,
 Storefront,
 Person,
 Shield,
 Chat
} from "@mui/icons-material";

import {
 collection,
 query,
 where,
 orderBy,
 onSnapshot
} from "firebase/firestore";

import {
 auth,
 db
} from "../services/firebase";

import {useNavigate} from "react-router-dom";

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

export default function SupportChats(){

 const navigate=useNavigate();

 const [search,setSearch]=useState("");

 const [tab,setTab]=useState(0);

 const [buyerChats,setBuyerChats]=useState([]);

 const [sellerChats,setSellerChats]=useState([]);

 /* =========================================================
 LOAD BUYER CHATS
========================================================= */

 useEffect(()=>{

  if(!auth.currentUser) return;

  const q=query(
   collection(db,"adminChats"),
   where("buyerId","==",auth.currentUser.uid),
   orderBy("createdAt","desc")
  );

  const unsub=onSnapshot(q,snap=>{

   setBuyerChats(
    snap.docs.map(doc=>({
     id:doc.id,
     type:"buyer",
     ...doc.data()
    }))
   );

  });

  return()=>unsub();

 },[]);

 /* =========================================================
 LOAD SELLER CHATS
========================================================= */

 useEffect(()=>{

  if(!auth.currentUser) return;

  const q=query(
   collection(db,"adminSellerChats"),
   where("sellerId","==",auth.currentUser.uid),
   orderBy("createdAt","desc")
  );

  const unsub=onSnapshot(q,snap=>{

   setSellerChats(
    snap.docs.map(doc=>({
     id:doc.id,
     type:"seller",
     ...doc.data()
    }))
   );

  });

  return()=>unsub();

 },[]);

 /* =========================================================
 FILTER
========================================================= */

 const chats=useMemo(()=>{

  const list=tab===0
   ? buyerChats
   : sellerChats;

  return list.filter(chat=>{

   const text=`
    ${chat.productTitle || ""}
    ${chat.lastMessage || ""}
    ${chat.sellerLastMessage || ""}
   `.toLowerCase();

   return text.includes(
    search.toLowerCase()
   );

  });

 },[
  buyerChats,
  sellerChats,
  tab,
  search
 ]);

 /* =========================================================
 OPEN CHAT
========================================================= */

 const openChat=(chat)=>{

  if(chat.type==="buyer"){

   navigate(`/support-chat/${chat.id}`);

  }else{

   navigate(
    `/seller-support-chat/${chat.id}`
   );

  }

 };

 /* =========================================================
 UI
========================================================= */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
   color:"#fff"
  }}
 >

 {/* =====================================================
 HEADER
===================================================== */}

 <Box
  sx={{
   p:2,
   borderBottom:`1px solid ${BORDER}`,
   background:CARD,
   position:"sticky",
   top:0,
   zIndex:10
  }}
 >

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mb={2}
 >

 <SupportAgent sx={{color:GOLD}} />

 <Typography
  sx={{
   fontWeight:900,
   fontSize:22
  }}
 >
  Support Chats
 </Typography>

 </Stack>

 {/* =====================================================
 TABS
===================================================== */}

 <Tabs
  value={tab}
  onChange={(e,v)=>setTab(v)}
  sx={{

   mb:2,

   "& .MuiTab-root":{
    color:"#888",
    fontWeight:700
   },

   "& .Mui-selected":{
    color:GOLD
   }

  }}
 >

 <Tab
  icon={<Person />}
  iconPosition="start"
  label={`Buyer Chats (${buyerChats.length})`}
 />

 <Tab
  icon={<Storefront />}
  iconPosition="start"
  label={`Seller Chats (${sellerChats.length})`}
 />

 </Tabs>

 {/* =====================================================
 SEARCH
===================================================== */}

 <TextField
  fullWidth
  placeholder="Search support chats..."
  value={search}
  onChange={(e)=>
   setSearch(e.target.value)
  }
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
    }
   }
  }}
 />

 </Box>

 {/* =====================================================
 LIST
===================================================== */}

 <Box p={2}>

 <Stack spacing={2}>

 {chats.map(chat=>(

 <Paper
  key={chat.id}
  onClick={()=>openChat(chat)}
  sx={{
   p:2,
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   cursor:"pointer",
   transition:".2s",

   "&:hover":{
    border:`1px solid ${GOLD}`,
    transform:"translateY(-2px)"
   }
  }}
 >

 <Stack
  direction="row"
  spacing={2}
  alignItems="center"
 >

 {/* =====================================================
 IMAGE
===================================================== */}

 <Badge
  overlap="circular"
  anchorOrigin={{
   vertical:"bottom",
   horizontal:"right"
  }}
  badgeContent={

   <Avatar
    sx={{
     width:22,
     height:22,
     background:GOLD,
     color:"#000"
    }}
   >
    <Shield sx={{fontSize:14}} />
   </Avatar>

  }
 >

 <Avatar
  src={chat.productImage}
  sx={{
   width:65,
   height:65
  }}
 >
  <Chat />
 </Avatar>

 </Badge>

 {/* =====================================================
 DETAILS
===================================================== */}

 <Box flex={1}>

 <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  mb={1}
 >

 <Typography
  sx={{
   fontWeight:800,
   fontSize:15
  }}
 >
  {chat.productTitle || "Support Chat"}
 </Typography>

 <Chip
  size="small"
  label={chat.status || "active"}
  sx={{
   background:"rgba(244,180,0,.12)",
   color:GOLD,
   border:`1px solid ${GOLD}`,
   fontWeight:700
  }}
 />

 </Stack>

 <Typography
  sx={{
   color:"#ccc",
   fontSize:13,
   mb:1
  }}
 >
  {
   tab===0
    ? (
       chat.lastMessage ||
       "Open buyer support conversation"
      )
    : (
       chat.sellerLastMessage ||
       "Open seller support conversation"
      )
  }
 </Typography>

 <Typography
  sx={{
   color:"#777",
   fontSize:12
  }}
 >
  {tab===0
   ? "Admin Support Team"
   : "Seller Coordination"}
 </Typography>

 </Box>

 </Stack>

 </Paper>

 ))}

 {/* =====================================================
 EMPTY
===================================================== */}

 {chats.length===0 && (

 <Paper
  sx={{
   p:5,
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   textAlign:"center"
  }}
 >

 <SupportAgent
  sx={{
   fontSize:55,
   color:GOLD,
   mb:2
  }}
 />

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  No Support Chats
 </Typography>

 <Typography
  sx={{
   color:"#888",
   mt:1
  }}
 >
  Your conversations with admins
  will appear here.
 </Typography>

 </Paper>

 )}

 </Stack>

 </Box>

 </Box>

 );

}