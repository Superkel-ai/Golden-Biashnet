// src/pages/SuperAdminManager.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  IconButton,
  MenuItem,
  CircularProgress,
  Divider,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from "@mui/material";

import {
  Delete,
  Block,
  AdminPanelSettings,
  CheckCircle,
  Person,
  Search,
  Edit,
  Save,
  ContentCopy,
  Phone,
  Email,
  Badge,
  VerifiedUser
} from "@mui/icons-material";

import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

// ================= THEME =================

const BG = "#000";
const CARD = "#111";
const CARD2 = "#181818";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUB = "#aaa";
const BORDER = "#222";

// ================= SUPER ADMIN =================

const SUPER_ADMIN_EMAIL = "superkelmatush2@gmail.com";

export default function SuperAdminManager() {

  // ================= STATES =================

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const [foundUsers, setFoundUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "admin",
    status: "active",
    dashboard: true,
    users: true,
    orders: true,
    products: true,
    posts: true,
    investors: true
  });

  // ================= SECURITY =================

  const isSuperAdmin =
    auth.currentUser?.email === SUPER_ADMIN_EMAIL;

  // ================= FETCH ADMINS =================

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {

        const list = [];

        snapshot.forEach((docSnap) => {

          list.push({
            id: docSnap.id,
            ...docSnap.data()
          });

        });

        setAdmins(list);

      }
    );

    return () => unsub();

  }, []);

  // ================= DENIED =================

  if (!isSuperAdmin) {

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

        <Paper
          sx={{
            p: 5,
            background: CARD,
            border: `1px solid ${BORDER}`
          }}
        >

          <Typography
            sx={{
              color: "red",
              fontWeight: "bold",
              fontSize: 20
            }}
          >
            Access Denied
          </Typography>

        </Paper>

      </Box>
    );

  }

  // ================= SEARCH USERS =================

  const searchUsers = async () => {

    setError("");
    setSuccess("");

    if (!search.trim()) {
      setError("Enter name or email");
      return;
    }

    try {

      setSearching(true);

      const q1 = query(
        collection(db, "users"),
        where("name", ">=", search),
        where("name", "<=", search + "\uf8ff")
      );

      const q2 = query(
        collection(db, "users"),
        where("email", ">=", search),
        where("email", "<=", search + "\uf8ff")
      );

      const [snap1, snap2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const usersMap = new Map();

      snap1.forEach((docSnap) => {

        usersMap.set(docSnap.id, {
          id: docSnap.id,
          ...docSnap.data()
        });

      });

      snap2.forEach((docSnap) => {

        usersMap.set(docSnap.id, {
          id: docSnap.id,
          ...docSnap.data()
        });

      });

      setFoundUsers(Array.from(usersMap.values()));

    } catch (err) {

      console.error(err);
      setError("Failed to search users");

    }

    setSearching(false);

  };

  // ================= ADD ADMIN =================

  const addAdmin = async (user) => {

    try {

      await setDoc(doc(db, "admins", user.userId), {

        userId: user.userId,

        name: user.name || "",

        email: user.email || "",

        phone: user.phone || "",

        role: "admin",

        permissions: {
          dashboard: true,
          users: true,
          orders: true,
          products: true,
          posts: true,
          investors: true
        },

        status: "active",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        createdBy: auth.currentUser.email

      });

      setSuccess(`${user.name} added as admin`);

    } catch (err) {

      console.error(err);
      setError("Failed to add admin");

    }

  };

  // ================= REMOVE ADMIN =================

  const removeAdmin = async (id) => {

    try {

      await deleteDoc(doc(db, "admins", id));

      setSuccess("Admin removed");

    } catch (err) {

      console.error(err);
      setError("Failed to remove admin");

    }

  };

  // ================= OPEN EDIT =================

  const openEdit = (admin) => {

    setEditingAdmin(admin);

    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "admin",
      status: admin.status || "active",

      dashboard: admin.permissions?.dashboard || false,
      users: admin.permissions?.users || false,
      orders: admin.permissions?.orders || false,
      products: admin.permissions?.products || false,
      posts: admin.permissions?.posts || false,
      investors: admin.permissions?.investors || false
    });

    setEditOpen(true);

  };

  // ================= SAVE EDIT =================

  const saveAdminChanges = async () => {

    try {

      await updateDoc(
        doc(db, "admins", editingAdmin.id),
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          role: editForm.role,
          status: editForm.status,

          permissions: {
            dashboard: editForm.dashboard,
            users: editForm.users,
            orders: editForm.orders,
            products: editForm.products,
            posts: editForm.posts,
            investors: editForm.investors
          },

          updatedAt: serverTimestamp()
        }
      );

      setSuccess("Admin updated successfully");

      setEditOpen(false);

    } catch (err) {

      console.error(err);
      setError("Failed to update admin");

    }

  };

  // ================= COPY =================

  const copyText = (text) => {

    navigator.clipboard.writeText(text || "");

    setSuccess("Copied");

  };

  // ================= KPIs =================

  const activeAdmins =
    admins.filter(a => a.status === "active").length;

  const blockedAdmins =
    admins.filter(a => a.status === "blocked").length;

  // ================= UI =================

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        py: 4
      }}
    >

      <Container maxWidth="xl">

        {/* ================= HEADER ================= */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >

          <Box>

            <Typography
              sx={{
                color: GOLD,
                fontWeight: "bold",
                fontSize: {
                  xs: 24,
                  md: 30
                }
              }}
            >
              Super Admin Manager
            </Typography>

            <Typography
              sx={{
                color: SUB
              }}
            >
              Manage platform admins securely
            </Typography>

          </Box>

          <Chip
            icon={<VerifiedUser />}
            label="SUPER ADMIN"
            sx={{
              background: GOLD,
              color: "#000",
              fontWeight: "bold"
            }}
          />

        </Box>

        {/* ================= ALERTS ================= */}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* ================= KPI ================= */}

        <Grid container spacing={2} mb={3}>

          <Grid item xs={12} sm={4}>

            <Paper
              sx={{
                p: 3,
                background: CARD,
                border: `1px solid ${BORDER}`
              }}
            >

              <Typography sx={{ color: SUB }}>
                Total Admins
              </Typography>

              <Typography
                sx={{
                  color: GOLD,
                  fontWeight: "bold",
                  fontSize: 30
                }}
              >
                {admins.length}
              </Typography>

            </Paper>

          </Grid>

          <Grid item xs={12} sm={4}>

            <Paper
              sx={{
                p: 3,
                background: CARD,
                border: `1px solid ${BORDER}`
              }}
            >

              <Typography sx={{ color: SUB }}>
                Active Admins
              </Typography>

              <Typography
                sx={{
                  color: "#4caf50",
                  fontWeight: "bold",
                  fontSize: 30
                }}
              >
                {activeAdmins}
              </Typography>

            </Paper>

          </Grid>

          <Grid item xs={12} sm={4}>

            <Paper
              sx={{
                p: 3,
                background: CARD,
                border: `1px solid ${BORDER}`
              }}
            >

              <Typography sx={{ color: SUB }}>
                Blocked Admins
              </Typography>

              <Typography
                sx={{
                  color: "#f44336",
                  fontWeight: "bold",
                  fontSize: 30
                }}
              >
                {blockedAdmins}
              </Typography>

            </Paper>

          </Grid>

        </Grid>

        {/* ================= SEARCH USERS ================= */}

        <Paper
          sx={{
            p: 3,
            background: CARD,
            border: `1px solid ${BORDER}`,
            mb: 3
          }}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              mb: 2,
              fontSize: 20
            }}
          >
            Add Existing User As Admin
          </Typography>

          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
          >

            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: SUB }} />
                  </InputAdornment>
                ),
                sx: {
                  color: TEXT
                }
              }}
              sx={{
                flex: 1
              }}
            />

            <Button
              variant="contained"
              onClick={searchUsers}
              disabled={searching}
              sx={{
                background: GOLD,
                color: "#000",
                fontWeight: "bold",
                minWidth: 160
              }}
            >

              {searching
                ? <CircularProgress size={22} />
                : "Search Users"}

            </Button>

          </Box>

        </Paper>

        {/* ================= FOUND USERS ================= */}

        {foundUsers.length > 0 && (

          <Paper
            sx={{
              p: 3,
              background: CARD,
              border: `1px solid ${BORDER}`,
              mb: 3
            }}
          >

            <Typography
              sx={{
                color: GOLD,
                fontWeight: "bold",
                mb: 2
              }}
            >
              Search Results
            </Typography>

            {foundUsers.map((user, index) => (

              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 2,
                  background: CARD2,
                  border: `1px solid ${BORDER}`
                }}
              >

                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                >

                  <Grid item>

                    <Avatar
                      src={user.photoURL}
                      sx={{
                        width: 55,
                        height: 55,
                        bgcolor: GOLD,
                        color: "#000"
                      }}
                    >
                      {user.name?.charAt(0)}
                    </Avatar>

                  </Grid>

                  <Grid item xs>

                    <Typography
                      sx={{
                        color: TEXT,
                        fontWeight: "bold"
                      }}
                    >
                      {user.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 13
                      }}
                    >
                      {user.email}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 13
                      }}
                    >
                      {user.phone}
                    </Typography>

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 11
                      }}
                    >
                      UID: {user.userId}
                    </Typography>

                  </Grid>

                  <Grid item>

                    <Button
                      startIcon={
                        <AdminPanelSettings />
                      }
                      onClick={() => addAdmin(user)}
                      sx={{
                        background: GOLD,
                        color: "#000",
                        fontWeight: "bold"
                      }}
                    >
                      Make Admin
                    </Button>

                  </Grid>

                </Grid>

              </Paper>

            ))}

          </Paper>

        )}

        {/* ================= ADMINS LIST ================= */}

        <Paper
          sx={{
            p: 3,
            background: CARD,
            border: `1px solid ${BORDER}`
          }}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: 22,
              mb: 3
            }}
          >
            All Admins
          </Typography>

          {admins.length === 0 && (

            <Typography sx={{ color: SUB }}>
              No admins found
            </Typography>

          )}

          {admins.map((admin, index) => (

            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 2,
                background: CARD2,
                border: `1px solid ${BORDER}`
              }}
            >

              <Grid
                container
                spacing={2}
                alignItems="center"
              >

                {/* LEFT */}

                <Grid item xs={12} md={5}>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >

                    <Avatar
                      sx={{
                        bgcolor:
                          admin.status === "active"
                            ? "#2e7d32"
                            : "#f44336"
                      }}
                    >
                      <Person />
                    </Avatar>

                    <Box>

                      <Typography
                        sx={{
                          color: TEXT,
                          fontWeight: "bold"
                        }}
                      >
                        {admin.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: SUB,
                          fontSize: 13
                        }}
                      >
                        {admin.email}
                      </Typography>

                      <Typography
                        sx={{
                          color: SUB,
                          fontSize: 13
                        }}
                      >
                        {admin.phone}
                      </Typography>

                      <Typography
                        sx={{
                          color: SUB,
                          fontSize: 11
                        }}
                      >
                        UID: {admin.userId}
                      </Typography>

                    </Box>

                  </Box>

                </Grid>

                {/* CENTER */}

                <Grid item xs={12} md={3}>

                  <Chip
                    label={admin.status}
                    icon={<CheckCircle />}
                    sx={{
                      background:
                        admin.status === "active"
                          ? "#2e7d32"
                          : "#f44336",
                      color: "#fff",
                      fontWeight: "bold"
                    }}
                  />

                </Grid>

                {/* RIGHT */}

                <Grid item xs={12} md={4}>

                  <Box
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    justifyContent={{
                      xs: "flex-start",
                      md: "flex-end"
                    }}
                  >

                    <Tooltip title="Copy Email">

                      <IconButton
                        onClick={() =>
                          copyText(admin.email)
                        }
                        sx={{
                          color: GOLD
                        }}
                      >
                        <Email />
                      </IconButton>

                    </Tooltip>

                    <Tooltip title="Copy Phone">

                      <IconButton
                        onClick={() =>
                          copyText(admin.phone)
                        }
                        sx={{
                          color: GOLD
                        }}
                      >
                        <Phone />
                      </IconButton>

                    </Tooltip>

                    <Tooltip title="Copy UID">

                      <IconButton
                        onClick={() =>
                          copyText(admin.userId)
                        }
                      sx={{
                            color: GOLD
                        }}
                      >
                        <ContentCopy />
                      </IconButton>

                    </Tooltip>

                    <Tooltip title="Edit Admin">

                      <IconButton
                        onClick={() =>
                          openEdit(admin)
                        }
                        sx={{
                          color: "#4caf50"
                        }}
                      >
                        <Edit />
                      </IconButton>

                    </Tooltip>

                    <Tooltip title="Delete Admin">

                      <IconButton
                        onClick={() =>
                          removeAdmin(admin.id)
                        }
                        sx={{
                          color: "#f44336"
                        }}
                      >
                        <Delete />
                      </IconButton>

                    </Tooltip>

                  </Box>

                </Grid>

              </Grid>

            </Paper>

          ))}

        </Paper>

      </Container>

      {/* ================= EDIT DIALOG ================= */}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >

        <DialogTitle
          sx={{
            background: CARD,
            color: GOLD
          }}
        >
          Edit Admin
        </DialogTitle>

        <DialogContent
          sx={{
            background: CARD,
            pt: 3
          }}
        >

          <TextField
            fullWidth
            label="Name"
            value={editForm.name}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                name: e.target.value
              })
            }
            sx={{
              mb: 2,
              input: { color: TEXT }
            }}
          />

          <TextField
            fullWidth
            label="Email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                email: e.target.value
              })
            }
            sx={{
              mb: 2,
              input: { color: TEXT }
            }}
          />

          <TextField
            fullWidth
            label="Phone"
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                phone: e.target.value
              })
            }
            sx={{
              mb: 2,
              input: { color: TEXT }
            }}
          />

          <TextField
            fullWidth
            select
            label="Status"
            value={editForm.status}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                status: e.target.value
              })
            }
            sx={{
              mb: 3
            }}
          >

            <MenuItem value="active">
              Active
            </MenuItem>

            <MenuItem value="blocked">
              Blocked
            </MenuItem>

          </TextField>

          <Divider
            sx={{
              borderColor: BORDER,
              mb: 2
            }}
          />

          <Typography
            sx={{
              color: GOLD,
              mb: 2,
              fontWeight: "bold"
            }}
          >
            Permissions
          </Typography>

          <Grid container spacing={1}>

            {[
              "dashboard",
              "users",
              "orders",
              "products",
              "posts",
              "investors"
            ].map((perm) => (

              <Grid item xs={6} key={perm}>

                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm[perm]}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          [perm]:
                            e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: TEXT,
                        textTransform: "capitalize"
                      }}
                    >
                      {perm}
                    </Typography>
                  }
                />

              </Grid>

            ))}

          </Grid>

        </DialogContent>

        <DialogActions
          sx={{
            background: CARD
          }}
        >

          <Button
            onClick={() =>
              setEditOpen(false)
            }
            sx={{
              color: SUB
            }}
          >
            Cancel
          </Button>

          <Button
            startIcon={<Save />}
            onClick={saveAdminChanges}
            sx={{
              background: GOLD,
              color: "#000",
              fontWeight: "bold"
            }}
          >
            Save Changes
          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}