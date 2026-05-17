import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  Paper,
  Stack,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  IconButton,
  Skeleton,
  Badge,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent
} from "@mui/material";

import {
  ShoppingCart,
  Phone,
  Verified,
  Inventory2,
  WhatsApp,
  Category,
  LocalOffer,
  Sms,
  Report,
  FavoriteBorder,
  Favorite,
  Share,
  ChevronLeft,
  ChevronRight,
  Bolt,
  Storefront,
  Star,
  Shield,
  LocationOn,
  Chat
} from "@mui/icons-material";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  limit,
  getDocs
} from "firebase/firestore";
import { calculateSellerTrust }
from "../../utils/sellerTrust";
import { Helmet } from "react-helmet-async";
import { auth, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

/* =========================================================
THEME
========================================================= */

const GOLD = "#F4B400";
const BG = "#050505";
const CARD = "#111111";
const BORDER = "#232323";
const TEXT = "#ffffff";
const SUB = "#aaaaaa";

const ADMINS=[
 "254758922614",
 "25410691650",
 "254751852962"
];
/* =========================================================
HELPERS
========================================================= */

const formatPrice = (price) => {
  if (!price) return "KES 0";
  return "KES " + Number(price).toLocaleString();
};

const formatKenyanPhone = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\s+/g, "").trim();

  if (cleaned.startsWith("07")) {
    return "254" + cleaned.slice(1);
  }

  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return "254" + cleaned;
  }

  if (cleaned.startsWith("+254")) {
    return cleaned.slice(1);
  }

  if (cleaned.startsWith("254")) {
    return cleaned;
  }

  return cleaned;
};

/* =========================================================
COMPONENT
========================================================= */

export default function ProductDetails({ post }) {

  const navigate = useNavigate();

  const images = useMemo(() => {
    if (!post?.images) return [];

    return post.images.map((img) => {
      if (typeof img === "string") {
        return {
          full: img,
          thumb: img
        };
      }

      return {
        full: img.full || img.thumb,
        thumb: img.thumb || img.full
      };
    });

  }, [post]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sellerData, setSellerData] = useState(null);
  const [addingCart, setAddingCart] = useState(false);

  const [favorite, setFavorite] = useState(false);

  const [tab, setTab] = useState(0);

  const [reportOpen, setReportOpen] = useState(false);

  const [reportReason, setReportReason] = useState("");

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loadingRelated, setLoadingRelated] = useState(true);

  const sellerPhone = formatKenyanPhone(post?.sellerPhone);

  const selectedImage =
    images?.[selectedIndex]?.full ||
    images?.[0]?.full ||
    "";

/* =========================================================
BUY NOW LOGIC
========================================================= */

const handleBuyNow = async () => {

  try {

    /* =====================================================
       AUTH CHECK
    ===================================================== */

    if (!auth.currentUser) {

      alert("Login required");
      return;

    }

    const buyer = auth.currentUser;

    /* =====================================================
       LOADING
    ===================================================== */

    setAddingCart(true);

    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    const productImage =
      post.images?.[0]?.thumb ||
      post.images?.[0]?.full ||
      "";

    /* =====================================================
       CREATE ORDER
    ===================================================== */

    const orderData = {

      /* =========================================
         USER
      ========================================= */

      userId: buyer.uid,
      buyerId: buyer.uid,

      /* =========================================
         ORDER STATUS
      ========================================= */

      orderStatus: "pending",
      paymentStatus: "pending",
      deliveryStatus: "waiting",

      /* =========================================
         PAYMENT
      ========================================= */

      paymentMethod: "cash_on_delivery",

      amountPaid: 0,

      total: Number(post.price || 0),

      /* =========================================
         DELIVERY
      ========================================= */

      deliveryLocation: "",

      pickupStation: "Golden Biashnet Store",

      /* =========================================
         ITEMS ARRAY
      ========================================= */

      items: [

        {

          id: post.id,

          title: post.title || "",

          image: productImage,

          category:
            post.category || "Other",

          sellerId:
            post.sellerId || "",

          price:
            Number(post.price || 0),

          quantity: 1

        }

      ],

      /* =========================================
         QUICK ACCESS
      ========================================= */

      sellerId: post.sellerId,

      productId: post.id,

      title: post.title,

      image: productImage,

      /* =========================================
         TIMESTAMP
      ========================================= */

      createdAt: serverTimestamp()

    };

    /* =====================================================
       SAVE ORDER
    ===================================================== */

    const orderRef = await addDoc(
      collection(db, "orders"),
      orderData
    );

    /* =====================================================
       NOTIFY SELLER
    ===================================================== */

    await addDoc(
      collection(db, "notifications"),
      {

        userId: post.sellerId,

        type: "new_order",

        title: "🛒 New Order Received",

        message:
          `${"A buyer"} wants to buy "${post.title}"`,

        orderId: orderRef.id,

        image: productImage,

        productId: post.id,

        read: false,

        createdAt: serverTimestamp()

      }
    );

    /* =====================================================
       UPDATE SELLER STATS
    ===================================================== */

    await updateDoc(
      doc(db, "users", post.sellerId),
      {

        totalOrders: increment(1),

        pendingOrders: increment(1)

      }
    );

    /* =====================================================
       SUCCESS
    ===================================================== */

    alert(
      "Order placed successfully. Seller and admins notified instantly."
    );

  } catch (err) {

    console.error(err);

    alert("Failed to place order");

  } finally {

    setAddingCart(false);

  }

};
  /* =========================================================
DISCOUNT
========================================================= */

  const discount = post.discount || 0;

  const savedAmount =
    post.markedPrice && post.price
      ? post.markedPrice - post.price
      : 0;

  const stockStatus =
    post.stock > 0 ? "In Stock" : "Out of Stock";

