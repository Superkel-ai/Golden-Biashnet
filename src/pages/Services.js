// src/pages/Services.js

import React,
{
 useEffect,
 useState,
 useMemo
}
from "react";

import {

 Box,
 Typography,
 CircularProgress,
 TextField,
 InputAdornment,
 IconButton,
 Chip,
 Avatar,
 Badge,
 Fab

} from "@mui/material";

import {

 Search,
 Campaign,
 Home,
 ShoppingCart,
 Verified,
 Star,
 Bolt,
 TrendingUp,
 Add,
 Shield,
 LocationOn,
 Share,
 FavoriteBorder

} from "@mui/icons-material";

import { useNavigate }
from "react-router-dom";

import {

 collection,
 getDocs,
 query,
 where,
 orderBy,
 limit

} from "firebase/firestore";

import { db }
from "../services/firebase";

/* =========================================================
THEME
========================================================= */

const GOLD = "#F4B400";

const BG = "#050505";

const CARD = "#111111";

const BORDER = "#232323";

const TEXT = "#ffffff";

const SUB = "#aaaaaa";

/* =========================================================
HELPERS
========================================================= */

const formatPrice=(price)=>{

 if(!price) return "Contact";

 return `KES ${Number(
  price
 ).toLocaleString()}`;

};

const getImage=(service)=>{

 return(
  service.images?.[0]?.thumb ||
  service.images?.[0]?.full ||
  service.images?.[0] ||
  ""
 );

};

const getCategoryEmoji=(cat)=>{

 switch(cat){

  case "Cleaning":
   return "🧹";

  case "Beauty":
   return "💄";

  case "Photography":
   return "📸";

  case "Repair":
   return "🔧";

  case "Tutoring":
   return "📚";

  case "Delivery":
   return "🛵";

  case "Design":
   return "🎨";

  default:
   return "✨";

 }

};

/* =========================================================
SERVICE CARD
========================================================= */

const ServiceCard=({service})=>{

 const navigate=useNavigate();

 const image=getImage(service);

 return(

  <Box

   onClick={()=>
    navigate(
     `/post/service/${service.id}`
    )
   }

   sx={{

    position:"relative",

    overflow:"hidden",

    borderRadius:4,

    background:
     "linear-gradient(180deg,#161616,#101010)",

    border:
     "1px solid rgba(255,255,255,.06)",

    transition:"all .25s ease",

    cursor:"pointer",

    "&:hover":{

     transform:
      "translateY(-4px) scale(1.02)",

     borderColor:GOLD

    }

   }}
  >

   {/* =====================================================
      IMAGE
   ===================================================== */}

   <Box
    sx={{
     position:"relative",
     aspectRatio:"1/1"
    }}
   >

    <Box

     component="img"

     src={image}

     alt={service.title}

     sx={{

      width:"100%",
      height:"100%",

      objectFit:"cover"

     }}
    />

    {/* =====================================================
       OVERLAY
    ===================================================== */}

    <Box
     sx={{

      position:"absolute",

      inset:0,

      background:
       "linear-gradient(transparent,rgba(0,0,0,.88))"

     }}
    />

    {/* =====================================================
       TOP BADGES
    ===================================================== */}

    <Box
     sx={{

      position:"absolute",
      top:8,
      left:8,

      display:"flex",
      gap:.5,
      flexWrap:"wrap"

     }}
    >

     {service?.promotion?.promoted && (

      <Chip
       icon={
        <Bolt
         sx={{
          fontSize:"14px !important"
         }}
        />
       }
       label="Boosted"
       size="small"
       sx={{

        background:GOLD,
        color:"#000",

        fontWeight:900,

        height:22,

        fontSize:10

       }}
      />

     )}

     {service.verified && (

      <Chip
       icon={
        <Verified
         sx={{
          fontSize:"14px !important"
         }}
        />
       }
       label="Verified"
       size="small"
       sx={{

        background:"#1b5e20",
        color:"#fff",

        fontWeight:700,

        height:22,

        fontSize:10

       }}
      />

     )}

    </Box>

    {/* =====================================================
       TRUST SCORE
    ===================================================== */}

    <Box
     sx={{

      position:"absolute",

      top:8,
      right:8,

      background:
       "rgba(0,0,0,.7)",

      borderRadius:10,

      px:1,
      py:.3,

      display:"flex",
      alignItems:"center",
      gap:.3

     }}
    >

     <Star
      sx={{
       color:"#FFD700",
       fontSize:14
      }}
     />

     <Typography
      sx={{
       color:"#fff",
       fontSize:10,
       fontWeight:700
      }}
     >
      {service.trustScore || 92}%
     </Typography>

    </Box>

    {/* =====================================================
       BOTTOM INFO
    ===================================================== */}

    <Box
     sx={{

      position:"absolute",

      left:0,
      right:0,
      bottom:0,

      p:1

     }}
    >

     <Typography
      sx={{

       color:"#fff",

       fontWeight:800,

       fontSize:12,

       overflow:"hidden",

       display:"-webkit-box",

       WebkitLineClamp:2,

       WebkitBoxOrient:"vertical"

      }}
     >
      {service.title}
     </Typography>

     <Typography
      sx={{
       color:GOLD,
       fontWeight:900,
       fontSize:13,
       mt:.5
      }}
     >
      {formatPrice(service.price)}
     </Typography>

    </Box>

   </Box>

   {/* =====================================================
      CONTENT
   ===================================================== */}

   <Box sx={{p:1}}>

    {/* CATEGORY */}

    <Typography
     sx={{
      color:"#aaa",
      fontSize:10
     }}
    >
      {getCategoryEmoji(
       service.category
      )}

      {" "}

      {service.category}
    </Typography>

    {/* LOCATION */}

    <Box
     sx={{
      display:"flex",
      alignItems:"center",
      gap:.4,
      mt:.5
     }}
    >

     <LocationOn
      sx={{
       fontSize:12,
       color:"#777"
      }}
     />

     <Typography
      sx={{
       color:"#888",
       fontSize:10
      }}
     >
      {service.location || "Kenya"}
     </Typography>

    </Box>

    {/* STATUS */}

    <Box
     sx={{
      display:"flex",
      gap:.5,
      flexWrap:"wrap",
      mt:1
     }}
    >

     <Chip
      label="Admin Protected"
      size="small"
      sx={{

       background:"#0f172a",

       color:"#38bdf8",

       fontSize:9,

       height:20

      }}
     />

     <Chip
      label="Fast Response"
      size="small"
      sx={{

       background:"#1a1a1a",

       color:"#4ade80",

       fontSize:9,

       height:20

      }}
     />

    </Box>

   </Box>

  </Box>

 );

};

