import React, {
  useEffect,
  useState
} from "react";

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  Chip,
  CircularProgress
} from "@mui/material";

import {
  NotificationsActive,
  Campaign,
  Person,
  Send
} from "@mui/icons-material";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../services/firebase";

import {
  Navigate
} from "react-router-dom";

const GOLD = "#F4B400";

export default function AdminNotifications() {

  /* =====================================================
     SECURITY
  ===================================================== */

  const [authorized, setAuthorized] =
    useState(null);

  /* =====================================================
     STATES
  ===================================================== */

  const [title, setTitle] = useState("");

  const [message, setMessage] =
    useState("");

  const [type, setType] =
    useState("broadcast");

  const [users, setUsers] =
    useState([]);

  const [selectedUser,
    setSelectedUser] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     VERIFY ADMIN
  ===================================================== */

  useEffect(() => {

    const verifyAdmin = async () => {

      try {

        if (!auth.currentUser) {
          setAuthorized(false);
          return;
        }

        const adminRef = doc(
          db,
          "admins",
          auth.currentUser.uid
        );

        const adminSnap =
          await getDoc(adminRef);

        if (!adminSnap.exists()) {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

      } catch (err) {

        console.log(err);
        setAuthorized(false);

      }

    };

    verifyAdmin();

  }, []);

  /* =====================================================
     FETCH USERS
  ===================================================== */

  useEffect(() => {

    if (!authorized) return;

    const fetchUsers = async () => {

      try {

        const snap = await getDocs(
          collection(db, "users")
        );

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUsers(data);

      } catch (err) {

        console.log(err);

      }

    };

    fetchUsers();

  }, [authorized]);

  /* =====================================================
     SEND NOTIFICATION
  ===================================================== */

  const handleSend = async () => {

    if (!title || !message) {

      setError(
        "Title and message required"
      );

      return;

    }

    if (
      type === "individual"
      &&
      !selectedUser
    ) {

      setError("Select user");
      return;

    }

    try {

      setLoading(true);
      setError("");

      await addDoc(
        collection(db, "notifications"),
        {

          title: title.trim(),

          message: message.trim(),

          type,

          userId:
            type === "individual"
              ? selectedUser
              : null,

          readBy: [],

          createdAt:
            serverTimestamp(),

          createdBy:
            auth.currentUser.uid,

          createdByEmail:
            auth.currentUser.email,

          isActive: true

        }
      );

      /* RESET */

      setTitle("");
      setMessage("");
      setSelectedUser("");

      setSuccess(true);

    } catch (err) {

      console.log(err);

      setError(
        "Failed to send notification"
      );

    } finally {

      setLoading(false);

    }

  };

  /* =====================================================
     BLOCK ACCESS
  ===================================================== */

  if (authorized === false) {
    return <Navigate to="/admin" />;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (authorized === null) {

    return (

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505"
        }}
      >

        <CircularProgress
          sx={{ color: GOLD }}
        />

      </Box>

    );

  }

  return (

    <Box
      sx={{
        p: 2,
        background: "#050505",
        minHeight: "100vh"
      }}
    >

      {/* =====================================================
         HEADER
      ===================================================== */}

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          background:
            "linear-gradient(135deg,#1a1a1a,#111)",
          border:
            "1px solid rgba(255,255,255,.06)"
        }}
      >

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >

          <NotificationsActive
            sx={{
              color: GOLD,
              fontSize: 30
            }}
          />

          <Box>

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 18
              }}
            >
              Admin Notifications
            </Typography>

            <Typography
              sx={{
                color: "#888",
                fontSize: 12
              }}
            >
              Send announcements securely
            </Typography>

          </Box>

        </Stack>

      </Paper>

      {/* =====================================================
         FORM
      ===================================================== */}

      <Paper
        sx={{
          p: 2,
          borderRadius: 4,
          background: "#111",
          border:
            "1px solid rgba(255,255,255,.06)"
        }}
      >

        {/* TYPE */}

        <TextField
          select
          fullWidth
          label="Notification Type"
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          sx={{
            mb: 2
          }}
        >

          <MenuItem value="broadcast">

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >

              <Campaign
                sx={{ fontSize: 18 }}
              />

              <Typography>
                Broadcast
              </Typography>

            </Stack>

          </MenuItem>

          <MenuItem value="individual">

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >

              <Person
                sx={{ fontSize: 18 }}
              />

              <Typography>
                Individual
              </Typography>

            </Stack>

          </MenuItem>

        </TextField>

        {/* USER */}

        {type === "individual" && (

          <TextField
            select
            fullWidth
            label="Select User"
            value={selectedUser}
            onChange={(e) =>
              setSelectedUser(
                e.target.value
              )
            }
            sx={{ mb: 2 }}
          >

            {users.map((user) => (

              <MenuItem
                key={user.id}
                value={user.id}
              >

                {user.name || "User"}
                {" "}
                (
                {user.email}
                )

              </MenuItem>

            ))}

          </TextField>

        )}

        {/* TITLE */}

        <TextField
          fullWidth
          label="Notification Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          sx={{ mb: 2 }}
        />

        {/* MESSAGE */}

        <TextField
          fullWidth
          multiline
          rows={5}
          label="Write message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          sx={{ mb: 2 }}
        />

        {/* INFO */}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          mb={2}
        >

          <Chip
            label={
              type === "broadcast"
                ? "All Users"
                : "Single User"
            }
            sx={{
              background:
                "rgba(244,180,0,.12)",
              color: GOLD,
              fontWeight: 700
            }}
          />

          <Chip
            label={
              `${users.length} Users`
            }
            sx={{
              background:
                "rgba(255,255,255,.05)",
              color: "#ccc"
            }}
          />

        </Stack>

        {/* SEND BUTTON */}

        <Button
          fullWidth
          variant="contained"
          startIcon={<Send />}
          disabled={loading}
          onClick={handleSend}
          sx={{
            py: 1.3,
            borderRadius: 3,
            background:
              "linear-gradient(135deg,#F4B400,#ff9800)",
            color: "#000",
            fontWeight: 900,
            fontSize: 14,

            "&:hover": {
              background:
                "linear-gradient(135deg,#ffcc00,#ff9800)"
            }
          }}
        >

          {loading
            ? "Sending..."
            : "Send Notification"}

        </Button>

      </Paper>

      {/* =====================================================
         SUCCESS
      ===================================================== */}

      <Snackbar
        open={success}
        autoHideDuration={3500}
        onClose={() =>
          setSuccess(false)
        }
      >

        <Alert severity="success">

          Notification sent successfully

        </Alert>

      </Snackbar>

      {/* =====================================================
         ERROR
      ===================================================== */}

      <Snackbar
        open={!!error}
        autoHideDuration={3500}
        onClose={() =>
          setError("")
        }
      >

        <Alert severity="error">

          {error}

        </Alert>

      </Snackbar>

    </Box>

  );

}