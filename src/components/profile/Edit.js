import React, { useEffect, useState } from "react";

import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

const GOLD = "#F4B400";

export default function Edit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    photoURL: "",
  });

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snap = await getDoc(doc(db, "users", uid));

      if (!snap.exists()) return;

      const data = snap.data();

      setProfile({
        name: data?.name || "",
        phone: data?.phone || "",
        location: data?.location || "",
        bio: data?.bio || "",
        photoURL: data?.photoURL || "",
      });

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // IMAGE UPLOAD (CLOUDINARY)
  // =========================
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Upload to Cloudinary
      const uploaded = await uploadToCloudinary(file);

      if (!uploaded) {
        throw new Error("Upload failed");
      }

      setProfile((prev) => ({
        ...prev,
        photoURL: uploaded.full, // use optimized version
      }));

    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSave = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setSaving(true);

      await updateDoc(doc(db, "users", uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      });

      // Better UX than alert
      console.log("Profile updated successfully");

    } catch (err) {
      console.log(err);
      console.log("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, color: "#fff" }}>

      {/* =========================
         HEADER
      ========================= */}
      <Typography sx={{ fontSize: 22, fontWeight: 900, mb: 3 }}>
        Edit Profile
      </Typography>

      {/* =========================
         PROFILE IMAGE
      ========================= */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: 1,
            borderRadius: "50%",
            bgcolor: "#111",
            border: `2px solid ${GOLD}`,
          }}
        >
          <Avatar
            src={profile.photoURL}
            sx={{ width: 110, height: 110 }}
          >
            {profile.name?.charAt(0)}
          </Avatar>

          {/* Upload button */}
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: GOLD,
              color: "#000",
              "&:hover": { bgcolor: "#ffcc33" },
            }}
          >
            {uploading ? (
              <CircularProgress size={18} sx={{ color: "#000" }} />
            ) : (
              <CameraAltIcon fontSize="small" />
            )}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </IconButton>
        </Paper>
      </Box>

      {/* =========================
         FORM
      ========================= */}
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
          fullWidth
        />

        <TextField
          label="Phone"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
          fullWidth
        />

        <TextField
          label="Location"
          value={profile.location}
          onChange={(e) =>
            setProfile({ ...profile, location: e.target.value })
          }
          fullWidth
        />

        <TextField
          label="Bio"
          value={profile.bio}
          onChange={(e) =>
            setProfile({ ...profile, bio: e.target.value })
          }
          fullWidth
          multiline
          rows={3}
        />
      </Stack>

      {/* =========================
         SAVE BUTTON
      ========================= */}
      <Button
        fullWidth
        onClick={handleSave}
        disabled={saving}
        sx={{
          mt: 3,
          py: 1.4,
          fontWeight: 800,
          bgcolor: GOLD,
          color: "#000",
          borderRadius: 2,
          "&:hover": { bgcolor: "#ffcc33" },
        }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>

    </Box>
  );
}