/*=========================================================
fetch seller
========================================================= */
    useEffect(() => {

  const fetchSeller = async () => {

    try {

      if (!post?.sellerId) return;

      const sellerRef = doc(
        db,
        "users",
        post.sellerId
      );

      const sellerSnap =
        await getDoc(sellerRef);

      if (sellerSnap.exists()) {

        setSellerData({
          id: sellerSnap.id,
          ...sellerSnap.data()
        });

      }

    } catch (err) {

      console.error(err);

    }

  };

  fetchSeller();

}, [post]);

const trust =
  sellerData
    ? calculateSellerTrust(sellerData)
    : null;

  /* =========================================================
RELATED PRODUCTS
========================================================= */

  useEffect(() => {

    const fetchRelated = async () => {

      try {

        setLoadingRelated(true);

        const q = query(
          collection(db, "products"),
          where("category", "==", post.category),
          limit(6)
        );

        const snap = await getDocs(q);

        const list = [];

        snap.forEach((doc) => {

          if (doc.id !== post.id) {
            list.push({
              id: doc.id,
              ...doc.data()
            });
          }

        });

        setRelatedProducts(list);

      } catch (err) {

        console.error(err);

      } finally {

        setLoadingRelated(false);

      }

    };

    fetchRelated();

  }, [post]);

  /* =========================================================
IMAGE SLIDER
========================================================= */

  const nextImage = () => {

    if (images.length <= 1) return;

    setSelectedIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );

  };

  const prevImage = () => {

    if (images.length <= 1) return;

    setSelectedIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  };
//=========================================================
  const trackMarketplaceAction = async(type)=>{

 try{

  await addDoc(
   collection(db,"marketplaceEvents"),
   {
    type,

    productId:post.id,

    sellerId:post.sellerId,

    buyerId:
      auth.currentUser?.uid || null,

    createdAt:serverTimestamp()
   }
  );

 }catch(err){

  console.log(err);

 }

};

//=========================================================


  const startAdminChat = async()=>{

 try{

  if(!auth.currentUser){
   alert("Login required");
   return;
  }

  const buyer = auth.currentUser;

  const ref = await addDoc(
   collection(db,"adminChats"),
   {
    buyerId:buyer.uid,

    productId:post.id,

    sellerId:post.sellerId,

    productTitle:post.title,

    productImage:
     post.images?.[0]?.thumb || "",

    status:"active",

    createdAt:serverTimestamp()
   }
  );

  /* ======================================
     NOTIFY ADMINS
  ====================================== */

  await addDoc(
   collection(db,"adminNotifications"),
   {
    type:"admin_chat",

    buyerId:buyer.uid,

    sellerId:post.sellerId,

    productId:post.id,

    chatId:ref.id,

    title:"New Buyer Support Chat",

    message:
     `${buyer.displayName || "Buyer"} needs help with ${post.title}`,

    read:false,

    createdAt:serverTimestamp()
   }
  );

  navigate(`/support-chat/${ref.id}`);

 }catch(err){

  console.log(err);

  alert("Failed to start admin chat");

 }

};
  
