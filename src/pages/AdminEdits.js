import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from "@mui/material";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

const categories = [
  "Electronics",
  "Fashion",
  "Home",
  "Shoes",
  "Jewelry",
  "Watches",
  "Foods",
  "Snacks",
  "Vehicles",
  "Phones",
  "Computers",
  "Accessories",
  "Other"
];

const conditions = [
  "New",
  "Used",
  "Refurbished"
];

export default function AdminEditProduct() {

  const { productId } = useParams();

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);

  const [saving,setSaving] = useState(false);

  const [error,setError] = useState("");

  const [success,setSuccess] = useState("");

  const [product,setProduct] = useState(null);

  const [form,setForm] = useState({

    title:"",
    description:"",
    category:"",
    subCategory:"",
    condition:"New",

    price:"",
    markedPrice:"",

    flashSale: false,
    flashSalePrice: "",
    flashSaleEndsAt: 24,

    stock:1,

    location:"",

    status:"approved",

    isActive:true,

    promoted:false

  });

  /* ===================================================
     LOAD PRODUCT
  =================================================== */

  useEffect(() => {

    loadProduct();

  }, [productId]);

  const loadProduct = async () => {

    try {

      setLoading(true);

      const ref = doc(
        db,
        "products",
        productId
      );

      const snap = await getDoc(ref);

      if (!snap.exists()) {

        setError("Product not found");

        return;

      }

      const data = snap.data();

      setProduct(data);

      setForm({

        title:data.title || "",

        description:data.description || "",

        category:data.category || "",

        subCategory:data.subCategory || "",

        condition:data.condition || "New",

        price:data.price || "",

        markedPrice:data.markedPrice || "",

        flashSale: data.flashSale || false,
        flashSalePrice: data.flashSalePrice || "",
        flashSaleDuration: data.flashSaleEndsAt || 24,

        stock:data.stock || 1,

        location:data.location || "",

        status:data.status || "approved",

        isActive:data.isActive ?? true,

        promoted:data.promotion?.promoted || false

      });

    } catch(err) {

      console.log(err);

      setError("Failed to load product");

    } finally {

      setLoading(false);

    }

  };

  /* ===================================================
     FORM CHANGE
  =================================================== */

  const handleChange = (field,value) => {

    setForm(prev => ({

      ...prev,

      [field]: value

    }));

  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSave = async () => {

    try {

      setSaving(true);

      setError("");

      const price =
        Number(form.price);

      const marked =
        Number(form.markedPrice);

      let discount = 0;

      if(marked > price){

        discount = Math.round(

          ((marked - price) / marked) * 100

        );

      }

      await updateDoc(

        doc(
          db,
          "products",
          productId
        ),

        {

          title: form.title,

          description:
            form.description,

          category:
            form.category,

          subCategory:
            form.subCategory,

          condition:
            form.condition,

          price,

          markedPrice:
            marked,

          discount,

          stock:
            Number(form.stock),

          location:
            form.location,

          status:
            form.status,

          isActive:
            form.isActive,

          "promotion.promoted":
            form.promoted

        }

      );

      setSuccess(
        "Product updated successfully"
      );

    } catch(err) {

      console.log(err);

      setError(
        "Failed to save product"
      );

    } finally {

      setSaving(false);

    }

  };

  /* ===================================================
     LOADING
  =================================================== */

  if(loading){

    return(

      <Box
        sx={{
          display:"flex",
          justifyContent:"center",
          py:8
        }}
      >

        <CircularProgress />

      </Box>

    );

  }

  return(

    <Box
      sx={{
        background:"#050505",
        minHeight:"100vh",
        p:3,
        color:"#fff"
      }}
    >

      <Paper
        sx={{
          maxWidth:900,
          mx:"auto",
          p:4,
          background:"#101010"
        }}
      >

        <Typography
          sx={{
            fontSize:28,
            fontWeight:900,
            mb:3,
            color:GOLD
          }}
        >
          Edit Product
        </Typography>

        {error && (
          <Alert severity="error" sx={{mb:2}}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{mb:2}}>
            {success}
          </Alert>
        )}

        <Stack spacing={2}>

          <TextField
            label="Title"
            value={form.title}
            onChange={(e)=>
              handleChange(
                "title",
                e.target.value
              )
            }
          />

          <TextField
            label="Description"
            multiline
            rows={5}
            value={form.description}
            onChange={(e)=>
              handleChange(
                "description",
                e.target.value
              )
            }
          />

          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e)=>
              handleChange(
                "category",
                e.target.value
              )
            }
          >
            {categories.map(cat=>(
              <MenuItem
                key={cat}
                value={cat}
              >
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Sub Category"
            value={form.subCategory}
            onChange={(e)=>
              handleChange(
                "subCategory",
                e.target.value
              )
            }
          />

          <TextField
            select
            label="Condition"
            value={form.condition}
            onChange={(e)=>
              handleChange(
                "condition",
                e.target.value
              )
            }
          >
            {conditions.map(c=>(
              <MenuItem
                key={c}
                value={c}
              >
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={(e)=>
              handleChange(
                "price",
                e.target.value
              )
            }
          />

          <TextField
            label="Marked Price"
            type="number"
            value={form.markedPrice}
            onChange={(e)=>
              handleChange(
                "markedPrice",
                e.target.value
              )
            }
          />

          <TextField
            label="Stock"
            type="number"
            value={form.stock}
            onChange={(e)=>
              handleChange(
                "stock",
                e.target.value
              )
            }
          />

          <TextField
            label="Location"
            value={form.location}
            onChange={(e)=>
              handleChange(
                "location",
                e.target.value
              )
            }
          />
          <TextField
  label="Flash Sale Price"
  type="number"
  value={form.flashSalePrice}
  onChange={(e) =>
    handleChange("flashSalePrice", e.target.value)
  }
/>
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e)=>
              handleChange(
                "status",
                e.target.value
              )
            }
          >
            <MenuItem value="approved">
              Approved
            </MenuItem>

            <MenuItem value="pending">
              Pending
            </MenuItem>

            <MenuItem value="rejected">
              Rejected
            </MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e)=>
                  handleChange(
                    "isActive",
                    e.target.checked
                  )
                }
              />
            }
            label="Visible"
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.promoted}
                onChange={(e)=>
                  handleChange(
                    "promoted",
                    e.target.checked
                  )
                }
              />
            }
            label="Promoted"
          />

          <FormControlLabel
  control={
    <Switch
      checked={form.flashSale}
      onChange={(e) =>
        handleChange("flashSale", e.target.checked)
      }
/>
  }
  label="Flash Sale"
/>

          <Stack
            direction="row"
            spacing={2}
          >

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                background:GOLD,
                color:"#000"
              }}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>

            <Button
              variant="outlined"
              onClick={()=>
                navigate(-1)
              }
            >
              Cancel
            </Button>

          </Stack>

        </Stack>

      </Paper>

    </Box>

  );

}