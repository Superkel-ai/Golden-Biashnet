import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
  Badge,
  CircularProgress
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const COLORS = {
  GOLD: "#F4B400",
  BLACK: "#0a0a0a",
  CARD: "#111",
  BORDER: "#222",
  TEXT: "#fff",
  MUTED: "#aaa",
  ONLINE: "#4CAF50"
};

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const navigate = useNavigate();

  /* ===================================== */
  /* LOAD CHATS + USERS */
  /* ===================================== */

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const list = [];

      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      // ✅ sort by latest message
      list.sort(
        (a, b) =>
          (b.lastMessageAt?.seconds || 0) -
          (a.lastMessageAt?.seconds || 0)
      );

      setChats(list);

      // ✅ collect other user IDs
      const userIds = new Set();

      list.forEach((chat) => {
        chat.participants.forEach((id) => {
          if (id !== user.uid) userIds.add(id);
        });
      });

      // ✅ fetch user data
      const newMap = {};

      await Promise.all(
        [...userIds].map(async (id) => {
          const snap = await getDoc(doc(db, "users", id)); // 🔥 USE CORRECT COLLECTION
          if (snap.exists()) {
            newMap[id] = snap.data();
          }
        })
      );

      setUsersMap(newMap);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ===================================== */
  /* HELPERS */
  /* ===================================== */

  const getOtherUserId = (chat) =>
    chat.participants.find((id) => id !== user.uid);

  /* ===================================== */
  /* FILTER ONLY EXISTING CHATS */
  /* ===================================== */

  const filteredChats = chats.filter((chat) => {
    const otherId = getOtherUserId(chat);
    const name = usersMap[otherId]?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  /* ===================================== */
  /* LOADING */
  /* ===================================== */

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: COLORS.BLACK
        }}
      >
        <CircularProgress sx={{ color: COLORS.GOLD }} />
      </Box>
    );
  }

  /* ===================================== */
  /* UI */
  /* ===================================== */

  return (
    <Box
      sx={{
        p: 2,
        background: COLORS.BLACK,
        minHeight: "100vh",
        color: COLORS.TEXT
      }}
    >
      {/* HEADER */}
      <Typography
        sx={{
          color: COLORS.GOLD,
          fontWeight: 800,
          fontSize: 22,
          mb: 2
        }}
      >
        Messages
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
          background: COLORS.CARD,
          borderRadius: 2,
          input: { color: COLORS.TEXT }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: COLORS.GOLD }} />
            </InputAdornment>
          )
        }}
      />

      <Divider sx={{ background: COLORS.BORDER, mb: 2 }} />

      {/* EMPTY */}
      {filteredChats.length === 0 && (
        <Typography sx={{ color: COLORS.MUTED }}>
          No conversations yet
        </Typography>
      )}

      {/* CHAT LIST */}
      {filteredChats.map((chat) => {
        const otherId = getOtherUserId(chat);
        const otherUser = usersMap[otherId];

        const unread = chat.unreadCount?.[user.uid] || 0;

        return (
          <Paper
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              mb: 1.2,
              cursor: "pointer",
              background: COLORS.CARD,
              borderRadius: 2,
              "&:hover": {
                background: "#1a1a1a"
              }
            }}
          >
            {/* LEFT */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              
              <Avatar
                src={otherUser?.photoURL || ""}
                sx={{
                  bgcolor: COLORS.GOLD,
                  color: "#000",
                  fontWeight: 700
                }}
              >
                {!otherUser?.photoURL &&
                  (otherUser?.name?.charAt(0) || "U")}
              </Avatar>

              <Box>
                <Typography fontWeight={700}>
                  {otherUser?.name || "User"}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: unread ? "#fff" : COLORS.MUTED,
                    fontWeight: unread ? 600 : 400
                  }}
                >
                  {chat.lastMessage || "Start conversation"}
                </Typography>
              </Box>
            </Box>

            {/* RIGHT */}
            <Box textAlign="right">
              {chat.lastMessageAt?.toDate && (
                <Typography sx={{ fontSize: 11, color: COLORS.MUTED }}>
                  {chat.lastMessageAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </Typography>
              )}

              {unread > 0 && (
                <Badge badgeContent={unread} color="error" sx={{ mt: 1 }} />
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}