const handleAddToCart = async()=>{

 try{

  if(!auth.currentUser){
   alert("Login required");
   return;
  }

  setAddingCart(true);

  const buyer = auth.currentUser;

  /* =====================================
     ADD CART
  ===================================== */

  await addDoc(
   collection(db,"cart"),
   {
    userId:buyer.uid,

    postId:post.id,

    sellerId:post.sellerId,

    title:post.title,

    image:
     images?.[0]?.thumb ||
     images?.[0]?.full,

    price:Number(post.price || 0),

    createdAt:serverTimestamp()
   }
  );

  /* =====================================
     ADMIN REQUEST
  ===================================== */

  await addDoc(
   collection(db,"marketplaceRequests"),
   {
    type:"cart_interest",

    buyerId:buyer.uid,

    sellerId:post.sellerId,

    productId:post.id,

    title:post.title,

    amount:Number(post.price || 0),

    status:"pending",

    visibility:"admin_controlled",

    createdAt:serverTimestamp()
   }
  );

  /* =====================================
     NOTIFY ADMINS
  ===================================== */

  await addDoc(
   collection(db,"adminNotifications"),
   {
    type:"cart_added",

    buyerId:buyer.uid,

    sellerId:post.sellerId,

    productId:post.id,

    title:"Product Added To Cart",

    message:
      `${post.title} was added to cart`,

    read:false,

    createdAt:serverTimestamp()
   }
  );

  /* =====================================
     LIMITED SELLER NOTIFICATION
  ===================================== */

  await addDoc(
   collection(db,"notifications"),
   {
    userId:post.sellerId,

    type:"buyer_interest",

    title:"Buyer Interested",

    message:
     `Someone is interested in "${post.title}"`,

    productId:post.id,

    read:false,

    createdAt:serverTimestamp()
   }
  );

  alert(
   "Added successfully. Admins notified."
  );

 }catch(err){

  console.log(err);

  alert("Failed to add to cart");

 }finally{

  setAddingCart(false);

 }

};
/* =========================================================
SMART PRODUCT SHARE
TikTok / WhatsApp / IG Style
========================================================= */

const handleShare = async () => {

  try {
    /* ========================================
       PRODUCT LINK (DEEP LINK)
    ======================================== */

    const shareUrl =
      `${window.location.origin}/post/product/${post.id}`;

    /* ========================================
       PRODUCT IMAGE
    ======================================== */

    const imageUrl =
      post.images?.[0]?.full ||
      post.images?.[0]?.thumb ||
      "";

    /* ========================================
       DISCOUNT
    ======================================== */

    const originalPrice =
      Number(post.markedtPrice || 0);

    const currentPrice =
      Number(post.price || 0);

    let discountText = "";

    if (
      originalPrice > currentPrice &&
      originalPrice > 0
    ) {

      const percent = Math.round(
        ((originalPrice - currentPrice) /
          originalPrice) *
          100
      );

      discountText =
        `🔥 ${percent}% OFF\n`;

    }

    /* ========================================
       DESCRIPTION
    ======================================== */

    const description =
      post.description
        ?.slice(0, 80)
        ?.trim() || "";

         /* ========================================
        CATEGORY
    ======================================== */

    const category =
  post.category
    ? `📦 Category: ${post.category}`
    : "";

    /* ========================================
        LOCATION
    ======================================== */

   const location =
  post.location
    ? `📍 Location: ${post.location}`
    : "📍 Available Locally";

    /* ========================================
       SHARE TEXT
    ======================================== */

    const shareText = ` ${post.title} Now Available on GOLDEN BIASHNET 

${formatPrice(post.price)}
${discountText}
${category}
${location}

📝 ${description}

🛒 WHY GOLDEN BIASHNET?
✅ Buy & Sell Easily
✅ Trusted Local Marketplace
✅ Products • Services • Houses
✅ Connect With Real Buyers & Sellers
✅ Fast Growing Online Marketplace

📲 View Product Here 👇
${shareUrl}

🌍 Join the Future of Online Shopping & Business

 GOLDEN BIASHNET
ALL YOU NEED IN ONE PLACE
https://golden-biashnet.web.app
`;

    /* ========================================
       SHARE FILE IMAGE
       (WhatsApp/IG/TikTok support)
    ======================================== */

    try {

      if (navigator.canShare && imageUrl) {

        const response =
          await fetch(imageUrl);

        const blob =
          await response.blob();

        const file =
          new File(
            [blob],
            "product.jpg",
            {
              type: blob.type,
            }
          );

        /* ========================================
           MOBILE NATIVE SHARE
        ======================================== */

        if (
          navigator.canShare({
            files: [file],
          })
        ) {

          await navigator.share({

            title: post.title,

            text: shareText,

            url: shareUrl,

            files: [file],

          });

          return;
        }
      }

    } catch (fileErr) {

      console.log(
        "Image sharing fallback"
      );

    }

    /* ========================================
       NORMAL SHARE
    ======================================== */

    if (navigator.share) {

      await navigator.share({

        title: post.title,

        text: shareText,

        url: shareUrl,

      });

    } else {

      /* ========================================
         FALLBACK COPY
      ======================================== */

      await navigator.clipboard.writeText(
        shareText
      );

      alert("Product link copied");

    }

  } catch (err) {

    console.error(err);

  }

};

