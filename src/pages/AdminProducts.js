import React,{useEffect,useMemo,useState} from "react";

import{
 Box,
 Typography,
 Paper,
 Stack,
 Avatar,
 Chip,
 Button,
 TextField,
 InputAdornment,
 Grid,
 Divider,
 CircularProgress
}from "@mui/material";

import{
 Search,
 Visibility,
 VisibilityOff,
 Delete,
 Edit,
 WorkspacePremium,
 Inventory2,
 Storefront,
 LocationOn,
 Phone,
 Refresh,
 CalendarMonth,
 Category,
 Sell
}from "@mui/icons-material";

import{
 collection,
 getDocs,
 query,
 orderBy,
 doc,
 updateDoc,
 deleteDoc
}from "firebase/firestore";

import{useNavigate}from "react-router-dom";

import{db,auth}from "../services/firebase";
import{
 onAuthStateChanged
}from "firebase/auth";

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

export default function AdminProducts(){

 const navigate=useNavigate();

 const[products,setProducts]=useState([]);
 const[loading,setLoading]=useState(true);
 const[search,setSearch]=useState("");

 /* =========================================================
 LOAD PRODUCTS
========================================================= */

 const fetchProducts=async()=>{

  try{

   setLoading(true);

   const q=query(
    collection(db,"products"),
    orderBy("createdAt","desc")
   );

   const snap=await getDocs(q);

   const list=snap.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
   }));

   setProducts(list);

  }catch(err){

   console.log(err);

  }finally{

   setLoading(false);

  }

 };

 useEffect(()=>{
  fetchProducts();
 },[]);

 /* =========================================================
 FILTER
========================================================= */

 const filteredProducts=useMemo(()=>{

  return products.filter(product=>`

   ${product.title}
   ${product.category}
   ${product.location}
   ${product.sellerName}
   ${product.sellerPhone}

  `.toLowerCase().includes(
   search.toLowerCase()
  ));

 },[products,search]);

 /* =========================================================
 TOGGLE VISIBILITY
========================================================= */

 const toggleHide=async(product)=>{

  try{

   await updateDoc(
    doc(db,"products",product.id),
    {
     isActive:!product.isActive
    }
   );

   fetchProducts();

  }catch(err){

   console.log(err);

  }

 };


 /* =========================================================
 PROMOTE
========================================================= */

