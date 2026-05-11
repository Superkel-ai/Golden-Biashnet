import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Stack,
  Chip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import VerifiedIcon from "@mui/icons-material/Verified";

import { useNavigate } from "react-router-dom";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";
const CARD = "#111";
const BORDER = "#222";

export default function Profile() {

  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  const [loading,setLoading] = useState(true);
  const [editing,setEditing] = useState(false);

  const [tab,setTab] = useState(0);

  const [user,setUser] = useState(null);

  const [form,setForm] = useState({
    name:"",
    phone:"",
    location:"",
    bio:"",
    instagram:"",
    twitter:"",
    website:""
  });

  // ==============================
  // LOAD USER
  // ==============================

  const loadUser = async () => {

    try{

      const ref = doc(db,"users",userId);
      const snap = await getDoc(ref);

      if(snap.exists()){

        const data = snap.data();

        setUser(data);

        setForm({
          name:data.name || "",
          phone:data.phone || "",
          location:data.location || "",
          bio:data.bio || "",
          instagram:data.instagram || "",
          twitter:data.twitter || "",
          website:data.website || ""
        });

      }

    }catch(err){
      console.error(err);
    }

    setLoading(false);

  };

  useEffect(()=>{
    if(!userId){
      navigate("/login");
      return;
    }

    loadUser();
  },[]);


  // ==============================
  // SAVE PROFILE
  // ==============================

  const saveProfile = async ()=>{

    try{

      await updateDoc(doc(db,"users",userId),{
        ...form,
        updatedAt:new Date()
      });

      setEditing(false);

      loadUser();

    }catch(err){
      console.error(err);
    }

  };


  if(loading){
    return(
      <Box sx={{display:"flex",justifyContent:"center",mt:10}}>
        <CircularProgress/>
      </Box>
    )
  }

  return(

  <Box sx={{background:"#000",minHeight:"100vh",color:"#fff"}}>

  <Container maxWidth="lg" sx={{py:4}}>

  {/* ================= HEADER ================= */}

  <Card sx={{background:CARD,border:`1px solid ${BORDER}`,mb:4}}>

  <CardContent>

  <Grid container spacing={3} alignItems="center">

  <Grid item>

  <Avatar
  src={user?.photoURL}
  sx={{width:90,height:90}}
  >
  {user?.name?.[0]}
  </Avatar>

  </Grid>

  <Grid item xs>

  {editing ? (

  <Stack spacing={2}>

  <TextField
  label="Name"
  value={form.name}
  onChange={(e)=>setForm({...form,name:e.target.value})}
  fullWidth
  />

  <TextField
  label="Phone"
  value={form.phone}
  onChange={(e)=>setForm({...form,phone:e.target.value})}
  fullWidth
  />

  <TextField
  label="Location"
  value={form.location}
  onChange={(e)=>setForm({...form,location:e.target.value})}
  fullWidth
  />

  </Stack>

  ):(

  <>

  <Stack direction="row" spacing={1} alignItems="center">

  <Typography variant="h5">

  {user?.name}

  </Typography>

  {user?.verified && (
  <VerifiedIcon sx={{color:GOLD}}/>
  )}

  </Stack>

  <Typography color="gray">

  {user?.email}

  </Typography>

  <Typography color="gray">

  {user?.location}

  </Typography>

  </>

  )}

  </Grid>

  <Grid item>

  {editing ? (

  <Button
  startIcon={<SaveIcon/>}
  variant="contained"
  onClick={saveProfile}
  sx={{background:GOLD,color:"#000"}}
  >
  Save
  </Button>

  ):(

  <Button
  startIcon={<EditIcon/>}
  variant="outlined"
  onClick={()=>setEditing(true)}
  sx={{borderColor:GOLD,color:GOLD}}
  >
  Edit Profile
  </Button>

  )}

  </Grid>

  </Grid>

  </CardContent>

  </Card>


  {/* ================= SELLER PORTFOLIO ================= */}

  <Card sx={{background:CARD,border:`1px solid ${BORDER}`,mb:4}}>

  <CardContent>

  <Typography variant="h6" mb={2}>

  Seller Portfolio

  </Typography>

  {editing ? (

  <Stack spacing={2}>

  <TextField
  label="About You"
  multiline
  rows={3}
  value={form.bio}
  onChange={(e)=>setForm({...form,bio:e.target.value})}
  />

  <TextField
  label="Instagram"
  value={form.instagram}
  onChange={(e)=>setForm({...form,instagram:e.target.value})}
  />

  <TextField
  label="Twitter"
  value={form.twitter}
  onChange={(e)=>setForm({...form,twitter:e.target.value})}
  />

  <TextField
  label="Website"
  value={form.website}
  onChange={(e)=>setForm({...form,website:e.target.value})}
  />

  </Stack>

  ):(

  <>

  <Typography color="gray" mb={2}>

  {user?.bio || "No description yet"}

  </Typography>

  <Stack direction="row" spacing={1} flexWrap="wrap">

  {user?.roles?.seller && (
  <Chip label="Seller" sx={{background:GOLD,color:"#000"}}/>
  )}

  {user?.roles?.buyer && (
  <Chip label="Buyer"/>
  )}

  {user?.sellerVerified && (
  <Chip label="Verified Seller" color="success"/>
  )}

  </Stack>

  </>

  )}

  </CardContent>

  </Card>


  {/* ================= SELLER STATS ================= */}

  <Grid container spacing={3} mb={4}>

  <Grid item xs={6} md={3}>

  <Card sx={{background:CARD}}>
  <CardContent>

  <Typography color="gray">
  Listings
  </Typography>

  <Typography variant="h6">
  {user?.listingsCount || 0}
  </Typography>

  </CardContent>
  </Card>

  </Grid>

  <Grid item xs={6} md={3}>

  <Card sx={{background:CARD}}>
  <CardContent>

  <Typography color="gray">
  Orders
  </Typography>

  <Typography variant="h6">
  {user?.ordersCount || 0}
  </Typography>

  </CardContent>
  </Card>

  </Grid>

  <Grid item xs={6} md={3}>

  <Card sx={{background:CARD}}>
  <CardContent>

  <Typography color="gray">
  Completed
  </Typography>

  <Typography variant="h6">
  {user?.completedOrders || 0}
  </Typography>

  </CardContent>
  </Card>

  </Grid>

  <Grid item xs={6} md={3}>

  <Card sx={{background:CARD}}>
  <CardContent>

  <Typography color="gray">
  Rating
  </Typography>

  <Rating value={user?.sellerRating || 0} readOnly/>

  </CardContent>
  </Card>

  </Grid>

  </Grid>


  {/* ================= DASHBOARD ================= */}

  <Card sx={{background:CARD,border:`1px solid ${BORDER}`}}>

  <CardContent>

  <Typography variant="h6" mb={2}>
  Dashboard
  </Typography>

  <Grid container spacing={2}>

  <Grid item xs={6} md={3}>

  <Button
  fullWidth
  variant="contained"
  onClick={()=>navigate("/my-uploads")}
  sx={{background:GOLD,color:"#000"}}
  >
  My Uploads
  </Button>

  </Grid>

  <Grid item xs={6} md={3}>

  <Button
  fullWidth
  variant="outlined"
  onClick={()=>navigate("/seller-orders")}
  sx={{borderColor:GOLD,color:GOLD}}
  >
  Customer Orders
  </Button>

  </Grid>

  <Grid item xs={6} md={3}>

  <Button
  fullWidth
  variant="outlined"
  onClick={()=>navigate("/my-orders")}
  sx={{borderColor:GOLD,color:GOLD}}
  >
  My Purchases
  </Button>

  </Grid>

  <Grid item xs={6} md={3}>

  <Button
  fullWidth
  variant="outlined"
  onClick={()=>navigate("/lend")}
  sx={{borderColor:GOLD,color:GOLD}}
  >
  Lend
  </Button>

  </Grid>

  </Grid>

  </CardContent>

  </Card>


  </Container>

  </Box>

  );

}