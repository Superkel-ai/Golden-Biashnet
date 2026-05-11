// src/components/AppLayout.js

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Divider,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import Bell from "../components/Bell";
import ChatIcon from "../components/Chat";

import {
  Menu,
  Home,
  ShoppingCart,
  Upload,
  LocalShipping,
  PersonAdd,
  ProductionQuantityLimits,
  Subscriptions,
  TrackChanges,
  Person,
    Build,

    Campaign,


  Logout,
  ChevronLeft,
  TrendingUp,
} from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const COLORS = {
  BLACK: "#000",
  CARD: "#111",
  BORDER: "#222",
  GOLD: "#F4B400",
  GOLD_LIGHT: "#FFD54F",
  TEXT: "#fff",
};

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => setOpen(!open);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setOpen(false); // ✅ auto collapse on mobile
  };

  const menuItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Uploads", icon: <Upload />, path: "/uploads" },

    { text: "Products", icon: <ShoppingCart />, path: "/product" },
    { text: "Houses", icon: <Home />, path: "/houses" },
    { text: "Services", icon: <Build />, path: "/services" },
    { text: "Adverts", icon: <Campaign />, path: "/adverts" },
    { text: "Boost", icon: <TrendingUp />, path: "/boost" },
    { text: "My Orders", icon: <LocalShipping />, path: "/my-orders" },
    
    { text: "Create Account", icon: <PersonAdd />, path: "/signup" },
    { text: "Profile", icon: <Person />, path: "/profile" },
    { text: "LogIn", icon: <Logout />, path: "/login" },
  ];

  return (
<Box
  sx={{
    display: "flex",
    background: COLORS.BLACK,

    width: "100%",
    maxWidth: "100vw",       // 🔥 HARD STOP horizontal stretch
    overflowX: "hidden",     // 🔥 GLOBAL FIX (no page will stretch again)

    justifyContent: "center" // 🔥 centers app on large screens
  }}
>

      {/* ================= SIDEBAR ================= */}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: COLORS.CARD,
            color: COLORS.TEXT,
            borderRight: `1px solid ${COLORS.BORDER}`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: COLORS.GOLD, fontWeight: 1000 }}>
            G_B_M
          </Typography>

          {isMobile && (
            <IconButton onClick={() => setOpen(false)} sx={{ color: COLORS.GOLD }}>
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ borderColor: COLORS.BORDER }} />

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: COLORS.GOLD,
                  color: COLORS.BLACK,
                  "& .MuiListItemIcon-root": { color: COLORS.BLACK },
                },
                "&:hover": {
                  backgroundColor: "#222",
                },
              }}
            >
              <ListItemIcon sx={{ color: COLORS.TEXT }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* ================= MAIN AREA ================= */}

      <Box
  component="main"
  sx={{
    flexGrow: 1,
    background: COLORS.BLACK,
    minHeight: "100vh",

    width: "100%",
    maxWidth: 480,        // 🔥 MOBILE APP WIDTH (VERY IMPORTANT)
    margin: "0 auto",     // 🔥 center content

    overflowX: "hidden",  // 🔥 double protection
  }}
>

        {/* ================= TOP NAV ================= */}

        <AppBar
          position="fixed"
          sx={{
            background: COLORS.CARD,
            color: COLORS.GOLD,
            borderBottom: `1px solid ${COLORS.BORDER}`,
            zIndex: 1201,
            width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ color: COLORS.GOLD }}
              >
                <Menu />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ fontWeight: 1000 }}>
              BIASHNET
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <ChatIcon />
  <Bell />
</Box>
          </Toolbar>
        </AppBar>

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* ================= PAGE CONTENT ================= */}

        <Box
  sx={{
    px: 2,                 // 🔥 consistent mobile padding
    pt: 1.5,
    pb: isMobile ? "80px" : 3,

    width: "100%",
    maxWidth: "100%",      // 🔥 prevent inner overflow
    overflowX: "hidden",
  }}
>
          {children}
        </Box>

        {/* ================= BOTTOM NAV (MOBILE ONLY) ================= */}

        {isMobile && (
          <BottomNavigation
            value={location.pathname}
            onChange={(e, newValue) => handleNavigate(newValue)}
            sx={{
              position: "fixed",
              bottom: 0,
              left: isMobile ? 0 : drawerWidth,
              right: 0,
              maxWidth: 480, 
              margin: "0 auto",    
              background: COLORS.CARD,
              borderTop: `1px solid ${COLORS.BORDER}`,
              zIndex: 1300,
            }}
          >
            <BottomNavigationAction
              label="Home"
              value="/"
              icon={<Home />}
              sx={{ color: COLORS.GOLD }}
            />
            <BottomNavigationAction
              label="Cart"
              value="/cart"
              icon={<ShoppingCart />}
              sx={{ color: COLORS.GOLD }}
            />
            <BottomNavigationAction
              label="Uploads"
              value="/uploads"
              icon={<Upload />}
              sx={{ color: COLORS.GOLD }}
            />
            <BottomNavigationAction
              label="Profile"
              value="/profile"
              icon={<Person />}
              sx={{ color: COLORS.GOLD }}
            />
          </BottomNavigation>
        )}
      </Box>
    </Box>
  );
}