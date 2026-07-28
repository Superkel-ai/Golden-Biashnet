import React from "react";

import {
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const GOLD = "#F4B400";

export default function Manual() {
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied successfully");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        background:
          "linear-gradient(135deg,#151515,#080808)",
        border:
          "1px solid rgba(244,180,0,.15)",
        color: "#fff",
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
      >
        <AccountBalanceIcon
          sx={{
            color: GOLD,
            fontSize: 40,
          }}
        />

        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
          >
            Invest in BIASHNET LTD
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 14,
            }}
          >
            Help build the future of
            online marketplaces and
            digital commerce.
          </Typography>
        </Box>
      </Stack>

      {/* STICKER */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background:
            "linear-gradient(135deg,#1c1c1c,#0c0c0c)",
          border:
            `2px solid ${GOLD}`,
          mb: 3,
        }}
      >
        <Typography
          sx={{
            color: GOLD,
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
            mb: 2,
          }}
        >
          BIASHNET INVESTMENT ACCOUNT
        </Typography>

        <Divider
          sx={{
            borderColor:
              "rgba(244,180,0,.2)",
            mb: 3,
          }}
        />

        {/* PAYBILL */}

        <Typography
          sx={{
            color: "#999",
            fontSize: 13,
          }}
        >
          Paybill Number
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            sx={{
              fontSize: 32,
              fontWeight: 900,
              color: GOLD,
            }}
          >
            522533
          </Typography>

          <Button
            size="small"
            startIcon={
              <ContentCopyIcon />
            }
            onClick={() =>
              copyText("522533")
            }
          >
            Copy
          </Button>
        </Stack>

        {/* ACCOUNT */}

        <Typography
          sx={{
            color: "#999",
            fontSize: 13,
          }}
        >
          Account Number
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            8106576
          </Typography>

          <Button
            size="small"
            startIcon={
              <ContentCopyIcon />
            }
            onClick={() =>
              copyText("8106576")
            }
          >
            Copy
          </Button>
        </Stack>

        {/* BUSINESS */}

        <Typography
          sx={{
            color: "#999",
            fontSize: 13,
          }}
        >
          Business Name
        </Typography>

        <Typography
          sx={{
            color: GOLD,
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          BIASHNET LTD
        </Typography>
      </Paper>

      {/* WHY INVEST */}

      <Paper
        sx={{
          p: 3,
          bgcolor: "#101010",
          borderRadius: 4,
          mb: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mb={2}
        >
          <TrendingUpIcon
            sx={{
              color: GOLD,
            }}
          />

          <Typography
            fontWeight={800}
          >
            Why Invest?
          </Typography>
        </Stack>

        <Typography
          sx={{
            color: "#bbb",
            lineHeight: 1.8,
          }}
        >
          BIASHNET is building a
          modern online marketplace
          connecting buyers, sellers,
          service providers, property
          owners and businesses across
          Kenya.

          <br />
          <br />

          Your investment helps fund:

          <br />• Platform development
          <br />• Marketing and growth
          <br />• Technology infrastructure
          <br />• Customer acquisition
          <br />• Business expansion
        </Typography>
      </Paper>

      {/* CALL TO ACTION */}

      <Paper
        sx={{
          p: 3,
          bgcolor:
            "rgba(244,180,0,.08)",
          borderRadius: 4,
          border:
            "1px solid rgba(244,180,0,.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: GOLD,
            fontWeight: 900,
            mb: 1,
          }}
        >
          Become a BIASHNET Investor
        </Typography>

        <Typography
          sx={{
            color: "#ddd",
            mb: 2,
          }}
        >
          Every contribution brings us
          closer to building one of
          Africa's leading online
          marketplace platforms.

          Invest today. Grow with us.
          Benefit from future company
          growth and opportunities.
        </Typography>
      </Paper>
    </Paper>
  );
}