import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("broadcast");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [success, setSuccess] = useState(false);

  // 🔥 FETCH USERS (for individual notifications)
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "members"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  // 🔥 SEND NOTIFICATION
  const handleSend = async () => {
    if (!title || !message) return;

    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        type,
        userId: type === "individual" ? selectedUser : null,
        readBy: [],
        createdAt: serverTimestamp(),
        createdBy: "admin"
      });

      setTitle("");
      setMessage("");
      setSelectedUser("");
      setSuccess(true);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        Send Notification
      </Typography>

      <Paper sx={{ p: 2 }}>

        {/* TYPE */}
        <TextField
          select
          fullWidth
          label="Notification Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="broadcast">Broadcast (All Users)</MenuItem>
          <MenuItem value="individual">Individual User</MenuItem>
        </TextField>

        {/* USER SELECT */}
        {type === "individual" && (
          <TextField
            select
            fullWidth
            label="Select User"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            sx={{ mb: 2 }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.userId}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* TITLE */}
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* MESSAGE */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* SEND */}
        <Button
          fullWidth
          onClick={handleSend}
          sx={{
            background: "#F4B400",
            color: "#000",
            fontWeight: "bold"
          }}
        >
          Send Notification
        </Button>

      </Paper>

      {/* SUCCESS */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">Notification Sent</Alert>
      </Snackbar>
    </Box>
  );
}