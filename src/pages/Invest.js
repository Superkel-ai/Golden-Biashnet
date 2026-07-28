import React, { useState } from "react";

import {
  Box,
  Container,
  Stack,
} from "@mui/material";

import InvestorHero from "../components/investors/Hero";
import InvestorWallet from "../components/investors/Wallet";
import InvestorManual from "../components/investors/Manual";
import InvestorProgress from "../components/investors/Progress";
import RecentTransactions from "../components/investors/Transactions";
import InvestorDocuments from "../components/investors/Documents";

import DepositDialog from "../components/investors/Deposit";
import WithdrawDialog from "../components/investors/Withdraw";
import SellSharesDialog from "../components/investors/SellShares";

export default function Invest() {
  const [depositOpen, setDepositOpen] =
    useState(false);

  const [withdrawOpen, setWithdrawOpen] =
    useState(false);

  const [sellSharesOpen, setSellSharesOpen] =
    useState(false);

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#050505",
          py: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Container maxWidth="xl">

          <Stack spacing={3}>

            {/* HERO */}
            <InvestorHero />
            <InvestorManual />
          </Stack>

        </Container>
      </Box>

      {/* ==========================
          DEPOSIT DIALOG
      ========================== */}

      <DepositDialog
        open={depositOpen}
        onClose={() =>
          setDepositOpen(false)
        }
      />

      {/* ==========================
          WITHDRAW DIALOG
      ========================== */}

      <WithdrawDialog
        open={withdrawOpen}
        onClose={() =>
          setWithdrawOpen(false)
        }
      />

      {/* ==========================
          SELL SHARES DIALOG
      ========================== */}

      <SellSharesDialog
        open={sellSharesOpen}
        onClose={() =>
          setSellSharesOpen(false)
        }
      />
    </>
  );
}