import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  Chip,
  Divider,
  MenuItem,
  IconButton,
  Collapse,
  Switch,
  FormControlLabel
} from "@mui/material";

import {
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Verified,
  Person,
  Store,
  Group,
  Search,
  CheckCircle,
  Block
} from "@mui/icons-material";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";

// ================= THEME =================

const BG = "#000";
const CARD = "#111";
const GOLD = "#F4B400";
const TEXT = "#fff";
const SUB = "#aaa";

// ================= COMPONENT =================

export default function AdminUsers() {

  // ================= STATES =================

  const [users, setUsers] = useState([]);

  const [showUsers, setShowUsers] =
    useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  // ================= FETCH USERS =================

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const list = [];

        snapshot.forEach((doc) => {

          list.push({
            id: doc.id,
            ...doc.data()
          });

        });

        setUsers(list);

      }
    );

    return () => unsub();

  }, []);

  // ================= KPI =================

  const analytics = useMemo(() => {

    let buyers = 0;
    let sellers = 0;
    let active = 0;
    let suspended = 0;
    let verified = 0;

    users.forEach((user) => {

      if (user.roles?.buyer) buyers++;

      if (user.roles?.seller) sellers++;

      if (
        user.accountStatus === "active"
      ) {
        active++;
      }

      if (
        user.accountStatus ===
        "suspended"
      ) {
        suspended++;
      }

      if (user.sellerVerified) {
        verified++;
      }

    });

    return {
      total: users.length,
      buyers,
      sellers,
      active,
      suspended,
      verified
    };

  }, [users]);

  // ================= FILTER =================

  const filteredUsers = users.filter(
    (user) => {

      const matchesSearch =
        user.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.phone?.includes(search);

      const matchesRole = (() => {

        if (roleFilter === "all")
          return true;

        if (roleFilter === "buyers") {
          return user.roles?.buyer;
        }

        if (roleFilter === "sellers") {
          return user.roles?.seller;
        }

        if (roleFilter === "both") {
          return (
            user.roles?.buyer &&
            user.roles?.seller
          );
        }

        return true;

      })();

      return (
        matchesSearch && matchesRole
      );

    }
  );

  // ================= UPDATE USER =================

  const updateUserField = async (
    userId,
    field,
    value
  ) => {

    try {

      await updateDoc(
        doc(db, "users", userId),
        {
          [field]: value
        }
      );

    } catch (err) {

      console.error(err);

    }

  };

  // ================= COPY =================

  const copyText = (text) => {

    navigator.clipboard.writeText(
      text || ""
    );

  };

  // ================= DATE =================

  const formatDate = (date) => {

    if (!date?.seconds) return "-";

    return new Date(
      date.seconds * 1000
    ).toLocaleString();

  };

  // ================= UI =================

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 5
      }}
    >

      <Container maxWidth="xl">

        {/* HEADER */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={3}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: 26
            }}
          >
            Users Analytics Dashboard
          </Typography>

          <IconButton
            onClick={() =>
              setShowUsers(!showUsers)
            }
            sx={{ color: GOLD }}
          >

            {showUsers
              ? <ExpandLess />
              : <ExpandMore />}

          </IconButton>

        </Box>

        <Collapse in={showUsers}>

          {/* KPI */}

          <Grid container spacing={2}>

            {[
              {
                label: "Total Users",
                value: analytics.total,
                color: GOLD,
                icon: <Group />
              },
              {
                label: "Buyers",
                value: analytics.buyers,
                color: "#4caf50",
                icon: <Person />
              },
              {
                label: "Sellers",
                value: analytics.sellers,
                color: "#2196f3",
                icon: <Store />
              },
              {
                label: "Verified",
                value: analytics.verified,
                color: "#9c27b0",
                icon: <Verified />
              },
              {
                label: "Active",
                value: analytics.active,
                color: "#00e676",
                icon: <CheckCircle />
              },
              {
                label: "Suspended",
                value: analytics.suspended,
                color: "#ff1744",
                icon: <Block />
              }
            ].map((item, i) => (

              <Grid
                item
                xs={6}
                md={2}
                key={i}
              >

                <Paper
                  sx={{
                    p: 2,
                    background: CARD,
                    border:
                      `1px solid ${item.color}`
                  }}
                >

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >

                    <Box>

                      <Typography
                        sx={{
                          color: SUB,
                          fontSize: 12
                        }}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        sx={{
                          color: item.color,
                          fontWeight: "bold",
                          fontSize: 24
                        }}
                      >
                        {item.value}
                      </Typography>

                    </Box>

                    <Box
                      sx={{
                        color: item.color
                      }}
                    >
                      {item.icon}
                    </Box>

                  </Box>

                </Paper>

              </Grid>

            ))}

          </Grid>

          {/* FILTERS */}

          <Paper
            sx={{
              p: 2,
              mt: 3,
              background: CARD
            }}
          >

            <Grid container spacing={2}>

              {/* SEARCH */}

              <Grid item xs={12} md={8}>

                <TextField
                  fullWidth
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <Search
                        sx={{
                          color: SUB,
                          mr: 1
                        }}
                      />
                    ),
                    style: {
                      color: TEXT
                    }
                  }}
                />

              </Grid>

              {/* ROLE FILTER */}

              <Grid item xs={12} md={4}>

                <TextField
                  fullWidth
                  select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(
                      e.target.value
                    )
                  }
                  InputProps={{
                    style: {
                      color: TEXT
                    }
                  }}
                >

                  <MenuItem value="all">
                    All Users
                  </MenuItem>

                  <MenuItem value="buyers">
                    Buyers
                  </MenuItem>

                  <MenuItem value="sellers">
                    Sellers
                  </MenuItem>

                  <MenuItem value="both">
                    Buyers & Sellers
                  </MenuItem>

                </TextField>

              </Grid>

            </Grid>

          </Paper>

          {/* USERS LIST */}

          {filteredUsers.map((user) => (

            <Paper
              key={user.id}
              sx={{
                p: 2,
                mt: 3,
                background: CARD,
                border:
                  "1px solid #222"
              }}
            >

              {/* TOP */}

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              >

                <Box
                  display="flex"
                  gap={2}
                  alignItems="center"
                >

                  <Avatar
                    src={user.photoURL}
                    sx={{
                      width: 70,
                      height: 70
                    }}
                  >
                    {user.name?.charAt(0)}
                  </Avatar>

                  <Box>

                    <Typography
                      sx={{
                        color: GOLD,
                        fontWeight: "bold",
                        fontSize: 18
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

                    <Box
                      display="flex"
                      gap={1}
                      mt={1}
                      flexWrap="wrap"
                    >

                      {user.roles?.buyer && (
                        <Chip
                          label="Buyer"
                          size="small"
                          sx={{
                            background:
                              "#2e7d32",
                            color: "#fff"
                          }}
                        />
                      )}

                      {user.roles?.seller && (
                        <Chip
                          label="Seller"
                          size="small"
                          sx={{
                            background:
                              "#1565c0",
                            color: "#fff"
                          }}
                        />
                      )}

                      {user.sellerVerified && (
                        <Chip
                          label="Verified"
                          size="small"
                          sx={{
                            background:
                              "#9c27b0",
                            color: "#fff"
                          }}
                        />
                      )}

                    </Box>

                  </Box>

                </Box>

                {/* STATUS */}

                <Chip
                  label={
                    user.accountStatus
                  }
                  sx={{
                    background:
                      user.accountStatus ===
                      "active"
                        ? "#2e7d32"
                        : "#d32f2f",
                    color: "#fff",
                    fontWeight: "bold"
                  }}
                />

              </Box>

              <Divider sx={{ my: 2 }} />

              {/* MAIN GRID */}

              <Grid container spacing={2}>

                {/* LEFT */}

                <Grid item xs={12} md={6}>

                  <Typography
                    sx={{
                      color: GOLD,
                      mb: 1,
                      fontWeight: "bold"
                    }}
                  >
                    User Information
                  </Typography>

                  {/* PHONE */}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >

                    <Typography
                      sx={{
                        color: TEXT,
                        fontSize: 13
                      }}
                    >
                      📞 {user.phone}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() =>
                        copyText(
                          user.phone
                        )
                      }
                      startIcon={
                        <ContentCopy />
                      }
                      sx={{
                        color: GOLD
                      }}
                    >
                      Copy
                    </Button>

                  </Box>

                  {/* USER ID */}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >

                    <Typography
                      sx={{
                        color: SUB,
                        fontSize: 12
                      }}
                    >
                      ID: {user.userId}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() =>
                        copyText(
                          user.userId
                        )
                      }
                      startIcon={
                        <ContentCopy />
                      }
                      sx={{
                        color: GOLD
                      }}
                    >
                      Copy
                    </Button>

                  </Box>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 13,
                      mb: 1
                    }}
                  >
                    📍{" "}
                    {user.location ||
                      "No location"}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 13,
                      mb: 1
                    }}
                  >
                    🌐{" "}
                    {user.website ||
                      "No website"}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 13,
                      mb: 1
                    }}
                  >
                    📝{" "}
                    {user.bio ||
                      "No bio"}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 12
                    }}
                  >
                    Joined:{" "}
                    {formatDate(
                      user.createdAt
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 12
                    }}
                  >
                    Last Login:{" "}
                    {formatDate(
                      user.lastLoginAt
                    )}
                  </Typography>

                </Grid>

                {/* RIGHT */}

                <Grid item xs={12} md={6}>

                  <Typography
                    sx={{
                      color: GOLD,
                      mb: 1,
                      fontWeight: "bold"
                    }}
                  >
                    Analytics & Controls
                  </Typography>

                  <Grid
                    container
                    spacing={1}
                  >

                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1,
                          background:
                            "#0d0d0d"
                        }}
                      >
                        <Typography
                          sx={{
                            color: SUB,
                            fontSize: 11
                          }}
                        >
                          Orders
                        </Typography>

                        <Typography
                          sx={{
                            color: TEXT
                          }}
                        >
                          {
                            user.ordersCount
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1,
                          background:
                            "#0d0d0d"
                        }}
                      >
                        <Typography
                          sx={{
                            color: SUB,
                            fontSize: 11
                          }}
                        >
                          Completed
                        </Typography>

                        <Typography
                          sx={{
                            color: TEXT
                          }}
                        >
                          {
                            user.completedOrders
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1,
                          background:
                            "#0d0d0d"
                        }}
                      >
                        <Typography
                          sx={{
                            color: SUB,
                            fontSize: 11
                          }}
                        >
                          Listings
                        </Typography>

                        <Typography
                          sx={{
                            color: TEXT
                          }}
                        >
                          {
                            user.listingsCount
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                   <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1,
                          background:
                            "#0d0d0d"
                        }}
                      >
                        <Typography
                          sx={{
                            color: SUB,
                            fontSize: 11
                          }}
                        >
                          Rating
                        </Typography>

                        <Typography
                          sx={{
                            color: TEXT
                          }}
                        >
                          {
                            user.sellerRating
                          }
                        </Typography>
                      </Paper>
                    </Grid>

                  </Grid>

                  {/* EDIT CONTROLS */}

                  <Box mt={2}>

                    {/* VERIFIED */}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            user.sellerVerified ||
                            false
                          }
                          onChange={(e) =>
                            updateUserField(
                              user.id,
                              "sellerVerified",
                              e.target
                                .checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: TEXT,
                            fontSize: 13
                          }}
                        >
                          Seller Verified
                        </Typography>
                      }
                    />

                    {/* SUB ACTIVE */}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            user.subscriptionActive ||
                            false
                          }
                          onChange={(e) =>
                            updateUserField(
                              user.id,
                              "subscriptionActive",
                              e.target
                                .checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: TEXT,
                            fontSize: 13
                          }}
                        >
                          Subscription Active
                        </Typography>
                      }
                    />

                  </Box>

                  {/* STATUS */}

                  <TextField
                    fullWidth
                    select
                    label="Account Status"
                    value={
                      user.accountStatus ||
                      "active"
                    }
                    onChange={(e) =>
                      updateUserField(
                        user.id,
                        "accountStatus",
                        e.target.value
                      )
                    }
                    sx={{ mt: 2 }}
                    InputProps={{
                      style: {
                        color: TEXT
                      }
                    }}
                  >

                    <MenuItem value="active">
                      Active
                    </MenuItem>

                    <MenuItem value="suspended">
                      Suspended
                    </MenuItem>

                    <MenuItem value="blocked">
                      Blocked
                    </MenuItem>

                  </TextField>

                  {/* RATING */}

                  <TextField
                    fullWidth
                    type="number"
                    label="Seller Rating"
                    value={
                      user.sellerRating || 0
                    }
                    onChange={(e) =>
                      updateUserField(
                        user.id,
                        "sellerRating",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    sx={{ mt: 2 }}
                    InputProps={{
                      style: {
                        color: TEXT
                      }
                    }}
                  />

                </Grid>

              </Grid>

            </Paper>

          ))}

        </Collapse>

      </Container>

    </Box>

  );

}