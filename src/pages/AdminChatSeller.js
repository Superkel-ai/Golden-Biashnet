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
 Storefront,
 WhatsApp,
 Phone,
  Sms,
 DoneAll,
 Shield
} from "@mui/icons-material";

import {useParams} from "react-router-dom";

import {
 db,
 auth
} from "../services/firebase";

import {
 doc,
 getDoc,
 setDoc,
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

export default function AdminChatSeller(){

 const {chatId}=useParams();

 const [chat,setChat]=useState(null);

 const [seller,setSeller]=useState(null);

 const [messages,setMessages]=useState([]);

 const [message,setMessage]=useState("");

 const [sellerTyping,setSellerTyping]=useState(false);

 const [sending,setSending]=useState(false);

 const bottomRef=useRef(null);

 /* =========================================================
 LOAD CHAT
 ========================================================= */

 useEffect(()=>{

  const unsub=onSnapshot(
   doc(db,"adminSellerChats",chatId),
   async(snap)=>{

    if(!snap.exists()) return;

    const data={
     id:snap.id,
     ...snap.data()
    };

    setChat(data);

    setSellerTyping(
     data?.sellerTyping || false
    );

    /* ======================================
       LOAD SELLER
    ====================================== */

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
 ADMIN ONLINE
 ========================================================= */

 useEffect(()=>{

  const updateOnline=async()=>{

   try{

    await updateDoc(
     doc(db,"adminSellerChats",chatId),
     {
      adminOnline:true
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

     senderRole:"admin",

     seen:true,

     createdAt:serverTimestamp()
    }
   );

   await updateDoc(
    doc(db,"adminSellerChats",chatId),
    {
     sellerLastMessage:message,

     sellerLastMessageAt:
      serverTimestamp(),

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
 TYPING
 ========================================================= */

 const handleTyping=async(e)=>{

  setMessage(e.target.value);

  try{

   await updateDoc(
    doc(db,"adminSellerChats",chatId),
    {
     adminTyping:true
    }
   );

   setTimeout(async()=>{

    await updateDoc(
     doc(db,"adminSellerChats",chatId),
     {
      adminTyping:false
     }
    );

   },1000);

  }catch(err){

   console.log(err);

  }

 };

/* =========================================================
 FORMAT PHONE
 Converts:
 0712345678 -> 254712345678
 +254712345678 -> 254712345678
 254712345678 -> 254712345678
 ========================================================= */

const formattedPhone = seller?.phone
 ? seller.phone
    .replace(/\s/g,"")
    .replace("+","")
    .replace(/^0/,"254")
 : "";

/* =========================================================
 WHATSAPP LINK
 ========================================================= */

const whatsappLink =
 formattedPhone
  ? `https://wa.me/${formattedPhone}`
  : "#";

/* =========================================================
 CALL LINK
 ========================================================= */

const callLink =
 formattedPhone
  ? `tel:+${formattedPhone}`
  : "#";

/* =========================================================
 SMS LINK
 ========================================================= */

const smsLink =
 formattedPhone
  ? `sms:+${formattedPhone}`
  : "#";
 /* =========================================================
 UI
 ========================================================= */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
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
   width:58,
   height:58,
   background:"rgba(244,180,0,.12)",
   color:GOLD
  }}
 >
  <Storefront />
 </Avatar>

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:18
  }}
 >
  Seller Coordination
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:13
  }}
 >
  {seller?.fullName ||
   seller?.name ||
   "Seller"}
 </Typography>

 </Box>

 <Chip
  icon={<Shield />}
  label="Protected"
  sx={{
   background:"rgba(244,180,0,.12)",
   color:GOLD,
   border:`1px solid ${GOLD}`
  }}
 />

 </Stack>

 {/* =====================================================
 ACTIONS
 ===================================================== */}

 <Stack
  direction="row"
  spacing={1.5}
  mt={2}
 >

<Button
 fullWidth
 href={whatsappLink}
 target="_blank"
 startIcon={<WhatsApp />}
 sx={{
  background:"#25D366",
  color:"#000",
  fontWeight:800,
  borderRadius:3,
  height:45
 }}
>
 WhatsApp Seller
</Button>

<Button
 fullWidth
 href={callLink}
 startIcon={<Phone />}
 sx={{
  background:GOLD,
  color:"#000",
  fontWeight:800,
  borderRadius:3,
  height:45
 }}
>
 Call Seller
</Button>

<Button
 fullWidth
 href={smsLink}
 startIcon={<Sms />}
 sx={{
  border:`1px solid ${GOLD}`,
  color:GOLD,
  fontWeight:800,
  borderRadius:3,
  height:45
 }}
>
 SMS Seller
</Button>

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
   borderRadius:5
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
   width:95,
   height:95,
   borderRadius:3,
   objectFit:"cover"
  }}
 />

 <Box flex={1}>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:17
  }}
 >
  {chat.productTitle}
 </Typography>

 <Typography
  sx={{
   color:GOLD,
   fontWeight:800,
   mt:.5
  }}
 >
  KSh {chat.price || "N/A"}
 </Typography>

 <Typography
  sx={{
   color:"#aaa",
   fontSize:13,
   mt:1
  }}
 >
  {chat.description ||
   "No description added"}
 </Typography>

 <Divider
  sx={{
   borderColor:BORDER,
   my:1.5
  }}
 />

 <Stack
  direction="row"
  spacing={2}
  flexWrap="wrap"
 >

 <Typography
  sx={{
   color:"#888",
   fontSize:12
  }}
 >
  Seller:
  {" "}
  {seller?.fullName ||
   seller?.name ||
   "Seller"}
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:12
  }}
 >
  Phone:
  {" "}
  {seller?.phone || "N/A"}
 </Typography>

 <Typography
  sx={{
   color:"#888",
   fontSize:12
  }}
 >
  Location:
  {" "}
  {seller?.location || "N/A"}
 </Typography>

 </Stack>

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
     ? GOLD
     : CARD,

   color:
    msg.senderRole==="admin"
     ? "#000"
     : "#fff",

   border:
    msg.senderRole==="seller"
     ? `1px solid ${BORDER}`
     : "none"
  }}
 >

 <Typography
  sx={{
   whiteSpace:"pre-wrap",
   lineHeight:1.5
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

 {msg.senderRole==="admin" && (
  <DoneAll sx={{fontSize:15}} />
 )}

 </Stack>

 </Paper>

 </Box>

 ))}

 {sellerTyping && (

 <Typography
  sx={{
   color:"#888",
   fontStyle:"italic",
   fontSize:13
  }}
 >
  Seller is typing...
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

 <Stack direction="row" spacing={1}>

 <TextField
  fullWidth

  placeholder="Message seller..."

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