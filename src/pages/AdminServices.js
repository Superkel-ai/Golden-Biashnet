// src/admin/AdminServices.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Avatar
} from "@mui/material";

import {
  Delete,
  Visibility,
  Block,
  CheckCircle
} from "@mui/icons-material";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";



// ================= COLORS =================

const BG = "#0a0a0a";
const CARD = "#111";
const GOLD = "#F4B400";


// ================= GET CLOUDINARY PUBLIC ID =================

const getPublicId = (url) => {
  try {

    const parts = url.split("/upload/")[1];

    if (!parts) return null;

    const clean = parts.split(".")[0];

    const withoutVersion = clean.replace(/^v\d+\//, "");

    return withoutVersion;

  } catch {
    return null;
  }
};


// ================= COMPONENT =================

export default function AdminServices() {

  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  // ================= FETCH SERVICES =================

  const fetchServices = async () => {

    try {

      const snap = await getDocs(collection(db, "services"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setServices(data);
      setFiltered(data);

    } catch (error) {

      console.error("Fetch services error:", error);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {
    fetchServices();
  }, []);



  // ================= SEARCH =================

  useEffect(() => {

    const term = search.toLowerCase();

    const results = services.filter(service =>
      service.title?.toLowerCase().includes(term) ||
      service.name?.toLowerCase().includes(term) ||
      service.category?.toLowerCase().includes(term)
    );

    setFiltered(results);

  }, [search, services]);



  // ================= DELETE SERVICE =================

  const handleDelete = async (service) => {

    if (!window.confirm("Delete this service?")) return;

    try {

      

      await deleteDoc(doc(db, "services", service.id));

      setServices(prev =>
        prev.filter(s => s.id !== service.id)
      );

    } catch (error) {

      console.error("Delete service error:", error);

    }

  };



  // ================= TOGGLE STATUS =================

  const toggleStatus = async (service) => {

    const newStatus =
      service.status === "active"
        ? "disabled"
        : "active";

    await updateDoc(doc(db, "services", service.id), {
      status: newStatus
    });

    fetchServices();

  };



  if (loading) {

    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );

  }



  return (

    <Box sx={{ p: 3, background: BG, minHeight: "100vh" }}>

      <Typography
        sx={{
          fontSize: 24,
          fontWeight: "bold",
          mb: 2,
          color: GOLD
        }}
      >
        Admin Services
      </Typography>


      {/* SEARCH */}

      <TextField
        placeholder="Search services..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          background: "#111",
          borderRadius: 2,
          input: { color: "#fff" }
        }}
      />


      <Paper sx={{ background: CARD }}>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ color: "#fff" }}>Image</TableCell>
              <TableCell sx={{ color: "#fff" }}>Title</TableCell>
              <TableCell sx={{ color: "#fff" }}>Provider</TableCell>
              <TableCell sx={{ color: "#fff" }}>Category</TableCell>
              <TableCell sx={{ color: "#fff" }}>Price</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff" }}>Actions</TableCell>

            </TableRow>

          </TableHead>



          <TableBody>

            {filtered.map(service => {

              const image =
                service.images?.[0]?.thumb ||
                service.images?.[0]?.full;

              return (

                <TableRow key={service.id}>

                  <TableCell>

                    <Avatar
                      src={image}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    />

                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                    {service.title}
                  </TableCell>

                  <TableCell sx={{ color: "#aaa" }}>
                    {service.name}
                  </TableCell>

                  <TableCell sx={{ color: "#aaa" }}>
                    {service.category}
                  </TableCell>

                  <TableCell sx={{ color: GOLD }}>
                    KES {service.price}
                  </TableCell>


                  <TableCell>

                    <Chip
                      label={service.status}
                      color={
                        service.status === "active"
                          ? "success"
                          : "default"
                      }
                    />

                  </TableCell>


                  <TableCell>

                    <IconButton
                      onClick={() => toggleStatus(service)}
                      sx={{ color: "#fff" }}
                    >
                      {service.status === "active"
                        ? <Block />
                        : <CheckCircle />}
                    </IconButton>


                    <IconButton
                      onClick={() => handleDelete(service)}
                      sx={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>

                  </TableCell>

                </TableRow>

              );

            })}

          </TableBody>

        </Table>

      </Paper>

    </Box>

  );

}