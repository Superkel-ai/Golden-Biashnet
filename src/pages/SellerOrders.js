import React, { useEffect, useState } from "react";

import {
Box,
Container,
Typography,
Grid,
Card,
CardContent,
Avatar,
Stack,
Chip,
Button,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Select,
MenuItem,
CircularProgress
} from "@mui/material";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";

import {
collection,
query,
where,
getDocs,
doc,
updateDoc,
orderBy
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const GOLD="#F4B400";
const CARD="#111";
const BORDER="#222";

const ORDER_STATUS=[
"received",
"packaging",
"dispatched",
"in transit",
"delivered"
];

export default function SellerOrders(){

const uid=auth.currentUser?.uid;

const [loading,setLoading]=useState(true);
const [orders,setOrders]=useState([]);
const [selected,setSelected]=useState(null);
const [status,setStatus]=useState("");


// =====================
// LOAD ORDERS
// =====================

const loadOrders=async()=>{

try{

const q=query(
collection(db,"orders"),
where("sellerId","==",uid),
orderBy("createdAt","desc")
);

const snap=await getDocs(q);

const data=snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setOrders(data);

}catch(err){
console.error(err);
}

setLoading(false);

};


useEffect(()=>{

if(!uid) return;

loadOrders();

},[]);


// =====================
// UPDATE ORDER STATUS
// =====================

const updateStatus=async()=>{

try{

await updateDoc(doc(db,"orders",selected.id),{
orderStatus:status
});

loadOrders();
setSelected(null);

}catch(err){
console.error(err);
}

};


// =====================
// ORDER CARD
// =====================

const OrderCard=({order})=>{

const item=order.items?.[0];

return(

<Grid item xs={12} sm={6} md={4}>

<Card sx={{background:CARD,border:`1px solid ${BORDER}`}}>

<CardContent>

<Stack direction="row" spacing={2}>

<Avatar
variant="rounded"
src={item?.image}
sx={{width:70,height:70}}
/>

<Box>

<Typography fontWeight="bold">
{item?.title}
</Typography>

<Typography color={GOLD}>
KES {order.total?.toLocaleString()}
</Typography>

<Chip
size="small"
label={order.orderStatus}
/>

</Box>

</Stack>

<Stack spacing={1} mt={2}>

<Typography fontSize={13} color="gray">

Payment: {order.paymentMethod}

</Typography>

<Typography fontSize={13} color="gray">

Payment Status: {order.paymentStatus}

</Typography>

</Stack>

<Button
fullWidth
sx={{mt:2,color:GOLD}}
onClick={()=>{

setSelected(order);
setStatus(order.orderStatus);

}}
>

View Order

</Button>

</CardContent>

</Card>

</Grid>

)

};


// =====================
// LOADING
// =====================

if(loading){

return(

<Box sx={{display:"flex",justifyContent:"center",mt:10}}>
<CircularProgress/>
</Box>

)

}


// =====================
// PAGE
// =====================

return(

<Box sx={{background:"#000",minHeight:"100vh",color:"#fff"}}>

<Container maxWidth="lg" sx={{py:4}}>

<Typography variant="h5" mb={3}>

Customer Orders

</Typography>

<Grid container spacing={3}>

{orders.map(order=>(
<OrderCard key={order.id} order={order}/>
))}

</Grid>


{/* ORDER DETAILS */}

<Dialog
open={!!selected}
onClose={()=>setSelected(null)}
fullWidth
maxWidth="sm"
>

<DialogTitle>

Order Details

</DialogTitle>

<DialogContent>

{selected && (

<Stack spacing={2} mt={1}>

{selected.items.map(item=>(

<Stack direction="row" spacing={2} key={item.id}>

<Avatar
variant="rounded"
src={item.image}
sx={{width:70,height:70}}
/>

<Box>

<Typography fontWeight="bold">
{item.title}
</Typography>

<Typography color="gray">
Qty: {item.quantity}
</Typography>

</Box>

</Stack>

))}


<Typography>

Delivery Location:
{selected.deliveryLocation || selected.pickupStation}

</Typography>


<Typography>

Total: KES {selected.total?.toLocaleString()}

</Typography>


<Select
value={status}
onChange={(e)=>setStatus(e.target.value)}
fullWidth
>

{ORDER_STATUS.map(s=>(
<MenuItem key={s} value={s}>
{s}
</MenuItem>
))}

</Select>

</Stack>

)}

</DialogContent>

<DialogActions>

<Button onClick={()=>setSelected(null)}>
Close
</Button>

<Button
variant="contained"
sx={{background:GOLD,color:"#000"}}
onClick={updateStatus}
>

Update Status

</Button>

</DialogActions>

</Dialog>


</Container>

</Box>

)

}