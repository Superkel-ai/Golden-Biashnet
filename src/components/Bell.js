import React, { useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Stack,
  Divider
} from "@mui/material";



import NotificationsIcon from "@mui/icons-material/Notifications";
import Campaign from "@mui/icons-material/Campaign";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import Chat from "@mui/icons-material/Chat";
import Info from "@mui/icons-material/Info";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const TEXT = "#fff";
const SUB = "#aaa";
const BORDER = "#222";

/* ===================================== */
/* ICON LOGIC */
/* ===================================== */

const getIcon = (type) => {
  switch (type) {
    case "order":
      return <ShoppingCart sx={{ color: GOLD, fontSize: 20 }} />;
    case "chat":
      return <Chat sx={{ color: "#4FC3F7", fontSize: 20 }} />;
    case "broadcast":
      return <Campaign sx={{ color: "#FF7043", fontSize: 20 }} />;
    default:
      return <Info sx={{ color: "#aaa", fontSize: 20 }} />;
  }
};

/* ===================================== */
/* TIME FORMAT */
/* ===================================== */

const formatTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return "Now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";

  return date.toLocaleDateString();
};

/* ===================================== */
/* COMPONENT */
/* ===================================== */

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const user = auth.currentUser;

  const open = Boolean(anchorEl);

  /* ===================================== */
  /* REALTIME LISTENER */
  /* ===================================== */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (
          data.type === "broadcast" ||
          data.userId === user.uid
        ) {
          list.push({
            id: docSnap.id,
            ...data
          });
        }
      });

      setNotifications(list);
    });

    return () => unsub();
  }, [user]);

  /* ===================================== */
  /* UNREAD COUNT */
  /* ===================================== */

  const unreadCount = notifications.filter(
    (n) => !n.readBy?.includes(user?.uid)
  ).length;

  /* ===================================== */
  /* MARK READ */
  /* ===================================== */

  const markAsRead = async (notif) => {
    if (!user) return;

    const alreadyRead = notif.readBy?.includes(user.uid);
    if (alreadyRead) return;

    await updateDoc(doc(db, "notifications", notif.id), {
      readBy: [...(notif.readBy || []), user.uid]
    });
  };

  /* ===================================== */
  /* HANDLERS */
  /* ===================================== */

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* 🔔 ICON */}
      <IconButton onClick={handleClick}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
        >
          <NotificationsIcon sx={{ color: GOLD }} />
        </Badge>
      </IconButton>

      {/* 🔥 DROPDOWN */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            background: BG,
            width: 340,
            maxHeight: 420,
            border: `1px solid ${BORDER}`,
            borderRadius: 2
          }
        }}
      >
        {/* HEADER */}
        <Box px={2} py={1}>
          <Typography sx={{ color: TEXT, fontWeight: "bold" }}>
            Notifications
          </Typography>
        </Box>

        <Divider sx={{ borderColor: BORDER }} />

        {/* EMPTY */}
        {notifications.length === 0 && (
          <Box textAlign="center" py={4}>
            <NotificationsIcon sx={{ color: "#333", fontSize: 40 }} />
            <Typography sx={{ color: SUB, mt: 1 }}>
              No notifications
            </Typography>
          </Box>
        )}

        {/* LIST */}
        {notifications.slice(0, 6).map((notif) => {
          const isRead = notif.readBy?.includes(user?.uid);

          return (
            <Box
              key={notif.id}
              onClick={() => {
                markAsRead(notif);
                handleClose();
                navigate("/notify");
              }}
              sx={{
                px: 2,
                py: 1.5,
                cursor: "pointer",
                background: isRead ? "transparent" : "#151515",
                borderBottom: `1px solid ${BORDER}`,
                "&:hover": {
                  background: "#1f1f1f"
                }
              }}
            >
              <Stack direction="row" spacing={2}>

                {/* ICON */}
                {getIcon(notif.type)}

                {/* CONTENT */}
                <Box flex={1}>
                  <Typography
                    sx={{
                      color: TEXT,
                      fontWeight: isRead ? "normal" : "bold",
                      fontSize: 13
                    }}
                  >
                    {notif.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 12,
                      mt: 0.3
                    }}
                  >
                    {notif.message}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#666",
                      fontSize: 11,
                      mt: 0.5
                    }}
                  >
                    {notif.createdAt?.toDate &&
                      formatTime(notif.createdAt.toDate())}
                  </Typography>
                </Box>

              </Stack>
            </Box>
          );
        })}

        {/* VIEW ALL */}
        {notifications.length > 0 && (
          <Box
            textAlign="center"
            py={1.5}
            sx={{
              cursor: "pointer",
              "&:hover": { background: "#1a1a1a" }
            }}
            onClick={() => {
              handleClose();
              navigate("/notify");
            }}
          >
            <Typography sx={{ color: GOLD, fontWeight: "bold" }}>
              View All Notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
}