/* =========================================================
 FORMAT PHONE
========================================================= */

const formatPhone=(phone="")=>{

 let cleaned=phone
  .replace(/\s/g,"")
  .replace(/\+/g,"");

 // 07XXXXXXXX
 if(cleaned.startsWith("07")){

  cleaned=`254${cleaned.slice(1)}`;

 }

 // 01XXXXXXXX
 if(cleaned.startsWith("01")){

  cleaned=`254${cleaned.slice(1)}`;

 }

 return cleaned;

};

  /* =========================================================
WHATSAPP
========================================================= */
const contactAdminsWhatsApp=()=>{

 try{

  /* =========================================
     SAFETY CHECK
  ========================================= */

  if(!post?.id){

   alert("Product not available");
   return;

  }

  /* =========================================
     BUILD MESSAGE
  ========================================= */

  const message=
`Hello Golden Biashnet Admin,

I am interested in this product.

Product:
${post.title || "Marketplace Product"}

Price:
KES ${post.price || 0}

Product ID:
${post.id}

Seller ID:
${post.sellerId || "N/A"}

Location:
${post.location || "N/A"}

Please assist me with the purchase process.`;

  const encodedText=
   encodeURIComponent(message);

  /* =========================================
     OPEN FIRST ADMIN FAST
  ========================================= */

  const firstAdmin=
   formatPhone(ADMINS[0]);

  window.open(
   `https://wa.me/${firstAdmin}?text=${encodedText}`,
   "_blank"
  );

  /* =========================================
     OPTIONAL BACKUP ADMINS
     (silent fail-safe)
  ========================================= */

  ADMINS.slice(1).forEach((phone,index)=>{

   const formatted=
    formatPhone(phone);

   setTimeout(()=>{

    fetch(
    `https://wa.me/${formatted}`
    ).catch(()=>{});

   },index*300);

  });

 }catch(err){

  console.log(err);

  alert(
   "Failed to open WhatsApp"
  );

 }

 trackMarketplaceAction(
  "whatsapp_admin"
 );

};
  /* =========================================================
SMS
========================================================= */

  const smsLink = sellerPhone
    ? `sms:${sellerPhone}?body=${encodeURIComponent(
        `Hello ${post.sellerName}, I saw your product "${post.title}" on Golden Biashnet`
      )}`
    : null;

  /* =========================================================
REPORT
========================================================= */

  const submitReport = async () => {

    try {

      await addDoc(collection(db, "reports"), {

        productId: post.id,
        sellerId: post.sellerId,
        reason: reportReason,
        reportedBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()

      });

      alert("Report submitted");

      setReportOpen(false);

      setReportReason("");

    } catch (err) {

      console.error(err);

    }

  };

  /* =========================================================
UI
========================================================= */

  return ( <>
<Helmet>

  {/* Main Title */}
  <title>
    {post?.title} | Golden Biashnet
  </title>

  {/* Basic SEO */}
  <meta
    name="description"
    content={post?.description}
  />

  <meta
    name="keywords"
    content={`
      ${post?.title},
      Golden Biashnet,
      Kenya marketplace,
      buy online Kenya,
      products,
      services,
      houses,
      adverts
    `}
  />

  <meta
    name="author"
    content="Golden Biashnet"
  />

  {/* Canonical URL */}
  <link
    rel="canonical"
    href={window.location.href}
  />

  {/* Open Graph / Facebook / WhatsApp */}
  <meta
    property="og:type"
    content="product"
  />

  <meta
    property="og:site_name"
    content="Golden Biashnet"
  />

  <meta
    property="og:title"
    content={post?.title}
  />

  <meta
    property="og:description"
    content={post?.description}
  />

  <meta
    property="og:image"
    content={post?.image}
  />

  <meta
    property="og:url"
    content={window.location.href}
  />

  {/* Product Pricing */}
  <meta
    property="product:price:amount"
    content={post?.price}
  />

  <meta
    property="product:price:currency"
    content="KES"
  />

  {/* Optional Discount */}
  <meta
    property="product:sale_price:amount"
    content={post?.discountPrice || post?.price}
  />

  {/* Twitter / X Preview */}
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content={post?.title}
  />

  <meta
    name="twitter:description"
    content={post?.description}
  />

  <meta
    name="twitter:image"
    content={post?.image}
  />

  {/* Structured Product Data */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",

      name: post?.title,

      image: [
        post?.image
      ],

      description: post?.description,

      brand: {
        "@type": "Brand",
        name: "Golden Biashnet"
      },

      offers: {
        "@type": "Offer",

        url: window.location.href,

        priceCurrency: "KES",

        price: post?.price,

        availability:
          "https://schema.org/InStock"
      }
    })}
  </script>

