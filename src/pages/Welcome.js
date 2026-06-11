import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
  Fade,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BuildIcon from "@mui/icons-material/Build";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CampaignIcon from "@mui/icons-material/Campaign";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedIcon from "@mui/icons-material/Verified";
import BoltIcon from "@mui/icons-material/Bolt";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatIcon from "@mui/icons-material/Chat";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";


import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";

/* =========================================================
THEME
========================================================= */

const GOLD = "#fad60b";
const BG = "#050505";
const CARD = "#111111";
const BORDER = "rgba(255,255,255,0.08)";

/* =========================================================
SEARCH STYLES
========================================================= */

const searchStyles={

 "& .MuiOutlinedInput-root":{

  background:"#111",
  color:"#fff",

  borderRadius:4,

  transition:"0.2s",

  "& fieldset":{
   border:"1px solid rgba(255,255,255,.06)"
  },

  "&:hover fieldset":{
   border:"1px solid rgba(250,214,11,.4)"
  },

  "&.Mui-focused fieldset":{
   border:"1px solid #fad60b"
  }

 },

 "& input::placeholder":{
  color:"#777",
  opacity:1
 }

};

/* =========================================================
WELCOME PAGE
========================================================= */

export default function Welcome() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoted,setPromoted]=useState([]);
  const promotedRef = useRef(null);
  const [latestProducts,setLatestProducts]=useState([]);
  
const [deferredPrompt, setDeferredPrompt] =
  useState(null);

const [installing, setInstalling] =
  useState(false);

const [isInstalled, setIsInstalled] =
  useState(false);

const [installSupported, setInstallSupported] =
  useState(false);
  const scrollRef = useRef(null);

  /* =========================================================
ROUTE MAP
========================================================= */

  const routeMap = {
    products: "product",
    services: "service",
    houses: "house",
    adverts: "advert",
  };

  /* =========================================================
COLORS
========================================================= */

  const typeColors = {
    products: "#ffa726",
    services: "#66bb6a",
    houses: "#29b6f6",
    adverts: "#ef5350",
  };

  /* =========================================================
QUICK ACTIONS
========================================================= */

  const actions = useMemo(
    () => [
      {
        title: "Shop",
        icon: <StorefrontIcon />,
        route: "/product",
      },
      {
        title: "Sell",
        icon: <WorkIcon />,
        route: "/uploads",
      },
      {
        title: "Houses",
        icon: <HomeIcon />,
        route: "/houses",
      },
      {
        title: "Services",
        icon: <BuildIcon />,
        route: "/services",
      },
      {
        title: "Chat",
        icon: <ChatIcon />,
        route: "#",
        onClick: () =>
          window.open(
            "https://chat.whatsapp.com/DEzMlxeMpeh3weXBLhwiWh?mode=gi_t",
            "_blank"
          ),
      },
    ],
    []
  );

  /* =========================================================
SHUFFLE
========================================================= */

  const shuffleArray = (array) => {
    return array
      .map((item) => ({
        sort: Math.random(),
        value: item,
      }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => item.value);
  };

  /* =========================================================
FETCH POSTS (UPGRADED WITH ERROR HANDLING)
========================================================= */

useEffect(() => {
  setLoading(true);

  const collectionsList = ["products", "services", "houses", "adverts"];
  let allData = [];

  const unsubscribers = collectionsList.map((col) => {
    const q = query(
      collection(db, col),
      where("status", "in", ["active", "approved"]),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // Added error handling block to isolate index issues
    return onSnapshot(q, 
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          type: col,
          ...doc.data(),
        }));

        allData = [
          ...allData.filter((d) => d.type !== col),
          ...data,
        ];

        const sorted = allData.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        const shuffled = shuffleArray(sorted);
        setPosts(shuffled.slice(0, 20));
        setLoading(false);
      },
      (error) => {
        console.error(`Index missing or permission denied for collection: ${col}`, error);
        // This will print the exact link you need to click to fix the index!
      }
    );
  });

  return () => unsubscribers.forEach((unsub) => unsub());
}, []);

/* =========================================================
PROMOTED PRODUCTS (UPGRADED)
========================================================= */
useEffect(() => {
  const q = query(
    collection(db, "products"),
    where("promotion.promoted", "==", true),
    where("status", "in", ["active", "approved"]),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const unsub = onSnapshot(q, 
    (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const shuffled = data
        .map(item => ({ sort: Math.random(), value: item }))
        .sort((a, b) => a.sort - b.sort)
        .map(item => item.value);

      setPromoted(shuffled);
    },
    (error) => {
      console.error("Index missing or permission denied for Promoted Products:", error);
    }
  );

  return () => unsub();
}, []);

/* =========================================================
FETCH LATEST PRODUCTS (UPGRADED)
========================================================= */
useEffect(() => {
  const q = query(
    collection(db, "products"),
    where("status", "in", ["active", "approved"]),
    where("latest.active", "==", true),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = data.filter((item) => {
        if (!item?.latest?.expiresAt) return true;

        const expiry = item.latest.expiresAt.seconds * 1000;
        return expiry > Date.now();
      });

      const shuffled = filtered
        .map((item) => ({ sort: Math.random(), value: item }))
        .sort((a, b) => a.sort - b.sort)
        .map((item) => item.value);

      setLatestProducts(shuffled);
    },
    (error) => {
      console.error("Index missing or permission denied for Latest Products:", error);
    }
  );

  return () => unsub();
}, []);

