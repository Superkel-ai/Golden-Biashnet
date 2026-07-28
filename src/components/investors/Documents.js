import React, {
  useEffect,
  useState,
} from "react";

import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";

import {
  Description,
  Download,
  OpenInNew,
} from "@mui/icons-material";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function Documents() {
  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const q = query(
        collection(
          db,
          "investorDocuments"
        ),
        where(
          "active",
          "==",
          true
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

      const snap =
        await getDocs(q);

      const results = [];

      snap.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setDocuments(results);

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
          fontSize: 22,
          mb: 1,
        }}
      >
        Company Documents
      </Typography>

      <Typography
        sx={{
          color: "#888",
          mb: 3,
        }}
      >
        Access official BIASHNET
        investor documents, reports,
        legal filings and updates.
      </Typography>

      {documents.length === 0 && (
        <Paper
          sx={{
            p: 4,
            bgcolor: "#181818",
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Description
            sx={{
              fontSize: 50,
              color: "#666",
              mb: 1,
            }}
          />

          <Typography
            sx={{
              color: "#999",
            }}
          >
            No documents available yet.
          </Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {documents.map((doc) => (
          <Paper
            key={doc.id}
            sx={{
              bgcolor: "#181818",
              p: 2,
              borderRadius: 3,
              border:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  {doc.title}
                </Typography>

                <Typography
                  sx={{
                    color: "#999",
                    fontSize: 13,
                    mt: .5,
                  }}
                >
                  {doc.description}
                </Typography>

                {doc.category && (
                  <Chip
                    size="small"
                    label={doc.category}
                    sx={{
                      mt: 1,
                      bgcolor:
                        "rgba(244,180,0,.15)",
                      color: GOLD,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <OpenInNew />
                  }
                  onClick={() =>
                    window.open(
                      doc.fileUrl,
                      "_blank"
                    )
                  }
                  sx={{
                    color: GOLD,
                    borderColor:
                      GOLD,

                    "&:hover": {
                      borderColor:
                        GOLD,
                    },
                  }}
                >
                  View
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    <Download />
                  }
                  onClick={() =>
                    window.open(
                      doc.fileUrl,
                      "_blank"
                    )
                  }
                  sx={{
                    bgcolor: GOLD,
                    color: "#000",
                    fontWeight: 800,

                    "&:hover": {
                      bgcolor:
                        "#dca300",
                    },
                  }}
                >
                  Download
                </Button>
              </Stack>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor:
            "rgba(244,180,0,.08)",
          borderRadius: 3,
          border:
            "1px solid rgba(244,180,0,.15)",
        }}
      >
        <Typography
          sx={{
            color: GOLD,
            fontWeight: 800,
            mb: .5,
          }}
        >
          Investor Transparency
        </Typography>

        <Typography
          sx={{
            color: "#bbb",
            fontSize: 13,
          }}
        >
          BIASHNET is committed to
          transparency by providing
          investors with access to
          company reports, legal
          documents, financial updates,
          fundraising information and
          major business announcements.
        </Typography>
      </Box>
    </Paper>
  );
}