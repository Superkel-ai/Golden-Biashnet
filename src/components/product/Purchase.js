import React, { useState } from "react";

import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip
} from "@mui/material";

import {
  ExpandMore,
  ContentCopy,
  WhatsApp,
  Payments
} from "@mui/icons-material";

const GOLD = "#F4B400";

const TILL_NUMBER = "3141192";
const BIASHNET_PHONE = "254758922614";

const formatPrice = (value) =>
  "KES " + Number(value || 0).toLocaleString();

export default function Purchase({ product }) {

  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const price =
    Number(product.price || 0);

  const deliveryFee =
    Number(product.deliveryFee || 0);

  const total =
    price + deliveryFee;

  const handleCopyTill = async () => {

    try {

      await navigator.clipboard.writeText(
        TILL_NUMBER
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {

      console.log(err);

    }

  };

  const handleConfirmPayment = () => {

    const message = `Hello Biashnet Service Providers,

I have completed payment.

Product: ${product.title}

Product ID: ${product.id}

Amount Paid: ${formatPrice(total)}

Till Number: ${TILL_NUMBER}

Please confirm my payment and arrange delivery.

Thank you.`;

    window.open(
      `https://wa.me/${BIASHNET_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

  };

  return (

    <Accordion
      sx={{
        mt: 2,
        bgcolor: "#101010",
        color: "#fff",
        border: "1px solid #1f1f1f",
        borderRadius: "12px !important"
      }}
    >

      <AccordionSummary
        expandIcon={
          <ExpandMore
            sx={{ color: GOLD }}
          />
        }
      >

        <Box>

          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 18
            }}
          >
            How To Pay
          </Typography>

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 800,
              mt: 0.5
            }}
          >
            Total: {formatPrice(total)}
          </Typography>

        </Box>

      </AccordionSummary>

      <AccordionDetails>

        <Stack spacing={2}>

          <Box>

            <Typography
              sx={{
                color: "#aaa",
                fontSize: 13
              }}
            >
              Amount To Pay
            </Typography>

            <Typography
              sx={{
                color: GOLD,
                fontSize: 32,
                fontWeight: 900
              }}
            >
              {formatPrice(total)}
            </Typography>

          </Box>

          <Box>

            <Typography
              sx={{
                color: "#aaa",
                mb: 1
              }}
            >
              Pay Via M-Pesa Till
            </Typography>

            <Chip
              icon={<Payments />}
              label={`Till ${TILL_NUMBER}`}
              sx={{
                bgcolor: GOLD,
                color: "#000",
                fontWeight: 900,
                fontSize: 16,
                p: 2.5
              }}
            />

          </Box>

          <Button
            startIcon={<ContentCopy />}
            onClick={handleCopyTill}
            variant="outlined"
            sx={{
              borderColor: GOLD,
              color: GOLD,
              fontWeight: 700
            }}
          >
            {copied
              ? "Till Copied"
              : "Copy Till Number"}
          </Button>

          <Box>

            <Typography
              sx={{
                color: "#ccc",
                lineHeight: 1.8
              }}
            >
              1. Open M-Pesa
              <br />
              2. Select Lipa na M-Pesa
              <br />
              3. Select Buy Goods
              <br />
              4. Enter Till Number
              <strong>
                {" "}
                {TILL_NUMBER}
              </strong>
              <br />
              5. Pay
              <br />
              6. Tap Confirm Payment
              <br />
              7. Biashnet will verify and arrange delivery
            </Typography>

          </Box>

          <Button
            fullWidth
            size="large"
            startIcon={<WhatsApp />}
            onClick={handleConfirmPayment}
            sx={{
              bgcolor: "#25D366",
              color: "#fff",
              fontWeight: 900,
              py: 1.5,
              "&:hover": {
                bgcolor: "#1ebe5d"
              }
            }}
          >
            Confirm Payment
          </Button>

        </Stack>

      </AccordionDetails>

    </Accordion>

  );

}