</Helmet>
    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        color: TEXT,
        pb: "100px"
      }}
    >

      <Grid container>

        {/* =========================================================
LEFT - IMAGE SECTION
========================================================= */}

        <Grid item xs={12} md={6}>

          <Box
            sx={{
              position: "sticky",
              top: 0
            }}
          >

            {/* MAIN IMAGE */}

            <Box
              sx={{
                position: "relative",
                background: "#000"
              }}
            >

              <Box
                component="img"
                src={selectedImage}
                sx={{
                  width: "100%",
                  height: {
                    xs: "55vh",
                    md: "100vh"
                  },
                  objectFit: "cover"
                }}
              />

              {/* TOP ACTIONS */}

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: "absolute",
                  top: 15,
                  right: 15
                }}
              >

                <IconButton
                  onClick={handleShare}
                  sx={{
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff"
                  }}
                >
                  <Share />
                </IconButton>

                <IconButton
                  onClick={() => setFavorite(!favorite)}
                  sx={{
                    background: "rgba(0,0,0,0.6)",
                    color: favorite ? "red" : "#fff"
                  }}
                >
                  {favorite ? (
                    <Favorite />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>

              </Stack>

              {/* DISCOUNT */}

              {discount > 0 && (

                <Chip
                  label={`${discount}% OFF`}
                  sx={{
                    position: "absolute",
                    top: 15,
                    left: 15,
                    background: GOLD,
                    color: "#000",
                    fontWeight: "bold"
                  }}
                />

              )}

              {/* SLIDER BUTTONS */}

              {images.length > 1 && (

                <>

                  <IconButton
                    onClick={prevImage}
                    sx={sliderBtnLeft}
                  >
                    <ChevronLeft />
                  </IconButton>

                  <IconButton
                    onClick={nextImage}
                    sx={sliderBtnRight}
                  >
                    <ChevronRight />
                  </IconButton>

                </>

              )}

            </Box>

            {/* THUMBNAILS */}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                p: 2,
                overflowX: "auto",
                background: CARD
              }}
            >

              {images.map((img, i) => (

                <Box
                  key={i}
                  component="img"
                  src={img.thumb}
                  onClick={() => setSelectedIndex(i)}
                  sx={{
                    width: 75,
                    height: 75,
                    borderRadius: 2,
                    objectFit: "cover",
                    cursor: "pointer",
                    border:
                      selectedIndex === i
                        ? `2px solid ${GOLD}`
                        : `1px solid ${BORDER}`
                  }}
                />

              ))}

            </Stack>

          </Box>

        </Grid>

        {/* =========================================================
RIGHT SIDE
========================================================= */}

        <Grid item xs={12} md={6}>

          <Box sx={{ p: { xs: 2, md: 4 } }}>

            {/* CATEGORY */}

            <Chip
              icon={<Category />}
              label={post.category}
              sx={{
                background: "#1b1b1b",
                color: GOLD,
                mb: 2
              }}
            />

            {/* TITLE */}

            <Typography
              sx={{
                fontSize: {
                  xs: 28,
                  md: 38
                },
                fontWeight: 800,
                lineHeight: 1.2
              }}
            >
              {post.title}
            </Typography>

            {/* PRICE */}

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              mt={2}
            >

              <Typography
                sx={{
                  fontSize: 34,
                  fontWeight: "bold",
                  color: GOLD
                }}
              >
                {formatPrice(post.price)}
              </Typography>

              {post.markedPrice && (

                <Typography
                  sx={{
                    textDecoration: "line-through",
                    color: "#777",
                    fontSize: 20
                  }}
                >
                  {formatPrice(post.markedPrice)}
                </Typography>

              )}

            </Stack>

            {/* BADGES */}

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              mt={2}
            >

              <Chip
                icon={<Inventory2 />}
                label={`${post.stock} in stock`}
                sx={badgeStyle}
              />

              <Chip
                icon={<Bolt />}
                label={stockStatus}
                sx={badgeStyle}
              />

              {discount > 0 && (

                <Chip
                  icon={<LocalOffer />}
                  label={`Save ${formatPrice(savedAmount)}`}
                  sx={badgeStyle}
                />

              )}

            </Stack>
              {/* =========================================================
SELLER TRUST CARD
========================================================= */}
 <Paper
  sx={{
    mt: 4,
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",

    background:
      "linear-gradient(180deg,#111,#080808)",

    border:
      `1px solid ${trust?.badge?.border || BORDER}`,

    boxShadow:
      trust?.badge?.level === "golden"
        ? "0 0 25px rgba(244,180,0,0.15)"
        : "none"
  }}
