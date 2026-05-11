import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";

const VERIFICATION_LEVELS = {
  none: { label: "No Badge", color: "#777" },
  regular: { label: "Regular Seller", color: "#2196F3" },
  trusted: { label: "Trusted Seller", color: "#9C27B0" },
  partner: { label: "Partner", color: "#FFD700" },
};

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "members"));
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(data);
  };

  /* ================= FILTER ================= */
  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= PENDING REQUESTS ================= */
  const pendingRequests = users.filter(
    (u) => u.verificationRequest?.status === "pending"
  );

  /* ================= APPROVE ================= */
  const approveRequest = async (user) => {
    const badgeKey = user.verificationRequest.badge;

    const ref = doc(db, "members", user.id);

    await updateDoc(ref, {
      verification: {
        status: badgeKey,
        badge: VERIFICATION_LEVELS[badgeKey].label,
        verifiedAt: new Date(),
        verifiedBy: "admin",
      },
      verificationRequest: {
        status: "approved",
      },
    });

    fetchUsers();
  };

  /* ================= REJECT ================= */
  const rejectRequest = async (userId) => {
    const ref = doc(db, "members", userId);

    await updateDoc(ref, {
      verificationRequest: {
        status: "rejected",
      },
    });

    fetchUsers();
  };

  /* ================= MANUAL UPDATE ================= */
  const updateVerification = async (userId, level) => {
    const ref = doc(db, "members", userId);

    await updateDoc(ref, {
      verification: {
        status: level,
        badge: VERIFICATION_LEVELS[level].label,
        verifiedAt: new Date(),
        verifiedBy: "admin",
      },
    });

    fetchUsers();
  };

  const removeVerification = async (userId) => {
    const ref = doc(db, "members", userId);

    await updateDoc(ref, {
      verification: {
        status: "none",
        badge: "",
        verifiedAt: null,
        verifiedBy: "",
      },
    });

    fetchUsers();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        Admin - Members Management
      </Typography>

      {/* 🔥 PENDING REQUESTS TABLE */}
      <Typography variant="h6" mb={1}>
        Pending Verification Requests
      </Typography>

      {pendingRequests.length === 0 ? (
        <Typography sx={{ color: "#888", mb: 3 }}>
          No pending requests
        </Typography>
      ) : (
        <Table sx={{ mb: 4 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Requested Badge</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pendingRequests.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {
                    VERIFICATION_LEVELS[
                      user.verificationRequest?.badge
                    ]?.label
                  }
                </TableCell>
                <TableCell>
                  {user.verificationRequest?.note || "-"}
                </TableCell>

                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mr: 1 }}
                    onClick={() => approveRequest(user)}
                  >
                    Approve
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => rejectRequest(user.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* 🔍 SEARCH */}
      <TextField
        fullWidth
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* USERS LIST */}
      {filtered.map((user) => {
        const level = user.verification?.status || "none";

        return (
          <Box
            key={user.id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #333",
              borderRadius: 2,
            }}
          >
            <Typography fontWeight="bold">{user.name}</Typography>
            <Typography fontSize={13}>{user.email}</Typography>
            <Typography fontSize={13}>{user.phone}</Typography>

            {/* BADGE */}
            <Typography
              sx={{
                mt: 1,
                color: VERIFICATION_LEVELS[level].color,
                fontWeight: "bold",
              }}
            >
              {VERIFICATION_LEVELS[level].label}
            </Typography>

            {/* ACTIONS */}
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                select
                size="small"
                value={level}
                onChange={(e) =>
                  updateVerification(user.id, e.target.value)
                }
              >
                {Object.keys(VERIFICATION_LEVELS).map((key) => (
                  <MenuItem key={key} value={key}>
                    {VERIFICATION_LEVELS[key].label}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                color="error"
                onClick={() => removeVerification(user.id)}
              >
                Remove
              </Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}