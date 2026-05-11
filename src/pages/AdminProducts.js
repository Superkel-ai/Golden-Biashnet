import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip
} from "@mui/material";

import { db } from "../services/firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

const GOLD = "#F4B400";

export default function AdminProducts() {

const [products,setProducts] = useState([]);
const [selected,setSelected] = useState(null);
const [open,setOpen] = useState(false);

const fetchProducts = async()=>{

try{

const snap = await getDocs(collection(db,"products"));

const list = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setProducts(list);

}catch(err){
console.error(err);
}

};

useEffect(()=>{
fetchProducts();
},[]);


const handleOpen = (product)=>{
setSelected(product);
setOpen(true);
};

const handleClose = ()=>{
setOpen(false);
};


const toggleHide = async(product)=>{

const ref = doc(db,"products",product.id);

await updateDoc(ref,{
isActive:!product.isActive
});

fetchProducts();

};


const togglePromote = async(product)=>{

const ref = doc(db,"products",product.id);

await updateDoc(ref,{
"promotion.isPromoted":!product.promotion?.isPromoted
});

fetchProducts();

};


const deleteProduct = async(product)=>{

const ref = doc(db,"products",product.id);

await deleteDoc(ref);

fetchProducts();

};


return(

<Box sx={{p:3}}>

<Typography
variant="h4"
sx={{
mb:3,
fontWeight:700
}}
>
Admin Products
</Typography>


<Grid container spacing={3}>

{products.map(product=>(

<Grid item xs={12} md={4} key={product.id}>

<Card
sx={{
border:"1px solid #eee"
}}
>

<CardMedia
component="img"
height="180"
image={product.images?.[0]?.thumb}
alt={product.title}
/>

<CardContent>

<Typography fontWeight={700}>
{product.title}
</Typography>

<Typography>
KES {product.price}
</Typography>

<Typography variant="body2">
{product.location}
</Typography>

<Stack direction="row" spacing={1} sx={{mt:1}}>

{product.isActive ? (
<Chip label="Visible" color="success"/>
):(
<Chip label="Hidden" color="error"/>
)}

{product.promotion?.isPromoted && (
<Chip label="Promoted" sx={{background:GOLD}}/>
)}

</Stack>

<Button
fullWidth
sx={{mt:2}}
variant="outlined"
onClick={()=>handleOpen(product)}
>
Manage
</Button>

</CardContent>

</Card>

</Grid>

))}

</Grid>



{/* ================= PRODUCT WINDOW ================= */}

<Dialog
open={open}
onClose={handleClose}
maxWidth="sm"
fullWidth
>

{selected && (

<>

<DialogTitle>

{selected.title}

</DialogTitle>

<DialogContent>

<Box sx={{mb:2}}>

<img
src={selected.images?.[0]?.full}
width="100%"
alt=""
/>

</Box>

<Typography>
Price: KES {selected.price}
</Typography>

<Typography>
Marked Price: KES {selected.markedPrice}
</Typography>

<Typography>
Category: {selected.category}
</Typography>

<Typography>
Condition: {selected.condition}
</Typography>

<Typography>
Stock: {selected.stock}
</Typography>

<Typography>
Seller: {selected.sellerName}
</Typography>

<Typography>
Phone: {selected.sellerPhone}
</Typography>

<Typography>
Location: {selected.location}
</Typography>

<Typography sx={{mt:2}}>
{selected.description}
</Typography>

</DialogContent>


<DialogActions>

<Button
color="error"
onClick={()=>deleteProduct(selected)}
>
Delete
</Button>

<Button
onClick={()=>toggleHide(selected)}
>
{selected.isActive ? "Hide" : "Unhide"}
</Button>

<Button
onClick={()=>togglePromote(selected)}
>
{selected.promotion?.isPromoted ? "Remove Promotion" : "Promote"}
</Button>

<Button
variant="contained"
sx={{background:GOLD}}
>
Edit
</Button>

</DialogActions>

</>

)}

</Dialog>


</Box>

);

}