>

  {/* ========================================
     TOP GLOW
  ======================================== */}

  <Box
    sx={{
      position: "absolute",
      top: -70,
      right: -70,
      width: 180,
      height: 180,
      borderRadius: "50%",

      background:
        trust?.badge?.bg,

      filter: "blur(45px)"
    }}
  />

  {/* ========================================
     CONTENT
  ======================================== */}

  <Box sx={{ p: 2.5 }}>

    {/* ========================================
       HEADER
    ======================================== */}

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: 16
        }}
      >
        Seller Trust Profile
      </Typography>

      <Shield
        sx={{
          color:
            trust?.badge?.color || GOLD
        }}
      />

    </Stack>

    {/* ========================================
       TOP SECTION
    ======================================== */}

    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
    >

      {/* ========================================
         AVATAR
      ======================================== */}

      <Avatar
        sx={{
          width: 70,
          height: 70,

          background:
            trust?.badge?.bg,

          color:
            trust?.badge?.color,

          border:
            `2px solid ${trust?.badge?.border}`,

          fontWeight: 900
        }}
      >
        <Storefront sx={{ fontSize: 32 }} />
      </Avatar>

      {/* ========================================
         INFO
      ======================================== */}

      <Box flex={1}>

        {/* ========================================
           BADGE
        ======================================== */}

        <Chip
          icon={
            <Verified
              sx={{
                color:
                  `${trust?.badge?.color} !important`
              }}
            />
          }

          label={
            trust?.badge?.label
          }

          sx={{
            background:
              trust?.badge?.bg,

            color:
              trust?.badge?.color,

            border:
              `1px solid ${trust?.badge?.border}`,

            fontWeight: 800,

            borderRadius: 3
          }}
        />

        {/* ========================================
           STATUS
        ======================================== */}

        <Typography
          sx={{
            mt: 1,
            color: "#ddd",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {trust?.status}
        </Typography>

        {/* ========================================
           RATING
        ======================================== */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mt={1}
        >

          <Rating
            value={
              trust?.sellerRating || 1
            }

            precision={0.5}

            readOnly

            sx={{
              "& .MuiRating-iconFilled": {
                color: GOLD
              }
            }}
          />

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900
            }}
          >
            {trust?.sellerRating?.toFixed(1)}
          </Typography>

          <Typography
            sx={{
              color: "#777",
              fontSize: 13
            }}
          >
            ({sellerData?.totalRatings || 0})
          </Typography>

        </Stack>

      </Box>

    </Stack>

    {/* ========================================
       TRUST METRICS
    ======================================== */}

    <Grid
      container
      spacing={1.2}
      mt={2}
    >

      {[
        {
          label: "Trust Score",
          value:
            `${trust?.trustScore || 0}%`
        },

        {
          label: "Sales",
          value:
            `${sellerData?.completedOrders || 0}+`
        },

        {
          label: "Success Rate",
          value:
            `${sellerData?.successRate || 98}%`
        },

        {
          label: "Response",
          value:
            sellerData?.responseTime ||
            "Fast"
        }

      ].map((item, i) => (

        <Grid item xs={6} key={i}>

          <Box
            sx={{
              background:
                "rgba(255,255,255,0.03)",

              border:
                `1px solid ${BORDER}`,

              borderRadius: 3,

              p: 1.3,

              textAlign: "center"
            }}
          >

            <Typography
              sx={{
                color: GOLD,
                fontWeight: 900,
                fontSize: 15
              }}
            >
              {item.value}
            </Typography>

            <Typography
              sx={{
                color: "#888",
                fontSize: 11
              }}
            >
              {item.label}
            </Typography>

          </Box>

        </Grid>

      ))}

    </Grid>


  </Box>

</Paper>

{/* =========================================================
MARKETPLACE PROTECTED ACTIONS
Golden Biashnet Middleman System
========================================================= */}

<Stack spacing={2.2} mt={4}>

  {/* =====================================================
      MARKETPLACE NOTICE
  ===================================================== */}

  <Paper
    sx={{
      background:"rgba(244,180,0,0.06)",
      border:"1px solid rgba(244,180,0,0.15)",
      borderRadius:4,
      p:2
    }}
  >

    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
    >

      <Shield sx={{color:GOLD}} />

      <Typography
        sx={{
          color:"#ddd",
          fontSize:13,
          lineHeight:1.7
        }}
      >
        Golden Biashnet protects all
        marketplace transactions.
        Buyers communicate directly
        with admins for safer payments,
        delivery coordination and seller
        verification.
      </Typography>

    </Stack>

  </Paper>

  {/* =====================================================
      CHAT ADMINS
  ===================================================== */}

  <Button
    fullWidth
    startIcon={<Chat />}
    onClick={startAdminChat}
    sx={primaryBtn}
  >
    Chat Marketplace Admins
  </Button>

  {/* =====================================================
      CONTACT ADMINS
  ===================================================== */}

  <Grid container spacing={2}>

    {/* WHATSAPP ADMINS */}

    <Grid item xs={12} sm={4}>

      <Button
        fullWidth
        startIcon={<WhatsApp />}
        onClick={contactAdminsWhatsApp}
        sx={{
          ...secondaryBtn,
          background:"#25D366",
          color:"#000",
          border:"none"
        }}
      >
        WhatsApp Admins
      </Button>

    </Grid>

    {/* CALL ADMIN */}

    <Grid item xs={6} sm={4}>

      <Button
        fullWidth
        href="tel:+254758922614"
        startIcon={<Phone />}
        onClick={()=>trackMarketplaceAction("call_admin")}
        sx={secondaryBtn}
      >
        Call Admin
      </Button>

    </Grid>

    {/* SMS ADMIN */}

    <Grid item xs={6} sm={4}>

      <Button
        fullWidth
        href={`sms:+254758922614?body=${encodeURIComponent(
          `Hello Golden Biashnet Admin,
I am interested in:
${post.title}
Product ID: ${post.id}`
        )}`}
        startIcon={<Sms />}
        onClick={()=>trackMarketplaceAction("sms_admin")}
        sx={secondaryBtn}
      >
        SMS Admin
      </Button>

    </Grid>

  </Grid>

  {/* =====================================================
      ADD TO CART
  ===================================================== */}

  <Button
    fullWidth
    startIcon={<ShoppingCart />}
    onClick={handleAddToCart}
    disabled={addingCart}
    sx={cartBtn}
  >

    {addingCart
      ? "Processing..."
      : "Add To Cart"}

  </Button>

</Stack>



            {/* =========================================================
LOWER TABS
========================================================= */}

            <Box mt={5}>

              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 3,
                  "& .MuiTabs-indicator": {
                    background: GOLD
                  }
                }}
              >

                <Tab
                  label="Description"
                  sx={{ color: "#fff" }}
                />

                <Tab
                  label="Reviews"
                  sx={{ color: "#fff" }}
                />

                <Tab
                  label="Related"
                  sx={{ color: "#fff" }}
                />

              </Tabs>

              {/* DESCRIPTION */}

              {tab === 0 && (

                <Paper sx={tabCard}>

                  <Typography
                    sx={{
                      color: "#ddd",
                      lineHeight: 1.8
                    }}
                  >
                    {post.description}
                  </Typography>

                </Paper>

              )}

              {/* REVIEWS */}

              {tab === 1 && (

                <Paper sx={tabCard}>

                  <Typography
                    sx={{
                      color: "#888"
                    }}
                  >
                    Reviews system coming soon
                  </Typography>

                </Paper>

              )}

              {/* RELATED */}

              {tab === 2 && (

                <Grid container spacing={2}>

                  {loadingRelated
                    ? Array.from(new Array(4)).map(
                        (_, i) => (

                          <Grid
                            item
                            xs={6}
                            key={i}
                          >

                            <Skeleton
                              variant="rectangular"
                              height={180}
                              sx={{
                                borderRadius: 3,
                                bgcolor: "#1a1a1a"
                              }}
                            />

                          </Grid>

                        )
                      )
                    : relatedProducts.map((item) => (

                        <Grid
                          item
                          xs={6}
                          sm={4}
                          key={item.id}
                        >

                          <Card
                            onClick={() =>
                              navigate(
                                `/product/${item.id}`
                              )
                            }
                            sx={{
                              background: CARD,
                              border:
                                "1px solid #222",
                              borderRadius: 4,
                              cursor: "pointer"
                            }}
                          >

                            <CardMedia
                              component="img"
                              image={
                                item.images?.[0]
                                  ?.full ||
                                item.images?.[0]
                              }
                              sx={{
                                height: 160,
                                objectFit: "cover"
                              }}
                            />

                            <CardContent>

                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontWeight:
                                    "bold",
                                  fontSize: 14
                                }}
                              >
                                {item.title}
                              </Typography>

                              <Typography
                                sx={{
                                  color: GOLD,
                                  mt: 1,
                                  fontWeight:
                                    "bold"
                                }}
                              >
                                {formatPrice(
                                  item.price
                                )}
                              </Typography>

                            </CardContent>

                          </Card>

                        </Grid>

                      ))}

                </Grid>

              )}

            </Box>

            {/* REPORT */}

            <Button
              startIcon={<Report />}
              onClick={() => setReportOpen(true)}
              sx={{
                color: "#777",
                mt: 4
              }}
            >
              Report Product
            </Button>

          </Box>

        </Grid>

      </Grid>

      {/* =========================================================
FLOATING ACTION BAR
Works With Existing App Bottom Navigation
========================================================= */}

