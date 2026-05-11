import React, { useEffect, useState } from "react";
import { IconButton, Badge } from "@mui/material";
import { Chat } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";

const GOLD = "#F4B400";

export default function ChatIcon() {
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let count = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        // 🔥 count unread messages
        if (
          data.lastMessage &&
          data.lastMessage.senderId !== auth.currentUser.uid &&
          !data.lastMessage.read
        ) {
          count++;
        }
      });

      setUnread(count);
    });

    return () => unsub();
  }, []);

  return (
    <IconButton onClick={() => navigate("/chats")}>
      <Badge badgeContent={unread} color="error">
        <Chat sx={{ color: GOLD }} />
      </Badge>
    </IconButton>
  );
}