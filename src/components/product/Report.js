import React, { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

const GOLD = "#F4B400";
const CARD = "#111";
const BORDER = "#222";

/* =========================================================
REPORT DIALOG
- Marketplace safety system
- Sends reports to Firestore
- Used for moderation & fraud control
========================================================= */

export default function ReportDialog({
  open,
  onClose,
  productId,
  sellerId,
  productTitle
}) {

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================================
  SUBMIT REPORT
  ========================================================= */
  const handleSubmit = async () => {

    try {

      if (!reason) {
        alert("Please select a reason");
        return;
      }

      setLoading(true);

      const user = auth.currentUser;

      await addDoc(collection(db, "reports"), {

        productId,
        sellerId,
        productTitle,

        reason,
        details,

        reportedBy: user?.uid || null,
        reporterEmail: user?.email || "guest",

        status: "pending",

        createdAt: serverTimestamp()

      });

      alert("Report submitted successfully");

      setReason("");
      setDetails("");

      onClose();

    } catch (err) {

      console.error("Report error:", err);
      alert("Failed to submit report");

    } finally {

      setLoading(false);

    }
  };

  /* =========================================================
  UI
  ========================================================= */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >

      {/* TITLE */}
      <DialogTitle
        sx={{
          background: CARD,
          color: "#fff",
          fontWeight: 800,
          borderBottom: `1px solid ${BORDER}`
        }}
      >
        🚨 Report Product
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          background: CARD,
          pt: 2
        }}
      >

        {/* PRODUCT INFO */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            background: "#0d0d0d",
            border: `1px solid ${BORDER}`
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: "#aaa"
            }}
          >
            Reporting:
          </Typography>

          <Typography
            sx={{
              fontWeight: 700,
              color: "#fff",
              fontSize: 14
            }}
          >
            {productTitle}
          </Typography>
        </Box>

        {/* REASON SELECT */}
        <TextField
          select
          fullWidth
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            mb: 2,
            background: "#0d0d0d",
            borderRadius: 1
          }}
        >
          <MenuItem value="scam">
            Scam / Fraud
          </MenuItem>

          <MenuItem value="fake_product">
            Fake Product
          </MenuItem>

          <MenuItem value="wrong_price">
            Wrong Pricing
          </MenuItem>

          <MenuItem value="duplicate">
            Duplicate Listing
          </MenuItem>

          <MenuItem value="offensive">
            Offensive Content
          </MenuItem>

          <MenuItem value="other">
            Other
          </MenuItem>
        </TextField>

        {/* DETAILS */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Additional Details (Optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          sx={{
            background: "#0d0d0d",
            borderRadius: 1
          }}
        />

        {/* WARNING */}
        <Typography
          sx={{
            fontSize: 11,
            color: "#777",
            mt: 2,
            lineHeight: 1.5
          }}
        >
          Reports help us keep the marketplace safe.
          Abuse of this feature may lead to account restrictions.
        </Typography>

      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          background: CARD,
          borderTop: `1px solid ${BORDER}`,
          p: 2
        }}
      >

        <Button
          onClick={onClose}
          sx={{
            color: "#aaa",
            fontWeight: 700
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "#ff1744",
            color: "#fff",
            fontWeight: 800,
            px: 3,

            "&:hover": {
              background: "#ff4569"
            }
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Submit Report"
          )}
        </Button>

      </DialogActions>

    </Dialog>
  );
}