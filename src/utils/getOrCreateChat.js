import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";

/**
 * Generate deterministic chat ID
 */
const generateChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

/**
 * Get existing chat OR create new one (PRODUCTION VERSION)
 */
export const getOrCreateChat = async (user1, user2) => {
  if (!user1 || !user2) {
    throw new Error("Missing user IDs");
  }

  const chatId = generateChatId(user1, user2);

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // ✅ If chat exists → return immediately
  if (chatSnap.exists()) {
    return chatId;
  }

  // 🚀 Create new chat instantly (no queries, no loops)
  await setDoc(chatRef, {
    participants: [user1, user2],

    lastMessage: "",
    lastMessageAt: serverTimestamp(),

    createdAt: serverTimestamp(),

    unreadCount: {
      [user1]: 0,
      [user2]: 0,
    },

    typing: {
      [user1]: false,
      [user2]: false,
    },
  });

  return chatId;
};