import React,{useEffect,useRef,useState} from "react";

import {
 Box,
 Stack,
 Typography,
 Avatar,
 TextField,
 IconButton,
 Paper,
 Chip
} from "@mui/material";

import {
 Send,
 SupportAgent,
 DoneAll,
 Shield
} from "@mui/icons-material";

import {useParams} from "react-router-dom";

import {
 auth,
 db
} from "../services/firebase";

import {
 doc,
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

export default function ChatSeller(){

 const {chatId}=useParams();

 const [chat,setChat]=useState(null);

 const [messages,setMessages]=useState([]);

 const [message,setMessage]=useState("");

 const [adminTyping,setAdminTyping]=useState(false);

 const [sending,setSending]=useState(false);

 const bottomRef=useRef(null);

 /* =========================================================
 LOAD CHAT
========================================================= */

 useEffect(()=>{

  const unsub=onSnapshot(
   doc(db,"adminSellerChats",chatId),
   snap=>{

    if(!snap.exists()) return;

    const data={
     id:snap.id,
     ...snap.data()
    };

    /* =====================================
       SECURITY CHECK
    ===================================== */

    if(
      data.sellerId !== auth.currentUser?.uid
    ){
      return;
    }

    setChat(data);

    setAdminTyping(
     data.adminTyping || false
    );

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
    "adminSellerChats",
    chatId,
    "sellerMessages"
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
 SELLER ONLINE
========================================================= */

 useEffect(()=>{

  const updateOnline=async()=>{

   try{

    await updateDoc(
     doc(db,"adminSellerChats",chatId),
     {
      sellerOnline:true
     }
    );

   }catch(err){

    console.log(err);

   }

  };

  updateOnline();

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
     "adminSellerChats",
     chatId,
     "sellerMessages"
    ),
    {
     text:message,

     senderId:auth.currentUser.uid,

     senderRole:"seller",

     seen:false,

     createdAt:serverTimestamp()
    }
   );

   await updateDoc(
    doc(db,"adminSellerChats",chatId),
    {
     sellerLastMessage:message,

     sellerLastMessageAt:
      serverTimestamp(),

     sellerTyping:false
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
 TYPING
========================================================= */

 const handleTyping=async(e)=>{

  setMessage(e.target.value);

  try{

   await updateDoc(
    doc(db,"adminSellerChats",chatId),
    {
     sellerTyping:true
    }
   );

   setTimeout(async()=>{

    await updateDoc(
     doc(db,"adminSellerChats",chatId),
     {
      sellerTyping:false
     }
    );

   },1000);

  }catch(err){

   console.log(err);

  }

 };

 /* =========================================================
 UI
========================================================= */

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
  sx={{
   width:55,
   height:55,
   background:"rgba(244,180,0,.12)",
   color:GOLD
  }}
 >
  <SupportAgent />
 </Avatar>

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  Admin Support
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:13
  }}
 >
  Seller Assistance & Coordination
 </Typography>

 </Box>

 <Chip
  icon={<Shield />}
  label={
   chat?.adminOnline
    ? "Admin Online"
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
 PRODUCT INFO
===================================================== */}

 {chat && (

 <Paper
  sx={{
   m:2,
   p:2,
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:4
  }}
 >

 <Stack
  direction="row"
  spacing={2}
 >

 <Box
  component="img"
  src={chat.productImage}
  sx={{
   width:85,
   height:85,
   borderRadius:3,
   objectFit:"cover"
  }}
 />

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:16
  }}
 >
  {chat.productTitle}
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:13,
   mt:1
  }}
 >
  Chat directly with marketplace
  admins regarding your listing,
  orders, delivery or buyers.
 </Typography>

 </Box>

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
    msg.senderRole==="seller"
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
    msg.senderRole==="seller"
     ? GOLD
     : CARD,

   color:
    msg.senderRole==="seller"
     ? "#000"
     : "#fff",

   border:
    msg.senderRole==="admin"
     ? `1px solid ${BORDER}`
     : "none"
  }}
 >

 <Typography
  sx={{
   lineHeight:1.5,
   whiteSpace:"pre-wrap"
  }}
 >
  {msg.text}
 </Typography>

 <Stack
  direction="row"
  spacing={.5}
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

 {msg.senderRole==="seller" && (
  <DoneAll sx={{fontSize:15}} />
 )}

 </Stack>

 </Paper>

 </Box>

 ))}

 {adminTyping && (

 <Typography
  sx={{
   color:"#888",
   fontStyle:"italic",
   fontSize:13
  }}
 >
  Admin is typing...
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

  placeholder="Message admin..."

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