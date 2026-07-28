import React, { useState } from "react";

import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import WalletBalance from "../components/wallet/WalletBalance";
import DepositDialog from "../components/wallet/DepositDialog";
import WithdrawDialog from "../components/wallet/WithdrawDialog";
import TransactionHistory from "../components/wallet/TransactionHistory";

const BG = "#050505";
const GOLD = "#F4B400";

export default function Wallet() {
  const [depositOpen, setDepositOpen] =
    useState(false);

  const [withdrawOpen, setWithdrawOpen] =
    useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: BG,
        color: "#fff",
        pb: 10,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          pt: 2,
        }}
      >
        {/* HEADER */}

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 900,
            color: GOLD,
            mb: 0.5,
          }}
        >
          Wallet
        </Typography>

        <Typography
          sx={{
            color: "#999",
            mb: 3,
          }}
        >
          Deposit, withdraw and manage your
          marketplace earnings securely.
        </Typography>

        {/* BALANCE */}

        <WalletBalance
          onDeposit={() =>
            setDepositOpen(true)
          }
          onWithdraw={() =>
            setWithdrawOpen(true)
          }
        />

        {/* HISTORY */}

        <TransactionHistory />

        {/* DIALOGS */}

        <DepositDialog
          open={depositOpen}
          onClose={() =>
            setDepositOpen(false)
          }
        />

        <WithdrawDialog
          open={withdrawOpen}
          onClose={() =>
            setWithdrawOpen(false)
          }
        />
      </Container>
    </Box>
  );
}