<Box
  sx={{
    position: "fixed",
    bottom: {
      xs: 70, // above your app bottom nav
      md: 20
    },
    left: 0,
    right: 0,
    zIndex: 1200,
    px: { xs: 1.5, md: 3 },
    pointerEvents: "none"
  }}
>

  <Paper
    elevation={24}
    sx={{
      maxWidth: 700,
      mx: "auto",
      borderRadius: 5,
      overflow: "hidden",
      background: "rgba(15,15,15,0.95)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${BORDER}`,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      pointerEvents: "auto"
    }}
  >

    <Stack
      direction="row"
      spacing={1.2}
      sx={{
        p: 1.2
      }}
    >

      {/* PRICE SECTION */}

      <Box
        sx={{
          minWidth: 90,
          display: {
            xs: "none",
            sm: "flex"
          },
          flexDirection: "column",
          justifyContent: "center",
          pl: 1
        }}
      >

        <Typography
          sx={{
            color: "#777",
            fontSize: 12
          }}
        >
          Total Price
        </Typography>

        <Typography
          sx={{
            color: GOLD,
            fontWeight: 800,
            fontSize: 20
          }}
        >
          {formatPrice(post.price)}
        </Typography>

      </Box>

      {/* ADD TO CART */}

      <Button
        fullWidth
        startIcon={<ShoppingCart />}
        onClick={handleAddToCart}
        disabled={addingCart}
        sx={{
          height: 42,
          borderRadius: 4,
          background: "#1a1a1a",
          color: "#fff",
          fontWeight: 700,
          border: `1px solid ${BORDER}`,
          textTransform: "none",
          fontSize: 15,

          "&:hover": {
            background: "#222"
          }
        }}
      >

        {addingCart
          ? "Adding..."
          : "Add To Cart"}

      </Button>

      {/* BUY NOW */}

      <Button
        fullWidth
        onClick={handleBuyNow}
        sx={{
          height: 42,
          borderRadius: 4,
          background: GOLD,
          color: "#000",
          fontWeight: 800,
          textTransform: "none",
          fontSize: 15,

          "&:hover": {
            background: "#ffd54f"
          }
        }}
      >
        Buy Now
      </Button>

    </Stack>

  </Paper>

