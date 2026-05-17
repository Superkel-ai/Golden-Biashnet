import React,{useEffect,useRef,useState} from "react";

import {
 Box,
 Stack,
 Typography,
 Avatar,
 TextField,
 IconButton,
 Paper,
 Chip,
 Button,
 Divider
} from "@mui/material";

import {
 Send,
 Person,
 DoneAll,
 Shield,
 Storefront,
 LocationOn,
 Phone,
 Chat
} from "@mui/icons-material";

import {useNavigate,useParams} from "react-router-dom";

import {
 db,
 auth
} from "../services/firebase";

import {
 doc,
 getDoc,
 updateDoc,
 collection,
 query,
 orderBy,
 onSnapshot,
 addDoc,
 serverTimestamp
} from "firebase/firestore";

/* =========================================================
THEME
========================================================= */

const GOLD="#F4B400";
const BG="#050505";
const CARD="#101010";
const BORDER="#232323";

/* =========================================================
COMPONENT
========================================================= */

export default function AdminChat(){

 const {chatId}=useParams();

 const navigate=useNavigate();

 const [chat,setChat]=useState(null);

 const [seller,setSeller]=useState(null);

 const [buyer,setBuyer]=useState(null);

 const [messages,setMessages]=useState([]);

 const [message,setMessage]=useState("");

 const [buyerTyping,setBuyerTyping]=useState(false);

 const [sending,setSending]=useState(false);

 const bottomRef=useRef(null);

 /* =========================================================
 LOAD CHAT
 ========================================================= */

 useEffect(()=>{

  const unsub=onSnapshot(
   doc(db,"adminChats",chatId),
   async snap=>{

    if(!snap.exists()) return;

    const data={
     id:snap.id,
     ...snap.data()
    };

    setChat(data);

    setBuyerTyping(
     data?.buyerTyping || false
    );

    /* ==============================
       LOAD BUYER
    ============================== */

    if(data.buyerId){

     const buyerSnap=await getDoc(
      doc(db,"users",data.buyerId)
     );

     if(buyerSnap.exists()){

      setBuyer(buyerSnap.data());

     }

    }

    /* ==============================
       LOAD SELLER
    ============================== */

    if(data.sellerId){

     const sellerSnap=await getDoc(
      doc(db,"users",data.sellerId)
     );

     if(sellerSnap.exists()){

      setSeller(sellerSnap.data());

     }

    }

   }
  );

  return()=>unsub();

 },[chatId]);

 /* =========================================================
 LOAD MESSAGES
 ========================================================= */

 useEffect(()=>{

  const q=query(
   collection(
    db,
    "adminChats",
    chatId,
    "messages"
   ),
   orderBy("createdAt","asc")
  );

  const unsub=onSnapshot(q,snap=>{

   setMessages(
    snap.docs.map(doc=>({
     id:doc.id,
     ...doc.data()
    }))
   );

  });

  return()=>unsub();

 },[chatId]);

 /* =========================================================
 AUTO SCROLL
 ========================================================= */

 useEffect(()=>{

  bottomRef.current?.scrollIntoView({
   behavior:"smooth"
  });

 },[messages]);

 /* =========================================================
 ADMIN ONLINE
 ========================================================= */

 useEffect(()=>{

  const setOnline=async()=>{

   try{

    await updateDoc(
     doc(db,"adminChats",chatId),
     {
      adminOnline:true
     }
    );

   }catch(err){

    console.log(err);

   }

  };

  setOnline();

 },[chatId]);

 /* =========================================================
 SEND MESSAGE
 ========================================================= */

 const sendMessage=async()=>{

  if(!message.trim()) return;

  try{

   setSending(true);

   await addDoc(
    collection(
     db,
     "adminChats",
     chatId,
     "messages"
    ),
    {
     text:message,
     senderId:auth.currentUser.uid,
     senderRole:"admin",
     seen:true,
     createdAt:serverTimestamp()
    }
   );

   await updateDoc(
    doc(db,"adminChats",chatId),
    {
     lastMessage:message,
     lastMessageAt:serverTimestamp(),
     adminTyping:false
    }
   );

   setMessage("");

  }catch(err){

   console.log(err);

  }finally{

   setSending(false);

  }

 };

 /* =========================================================
 ADMIN TYPING
 ========================================================= */

 const handleTyping=async(e)=>{

  setMessage(e.target.value);

  try{

   await updateDoc(
    doc(db,"adminChats",chatId),
    {adminTyping:true}
   );

   setTimeout(async()=>{

    await updateDoc(
     doc(db,"adminChats",chatId),
     {adminTyping:false}
    );

   },1200);

  }catch(err){

   console.log(err);

  }

 };

 /* =========================================================
 CHAT SELLER
 ========================================================= */

 const openSellerChat=async()=>{

  try{

   const ref=await addDoc(
    collection(db,"adminSellerChats"),
    {
     adminId:auth.currentUser.uid,

     sellerId:chat.sellerId,

     buyerId:chat.buyerId,

     productId:chat.productId,

     productTitle:chat.productTitle,

     productImage:chat.productImage || "",

     status:"active",

     createdAt:serverTimestamp()
    }
   );

   navigate(
    `/admin/seller-chat/${ref.id}`
   );

  }catch(err){

   console.log(err);

  }

 };

 return(

 <Box
  sx={{
   background:BG,
   height:"100vh",
   display:"flex",
   flexDirection:"column",
   color:"#fff"
  }}
 >

 {/* =====================================================
 HEADER
 ===================================================== */}

 <Box
  sx={{
   p:2,
   background:CARD,
   borderBottom:`1px solid ${BORDER}`
  }}
 >

 <Stack
  direction="row"
  spacing={2}
  alignItems="center"
 >

 <Avatar
  src={buyer?.photo}
  sx={{
   width:55,
   height:55,
   background:"rgba(244,180,0,.12)",
   color:GOLD
  }}
 >
  <Person />
 </Avatar>

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  {buyer?.fullName || "Buyer"}
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:13
  }}
 >
  Buyer Support Chat
 </Typography>

 </Box>

 <Chip
  icon={<Shield />}
  label={
   chat?.adminOnline
    ? "Online"
    : "Offline"
  }

  sx={{
   background:"rgba(244,180,0,.12)",
   color:GOLD,
   border:`1px solid ${GOLD}`
  }}
 />

 </Stack>

 </Box>

 {/* =====================================================
 PRODUCT / SELLER INFO
 ===================================================== */}

 {chat && (

 <Paper
  sx={{
   m:2,
   p:2,
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5
  }}
 >

 <Stack spacing={2}>

 <Stack
  direction={{
   xs:"column",
   md:"row"
  }}
  spacing={2}
 >

 <Box
  component="img"
  src={chat.productImage}
  sx={{
   width:{
    xs:"100%",
    md:120
   },
   height:120,
   objectFit:"cover",
   borderRadius:4
  }}
 />

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  {chat.productTitle}
 </Typography>

 <Stack
  direction="row"
  spacing={1}
  mt={1}
  flexWrap="wrap"
 >

 <Chip
  label={`KES ${chat.price || 0}`}
  sx={{
   background:"rgba(244,180,0,.12)",
   color:GOLD
  }}
 />

 <Chip
  icon={<LocationOn />}
  label={
   chat.location ||
   "Location not set"
  }

  sx={{
   background:"#171717",
   color:"#ddd"
  }}
 />

 </Stack>

 <Typography
  sx={{
   mt:2,
   color:"#aaa",
   lineHeight:1.7,
   fontSize:14
  }}
 >
  {chat.description ||
   "No description available"}
 </Typography>

 </Box>

 </Stack>

 <Divider
  sx={{
   borderColor:BORDER
  }}
 />

 {/* =====================================================
 SELLER INFO
 ===================================================== */}

 <Stack
  direction={{
   xs:"column",
   md:"row"
  }}
  spacing={2}
  justifyContent="space-between"
  alignItems={{
   xs:"flex-start",
   md:"center"
  }}
 >

 <Stack
  direction="row"
  spacing={2}
  alignItems="center"
 >

 <Avatar
  src={seller?.photo}
  sx={{
   background:"rgba(244,180,0,.12)",
   color:GOLD
  }}
 >
  <Storefront />
 </Avatar>

 <Box>

 <Typography
  sx={{
   fontWeight:800
  }}
 >
  {seller?.fullName || "Seller"}
 </Typography>

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
 >

 <Phone
  sx={{
   fontSize:15,
   color:"#4caf50"
  }}
 />

 <Typography
  sx={{
   color:"#888",
   fontSize:13
  }}
 >
  {seller?.phone || "No phone"}
 </Typography>

 </Stack>

 </Box>

 </Stack>

 <Button
  startIcon={<Chat />}
  onClick={openSellerChat}
  sx={{
   background:GOLD,
   color:"#000",
   fontWeight:800,
   borderRadius:3,
   px:3,

   "&:hover":{
    background:"#ffd54f"
   }
  }}
 >
  Chat Seller
 </Button>

 </Stack>

 </Stack>

 </Paper>

 )}

 {/* =====================================================
 MESSAGES
 ===================================================== */}

 <Box
  sx={{
   flex:1,
   overflow:"auto",
   px:2,
   pb:2
  }}
 >

 <Stack spacing={2}>

 {messages.map(msg=>(

 <Box
  key={msg.id}

  sx={{
   display:"flex",

   justifyContent:
    msg.senderRole==="admin"
     ? "flex-end"
     : "flex-start"
  }}
 >

 <Paper
  sx={{
   p:1.5,
   maxWidth:"80%",
   borderRadius:4,

   background:
    msg.senderRole==="admin"
     ? "#000000"
     :  "#000000",

   color:
    msg.senderRole==="admin"
     ? "#f3e51c"
     : "#e7da19",

   border:
    msg.senderRole==="buyer"
     ? `1px solid ${BORDER}`
     : "none"
  }}
 >

 <Typography
  sx={{
   lineHeight:1.6,
   whiteSpace:"pre-wrap"
  }}
 >
  {msg.text}
 </Typography>

 <Stack
  direction="row"
  spacing={0.5}
  justifyContent="flex-end"
  alignItems="center"
  mt={1}
 >

 <Typography
  sx={{
   fontSize:11,
   opacity:.7
  }}
 >
  {msg.createdAt?.seconds
   ? new Date(
      msg.createdAt.seconds*1000
     ).toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
     })
   : ""}
 </Typography>

 {msg.senderRole==="admin" && (
  <DoneAll sx={{fontSize:15}} />
 )}

 </Stack>

 </Paper>

 </Box>

 ))}

 {buyerTyping && (

 <Typography
  sx={{
   color:"#888",
   fontSize:13,
   fontStyle:"italic"
  }}
 >
  Buyer is typing...
 </Typography>

 )}

 <div ref={bottomRef} />

 </Stack>

 </Box>

 {/* =====================================================
 INPUT
 ===================================================== */}

 <Box
  sx={{
   p:2,
   background:CARD,
   borderTop:`1px solid ${BORDER}`
  }}
 >

 <Stack
  direction="row"
  spacing={1}
 >

 <TextField
  fullWidth

  placeholder="Reply buyer..."

  value={message}

  onChange={handleTyping}

  onKeyDown={(e)=>{

   if(e.key==="Enter"){

    e.preventDefault();

    sendMessage();

   }

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

 <IconButton
  onClick={sendMessage}

  disabled={sending}

  sx={{
   width:55,
   height:55,
   background:GOLD,
   color:"#000",

   "&:hover":{
    background:"#ffd54f"
   }
  }}
 >

 <Send />

 </IconButton>

 </Stack>

 </Box>

 </Box>

 );

}