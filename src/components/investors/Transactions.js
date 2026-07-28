import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";

import {
  ArrowDownward,
  ArrowUpward,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";

import {
  auth,
  db,
} from "../../services/firebase";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const GOLD = "#F4B400";

export default function Transactions() {
  const [loading, setLoading] =
    useState(true);

  const [transactions, setTransactions] =
    useState([]);

  useEffect(() => {
    const uid =
      auth.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(
        db,
        "investorTransactions"
      ),
      where("userId", "==", uid),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data = [];

          snapshot.forEach((doc) => {
            data.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          setTransactions(data);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          bgcolor: "#111",
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        bgcolor: "#111",
        p: 3,
        borderRadius: 4,
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 20,
          mb: 3,
        }}
      >
        Recent Transactions
      </Typography>

      {transactions.length === 0 && (
        <Typography
          sx={{
            color: "#888",
            textAlign: "center",
            py: 4,
          }}
        >
          No transactions found.
        </Typography>
      )}

      <Stack spacing={2}>
        {transactions.map((tx) => {

          const type =
            tx.type || "UNKNOWN";

          const status =
            tx.status || "PENDING";

          const success =
            status === "SUCCESS";

          const isDeposit =
            type === "DEPOSIT";

          const isWithdrawal =
            type === "WITHDRAWAL";

          const isShares =
            type === "SHARES";

          const isDividend =
            type === "DIVIDEND";

          return (
            <Paper
              key={tx.id}
              sx={{
                bgcolor: "#181818",
                p: 2,
                borderRadius: 3,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
              >
                <Box>

                  <Box
                    display="flex"
                    gap={1}
                    alignItems="center"
                  >

                    {isDeposit && (
                      <ArrowDownward
                        sx={{
                          color:
                            "#00C853",
                        }}
                      />
                    )}

                    {isWithdrawal && (
                      <ArrowUpward
                        sx={{
                          color:
                            "#ff4444",
                        }}
                      />
                    )}

                    {isShares && (
                      <TrendingUp
                        sx={{
                          color:
                            GOLD,
                        }}
                      />
                    )}

                    {isDividend && (
                      <TrendingDown
                        sx={{
                          color:
                            "#42A5F5",
                        }}
                      />
                    )}

                    <Typography
                      sx={{
                        color:
                          "#fff",
                        fontWeight: 800,
                      }}
                    >
                      {type}
                    </Typography>

                  </Box>

                  <Typography
                    sx={{
                      color:
                        "#888",
                      fontSize: 12,
                      mt: .5,
                    }}
                  >
                    {tx.createdAt?.toDate
                      ? tx.createdAt
                          .toDate()
                          .toLocaleString()
                      : "Unknown Date"}
                  </Typography>

                  {tx.reference && (
                    <Typography
                      sx={{
                        color:
                          "#666",
                        fontSize: 11,
                      }}
                    >
                      Ref:
                      {" "}
                      {tx.reference}
                    </Typography>
                  )}

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
                    KES{" "}
                    {Number(
                      tx.amount || 0
                    ).toLocaleString()}
                  </Typography>

                  <Chip
                    size="small"
                    label={status}
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
    </Paper>
  );
}