</Box>

      {/* =========================================================
REPORT DIALOG
========================================================= */}

      <Dialog
        open={reportOpen}
        onClose={() =>
          setReportOpen(false)
        }
        fullWidth
      >

        <DialogTitle>
          Report Product
        </DialogTitle>

        <DialogContent>

          <TextField
            select
            fullWidth
            label="Reason"
            value={reportReason}
            onChange={(e) =>
              setReportReason(
                e.target.value
              )
            }
            sx={{ mt: 2 }}
          >

            <MenuItem value="scam">
              Scam
            </MenuItem>

            <MenuItem value="wrong_price">
              Wrong Price
            </MenuItem>

            <MenuItem value="fake_product">
              Fake Product
            </MenuItem>

            <MenuItem value="duplicate">
              Duplicate Listing
            </MenuItem>

          </TextField>

          <Button
            fullWidth
            variant="contained"
            onClick={submitReport}
            sx={{
              mt: 3,
              background: GOLD,
              color: "#000",
              fontWeight: "bold"
            }}
          >
            Submit Report
          </Button>

        </DialogContent>

      </Dialog>

    </Box>
      </>
  );

}

/* =========================================================
STYLES
========================================================= */

const sliderBtnLeft = {
  position: "absolute",
  top: "50%",
  left: 10,
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.5)",
  color: "#fff"
};

const sliderBtnRight = {
  position: "absolute",
  top: "50%",
  right: 10,
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.5)",
  color: "#fff"
};

const badgeStyle = {
  background: "#1a1a1a",
  color: "#ddd",
  border: "1px solid #222"
};

const primaryBtn = {
  background: GOLD,
  color: "#000",
  fontWeight: "bold",
  height: 42,
  borderRadius: 3,
  fontSize: 16,
  "&:hover": {
    background: "#ffd54f"
  }
};

const secondaryBtn = {
  border: `1px solid ${GOLD}`,
  color: GOLD,
  height: 50,
  borderRadius: 3,
  fontWeight: "bold"
};

const cartBtn = {
  background: "#fff",
  color: "#000",
  height: 52,
  borderRadius: 3,
  fontWeight: "bold",
  fontSize: 16
};

const stickyCartBtn = {
  background: "#1a1a1a",
  color: "#fff",
  height: 50,
  borderRadius: 3,
  fontWeight: "bold"
};

const stickyBuyBtn = {
  background: GOLD,
  color: "#000",
  height: 50,
  borderRadius: 3,
  fontWeight: "bold"
};

const tabCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  p: 3
};