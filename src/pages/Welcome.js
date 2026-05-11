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
WELCOME PAGE
========================================================= */

export default function Welcome() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

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
FETCH POSTS
========================================================= */

  useEffect(() => {
    setLoading(true);

    const collectionsList = [
      "products",
      "services",
      "houses",
      "adverts",
    ];

    let allData = [];

    const unsubscribers = collectionsList.map(
      (col) => {
        const q = query(
          collection(db, col),
          where("status", "in", [
            "active",
            "approved",
          ]),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        return onSnapshot(q, (snap) => {
          const data = snap.docs.map((doc) => ({
            id: doc.id,
            type: col,
            ...doc.data(),
          }));

          allData = [
            ...allData.filter(
              (d) => d.type !== col
            ),
            ...data,
          ];

          const sorted = allData.sort(
            (a, b) =>
              b.createdAt?.seconds -
              a.createdAt?.seconds
          );

          const shuffled =
            shuffleArray(sorted);

          setPosts(shuffled.slice(0, 20));

          setLoading(false);
        });
      }
    );

    return () =>
      unsubscribers.forEach((unsub) =>
        unsub()
      );
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
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
  }, []);

  /* =========================================================
INSTALL APP
========================================================= */

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      await deferredPrompt.userChoice;

      setDeferredPrompt(null);
    } else {
      window.open(
        "https://golden-biashnet.web.app",
        "_blank"
      );
    }
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
HERO
========================================================= */}

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: 2,
          pt: 3,
          pb: 4,
          borderBottom: `1px solid ${BORDER}`,
          background:
            "radial-gradient(circle at top right, rgba(250,214,11,0.18), transparent 40%)",
        }}
      >
        <Fade in timeout={800}>
          <Box>
            {/* TOP BADGE */}

            <Chip
              label="Online Marketplace"
              icon={
                <VerifiedIcon
                  sx={{ color: GOLD }}
                />
              }
              sx={{
                background:
                  "rgba(0, 0, 0, 0.05)",
                color: "#dfe7de",
                border: `1px solid ${BORDER}`,
                mb: 2,
              }}
            />

            {/* TITLE */}

            <Typography
              sx={{
                fontSize: {
                  xs: 32,
                  sm: 42,
                },
                fontWeight: 900,
                lineHeight: 1,
                maxWidth: 500,
              }}
            >
              Buy. Sell. Grow.
            </Typography>

            <Typography
              sx={{
                color: GOLD,
                fontWeight: 900,
                fontSize: {
                  xs: 32,
                  sm: 42,
                },
                lineHeight: 1,
              }}
            >
              All In One App.
            </Typography>

            {/* SUBTEXT */}

            <Typography
              sx={{
                mt: 2,
                color: "#bdbdbd",
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 500,
              }}
            >
              Golden Biashnet helps
              students and local people
              around Juja discover
              products, services, houses,
              businesses and income
              opportunities.
            </Typography>

            {/* SEARCH */}

            <TextField
              fullWidth
              placeholder="Search products, services, houses..."
              onFocus={() =>
                navigate("/product")
              }
              sx={{
                mt: 3,

                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: 4,
                    background: CARD,
                    color: "#fff",

                    "& fieldset": {
                      border: `1px solid ${BORDER}`,
                    },
                  },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "#777",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* CTA BUTTONS */}

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <StorefrontIcon />
                }
                onClick={() =>
                  navigate("/product")
                }
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  background: GOLD,
                  color: "#000",
                  fontWeight: 800,
                  textTransform: "none",

                  "&:hover": {
                    background: "#f5cf00",
                  },
                }}
              >
                Explore
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <ShoppingBagIcon />
                }
                onClick={() =>
                  navigate("/uploads")
                }
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  border: `1px solid ${BORDER}`,
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Start Selling
              </Button>
            </Stack>

            {/* STATS */}

            <Stack
              direction="row"
              spacing={3}
              sx={{ mt: 3 }}
            >
              {[
                {
                  label: "Marketplace",
                  value: "24/7",
                },
                {
                  label: "Categories",
                  value: "4+",
                },
                {
                  label: "Fast Access",
                  value: "Instant",
                },
              ].map((item, i) => (
                <Box key={i}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: GOLD,
                      fontSize: 18,
                    }}
                  >
                    {item.value}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#888",
                      fontSize: 11,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Fade>
      </Box>

      {/* =========================================================
QUICK ACTIONS
========================================================= */}

      <Box sx={{ px: 2, mt: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={1.5}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            Quick Access
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontSize: 12,
            }}
          >
            Explore →
          </Typography>
        </Box>

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
          {actions.map((a, i) => (
            <Card
              key={i}
              onClick={() =>
                a.onClick
                  ? a.onClick()
                  : navigate(a.route)
              }
              sx={{
                minWidth: 95,
                background: CARD,
                borderRadius: 4,
                border: `1px solid ${BORDER}`,
                textAlign: "center",
                p: 1.5,
                cursor: "pointer",
                flexShrink: 0,

                transition: "0.2s",

                "&:active": {
                  transform: "scale(0.94)",
                },
              }}
            >
              <Avatar
                sx={{
                  mx: "auto",
                  mb: 1,
                  background:
                    "rgba(250,214,11,0.12)",
                  color: GOLD,
                }}
              >
                {a.icon}
              </Avatar>

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {a.title}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>

      {/* =========================================================
TRENDING SECTION
========================================================= */}

      <Box sx={{ px: 2, mt: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Trending Now
            </Typography>

            <Typography
              sx={{
                color: "#888",
                fontSize: 11,
              }}
            >
              Fresh listings from Juja
            </Typography>
          </Box>

          <Button
            endIcon={
              <ArrowForwardIcon />
            }
            onClick={() =>
              navigate("/product")
            }
            sx={{
              color: GOLD,
              textTransform: "none",
            }}
          >
            View
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress
              sx={{ color: GOLD }}
            />
          </Box>
        ) : (
          <Box
            ref={scrollRef}
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
            {posts.map((item) => (
              <Card
                key={item.id}
                onClick={() =>
                  navigate(
                    `/post/${
                      routeMap[item.type]
                    }/${item.id}`
                  )
                }
                sx={{
                  minWidth: 155,
                  maxWidth: 155,
                  borderRadius: 4,
                  background: CARD,
                  overflow: "hidden",
                  flexShrink: 0,
                  cursor: "pointer",
                  border: `1px solid ${BORDER}`,
                }}
              >
                {/* IMAGE */}

                <Box
                  component="img"
                  src={
                    item.images?.[0]
                      ?.thumb ||
                    item.images?.[0]
                      ?.full ||
                    "/placeholder.jpg"
                  }
                  sx={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                  }}
                />

                <CardContent
                  sx={{ p: 1.2 }}
                >
                  <Chip
                    size="small"
                    label={item.type}
                    sx={{
                      mb: 1,
                      background:
                        typeColors[
                          item.type
                        ],
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      height: 32,
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 900,
                      color: GOLD,
                      fontSize: 14,
                    }}
                  >
                    Ksh {item.price}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* =========================================================
FEATURES
========================================================= */}

      <Box sx={{ px: 2, mt: 3 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 15,
            mb: 1.5,
          }}
        >
          Opportunities
        </Typography>

        <Grid container spacing={1.5}>
          {[
            {
              title: "Find Houses",
              desc: "Rooms & bedsitters",
              icon: <HomeWorkIcon />,
              route: "/houses",
            },
            {
              title: "Sell Products",
              desc: "Start earning",
              icon: <ShoppingBagIcon />,
              route: "/uploads",
            },
            {
              title: "Offer Services",
              desc: "Get clients",
              icon: <BuildIcon />,
              route: "/services",
            },
            {
              title: "Promote Business",
              desc: "Reach students",
              icon: <CampaignIcon />,
              route: "/myuploads",
            },
          ].map((item, i) => (
            <Grid
              item
              xs={6}
              key={i}
            >
              <Card
                onClick={() =>
                  navigate(item.route)
                }
                sx={{
                  background: CARD,
                  borderRadius: 4,
                  border: `1px solid ${BORDER}`,
                  p: 1.5,
                  cursor: "pointer",
                  height: "100%",

                  "&:active": {
                    transform:
                      "scale(0.97)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    background:
                      "rgba(250,214,11,0.12)",
                    color: GOLD,
                    mb: 1.5,
                  }}
                >
                  {item.icon}
                </Avatar>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#999",
                    mt: 0.5,
                  }}
                >
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* =========================================================
WHY USERS STAY
========================================================= */}

      <Box sx={{ px: 2, mt: 3 }}>
        <Card
          sx={{
            background:
              "linear-gradient(135deg, rgba(250,214,11,0.14), rgba(255,255,255,0.02))",
            borderRadius: 5,
            border: `1px solid ${BORDER}`,
          }}
        >
          <CardContent>
            <Stack
              spacing={2}
            >
              {[
                {
                  icon: (
                    <BoltIcon />
                  ),
                  title:
                    "Fast Local Connections",
                  desc:
                    "Connect with nearby students and local businesses quickly.",
                },
                {
                  icon: (
                    <TrendingUpIcon />
                  ),
                  title:
                    "Income Opportunities",
                  desc:
                    "Sell products, market services and grow your business.",
                },
                {
                  icon: (
                    <VerifiedIcon />
                  ),
                  title:
                    "Growing Community",
                  desc:
                    "Be part of the future of local digital marketplaces.",
                },
              ].map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={1.5}
                >
                  <Avatar
                    sx={{
                      background:
                        "rgba(250,214,11,0.15)",
                      color: GOLD,
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#aaa",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
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
                    <DownloadIcon />
                  }
                  onClick={
                    handleInstallApp
                  }
                  sx={{
                    background: GOLD,
                    color: "#000",
                    fontWeight: 800,
                    borderRadius: 3,
                    textTransform:
                      "none",
                  }}
                >
                  App
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