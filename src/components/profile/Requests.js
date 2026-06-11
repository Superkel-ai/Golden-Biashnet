import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from "@mui/material";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../services/firebase";

const GOLD = "#F4B400";

export default function Requests() {

  const [loading,setLoading] =
    useState(true);

  const [submitting,setSubmitting] =
    useState(false);

  const [products,setProducts] =
    useState([]);

  const [selectedProduct,setSelectedProduct] =
    useState("");

  const [requestType,setRequestType] =
    useState("promotion");

  const [message,setMessage] =
    useState("");

  const [user,setUser] =
    useState(null);

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    try {

      const uid =
        auth.currentUser?.uid;

      if (!uid) return;

      /* ==========================
         USER
      ========================== */

      const userSnap =
        await getDoc(
          doc(db,"users",uid)
        );

      if(userSnap.exists()){

        setUser(userSnap.data());

      }

      /* ==========================
         PRODUCTS
      ========================== */

      const q = query(
        collection(db,"products"),
        where(
          "userId",
          "==",
          uid
        )
      );

      const snap =
        await getDocs(q);

      const data =
        snap.docs.map(doc=>({

          id:doc.id,

          ...doc.data()

        }));

      setProducts(data);

    } catch(err){

      console.log(err);

    } finally {

      setLoading(false);

    }

  };

  const submitRequest =
    async () => {

    try {

      if(!selectedProduct){

        alert(
          "Select a product"
        );

        return;
      }

      setSubmitting(true);

      const product =
        products.find(
          p =>
            p.id ===
            selectedProduct
        );

      await addDoc(
        collection(
          db,
          "adminRequests"
        ),
        {

          userId:
            auth.currentUser.uid,

          sellerName:
            user?.name || "",

          sellerPhone:
            user?.phone || "",

          productId:
            product?.id || "",

          productTitle:
            product?.title || "",

          requestType,

          message,

          status:
            "pending",

          createdAt:
            serverTimestamp(),

        }
      );

      alert(
        "Request sent successfully"
      );

      setMessage("");

      setSelectedProduct("");

    } catch(err){

      console.log(err);

      alert(
        "Failed to submit request"
      );

    } finally {

      setSubmitting(false);

    }

  };

  if(loading){

    return(

      <Box
        sx={{
          display:"flex",
          justifyContent:"center",
          py:5
        }}
      >
        <CircularProgress />
      </Box>

    );

  }

  return (

    <Box sx={{p:2}}>

      <Typography
        sx={{
          fontSize:22,
          fontWeight:800,
          mb:2,
          color:"#fff"
        }}
      >
        Request Admin Service
      </Typography>

      <Card
        sx={{
          bgcolor:"#111",
          borderRadius:4
        }}
      >

        <CardContent>

          <Stack spacing={2}>

            {/* PRODUCT */}

            <TextField
              select
              label="Select Product"
              value={
                selectedProduct
              }
              onChange={(e)=>
                setSelectedProduct(
                  e.target.value
                )
              }
            >

              {products.map(
                product => (

                <MenuItem
                  key={
                    product.id
                  }
                  value={
                    product.id
                  }
                >
                  {product.title}
                </MenuItem>

              ))}

            </TextField>

            {/* TYPE */}

            <TextField
              select
              label="Request Type"
              value={
                requestType
              }
              onChange={(e)=>
                setRequestType(
                  e.target.value
                )
              }
            >

              <MenuItem
                value="promotion"
              >
                Promote Product
              </MenuItem>

              <MenuItem
                value="flashsale"
              >
                Flash Sale
              </MenuItem>

              <MenuItem
                value="featured"
              >
                Homepage Featured
              </MenuItem>

              <MenuItem
                value="verification"
              >
                Product Verification
              </MenuItem>

              <MenuItem
                value="support"
              >
                General Support
              </MenuItem>

            </TextField>

            {/* MESSAGE */}

            <TextField
              multiline
              rows={4}
              label="Message"
              value={message}
              onChange={(e)=>
                setMessage(
                  e.target.value
                )
              }
              placeholder="
Explain your request...
"
            />

            {/* BUTTON */}

            <Button
              variant="contained"
              disabled={
                submitting
              }
              onClick={
                submitRequest
              }
              sx={{
                bgcolor:GOLD,
                color:"#000",
                fontWeight:800,
                py:1.4
              }}
            >
              {submitting
                ? "Sending..."
                : "Send Request"}
            </Button>

          </Stack>

        </CardContent>

      </Card>

    </Box>

  );

}