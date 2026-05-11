import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  arrayUnion
} from "firebase/firestore";

import { db, auth } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";

const COLORS = {
  GOLD: "#F4B400",
  BLACK: "#0a0a0a",
  CARD: "#111",
  TEXT: "#fff",
  MUTED: "#aaa",
  GREEN: "#25D366", // seen color
  SENT: "#333",
  RECEIVED: "#1a1a1a"
};

export default function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  const user = auth.currentUser;
  const bottomRef = useRef();

  /* ===================================== */
  /* LOAD CHAT + USER */
  /* ===================================== */

  useEffect(() => {
    if (!chatId || !user) return;

    const loadChat = async () => {
      const snap = await getDoc(doc(db, "chats", chatId));
      if (!snap.exists()) return;

      const chatData = snap.data();
      setChat(chatData);

      const otherId = chatData.participants.find(
        (id) => id !== user.uid
      );

      const userSnap = await getDoc(doc(db, "users", otherId));
      if (userSnap.exists()) {
        setOtherUser(userSnap.data());
      }

      // reset unread count
      await updateDoc(doc(db, "chats", chatId), {
        [`unreadCount.${user.uid}`]: 0
      });
    };

    loadChat();
  }, [chatId, user]);

  /* ===================================== */
  /* LOAD MESSAGES */
  /* ===================================== */

  useEffect(() => {
    if (!chatId || !user) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const list = [];

      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setMessages(list);

      // 🔥 MARK AS SEEN (REAL)
      list.forEach(async (msg) => {
        if (
          msg.senderId !== user.uid &&
          !msg.seenBy?.includes(user.uid)
        ) {
          await updateDoc(doc(db, "messages", msg.id), {
            seenBy: arrayUnion(user.uid)
          });
        }
      });

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    });

    return () => unsub();
  }, [chatId, user]);

  /* ===================================== */
  /* SEND MESSAGE */
  /* ===================================== */

  const sendMessage = async () => {
    if (!text.trim()) return;

    const receiverId = chat.participants.find(
      (id) => id !== user.uid
    );

    const msg = {
      chatId,
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      seenBy: [user.uid] // sender has seen
    };

    await addDoc(collection(db, "messages"), msg);

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastSenderId: user.uid,
      [`unreadCount.${receiverId}`]: increment(1),
      [`unreadCount.${user.uid}`]: 0
    });

    setText("");
  };

  /* ===================================== */
  /* FORMAT TIME */
  /* ===================================== */

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return "";
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /* ===================================== */
  /* UI */
  /* ===================================== */

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: COLORS.BLACK
      }}
    >

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 1.5,
          borderBottom: "1px solid #222",
          background: COLORS.CARD,
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: COLORS.GOLD }} />
        </IconButton>

        <Avatar src={otherUser?.photoURL}>
          {otherUser?.name?.charAt(0)}
        </Avatar>

        <Box>
          <Typography fontWeight="bold" color="#fff">
            {otherUser?.name || "User"}
          </Typography>

          <Typography fontSize={12} color={COLORS.MUTED}>
            {otherUser?.online ? "Online" : "Last seen recently"}
          </Typography>
        </Box>
      </Box>

      {/* MESSAGES */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {messages.map((msg) => {
          const isMine = msg.senderId === user.uid;
          const seen = msg.seenBy?.length > 1;

          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                mb: 1
              }}
            >
              <Box
                sx={{
                  maxWidth: "75%",
                  px: 1.5,
                  py: 1,
                  borderRadius: 3,
                  background: isMine
                    ? COLORS.GOLD
                    : COLORS.RECEIVED,
                  color: isMine ? "#000" : "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
                }}
              >
                <Typography fontSize={14}>
                  {msg.text}
                </Typography>

                {/* TIME + TICKS */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 0.5,
                    mt: 0.5
                  }}
                >
                  <Typography fontSize={10} sx={{ opacity: 0.7 }}>
                    {formatTime(msg.createdAt)}
                  </Typography>

                  {isMine && (
                    <Typography
                      fontSize={10}
                      sx={{
                        color: seen ? COLORS.GREEN : "#999",
                        fontWeight: 700
                      }}
                    >
                      {seen ? "✓✓" : "✓"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}

        <div ref={bottomRef} />
      </Box>

      {/* INPUT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderTop: "1px solid #222",
          background: COLORS.CARD,
          position: "sticky",
          bottom: 0
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          maxRows={4}
          sx={{
            input: { color: "#fff" },
            textarea: { color: "#fff" },
            background: "#1a1a1a",
            borderRadius: 3,
            px: 1
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <IconButton onClick={sendMessage}>
          <SendIcon sx={{ color: COLORS.GOLD }} />
        </IconButton>
      </Box>
    </Box>
  );
}