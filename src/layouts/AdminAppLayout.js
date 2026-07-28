// src/components/AdminAppLayout.js

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

import { useNavigate, useLocation } from "react-router-dom";

/* ================= ICONS ================= */

import Menu from "@mui/icons-material/Menu";
import Inventory from "@mui/icons-material/Inventory";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";

import Dashboard from "@mui/icons-material/Dashboard";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import Group from "@mui/icons-material/Group";
import PostAdd from "@mui/icons-material/PostAdd";
import Subscriptions from "@mui/icons-material/Subscriptions";
import Inventory2 from "@mui/icons-material/Inventory2";
import Handyman from "@mui/icons-material/Handyman";
import HomeWork from "@mui/icons-material/HomeWork";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Campaign from "@mui/icons-material/Campaign";
import MonitorHeart from "@mui/icons-material/MonitorHeart";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import Groups from "@mui/icons-material/Groups";

const drawerWidth = 250;

const COLORS = {
  BLACK: "#000000",
  CARD: "#111111",
  BORDER: "#222222",
  GOLD: "#F4B400",
  GOLD_LIGHT: "#FFD54F",
  TEXT: "#FFFFFF",
};

export default function AdminAppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [open, setOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  /* ================= MENU ITEMS ================= */

  const menuItems = [

  // ================= MAIN =================
  {
    text: "Dashboard",
    icon: <Dashboard />,
    path: "/admin/dashboard"
  },

  // ================= USERS =================
  {
    text: "Users",
    icon: <Group />,
    path: "/admin/users"
  },

  {
    text: "Support",
    icon: <AdminPanelSettings />,
    path: "/admin/support"
  },

  // ================= SALES =================
  {
    text: "Orders",
    icon: <ShoppingCart />,
    path: "/admin/orders"
  },

  {
    text: "Flash Sales",
    icon: <ShoppingCart />,
    path: "/admin/flash"
  },

  // ================= VERIFY =================
  {
    text: "Verify",
    icon: <AdminPanelSettings />,
    path: "/admin/verify"
  },

  // ================= MARKETPLACE =================
  {
    text: "Products",
    icon: <Inventory2 />,
    path: "/admin/products"
  },

  {
    text: "Services",
    icon: <Handyman />,
    path: "/admin/services"
  },

  {
    text: "Houses",
    icon: <HomeWork />,
    path: "/admin/houses"
  },

  // ================= BUSINESS =================
  {
    text: "Subscriptions",
    icon: <Subscriptions />,
    path: "/admin/sub"
  },

  {
    text: "Investors",
    icon: <TrendingUp />,
    path: "/admin/investors"
  },

  {
    text: "Adverts",
    icon: <Campaign />,
    path: "/admin/adverts"
  },

  // ================= SYSTEM =================
  {
    text: "Notifications",
    icon: <NotificationsActive />,
    path: "/admin/notify"
  }

];
  return (
    <Box sx={{ display: "flex", background: COLORS.BLACK }}>

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
        {/* LOGO / TITLE */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: COLORS.GOLD, fontWeight: 700 }}
          >
            Admin Panel
          </Typography>

          {isMobile && (
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: COLORS.GOLD }}
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ borderColor: COLORS.BORDER }} />

        {/* MENU LIST */}

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
                  backgroundColor: "#1c1c1c",
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
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>

            {isMobile && (
              <IconButton
                onClick={() => setOpen(true)}
                sx={{ color: COLORS.GOLD }}
              >
                <Menu />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Golden Biashnet Admin
            </Typography>

            <AdminPanelSettings sx={{ color: COLORS.GOLD }} />

          </Toolbar>
        </AppBar>

        {/* SPACER */}
        <Toolbar />

        {/* ================= CONTENT ================= */}

        <Box
          sx={{
            p: { xs: 2, md: 4 },
            pb: isMobile ? "80px" : 4,
          }}
        >
          {children}
        </Box>

        {/* ================= MOBILE NAV ================= */}

        {isMobile && (
          <BottomNavigation
            value={location.pathname}
            onChange={(e, newValue) => handleNavigate(newValue)}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: COLORS.CARD,
              borderTop: `1px solid ${COLORS.BORDER}`,
              zIndex: 1300,
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              value="/admin/dashboard"
              icon={<Dashboard />}
              sx={{ color: COLORS.GOLD }}
            />

            <BottomNavigationAction
              label="Orders"
              value="/admin/orders"
              icon={<ShoppingCart />}
              sx={{ color: COLORS.GOLD }}
            />

            <BottomNavigationAction
              label="Products"
              value="/admin/products"
              icon={<Inventory />}
              sx={{ color: COLORS.GOLD }}
            />

            <BottomNavigationAction
              label="Adverts"
              value="/admin/adverts"
              icon={<Campaign />}
              sx={{ color: COLORS.GOLD }}
            />
          </BottomNavigation>
        )}

      </Box>
    </Box>
  );
}