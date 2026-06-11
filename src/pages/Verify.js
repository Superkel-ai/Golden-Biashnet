// src/pages/Verify.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Verified,
  Security,
  CheckCircle
} from "@mui/icons-material";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  auth,
  db
} from "../services/firebase";

import { useNavigate } from "react-router-dom";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, Snackbar} from "@mui/material";


const GOLD = "#F4B400";

export default function Verify() {
  const [copied, setCopied] = useState(false);
const handleCopyTill = () => {
  navigator.clipboard.writeText("3141192");
  setCopied(true);
};
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [userData, setUserData] = useState(null);

  const [plan, setPlan] = useState("regular");

  const [phone, setPhone] = useState("");

  const [whatsapp, setWhatsapp] = useState("");

  const [location, setLocation] = useState("");

  const [businessName, setBusinessName] = useState("");

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {

    const loadUser = async () => {

      try {

        if (!auth.currentUser) {
          navigate("/login");
          return;
        }

        const ref = doc(
          db,
          "users",
          auth.currentUser.uid
        );
      

        const snap = await getDoc(ref);

        if (!snap.exists()) {

          setError(
            "Complete your profile first."
          );

          return;
        }

        const data = snap.data();

        
          const verifyRef = doc(
  db,
  "verificationRequests",
  auth.currentUser.uid
);

const verifySnap = await getDoc(verifyRef);

if (verifySnap.exists()) {
  setVerificationStatus(verifySnap.data());
}

        /* =====================================
           SECURITY CHECK
        ===================================== */

        if (
          !data.name ||
          !data.email
        ) {

          setError(
            "Your account must have name and email before verification."
          );

          return;
        }

        /* =====================================
           ALREADY VERIFIED
        ===================================== */

        if (
          data.verifiedSeller === true
        ) {

          setSuccess(
            "Your seller account is already verified."
          );

        }

        setUserData(data);

        setPhone(data.phone || "");
        setWhatsapp(
          data.whatsapp || ""
        );

        setLocation(
          data.location || ""
        );

      } catch (err) {

        console.error(err);

        setError(
          "Failed to load account."
        );

      }

    };

    loadUser();

  }, [navigate]);


  /* =====================================================
     PLAN PRICES
  ===================================================== */

  const plans = {

    regular: {
      title: "Verified Seller",
      old: 250,
      offer: 100
    },

    premium: {
      title: "Premium Seller",
      old: 750,
      offer: 500
    },

    golden: {
      title: "Golden Seller",
      old: 1000,
      offer: 750
    }

  };

  /* =====================================================
     SEND REQUEST
  ===================================================== */

  const handleSubmit = async () => {

    try {

      setError("");

      if (!auth.currentUser) {

        setError("Login first");

        return;
      }

      if (
        !phone ||
        !location
      ) {

        setError(
          "Fill all required fields"
        );

        return;
      }

      setLoading(true);

      /* =====================================
         SAVE REQUEST
      ===================================== */

      await setDoc(

        doc(
          db,
          "verificationRequests",
          auth.currentUser.uid
        ),

        {

          userId:
            auth.currentUser.uid,

          email:
            auth.currentUser.email,

          name:
            userData?.name || "",

          phone,
    
          location,
          

          plan,

          amount:
            plans[plan].offer,

          status: "pending",

          verified: false,

          submittedAt:
            serverTimestamp()

        }

      );

      /* =====================================
         OPEN WHATSAPP
      ===================================== */

      const message = encodeURIComponent(

`Hello Biashnet Admin,

I have submitted my seller verification request.

Name: ${userData?.name}
Email: ${auth.currentUser.email}
User ID: ${auth.currentUser.uid}

Plan: ${plans[plan].title}

Phone: ${phone}

Please guide me on verification payment.

Thank you.`

      );

      window.open(

        `https://wa.me/254758922614?text=${message}`,

        "_blank"

      );

      setSuccess(
        "Verification request submitted successfully."
      );
      setVerificationStatus({
  status: "pending"
});

      setLoading(false);

    } catch (err) {

      console.error(err);

      setLoading(false);

      setError(
        "Verification failed."
      );

    }

  };

  return (

    <Box
      sx={{
        minHeight: "100vh",
        background: "#000",
        p: 2
      }}
    >

      {/* HEADER */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "#111",
          border: "1px solid #222"
        }}
      >

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >

          <Verified
            sx={{
              color: GOLD,
              fontSize: 40
            }}
          />

          <Box>

            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 700
              }}
            >
              Seller Verification
            </Typography>

            <Typography
              sx={{
                color: "#aaa"
              }}
            >
              Verify your account to upload
              products, services, houses
              and adverts securely.
            </Typography>

          </Box>

        </Stack>

      </Paper>

      {/* ALERTS */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* PLANS */}

      <Grid container spacing={2} mb={3}>

        {Object.entries(plans).map(
          ([key, item]) => (

            <Grid
              item
              xs={12}
              md={4}
              key={key}
            >

              <Card
                onClick={() =>
                  setPlan(key)
                }
                sx={{
                  cursor: "pointer",
                  background:
                    plan === key
                      ? "#1a1a1a"
                      : "#111",

                  border:
                    plan === key
                      ? `2px solid ${GOLD}`
                      : "1px solid #222",

                  color: "#fff"
                }}
              >

                <CardContent>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    mb={2}
                  >

                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {item.title}
                    </Typography>

                    {plan === key && (
                      <CheckCircle
                        sx={{
                          color: GOLD
                        }}
                      />
                    )}

                  </Stack>

                  <Typography
                    sx={{
                      color: "#888",
                      textDecoration:
                        "line-through"
                    }}
                  >
                    KES {item.old}
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      color: GOLD,
                      fontWeight: 700
                    }}
                  >
                    KES {item.offer}
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

          )
        )}

      </Grid>
    
      {verificationStatus?.status === "pending" && (

  <Paper
    sx={{
      p: 3,
      mb: 3,
      background: "#111",
      border: "1px solid #F4B400",
      borderRadius: 3
    }}
  >

    <Typography
      variant="h6"
      sx={{
        color: GOLD,
        fontWeight: 700,
        mb: 2
      }}
    >
      ⏳ Verification Pending
    </Typography>

    <Typography
      sx={{
        color: "#fff",
        mb: 1
      }}
    >
      Your verification request has been received successfully.
    </Typography>

    <Typography
      sx={{
        color: "#aaa",
        mb: 1
      }}
    >
      Please wait while our verification team reviews your request.
    </Typography>

    <Typography
      sx={{
        color: "#22c55e",
        fontWeight: 700,
        mb: 2
      }}
    >
      Admin will verify your account shortly.
    </Typography>

    <Alert severity="info">
      If your account has not been verified within
      3 minutes after payment confirmation,
      contact the verification team directly.
    </Alert>

    <Box sx={{ mt: 2 }}>

      <Button
        fullWidth
        variant="contained"
        sx={{
          background: "#25D366",
          color: "#fff",
          fontWeight: 700,
          mb: 1
        }}
        onClick={() =>
          window.open(
            "https://wa.me/254758922614",
            "_blank"
          )
        }
      >
        WhatsApp Admin
      </Button>

      <Button
        fullWidth
        variant="outlined"
        sx={{
          borderColor: GOLD,
          color: GOLD,
          mb: 1
        }}
        href="tel:0758922614"
      >
        Call Admin
      </Button>

      <Button
        fullWidth
        variant="outlined"
        sx={{
          borderColor: "#777",
          color: "#fff"
        }}
        href="sms:0758922614"
      >
        Send SMS
      </Button>

    </Box>

  </Paper>

)}

      {/* =====================================================
   MPESA PAYMENT GUIDE
===================================================== */}