/* =========================================================
AUTO HORIZONTAL SCROLL
========================================================= */

useEffect(() => {

  const container = promotedRef.current;

  if (!container) return;

  let isUserInteracting = false;

  let direction = 1;
  // 1 = right
  // -1 = left

  /* =====================================================
     USER INTERACTION
  ===================================================== */

  const startInteraction = () => {

    isUserInteracting = true;

  };

  const stopInteraction = () => {

    setTimeout(() => {

      isUserInteracting = false;

    }, 1800);

  };

  container.addEventListener(
    "touchstart",
    startInteraction
  );

  container.addEventListener(
    "mousedown",
    startInteraction
  );

  container.addEventListener(
    "touchend",
    stopInteraction
  );

  container.addEventListener(
    "mouseup",
    stopInteraction
  );

  /* =====================================================
     AUTO MOVE
  ===================================================== */

  const interval = setInterval(() => {

    if (isUserInteracting) return;

    /* ===============================================
       SPEED
    =============================================== */

    container.scrollLeft += direction * 2.2;

    /* ===============================================
       REACH END
    =============================================== */

    const reachedEnd =

      container.scrollLeft + container.clientWidth >=
      container.scrollWidth - 3;

    /* ===============================================
       REACH START
    =============================================== */

    const reachedStart =
      container.scrollLeft <= 0;

    /* ===============================================
       CHANGE DIRECTION
    =============================================== */

    if (reachedEnd) {

      direction = -1;

    }

    if (reachedStart) {

      direction = 1;

    }

  }, 14);

  /* =====================================================
     CLEANUP
  ===================================================== */

  return () => {

    clearInterval(interval);

    container.removeEventListener(
      "touchstart",
      startInteraction
    );

    container.removeEventListener(
      "mousedown",
      startInteraction
    );

    container.removeEventListener(
      "touchend",
      stopInteraction
    );

    container.removeEventListener(
      "mouseup",
      stopInteraction
    );

  };

}, []);

  /* =========================================================
AUTO SCROLL
========================================================= */

  useEffect(() => {
    if (!posts.length) return;

    const container = scrollRef.current;

    if (!container) return;

    let direction = 1;

    const interval = setInterval(() => {
      const maxScroll =
        container.scrollWidth -
        container.clientWidth;

      if (
        container.scrollLeft >=
        maxScroll - 5
      ) {
        direction = -1;
      }

      if (container.scrollLeft <= 5) {
        direction = 1;
      }

      container.scrollBy({
        left: 140 * direction,
        behavior: "smooth",
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [posts]);

  /* =========================================================
PWA INSTALL
========================================================= */
useEffect(() => {

  /* =====================================
     CHECK IF ALREADY INSTALLED
  ===================================== */

  const installed =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    window.navigator.standalone;

  if (installed) {
    setIsInstalled(true);
  }

  /* =====================================
     INSTALL PROMPT
  ===================================== */

  const handler = (e) => {

    e.preventDefault();

    setDeferredPrompt(e);

    setInstallSupported(true);

  };

  window.addEventListener(
    "beforeinstallprompt",
    handler
  );

  /* =====================================
     AFTER INSTALL
  ===================================== */

  window.addEventListener(
    "appinstalled",
    () => {

      setIsInstalled(true);

      setDeferredPrompt(null);

    }
  );

  return () => {

    window.removeEventListener(
      "beforeinstallprompt",
      handler
    );

  };

}, []);
  /* =========================================================
INSTALL APP
========================================================= */

  const handleInstallApp = async () => {

  /* =====================================
     ALREADY INSTALLED
  ===================================== */

  if (isInstalled) {

    alert("Golden BiashNet is already installed.");

    return;

  }

  /* =====================================
     INSTALL SUPPORTED
  ===================================== */

  if (deferredPrompt) {

    try {

      setInstalling(true);

      deferredPrompt.prompt();

      const choice =
        await deferredPrompt.userChoice;

      console.log(choice);

      if (
        choice.outcome === "accepted"
      ) {

        console.log(
          "User installed app"
        );

      }

      setDeferredPrompt(null);

    } catch (err) {

      console.log(err);

    } finally {

      setInstalling(false);

    }

    return;

  }

  /* =====================================
     PLAY STORE FALLBACK
  ===================================== */

  window.open(
    "https://play.google.com/store/apps/details?id=",
    "_blank"
  );

};
  /* =========================================================
SHARE
========================================================= */

  const shareMessage = `Welcome To Golden Biashnet Marketplace 🚀

Buy, sell, market services, houses and businesses around Juja in one app.

https://golden-biashnet.web.app`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Golden Biashnet",
          text: shareMessage,
        });
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            shareMessage
          )}`,
          "_blank"
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================================
SMALL PRODUCT CARD
========================================================= */

const ProductCard=({
 item,
 navigate
})=>(

<Card
 onClick={()=>
  navigate(`/post/product/${item.id}`)
 }
 sx={{
  minWidth:135,
  maxWidth:135,
  background:"#111",
  borderRadius:4,
  overflow:"hidden",
  border:"1px solid rgba(255,255,255,.06)",
  flexShrink:0
 }}
>

 <Box
  component="img"
  src={
   item.images?.[0]?.thumb
  }
  sx={{
   width:"100%",
   height:100,
   objectFit:"cover"
  }}
 />

 <Box sx={{p:1}}>

 <Typography
  sx={{
   fontSize:11,
   fontWeight:700,
   height:32,
   overflow:"hidden"
  }}
 >
  {item.title}
 </Typography>

 <Typography
  sx={{
   color:"#fad60b",
   fontWeight:900,
   fontSize:13,
   mt:.5
  }}
 >
  KES {item.price}
 </Typography>

 </Box>

</Card>

);


const SectionHeader=({
 title,
 subtitle,
 onClick
})=>(

<Box
 display="flex"
 justifyContent="space-between"
 alignItems="center"
 mb={1.5}
>

 <Box>

 <Typography
  sx={{
   fontWeight:900,
   fontSize:15
  }}
 >
  {title}
 </Typography>

 <Typography
  sx={{
   color:"#777",
   fontSize:11
  }}
 >
  {subtitle}
 </Typography>

 </Box>

 <Button
  size="small"
  onClick={onClick}
  endIcon={<ArrowForwardIcon />}
  sx={{
   color:"#fad60b",
   textTransform:"none"
  }}
 >
  View
 </Button>

</Box>

);


  /* =========================================================
RENDER
========================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: BG,
        color: "#fff",
        pb: 10,
      }}
    >
{/* =========================================================
HERO SECTION
Modern Marketplace Search Hero
========================================================= */}

<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(18px)",
    background: "rgba(5,5,5,.92)",
    borderBottom: "1px solid rgba(255,255,255,.06)",
    px: 1.5,
    pt: 1.2,
    pb: 1.4,
  }}
>

  {/* =====================================================
      TOP ROW
  ===================================================== */}

  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={1.2}
  >

    <Box>

      <Typography
        sx={{
          color: "#f3bc08",
          fontWeight: 900,
          fontSize: 21,
          lineHeight: 1,
          letterSpacing: -.4,
        }}
      >
        WELCOME TO BIASHNET
      </Typography>

      <Typography
        sx={{
          color: "#999",
          fontSize: 11,
          mt: 0.3,
        }}
      >
        Buy • Sell • Discover Opportunities
      </Typography>

    </Box>

  </Box>

  {/* =====================================================
      SEARCH BAR
  ===================================================== */}

  <Box
    onClick={() => navigate("/product")}
    sx={{
      position: "relative",
      cursor: "pointer",
    }}
  >

    {/* GLOW */}

    <Box
      sx={{
        position: "absolute",
        inset: -2,
        borderRadius: 5,
        background:
          "linear-gradient(90deg,#fad60b,#ff9800,#fad60b)",
        opacity: 0.18,
        filter: "blur(12px)",
      }}
    />

    <TextField
      fullWidth
      placeholder="Search products, houses, services..."
      onFocus={() => navigate("/product")}
      InputProps={{

        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                color: "#fad60b",
                fontSize: 22,
              }}
            />
          </InputAdornment>
        ),

        endAdornment: (
          <InputAdornment position="end">

            <Box
              sx={{
                px: 1,
                py: 0.45,
                borderRadius: 10,
                background:
                  "rgba(250,214,11,.12)",
                border:
                  "1px solid rgba(250,214,11,.25)",
                color: "#fad60b",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              Explore
            </Box>

          </InputAdornment>
        ),

        readOnly: true,
      }}
      sx={{

        "& .MuiOutlinedInput-root": {

          borderRadius: 5,

          background:
            "linear-gradient(180deg,#161616,#0f0f0f)",

          minHeight: 56,

          color: "#fff",

          transition: "0.25s",

          border:
            "1px solid rgba(255,255,255,.06)",

          boxShadow:
            "0 4px 20px rgba(0,0,0,.35)",

          "& fieldset": {
            border: "none",
          },

          "&:hover": {
            transform: "translateY(-1px)",
            border:
              "1px solid rgba(250,214,11,.35)",
          },

          "&.Mui-focused": {
            border:
              "1px solid rgba(250,214,11,.5)",
          },
        },

        "& input::placeholder": {
          color: "#777",
          opacity: 1,
          fontSize: 14,
        },
      }}
    />

  </Box>

  {/* =====================================================
    QUICK TRENDING
===================================================== */}

<Box
  sx={{
    display: "flex",
    gap: 1,
    overflowX: "auto",
    mt: 1.3,
    pb: 0.3,

    "&::-webkit-scrollbar": {
      display: "none",
    },
  }}
>

  {[
    {
      title: "Phones",
      icon: "📱",
      route: "/InfiniteProducts",
      search: "phones",
    },

    {
      title: "Hostels",
      icon: "🏠",
      route: "/houses",
      search: "hostels",
    },

    {
      title: "Events",
      icon: "🎉",
      route: "/adverts",
      search: "events",
    },

    {
      title: "Jobs",
      icon: "💼",
      route: "/adverts",
      search: "jobs",
    },

    {
      title: "Fashion",
      icon: "👕",
      route: "/InifiniteProducts",
      search: "fashion",
    },

    {
      title: "Services",
      icon: "🛠️",
      route: "/services",
      search: "services",
    },
  ].map((item) => (

    <Box
      key={item.title}
      onClick={() =>
        navigate(
          `${item.route}?search=${item.search}`
        )
      }
      sx={{

        px: 1.4,
        py: 0.75,

        borderRadius: 20,

        background:
          "rgba(255,255,255,.05)",

        border:
          "1px solid rgba(255,255,255,.05)",

        color: "#ddd",

        fontSize: 11,

        fontWeight: 800,

        whiteSpace: "nowrap",

        flexShrink: 0,

        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        gap: 0.6,

        transition: "0.2s",

        "&:hover": {

          background:
            "rgba(250,214,11,.12)",

          color: "#fad60b",

          border:
            "1px solid rgba(250,214,11,.2)",

          transform: "translateY(-1px)",
        },

        "&:active": {
          transform: "scale(.95)",
        },
      }}
    >

      <Typography
        component="span"
        sx={{
          fontSize: 13,
        }}
      >
        {item.icon}
      </Typography>

      {item.title}

    </Box>

    ))}

  </Box>

</Box>

{/* =========================================================
PROMOTED SECTION
========================================================= */}

<Box sx={{ px: 2, mt: 2.5 }}>

  {/* =====================================================
      HEADER
  ===================================================== */}

  {/* =====================================================
      PROMOTION CTA
  ===================================================== */}

  <Box
    onClick={() => navigate("/uploads")}
    sx={{

      mt: 1.4,

      mb: 1.6,

      p: 1.5,

      borderRadius: 5,

      background:
        "linear-gradient(135deg,#171717,#101010)",

      border:
        "1px solid rgba(244,180,0,.15)",

      position: "relative",

      overflow: "hidden",

      cursor: "pointer",

      transition: ".25s",

      "&:hover": {

        border:
          "1px solid rgba(244,180,0,.35)",

        transform: "translateY(-2px)",

      },

    }}
  >

    {/* Glow */}

    <Box
      sx={{

        position: "absolute",

        right: -35,
        top: -35,

        width: 120,
        height: 120,

        borderRadius: "50%",

        background:
          "rgba(244,180,0,.08)",

      }}
    />

    {/* TOP */}

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >

      <Box>

        <Typography
          sx={{
            color: "#f5ca0cfff",
            fontSize: 18,
            fontWeight: 1000,
            lineHeight: 1.2,
          }}
        >
       Promote Your Products
        </Typography>

      </Box>

      {/* MINI BADGE */}

      <Box
        sx={{

          px: 1,
          py: 0.7,

          borderRadius: 3,

          background:
            "rgb(5, 4, 0)",

          border:
            "1px solid rgba(112, 252, 57, 0.49)",

        }}
      >

        <Typography
          sx={{
            color: "#F4B400",
            fontSize: 9,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Affordable
        </Typography>

      </Box>

    </Stack>

    {/* BENEFITS */}

    <Stack
      direction="row"
      spacing={1}
      mt={1.3}
      flexWrap="wrap"
    >

      {[
        "More visibility",
        "Reach nearby buyers",
        "Boost trust",
      ].map((item) => (

        <Box
          key={item}
          sx={{

            px: 1,
            py: 0.5,

            borderRadius: 10,

            background:
              "rgba(255,255,255,.04)",

            border:
              "1px solid rgba(255,255,255,.05)",

          }}
        >

          <Typography
            sx={{
              color: "#ddd",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            ✓ {item}
          </Typography>

        </Box>

      ))}

    </Stack>

    {/* PLANS */}

    <Stack
      direction="row"
      spacing={1}
      mt={1.4}
    >

      {[
        {
          name: "Daily",
          price: "KES 50",
        },

        {
          name: "Weekly",
          price: "KES 250",
        },

        {
          name: "Monthly",
          price: "KES 800",
        },

      ].map((p) => (

        <Box
          key={p.name}
          sx={{

            flex: 1,

            p: 0.7,

            borderRadius: 2,

            background:
              "rgba(255,255,255,.03)",

            border:
              "1px solid rgba(255,255,255,.05)",

            textAlign: "center",

          }}
        >

          <Typography
            sx={{
              color: "#888",
              fontSize: 8.5,
              fontWeight: 700,
            }}
          >
            {p.name}
          </Typography>

          <Typography
            sx={{
              color: "#F4B400",
              fontSize: 11,
              fontWeight: 900,
              mt: 0.2,
            }}
          >
            {p.price}
          </Typography>

        </Box>

      ))}

    </Stack>

  </Box>

  {/* =====================================================
      PRODUCTS ROW
  ===================================================== */}

  <Box
    ref={promotedRef}
    sx={{

      display: "flex",

      gap: 1.2,

      overflowX: "auto",

      scrollBehavior: "smooth",

      pb: 0.5,

      "&::-webkit-scrollbar": {
        display: "none",
      },

      msOverflowStyle: "none",

      scrollbarWidth: "none",

    }}
  >

    {(promoted.length
      ? promoted
      : [

        ]

    ).map((item, index) => (

      <Card

        key={`${item.id}-${index}`}

        onClick={() =>

          item.promo
            ? navigate("/upload")
            : navigate(`/post/product/${item.id}`)

        }

        sx={{

          minWidth: 110,

          maxWidth: 110,

          height: 180,

          borderRadius: 3,

          overflow: "hidden",

          background: "#101010",

          border:
            "1px solid rgba(255,255,255,.05)",

          flexShrink: 0,

          position: "relative",

          cursor: "pointer",

          transition: ".25s",

          "&:hover": {

            transform: "translateY(-3px)",

            borderColor:
              "rgba(244,180,0,.35)",

          },

          "& img": {
            transition: ".4s",
          },

          "&:hover img": {
            transform: "scale(1.06)",
          },

        }}
      >

        {/* IMAGE */}

        <Box
          sx={{
            position: "relative",
            height: 100,
            overflow: "hidden",
          }}
        >

          {item.promo ? (

            <Box
              sx={{

                width: "100%",
                height: "100%",

                background:
                  "linear-gradient(135deg,#F4B400,#ff9800)",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                flexDirection: "column",

              }}
            >

              <Typography sx={{ fontSize: 30 }}>
                🚀
              </Typography>

              <Typography
                sx={{
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 900,
                }}
              >
                BOOST NOW
              </Typography>

            </Box>

          ) : (

            <Box
              component="img"
              src={
                item.images?.[0]?.thumb ||
                item.images?.[0]?.full ||
                "/placeholder.jpg"
              }
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

          )}

          {/* DARK OVERLAY */}

          <Box
            sx={{

              position: "absolute",

              inset: 0,

              background:
                "linear-gradient(to top,rgba(0,0,0,.82),transparent 55%)",

            }}
          />

          {/* BADGE */}

          <Box
            sx={{

              position: "absolute",

              top: 7,
              left: 7,

              px: 0.9,
              py: 0.35,

              borderRadius: 10,

              background:
                "rgba(0,0,0,.72)",

              backdropFilter: "blur(10px)",

              border:
                "1px solid rgba(255,255,255,.08)",

            }}
          >

            <Typography
              sx={{
                color: "#F4B400",
                fontSize: 7.5,
                fontWeight: 900,
              }}
            >
              Sponsored
            </Typography>

          </Box>

          {/* TRENDING */}

          {!item.promo && (

            <Box
              sx={{

                position: "absolute",

                bottom: 7,
                left: 7,

                background:
                  "rgba(7, 1, 1, 0.72)",

                backdropFilter: "blur(8px)",

                borderRadius: 10,

                px: 0.8,
                py: 0.35,

                display: "flex",
                alignItems: "center",
                gap: 0.5,

              }}
            >

              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#00ff6a",
                }}
              />

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 7.5,
                  fontWeight: 700,
                }}
              >
                Trending
              </Typography>

            </Box>

          )}

        </Box>

        {/* DETAILS */}

        <Box sx={{ p: 1 }}
        >

         <Typography
            sx={{
              color: "#fff",
              fontSize: 10.5,
              fontWeight: 800,
              lineHeight: 1.35,

              overflow: "hidden",

              display: "-webkit-box",

              WebkitLineClamp: 2,

              WebkitBoxOrient: "vertical",

              minHeight: 30,
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              color: "#F4B400",
              fontSize: 11,
              fontWeight: 900,
              mt: 0.7,
            }}
          >
            {item.promo
              ? item.price
              : `KES ${Number(
                  item.price || 0
                ).toLocaleString()}`}
          </Typography>

          {/* MINI STATS */}

          {!item.promo && (

            <Stack
              direction="row"
              spacing={1}
              mt={0.8}
            >

              <Typography
                sx={{
                  color: "#76f82a8c",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                👁 Trending
              </Typography>

              <Typography
                sx={{
                  color: "#76f82a8c",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                ⚡ Active
              </Typography>

            </Stack>

          )}

        </Box>

      </Card>

    ))}

  </Box>

</Box>
   {/* =========================================================
QUICK ACTIONS
========================================================= */}

<Box sx={{ px: 2, mt: 3 }}>

  {/* HEADER */}
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={1.8}
  >
    <Box>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: 17,
          color: "#fff",
        }}
      >
        Quick Access
      </Typography>

      <Typography
        sx={{
          color: "#888",
          fontSize: 11,
          mt: 0.3,
        }}
      >
        Shop, sell, promote and discover opportunities
      </Typography>
    </Box>

    <Typography
      onClick={() => navigate("/product")}
      sx={{
        color: GOLD,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Explore →
    </Typography>
  </Box>

  {/* MAIN ACTIONS */}
  <Box
    sx={{
      display: "flex",
      gap: 1.5,
      overflowX: "auto",
      pb: 1,
      "&::-webkit-scrollbar": {
        display: "none",
      },
    }}
  >

    {[
      {
        title: "Order Now",
        subtitle: "Shop products",
        icon: <ShoppingCartIcon />,
        route: "/InfiniteProducts",
        bg: "linear-gradient(135deg,#F4B40022,#F4B40008)",
      },

      {
        title: "Sell Products",
        subtitle: "Start selling",
        icon: <StorefrontIcon />,
        route: "/uploads",
        bg: "linear-gradient(135deg,#00c85322,#00c85308)",
      },

      {
        title: "Find Houses",
        subtitle: "Rooms & rentals",
        icon: <HomeIcon />,
        route: "/houses",
        bg: "linear-gradient(135deg,#2196f322,#2196f308)",
      },

      {
        title: "Hire Services",
        subtitle: "Trusted experts",
        icon: <BuildIcon />,
        route: "/services",
        bg: "linear-gradient(135deg,#ff704322,#ff704308)",
      },

      {
        title: "Adverts",
        subtitle: "Jobs & events",
        icon: <CampaignIcon />,
        route: "/adverts",
        bg: "linear-gradient(135deg,#9c27b022,#9c27b008)",
      },
    ].map((a, i) => (

      <Card
        key={i}
        onClick={() => navigate(a.route)}
        sx={{
          minWidth: 50,
          maxWidth: 100,
          background: a.bg,
          backdropFilter: "blur(10px)",
          borderRadius: 5,
          border: `1px solid ${BORDER}`,
          p: 1.5,
          cursor: "pointer",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",

          transition: "0.25s",

          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: GOLD,
          },

          "&:active": {
            transform: "scale(0.96)",
          },
        }}
      >

        {/* GLOW */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 50,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        {/* ICON */}
        <Avatar
          sx={{
            width: 38,
            height: 38,
            mb: 1.3,
            background: "rgba(255,255,255,0.08)",
            color: GOLD,
          }}
        >
          {a.icon}
        </Avatar>

        {/* TITLE */}
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {a.title}
        </Typography>

        {/* SUBTITLE */}
        <Typography
          sx={{
            fontSize: 11,
            color: "#aaa",
            mt: 0.5,
          }}
        >
          {a.subtitle}
        </Typography>

      </Card>
    ))}
  </Box>

  {/* CTA SECTION */}
  <Box
    sx={{
      mt: 2,
      background:
        "linear-gradient(135deg, rgba(244,180,0,0.18), rgba(244,180,0,0.05))",
      border: `1px solid rgba(244,180,0,0.18)`,
      borderRadius: 5,
      p: 2,
    }}
  >

    <Box
      sx={{
        display: "flex",
        gap: 1,
        mt: 2,
      }}
    >

      <Box
        onClick={() => navigate("/uploads")}
        sx={{
          flex: 1,
          background: GOLD,
          color: "#000",
          borderRadius: 3,
          py: 1.2,
          textAlign: "center",
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        Upload Now
      </Box>

      <Box
        onClick={() => navigate("/InfiniteProducts")}
        sx={{
          flex: 1,
          border: `1px solid ${GOLD}`,
          color: GOLD,
          borderRadius: 3,
          py: 1.2,
          textAlign: "center",
          fontWeight: 800,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        Shop Now
      </Box>

    </Box>
  </Box>
</Box>

      {/* =========================================================
LATEST SECTION
Only products paid for latest visibility
========================================================= */}

<Box sx={{ px:2, mt:3 }}>

 <SectionHeader
  title="Latest"
  subtitle="Fresh visible products"
  onClick={()=>
   navigate("/InfiniteProducts")
  }
 />

 {/* =====================================================
    NO LATEST PRODUCTS
 ===================================================== */}

 {!latestProducts.length ? (

 <Box
  sx={{

   display:"grid",

   gridTemplateColumns:
    "repeat(3,1fr)",

   gap:1,

   mt:1

  }}
 >

 {/* =========================================
    POST PRODUCT
 ========================================= */}

 <Card
  onClick={()=>
   navigate("/uploads")
  }
  sx={{

   background:
    "linear-gradient(135deg,#1a1a1a,#111)",

   border:
    "1px solid rgba(255,255,255,.06)",

   borderRadius:3,

   p:1.2,

   cursor:"pointer"

  }}
 >

 <Avatar
  sx={{

   width:34,
   height:34,

   background:
    "rgba(250,214,11,.12)",

   color:"#fad60b",

   mb:1

  }}
 >
  <StorefrontIcon sx={{fontSize:18}} />
 </Avatar>

 <Typography
  sx={{
   fontSize:11,
   fontWeight:800,
   color:"#fff",
   lineHeight:1.3
  }}
 >
  Post Products
 </Typography>

 <Typography
  sx={{
   fontSize:9,
   color:"#888",
   mt:.5
  }}
 >
  Start selling on Golden Biashnet.
 </Typography>

 </Card>

 {/* =========================================
    PROMOTE PRODUCT
 ========================================= */}

 <Card
  onClick={()=>
   navigate("/profile")
  }
  sx={{

   background:
    "linear-gradient(135deg,#161616,#101010)",

   border:
    "1px solid rgba(255,255,255,.06)",

   borderRadius:3,

   p:1.2,

   cursor:"pointer"

  }}
 >

 <Avatar
  sx={{

   width:34,
   height:34,

   background:
    "rgba(25,118,210,.12)",

   color:"#42a5f5",

   mb:1

  }}
 >
  <TrendingUpIcon sx={{fontSize:18}} />
 </Avatar>

 <Typography
  sx={{
   fontSize:11,
   fontWeight:800,
   color:"#fff",
   lineHeight:1.3
  }}
 >
  Promote Products
 </Typography>

 <Typography
  sx={{
   fontSize:9,
   color:"#888",
   mt:.5
  }}
 >
  Reach more customers instantly.
 </Typography>

 </Card>

 {/* =========================================
    PAY FOR LATEST
 ========================================= */}

 <Card
  onClick={()=>
   navigate("/uploads")
  }
  sx={{

   background:
    "linear-gradient(135deg,#2a2100,#111)",

   border:
    "1px solid rgba(250,214,11,.15)",

   borderRadius:3,

   p:1.2,

   cursor:"pointer"

  }}
 >

 <Avatar
  sx={{

   width:34,
   height:34,

   background:
    "rgba(250,214,11,.12)",

   color:"#fad60b",

   mb:1

  }}
 >
  <BoltIcon sx={{fontSize:18}} />
 </Avatar>

 <Typography
  sx={{
   fontSize:11,
   fontWeight:800,
   color:"#fff",
   lineHeight:1.3
  }}
 >
  Latest Visibility
 </Typography>

 <Typography
  sx={{
   fontSize:9,
   color:"#aaa",
   mt:.5,
   lineHeight:1.4
  }}
 >
  Appear here for 48hrs at only KES 25.
 </Typography>

 </Card>

 </Box>

 ) : (

 /* =====================================================
    SHOW LATEST PRODUCTS
 ===================================================== */

 <Box
  sx={{

   display:"grid",

   gridTemplateColumns:{
    xs:"repeat(3,1fr)",
    sm:"repeat(5,1fr)"
   },

   gap:1,

   mt:1

  }}
 >

 {latestProducts
  .sort(()=>Math.random()-0.5)
  .map(item=>(

 <Card

  key={item.id}

  onClick={()=>
   navigate(
    `/post/product/${item.id}`
   )
  }

  sx={{

   position:"relative",

   background:"#101010",

   borderRadius:3,

   overflow:"hidden",

   border:
    "1px solid rgba(255,255,255,.05)",

   cursor:"pointer"

  }}
 >

 {/* =========================================
    IMAGE
 ========================================= */}

 <Box
  component="img"

  src={
   item.images?.[0]?.thumb ||
   item.images?.[0]?.full
  }

  sx={{

   width:"100%",

   height:{
    xs:78,
    sm:100
   },

   objectFit:"cover"

  }}
 />

 {/* =========================================
    LATEST BADGE
 ========================================= */}

 <Chip

  label="Latest"

  size="small"

  sx={{

   position:"absolute",

   top:5,
   left:5,

   height:18,

   fontSize:9,

   fontWeight:900,

   background:"#42a5f5",

   color:"#fff"

  }}
 />

 {/* =========================================
    INFO
 ========================================= */}

 <Box sx={{ p:.8 }}>

 <Typography
  sx={{

   fontSize:{
    xs:9.5,
    sm:11
   },

   fontWeight:700,

   color:"#fff",

   lineHeight:1.25,

   overflow:"hidden",

   display:"-webkit-box",

   WebkitLineClamp:2,

   WebkitBoxOrient:"vertical",

   minHeight:24

  }}
 >
  {item.title}
 </Typography>

 <Typography
  sx={{

   color:"#fad60b",

   fontWeight:900,

   fontSize:{
    xs:10,
    sm:13
   },

   mt:.5

  }}
 >
  KES {item.price}
 </Typography>

 </Box>

 </Card>

 ))}

 </Box>

 )}

</Box>

      {/* =========================================================
COMMUNITY
========================================================= */}

      <Box sx={{ px: 2, mt: 3 }}>
        <Card
          sx={{
            background: CARD,
            borderRadius: 5,
            border: `1px solid ${BORDER}`,
          }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              Join The Community 🚀
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#aaa",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Install the app, join
              WhatsApp community groups
              and help grow the future of
              local marketplaces.
            </Typography>

            <Grid
              container
              spacing={1.2}
              sx={{ mt: 1 }}
            >
              <Grid item xs={4}>
              <Button
  fullWidth
  startIcon={
    installing ? (
      <CircularProgress
        size={18}
        color="inherit"
      />
    ) : (
      <DownloadIcon />
    )
  }
  onClick={handleInstallApp}
  disabled={installing}
  sx={{

    background:
      isInstalled
        ? "#1b5e20"
        : GOLD,

    color:
      isInstalled
        ? "#fff"
        : "#000",

    fontWeight: 900,

    borderRadius: 3,

    textTransform: "none",

    height: 52,

    fontSize: 15,

    boxShadow:
      "0 6px 18px rgba(250,214,11,.25)",

    transition: ".25s",

    "&:hover": {

      background:
        isInstalled
          ? "#2e7d32"
          : "#ffd600",

      transform:
        "translateY(-2px)",

    },

    "&:active": {

      transform: "scale(.98)",

    },

  }}
>
  {isInstalled
    ? "Installed"
    : installing
    ? "Installing..."
    : installSupported
    ? "Install App"
    : "Get App"}
</Button>
              </Grid>

              <Grid item xs={4}>
                <Button
                  fullWidth
                  startIcon={
                    <WhatsAppIcon />
                  }
                  onClick={() =>
                    window.open(
                      "https://chat.whatsapp.com/DEzMlxeMpeh3weXBLhwiWh?mode=gi_t",
                      "_blank"
                    )
                  }
                  sx={{
                    background:
                      "#25D366",
                    color: "#000",
                    fontWeight: 800,
                    borderRadius: 3,
                    textTransform:
                      "none",
                  }}
                >
                  Group
                </Button>
              </Grid>

              <Grid item xs={4}>
                <Button
                  fullWidth
                  startIcon={
                    <ShareIcon />
                  }
                  onClick={
                    handleShare
                  }
                  sx={{
                    background:
                      "#1976d2",
                    color: "#fff",
                    fontWeight: 800,
                    borderRadius: 3,
                    textTransform:
                      "none",
                  }}
                >
                  Share
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* =========================================================
BOTTOM CTA
========================================================= */}

      <Box
        sx={{
          px: 2,
          mt: 3,
        }}
      >
        <Card
          sx={{
            borderRadius: 5,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${GOLD}, #ffeb3b)`,
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 900,
                color: "#000",
              }}
            >
              Start Earning Today
            </Typography>

            <Typography
              sx={{
                color: "#111",
                mt: 1,
                fontSize: 13,
                maxWidth: 400,
                mx: "auto",
              }}
            >
              Join Golden Biashnet and
              begin selling, promoting
              and growing your income.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() =>
                navigate("/signup")
              }
              sx={{
                mt: 3,
                px: 4,
                py: 1.3,
                borderRadius: 4,
                background: "#000",
                color: GOLD,
                fontWeight: 900,
                textTransform: "none",

                "&:hover": {
                  background: "#111",
                },
              }}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}