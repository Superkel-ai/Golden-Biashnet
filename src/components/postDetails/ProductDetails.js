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
          `${buyer.displayName || "A buyer"} wants to buy "${post.title}"`,

        orderId: orderRef.id,

        image: productImage,

        productId: post.id,

        read: false,

        createdAt: serverTimestamp()

      }
    );

    /* =====================================================
       NOTIFY ADMINS
    ===================================================== */

    await addDoc(
      collection(db, "adminNotifications"),
      {

        type: "new_market_order",

        title: "🔥 New Marketplace Order",

        message:
          `New order received for "${post.title}"`,

        orderId: orderRef.id,

        sellerId: post.sellerId,

        buyerId: buyer.uid,

        productId: post.id,

        image: productImage,

        read: false,

        createdAt: serverTimestamp()

      }
    );

    /* =====================================================
       UPDATE PRODUCT ANALYTICS
    ===================================================== */

    await updateDoc(
      doc(db, "products", post.id),
      {

        orderCount: increment(1),

        pendingOrders: increment(1)

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

  /* =========================================================
TRACK CONTACT
========================================================= */

  const trackContact = async (type) => {

    try {

      await addDoc(collection(db, "contactEvents"), {

        productId: post.id,
        sellerId: post.sellerId,
        buyerId: auth.currentUser?.uid || null,
        type,
        createdAt: serverTimestamp()

      });

    } catch (err) {

      console.error(err);

    }

  };

  /* =========================================================
CHAT
========================================================= */

  const startChat = async (otherUserId) => {

    const user = auth.currentUser;

    if (!user) {
      alert("Login required");
      return;
    }

    try {

      const chatId = [user.uid, otherUserId]
        .sort()
        .join("_");

      const chatRef = doc(db, "chats", chatId);

      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {

        await setDoc(chatRef, {

          participants: [user.uid, otherUserId],
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: serverTimestamp()

        });

        await updateDoc(doc(db, "users", otherUserId), {
          chatRequests: increment(1)
        });

      }

      navigate(`/chat/${chatId}`);

    } catch (err) {

      console.error(err);
      alert("Failed to start chat");

    }

  };

  /* =========================================================
ADD TO CART
========================================================= */

  const handleAddToCart = async () => {

    try {

      if (!auth.currentUser) {
        alert("Login required");
        return;
      }

      setAddingCart(true);

      await addDoc(collection(db, "cart"), {

        userId: auth.currentUser.uid,
        postId: post.id,
        type: "product",

        title: post.title,
        price: post.price,
        category: post.category || "general",

        image:
          images?.[0]?.thumb ||
          images?.[0]?.full,

        sellerId: post.sellerId || null,

        createdAt: serverTimestamp()

      });

      alert("Added to cart");

    } catch (err) {

      console.error(err);
      alert("Failed to add to cart");

    } finally {

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
WHATSAPP
========================================================= */

  const whatsappLink = sellerPhone
    ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(
        `Hello ${post.sellerName}, I am interested in "${post.title}" on Golden Biashnet`
      )}`
    : null;

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

  return (

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
SELLER CARD
========================================================= */}

            <Paper
              sx={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                p: 2.5,
                mt: 4
              }}
            >

              <Typography
                sx={{
                  mb: 2,
                  fontWeight: "bold"
                }}
              >
                Seller Information
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <Avatar
                  src={post.sellerPhoto}
                  sx={{
                    width: 70,
                    height: 70
                  }}
                >
                  {post.sellerName?.charAt(0)}
                </Avatar>

                <Box flex={1}>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >

                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: 18
                      }}
                    >
                      {post.sellerName}
                    </Typography>

                    {post.sellerVerified && (

                      <Verified
                        sx={{
                          color: GOLD,
                          fontSize: 20
                        }}
                      />

                    )}

                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mt={0.5}
                  >

                    <LocationOn
                      sx={{
                        color: "#777",
                        fontSize: 18
                      }}
                    />

                    <Typography
                      sx={{
                        color: "#999"
                      }}
                    >
                      {post.sellerLocation || "Kenya"}
                    </Typography>

                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mt={1}
                  >

                    <Rating
                      value={post.sellerRating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                    />

                    <Typography
                      sx={{
                        color: "#888"
                      }}
                    >
                      ({post.sellerTotalRatings || 0})
                    </Typography>

                  </Stack>

                </Box>

              </Stack>

            </Paper>

            {/* =========================================================
ACTIONS
========================================================= */}

            <Stack spacing={2} mt={4}>

              <Button
                fullWidth
                startIcon={<Chat />}
                onClick={() => startChat(post.sellerId)}
                sx={primaryBtn}
              >
                Chat In-App
              </Button>

              <Grid container spacing={2}>

                <Grid item xs={12} sm={4}>

                  <Button
                    fullWidth
                    href={whatsappLink}
                    target="_blank"
                    startIcon={<WhatsApp />}
                    onClick={() =>
                      trackContact("whatsapp")
                    }
                    sx={{
                      ...secondaryBtn,
                      background: "#25D366",
                      color: "#000",
                      border: "none"
                    }}
                  >
                    WhatsApp
                  </Button>

                </Grid>

                <Grid item xs={6} sm={4}>

                  <Button
                    fullWidth
                    href={`tel:${sellerPhone}`}
                    startIcon={<Phone />}
                    onClick={() =>
                      trackContact("call")
                    }
                    sx={secondaryBtn}
                  >
                    Call
                  </Button>

                </Grid>

                <Grid item xs={6} sm={4}>

                  <Button
                    fullWidth
                    href={smsLink}
                    startIcon={<Sms />}
                    onClick={() =>
                      trackContact("sms")
                    }
                    sx={secondaryBtn}
                  >
                    SMS
                  </Button>

                </Grid>

              </Grid>

              <Button
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={addingCart}
                sx={cartBtn}
              >
                {addingCart
                  ? "Adding..."
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