<Paper
  sx={{
    p: 3,
    mb: 3,
    background: "#111",
    border: "1px solid #222"
  }}
>

  <Stack
    direction="row"
    spacing={2}
    alignItems="center"
    mb={2}
  >

    <Security
      sx={{
        color: GOLD,
        fontSize: 35
      }}
    />

    <Box>

      <Typography
        variant="h6"
        sx={{
          color: "#fff",
          fontWeight: 700
        }}
      >
        Verification Payment
      </Typography>

      <Typography
        sx={{
          color: "#aaa",
          fontSize: 14
        }}
      >
        Complete verification payment
        using M-PESA Business Till contact ADMIN for Approval
      </Typography>

    </Box>

  </Stack>

  </Paper>

  {/* TILL */}

<Paper
  sx={{
    p: 2,
    mb: 2,
    background: "#151515",
    border: `1px solid ${GOLD}`
  }}
>
  <Typography
    sx={{
      color: "#aaa",
      fontSize: 13
    }}
  >
    Business Till Number
  </Typography>

  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
    <Typography
      variant="h4"
      sx={{
        color: GOLD,
        fontWeight: 700,
        letterSpacing: 2
      }}
    >
      3141192
    </Typography>

    <IconButton
      onClick={handleCopyTill}
      sx={{ color: GOLD }}
    >
      <ContentCopyIcon />
    </IconButton>
  </Box>