const togglePromote = async (product) => {

  try {

    const promoted =
      !product.promotion?.promoted;

    await updateDoc(
      doc(db, "products", product.id),
      {

        "promotion.promoted":
          promoted,

        "promotion.promotedAt":
          promoted
            ? new Date()
            : null,

        "promotion.promotionPlan":
          promoted
            ? "daily"
            : "none",

      }
    );

    fetchProducts();

  } catch (err) {

    console.log(err);

  }

};

 /* =========================================================
 STATS
========================================================= */

 const totalProducts=products.length;

 const visibleProducts=
  products.filter(
   x=>x.isActive
  ).length;

 const hiddenProducts=
  products.filter(
   x=>!x.isActive
  ).length;

 const promotedProducts = products.reduce(
  (count, product) =>
    product?.promotion?.promoted === true
      ? count + 1
      : count,
  0
);
 /* =========================================================
 UI
========================================================= */

 return(

 <Box
  sx={{
   background:BG,
   minHeight:"100vh",
   color:"#fff",
   p:{xs:2,md:3}
  }}
 >

 {/* =====================================================
 HEADER
===================================================== */}

 <Stack
  direction={{
   xs:"column",
   md:"row"
  }}
  justifyContent="space-between"
  spacing={2}
  mb={3}
 >

 <Box>

 <Typography
  sx={{
   fontSize:30,
   fontWeight:900
  }}
 >
  Marketplace Products
 </Typography>

 <Typography
  sx={{
   color:"#888",
   mt:.5
  }}
 >
  Oversee, control and manage all marketplace listings
 </Typography>

 </Box>

 <Button
  startIcon={<Refresh />}
  onClick={fetchProducts}
  sx={{
   background:GOLD,
   color:"#000",
   fontWeight:900,
   borderRadius:4,
   height:48,
   px:3,

   "&:hover":{
    background:"#ffd54f"
   }
  }}
 >
  Refresh Products
 </Button>

 </Stack>

 {/* =====================================================
 SEARCH
===================================================== */}

 <TextField
  fullWidth

  placeholder="Search title, seller, phone or location..."

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
   mb:3,

   "& .MuiOutlinedInput-root":{

    background:CARD,
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

 {/* =====================================================
 STATS
===================================================== */}

 <Grid container spacing={2} mb={3}>

 <Grid item xs={6} md={3}>
 <Paper sx={statCard}>
 <Typography sx={statNumber}>
  {totalProducts}
 </Typography>
 <Typography sx={statLabel}>
  Total Products
 </Typography>
 </Paper>
 </Grid>

 <Grid item xs={6} md={3}>
 <Paper sx={statCard}>
 <Typography sx={statNumber}>
  {visibleProducts}
 </Typography>
 <Typography sx={statLabel}>
  Visible Listings
 </Typography>
 </Paper>
 </Grid>

 <Grid item xs={6} md={3}>
 <Paper sx={statCard}>
 <Typography sx={statNumber}>
  {promotedProducts}
 </Typography>
 <Typography sx={statLabel}>
  Promoted Products
 </Typography>
 </Paper>
 </Grid>

 <Grid item xs={6} md={3}>
 <Paper sx={statCard}>
 <Typography sx={statNumber}>
  {hiddenProducts}
 </Typography>
 <Typography sx={statLabel}>
  Hidden Listings
 </Typography>
 </Paper>
 </Grid>

 </Grid>

 {/* =====================================================
 LOADING
===================================================== */}

 {loading && (

 <Box
  sx={{
   display:"flex",
   justifyContent:"center",
   py:8
  }}
 >

 <CircularProgress
  sx={{color:GOLD}}
 />

 </Box>

 )}

 {/* =====================================================
 PRODUCTS
===================================================== */}

 <Stack spacing={2}>

 {filteredProducts.map(product=>(

 <Paper
  key={product.id}
  sx={{
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   overflow:"hidden",
   p:2
  }}
 >

 <Stack
  direction={{
   xs:"column",
   lg:"row"
  }}
  spacing={2}
 >

 {/* =====================================================
 IMAGE
===================================================== */}

 <Avatar
  variant="rounded"

  src={
   product.images?.[0]?.thumb ||
   product.images?.[0]?.full
  }

  sx={{
   width:100,
   height:100,
   borderRadius:4
  }}
 >
  <Inventory2 />
 </Avatar>

 {/* =====================================================
 DETAILS
===================================================== */}

 <Box flex={1}>

 <Stack
  direction={{
   xs:"column",
   md:"row"
  }}
  justifyContent="space-between"
  spacing={2}
  mb={1}
 >

 <Box>

 <Typography
  sx={{
   fontSize:18,
   fontWeight:900
  }}
 >
  {product.title}
 </Typography>

 <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  mt={.5}
 >

 <Sell
  sx={{
   color:GOLD,
   fontSize:18
  }}
 />

 <Typography
  sx={{
   color:GOLD,
   fontWeight:900,
   fontSize:16
  }}
 >
  KES {product.price || 0}
 </Typography>

 </Stack>

 </Box>

 <Stack
  direction="row"
  spacing={1}
  flexWrap="wrap"
 >

 <Chip
  label={
   product.isActive
    ? "Visible"
    : "Hidden"
  }

  color={
   product.isActive
    ? "success"
    : "error"
  }

  sx={{
   fontWeight:800
  }}
 />

 {product.promotion?.promoted && (

 <Chip
  icon={<WorkspacePremium />}
  label="Promoted"

  sx={{
   background:GOLD,
   color:"#000",
   fontWeight:900
  }}
 />

 )}

 </Stack>

 </Stack>

 <Divider
  sx={{
   borderColor:BORDER,
   my:1.5
  }}
 />

 {/* =====================================================
 INFO GRID
===================================================== */}

 <Grid container spacing={2}>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <Storefront sx={iconGold} />
 <Box>
 <Typography sx={label}>
  Seller
 </Typography>
 <Typography sx={value}>
  {product.sellerName || "Unknown"}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <Phone sx={iconGreen} />
 <Box>
 <Typography sx={label}>
  Phone
 </Typography>
 <Typography sx={value}>
  {product.sellerPhone || "N/A"}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <LocationOn sx={iconOrange} />
 <Box>
 <Typography sx={label}>
  Location
 </Typography>
 <Typography sx={value}>
  {product.location || "N/A"}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <Category sx={iconBlue} />
 <Box>
 <Typography sx={label}>
  Category
 </Typography>
 <Typography sx={value}>
  {product.category || "N/A"}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <Inventory2 sx={iconPurple} />
 <Box>
 <Typography sx={label}>
  Stock
 </Typography>
 <Typography sx={value}>
  {product.stock || 0}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 <Grid item xs={12} md={4}>
 <Stack direction="row" spacing={1.2}>
 <CalendarMonth sx={iconPink} />
 <Box>
 <Typography sx={label}>
  Condition
 </Typography>
 <Typography sx={value}>
  {product.condition || "N/A"}
 </Typography>
 </Box>
 </Stack>
 </Grid>

 </Grid>

 {/* =====================================================
 DESCRIPTION
===================================================== */}

 <Divider
  sx={{
   borderColor:BORDER,
   my:1.5
  }}
 />

 <Typography
  sx={{
   color:"#999",
   lineHeight:1.7,
   fontSize:13
  }}
 >
  {product.description ||
   "No description added"}
 </Typography>

 </Box>

 {/* =====================================================
 ACTIONS
===================================================== */}

 <Stack
  spacing={1}
  sx={{
   width:{
    xs:"100%",
    lg:210
   }
  }}
 >

 <Button
  fullWidth
  startIcon={<Edit />}
  onClick={()=>
   navigate(
    `/admin/products/edit/${product.id}`
   )
  }
  sx={goldBtn}
 >
  Edit Product
 </Button>

 <Button
  fullWidth

  startIcon={
   product.isActive
    ? <VisibilityOff />
    : <Visibility />
  }

  onClick={()=>
   toggleHide(product)
  }

  sx={darkBtn}
 >
  {product.isActive
   ? "Hide Product"
   : "Unhide Product"}
 </Button>

 <Button
  fullWidth
  startIcon={<WorkspacePremium />}
  onClick={() =>
    togglePromote(product)
  }
  sx={darkBtn}
>

  {product.promotion?.promoted
    ? "Remove Promotion"
    : "Promote Product"}

 </Button>
 </Stack>
 </Stack>
 </Paper>

 ))}

 </Stack>

 {/* =====================================================
 EMPTY
===================================================== */}

 {!loading &&
  filteredProducts.length===0 && (

 <Paper
  sx={{
   background:CARD,
   border:`1px solid ${BORDER}`,
   borderRadius:5,
   p:6,
   mt:2,
   textAlign:"center"
  }}
 >

 <Inventory2
  sx={{
   fontSize:60,
   color:GOLD,
   mb:2
  }}
 />

 <Typography
  sx={{
   fontSize:22,
   fontWeight:900
  }}
 >
  No Products Found
 </Typography>

 <Typography
  sx={{
   color:"#888",
   mt:1
  }}
 >
  Marketplace listings will appear here
 </Typography>

 </Paper>

 )}

 </Box>

 );

}