/* =========================================================
COMPONENT
========================================================= */

export default function ServicesPage(){

 const navigate=useNavigate();

 const [services,setServices]=
  useState([]);

 const [filtered,setFiltered]=
  useState([]);

 const [categories,setCategories]=
  useState([]);

 const [loading,setLoading]=
  useState(true);

 const [search,setSearch]=
  useState("");

 const [
  selectedCategory,
  setSelectedCategory
 ]=useState("All");

/* =========================================================
FETCH SERVICES
========================================================= */

 useEffect(()=>{

  const fetchServices=async()=>{

   try{

    const q=query(

     collection(db,"services"),

     where(
      "status",
      "==",
      "active"
     ),

     orderBy(
      "createdAt",
      "desc"
     ),

     limit(100)

    );

    const snap=
     await getDocs(q);

    let data=snap.docs.map(doc=>({

     id:doc.id,

     ...doc.data()

    }));

    /* =======================================
       SMART SORT
    ======================================= */

    data=data.sort((a,b)=>{

     const scoreA=
      (a?.promotion?.promoted ? 50 : 0)+
      (a.verified ? 20 : 0)+
      (a.trustScore || 0);

     const scoreB=
      (b?.promotion?.promoted ? 50 : 0)+
      (b.verified ? 20 : 0)+
      (b.trustScore || 0);

     return scoreB-scoreA;

    });

    setServices(data);

    setFiltered(data);

    const cats=[

     "All",

     ...new Set(
      data.map(
       s=>s.category || "Other"
      )
     )

    ];

    setCategories(cats);

   }catch(err){

    console.log(err);

   }finally{

    setLoading(false);

   }

  };

  fetchServices();

 },[]);

/* =========================================================
FILTER
========================================================= */

 useEffect(()=>{

  let result=[...services];

  if(selectedCategory!=="All"){

   result=result.filter(

    s=>
     s.category ===
     selectedCategory

   );

  }

  if(search){

   result=result.filter(s=>

    s.title
    ?.toLowerCase()
    ?.includes(
      search.toLowerCase()
    )

   );

  }

  setFiltered(result);

 },[
  search,
  selectedCategory,
  services
 ]);

/* =========================================================
AUTO SHUFFLE
========================================================= */

 useEffect(()=>{

  if(filtered.length < 6) return;

  const interval=setInterval(()=>{

   setFiltered(prev=>

    [...prev].sort(
     ()=>Math.random()-0.5
    )

   );

  },8000);

  return()=>clearInterval(interval);

 },[filtered.length]);

/* =========================================================
LOADING
========================================================= */

 if(loading){

  return(

   <Box
    sx={{

     minHeight:"60vh",

     display:"flex",

     justifyContent:"center",

     alignItems:"center",

     background:BG

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

/* =========================================================
UI
========================================================= */

 return(

  <Box
   sx={{
    background:BG,
    minHeight:"100vh",
    pb:10
   }}
  >

   {/* =====================================================
      HERO
   ===================================================== */}

   <Box
    sx={{

     mx:1.2,
     mt:2,

     p:2,

     borderRadius:5,

     background:
      "linear-gradient(135deg,#F4B400,#ff9800)",

     color:"#000"

    }}
   >

    <Typography
     sx={{
      fontWeight:900,
      fontSize:22
     }}
    >
     Find Trusted Services
    </Typography>

    <Typography
     sx={{
      fontSize:12,
      mt:.5
     }}
    >
     Discover skilled professionals,
     home services, repairs,
     beauty, tutoring and more.
    </Typography>

    {/* STATS */}

    <Box
     sx={{
      display:"flex",
      gap:2,
      mt:2
     }}
    >

     <Box>

      <Typography
       sx={{
        fontWeight:900,
        fontSize:18
       }}
      >
       {services.length}+
      </Typography>

      <Typography
       sx={{
        fontSize:10
       }}
      >
       Services
      </Typography>

     </Box>

     <Box>

      <Typography
       sx={{
        fontWeight:900,
        fontSize:18
       }}
      >
       Trusted
      </Typography>

      <Typography
       sx={{
        fontSize:10
       }}
      >
       Admin Protected
      </Typography>

     </Box>

    </Box>

   </Box>

   {/* =====================================================
      SEARCH
   ===================================================== */}

   <Box sx={{px:1.2,mt:2}}>

    <TextField

     fullWidth

     placeholder=
      "Search services..."

     value={search}

     onChange={(e)=>
      setSearch(
       e.target.value
      )
     }

     InputProps={{

      startAdornment:(

       <InputAdornment
        position="start"
       >

        <Search
         sx={{
          color:GOLD
         }}
        />

       </InputAdornment>

      ),

      sx:{

       background:"#161616",

       borderRadius:4,

       color:"#fff"

      }

     }}
    />

   </Box>

   {/* =====================================================
      CATEGORY BAR
   ===================================================== */}

   <Box
    sx={{

     display:"flex",

     gap:1,

     overflowX:"auto",

     px:1,
     py:2,

     "&::-webkit-scrollbar":{
      display:"none"
     }

    }}
   >

    {categories.map(cat=>(

     <Box

      key={cat}

      onClick={()=>
       setSelectedCategory(cat)
      }

      sx={{

       px:2,
       py:.8,

       borderRadius:20,

       background:
        selectedCategory===cat
        ? GOLD
        : "#1a1a1a",

       color:
        selectedCategory===cat
        ? "#000"
        : "#fff",

       fontSize:12,

       fontWeight:700,

       whiteSpace:"nowrap",

       cursor:"pointer"

      }}
     >
      {cat}
     </Box>

    ))}

   </Box>

   {/* =====================================================
      GRID
   ===================================================== */}

   <Box
    sx={{

     display:"grid",

     gridTemplateColumns:{

      xs:"repeat(2,1fr)",

      sm:"repeat(3,1fr)",

      md:"repeat(4,1fr)"

     },

     gap:1,

     px:1

    }}
   >

    {filtered.length > 0 ? (

     filtered.map(service=>(

      <ServiceCard
       key={service.id}
       service={service}
      />

     ))

    ) : (

     <Box
      sx={{
       py:8
      }}
     >

      <Typography
       sx={{
        color:"#fff",
        fontWeight:800
       }}
      >
       No services found
      </Typography>

      <Typography
       sx={{
        color:"#777",
        fontSize:12,
        mt:1
       }}
      >
       Be the first to post
       your services on
       Golden Biashnet.
      </Typography>

     </Box>

    )}

   </Box>

   {/* =====================================================
      FLOATING BUTTON
   ===================================================== */}

   <Fab

    onClick={()=>
     navigate("/uploads")
    }

    sx={{

     position:"fixed",

     bottom:85,

     right:16,

     background:GOLD,

     color:"#000"

    }}
   >

    <Add />

   </Fab>

  </Box>

 );

}