</Paper>

<Snackbar
  open={copied}
  autoHideDuration={2000}
  onClose={() => setCopied(false)}
>
  <Alert severity="success">
    Till Number Copied
  </Alert>
</Snackbar>
  {/* =====================================================
   PAYMENT STEPS
===================================================== */}

<Accordion
  sx={{
    mt: 2,
    background: "#111",
    color: "#fff",
    border: "1px solid #222",
    boxShadow: "none"
  }}
>

  <AccordionSummary
    expandIcon={
      <ExpandMoreIcon
        sx={{ color: GOLD }}
      />
    }
  >

    <Typography
      sx={{
        fontWeight: 700,
        color: GOLD
      }}
    >
      How To Pay Verification Fee
    </Typography>

  </AccordionSummary>

  <AccordionDetails>

    <Stack spacing={1.2}>

      <Chip
        label="1. Open M-PESA"
        sx={{
          background: "#1a1a1a",
          color: "#fff"
        }}
      />

      <Chip
        label="2. Select Lipa na M-PESA"
        sx={{
          background: "#1a1a1a",
          color: "#fff"
        }}
      />

      <Chip
        label="3. Select Buy Goods & Services"
        sx={{
          background: "#1a1a1a",
          color: "#fff"
        }}
      />

      <Chip
        label="4. Enter Till Number 3141192"
        sx={{
          background: "#1a1a1a",
          color: GOLD,
          fontWeight: 700
        }}
      />

      <Chip
        label={`5. Pay KES ${plans[plan].offer}`}
        sx={{
          background: "#1a1a1a",
          color: GOLD,
          fontWeight: 700
        }}
      />

    </Stack>

    <Alert
      severity="info"
      sx={{ mt: 3 }}
    >
      After payment, submit your
      verification request and contact
      any verification admin on WhatsApp.
    </Alert>

  </AccordionDetails>

</Accordion>



      {/* FORM */}

      <Paper
        sx={{
          p: 3,
          background: "#111",
          border: "1px solid #222"
        }}
      >

        <Typography
          variant="h6"
          mb={2}
          sx={{
            color: "#fff"
          }}
        >
          Verification Details
        </Typography>

        <Grid container spacing={2}>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name/Business Name"
              value={userData?.name || ""}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={
                auth.currentUser?.email || ""
              }
              disabled
            />
          </Grid>

          <Grid item xs={12}>
  <TextField
    fullWidth
    label="Phone Number"
    value={phone}
    onChange={(e) =>
      setPhone(e.target.value)
    }
  />
</Grid>


<Divider sx={{ my: 3 }} />

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            />
          </Grid>

        </Grid>

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            mt: 4,
            py: 1.5,
            background: GOLD,
            color: "#000",
            fontWeight: 700
          }}
        >

          {loading ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            "Submit Verification Request"
          )}

        </Button>

      </Paper>

    </Box>

  );

}