/* =========================================================
STYLES
========================================================= */

const statCard={
 background:"#101010",
 border:"1px solid #232323",
 borderRadius:"18px",
 padding:"20px",
 color:"#fff"
};

const statNumber={
 fontSize:28,
 fontWeight:900,
 color:"#F4B400"
};

const statLabel={
 color:"#888",
 marginTop:"6px"
};

const label={
 fontSize:12,
 color:"#777"
};

const value={
 fontSize:14,
 fontWeight:800,
 color:"#fff"
};

const iconGold={
 color:"#F4B400",
 fontSize:19
};

const iconGreen={
 color:"#4caf50",
 fontSize:19
};

const iconOrange={
 color:"#ff7043",
 fontSize:19
};

const iconBlue={
 color:"#42a5f5",
 fontSize:19
};

const iconPurple={
 color:"#ab47bc",
 fontSize:19
};

const iconPink={
 color:"#ec407a",
 fontSize:19
};

const goldBtn={
 background:"#F4B400",
 color:"#000",
 fontWeight:900,
 borderRadius:3,
 height:44,

 "&:hover":{
  background:"#ffd54f"
 }
};

const darkBtn={
 border:"1px solid #232323",
 color:"#fff",
 fontWeight:700,
 borderRadius:3,
 height:44
};

