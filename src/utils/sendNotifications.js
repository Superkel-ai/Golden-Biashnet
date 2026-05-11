import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export const sendNotification = async ({
  type,
  title,
  message,
  userId,
  senderId = null,
  link = "/",
  priority = "normal"
}) => {
  try {
    await addDoc(collection(db, "notifications"), {
      type,
      title,
      message,
      userId,
      senderId,
      link,
      priority,
      readBy: [],
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
};