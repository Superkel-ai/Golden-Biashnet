import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Stack,
  Chip,
  Divider
} from "@mui/material";

import {
  Notifications,
  MarkEmailRead,
  Campaign,
  ShoppingCart,
  Chat,
  Info
} from "@mui/icons-material";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const TEXT = "#fff";
const SUB = "#aaa";
const BORDER = "#222";

/* ===================================== */
/* ICON BY TYPE */
/* ===================================== */

const getIcon = (type) => {
  switch (type) {
    case "order":
      return <ShoppingCart sx={{ color: GOLD }} />;
    case "chat":
      return <Chat sx={{ color: "#4FC3F7" }} />;
    case "broadcast":
      return <Campaign sx={{ color: "#FF7043" }} />;
    default:
      return <Info sx={{ color: "#aaa" }} />;
  }
};

/* ===================================== */
/* TIME FORMAT */
/* ===================================== */

const formatTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";

  return date.toLocaleDateString();
};

/* ===================================== */
/* COMPONENT */
/* ===================================== */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  /* ===================================== */
  /* REALTIME LISTENER */
  /* ===================================== */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notif"),
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
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ===================================== */
  /* MARK SINGLE */
  /* ===================================== */

  const markAsRead = async (notif) => {
    if (!user) return;

    const alreadyRead = notif.readBy?.includes(user.uid);
    if (alreadyRead) return;

    const ref = doc(db, "notifications", notif.id);

    await updateDoc(ref, {
      readBy: [...(notif.readBy || []), user.uid]
    });
  };

  /* ===================================== */
  /* MARK ALL */
  /* ===================================== */

  const markAllAsRead = async () => {
    const unread = notifications.filter(
      (n) => !n.readBy?.includes(user.uid)
    );

    await Promise.all(
      unread.map((n) =>
        updateDoc(doc(db, "notifications", n.id), {
          readBy: [...(n.readBy || []), user.uid]
        })
      )
    );
  };

  const unreadCount = notifications.filter(
    (n) => !n.readBy?.includes(user.uid)
  ).length;

  /* ===================================== */
  /* LOADING */
  /* ===================================== */

  if (loading) {
    return (
      <Box
        sx={{
          background: BG,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, minHeight: "100vh", p: 2 }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        
        <Stack direction="row" alignItems="center" spacing={1}>
          <Notifications sx={{ color: GOLD }} />
          <Typography sx={{ color: GOLD, fontWeight: "bold" }}>
            Notifications
          </Typography>

          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              size="small"
              sx={{ background: GOLD, color: "#000" }}
            />
          )}
        </Stack>

        <IconButton onClick={markAllAsRead}>
          <MarkEmailRead sx={{ color: "#aaa" }} />
        </IconButton>

      </Stack>

      <Divider sx={{ borderColor: BORDER, mb: 2 }} />

      {/* EMPTY */}
      {notifications.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Notifications sx={{ fontSize: 60, color: "#333" }} />
          <Typography sx={{ color: SUB, mt: 2 }}>
            No notifications yet
          </Typography>
        </Box>
      ) : (

        notifications.map((notif) => {
          const isRead = notif.readBy?.includes(user.uid);

          return (
            <Paper
              key={notif.id}
              onClick={() => markAsRead(notif)}
              sx={{
                p: 2,
                mb: 1.5,
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderLeft: isRead
                  ? "3px solid #333"
                  : `3px solid ${GOLD}`,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  background: "#1a1a1a"
                }
              }}
            >
              <Stack direction="row" spacing={2}>

                {/* ICON */}
                <Box mt={0.5}>
                  {getIcon(notif.type)}
                </Box>

                {/* CONTENT */}
                <Box flex={1}>

                  <Typography
                    sx={{
                      color: TEXT,
                      fontWeight: isRead ? "normal" : "bold"
                    }}
                  >
                    {notif.title}
                  </Typography>

                  <Typography sx={{ color: SUB, fontSize: 13, mt: 0.5 }}>
                    {notif.message}
                  </Typography>

                  <Typography sx={{ color: "#666", fontSize: 11, mt: 1 }}>
                    {notif.createdAt?.toDate &&
                      formatTime(notif.createdAt.toDate())}
                  </Typography>

                </Box>

              </Stack>
            </Paper>
          );
        })

      )}
    </Box>
  );
}