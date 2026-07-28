import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";

import {
  ArrowDownward,
  ArrowUpward,
} from "@mui/icons-material";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function TransactionHistory() {
  const [loading, setLoading] =
    useState(true);

  const [transactions, setTransactions] =
    useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      const results = [];

      /* ==========================
         COMPLETED TRANSACTIONS
      ========================== */

      const completedQuery = query(
        collection(db, "transactions"),
        where("userId", "==", uid)
      );

      const completedSnap =
        await getDocs(completedQuery);

      completedSnap.forEach((doc) => {
        results.push({
          id: doc.id,
          source: "completed",
          ...doc.data(),
        });
      });

      /* ==========================
         PENDING TRANSACTIONS
      ========================== */

      const pendingQuery = query(
        collection(
          db,
          "pendingTransactions"
        ),
        where("userId", "==", uid)
      );

      const pendingSnap =
        await getDocs(pendingQuery);

      pendingSnap.forEach((doc) => {
        results.push({
          id: doc.id,
          source: "pending",
          ...doc.data(),
        });
      });

      results.sort((a, b) => {
        const dateA =
          a.createdAt?.toMillis?.() || 0;

        const dateB =
          b.createdAt?.toMillis?.() || 0;

        return dateB - dateA;
      });

      setTransactions(results);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          mt: 2,
          textAlign: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          mb: 2,
        }}
      >
        Transaction History
      </Typography>

      {transactions.length === 0 && (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "#111",
            color: "#999",
          }}
        >
          No transactions yet
        </Paper>
      )}

      <Stack spacing={1.5}>
        {transactions.map((tx) => {

          const success = tx.status === "SUCCESS";

const transactionType =
  tx.type ||
  (tx.source === "pending"
    ? "DEPOSIT"
    : "UNKNOWN");

const isDeposit =
  transactionType === "DEPOSIT";

const isWithdrawal =
  transactionType === "WITHDRAWAL";

          return (
            <Paper
              key={tx.id}
              sx={{
                p: 2,
                bgcolor: "#111",
                borderRadius: 4,
                border:
                  "1px solid rgba(255,255,255,.05)",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
              >
                <Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                  {isDeposit ? (
  <ArrowUpward
    sx={{
      color: "#00C853",
    }}
  />
) : (
    <ArrowDownward
    sx={{
      color: "#ff4444",
    }}
  />
)}

                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {isDeposit
  ? "Deposit"
  : isWithdrawal
  ? "Withdrawal"
  : transactionType}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color: "#888",
                      fontSize: 12,
                      mt: .5,
                    }}
                  >
                    {tx.phone}
                  </Typography>

                  {tx.receiptNumber && (
                    <Typography
                      sx={{
                        color: "#aaa",
                        fontSize: 12,
                      }}
                    >
                      Receipt:
                      {" "}
                      {tx.receiptNumber}
                    </Typography>
                  )}

                  {tx.checkoutRequestID && (
                    <Typography
                      sx={{
                        color: "#aaa",
                        fontSize: 12,
                      }}
                    >
                      STK:
                      {" "}
                      {tx.checkoutRequestID}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      color: "#777",
                      fontSize: 11,
                      mt: .5,
                    }}
                  >
                    {tx.createdAt?.toDate
                      ? tx.createdAt
                          .toDate()
                          .toLocaleString()
                      : "Unknown"}
                  </Typography>

                </Box>

                <Box
                  textAlign="right"
                >
                  <Typography
                    sx={{
                      color: GOLD,
                      fontWeight: 900,
                      fontSize: 18,
                    }}
                  >
                    KES {Number(
                      tx.amount || 0
                    ).toLocaleString()}
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      tx.status ||
                      "PENDING"
                    }
                    sx={{
                      mt: 1,

                      bgcolor: success
                        ? "rgba(0,200,83,.15)"
                        : "rgba(255,152,0,.15)",

                      color: success
                        ? "#00C853"
                        : "#FF9800",

                      fontWeight: 700,
                    }}
                  />
                </Box>

              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}