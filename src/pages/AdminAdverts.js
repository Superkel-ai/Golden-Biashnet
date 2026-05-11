import React, { useEffect, useState } from "react";

import {
Box,
Typography,
Grid,
Card,
CardMedia,
CardContent,
TextField,
InputAdornment,
Select,
MenuItem,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Stack,
Chip,
IconButton
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
collection,
getDocs,
doc,
deleteDoc,
updateDoc
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

export default function AdminAdverts() {

const [adverts,setAdverts] = useState([]);
const [filtered,setFiltered] = useState([]);
const [search,setSearch] = useState("");
const [sort,setSort] = useState("newest");

const [selected,setSelected] = useState(null);
const [open,setOpen] = useState(false);



// FETCH ADVERTS
const fetchAdverts = async () => {

const snap = await getDocs(collection(db,"adverts"));

const list = snap.docs.map(doc => ({
id:doc.id,
...doc.data()
}));

setAdverts(list);
setFiltered(list);

};

useEffect(()=>{
fetchAdverts();
},[]);



// SEARCH + SORT
useEffect(()=>{

let data = [...adverts];

if(search){

data = data.filter(a =>
a.title?.toLowerCase().includes(search.toLowerCase()) ||
a.location?.toLowerCase().includes(search.toLowerCase()) ||
a.advertType?.toLowerCase().includes(search.toLowerCase())
);

}

if(sort==="newest") data.sort((a,b)=>b.createdAt?.seconds - a.createdAt?.seconds);
if(sort==="oldest") data.sort((a,b)=>a.createdAt?.seconds - b.createdAt?.seconds);
if(sort==="views") data.sort((a,b)=>b.views - a.views);
if(sort==="price") data.sort((a,b)=>b.price - a.price);

setFiltered(data);

},[search,sort,adverts]);



// OPEN DETAILS
const openDetails = (advert)=>{
setSelected(advert);
setOpen(true);
};

const closeDetails = ()=> setOpen(false);



// DELETE ADVERT
const deleteAdvert = async(advert)=>{

try{

await deleteDoc(doc(db,"adverts",advert.id));

setAdverts(prev=>prev.filter(a=>a.id!==advert.id));

setOpen(false);

}catch(err){

console.error(err);

}

};



// PROMOTE
const togglePromote = async(advert)=>{

await updateDoc(doc(db,"adverts",advert.id),{
promoted:!advert.promoted
});

fetchAdverts();

};



// STATUS
const toggleStatus = async(advert)=>{

await updateDoc(doc(db,"adverts",advert.id),{
status:advert.status==="active"?"inactive":"active"
});

fetchAdverts();

};




return (

<Box sx={{p:3}}>

<Typography variant="h4" fontWeight={700} mb={3}>
Admin Adverts
</Typography>



{/* SEARCH + SORT */}

<Grid container spacing={2} mb={3}>

<Grid item xs={12} md={6}>

<TextField
fullWidth
placeholder="Search adverts..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<SearchIcon/>
</InputAdornment>
)
}}
/>

</Grid>

<Grid item xs={12} md={3}>

<Select
fullWidth
value={sort}
onChange={(e)=>setSort(e.target.value)}
>

<MenuItem value="newest">Newest</MenuItem>
<MenuItem value="oldest">Oldest</MenuItem>
<MenuItem value="views">Most Viewed</MenuItem>
<MenuItem value="price">Highest Price</MenuItem>

</Select>

</Grid>

</Grid>



{/* ADVERT GRID */}

<Grid container spacing={3}>

{filtered.map(advert => (

<Grid item xs={12} sm={6} md={4} lg={3} key={advert.id}>

<Card>

<CardMedia
component="img"
height="180"
image={advert.images?.[0]?.thumb}
alt={advert.title}
/>

<CardContent>

<Typography fontWeight={700}>
{advert.title}
</Typography>

<Typography variant="body2">
{advert.advertType}
</Typography>

<Typography>
{advert.location}
</Typography>

<Stack direction="row" spacing={1} mt={1}>

{advert.promoted && (
<Chip label="Promoted" sx={{background:GOLD}}/>
)}

<Chip
label={advert.status}
color={advert.status==="active"?"success":"default"}
/>

</Stack>

<Button
variant="outlined"
fullWidth
sx={{mt:2}}
onClick={()=>openDetails(advert)}
>
View
</Button>

</CardContent>

</Card>

</Grid>

))}

</Grid>



{/* DETAILS WINDOW */}

<Dialog
open={open}
onClose={closeDetails}
maxWidth="md"
fullWidth
>

{selected && (

<>

<DialogTitle>

<Stack direction="row" alignItems="center">

<IconButton onClick={closeDetails}>
<ArrowBackIcon/>
</IconButton>

<Typography fontWeight={700}>
Advert Details
</Typography>

</Stack>

</DialogTitle>



<DialogContent>

<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<img
src={selected.images?.[0]?.full}
alt=""
width="100%"
style={{borderRadius:8}}
/>

</Grid>



<Grid item xs={12} md={6}>

<Typography variant="h6" fontWeight={700}>
{selected.title}
</Typography>

<Typography>
Advert Type: {selected.advertType}
</Typography>

<Typography>
Location: {selected.location}
</Typography>

<Typography>
Organizer: {selected.organizerName}
</Typography>

<Typography>
Phone: {selected.phone}
</Typography>

<Typography>
Salary: {selected.salary}
</Typography>

<Typography>
Price: KES {selected.price}
</Typography>

<Typography>
Views: {selected.views}
</Typography>

<Typography>
Clicks: {selected.clicks}
</Typography>

<Typography>
Promoted: {selected.promoted ? "Yes" : "No"}
</Typography>

<Typography>
Status: {selected.status}
</Typography>

<Typography mt={2}>
{selected.description}
</Typography>

</Grid>

</Grid>

</DialogContent>



<DialogActions>

<Button
color="error"
onClick={()=>deleteAdvert(selected)}
>
Delete
</Button>

<Button
onClick={()=>togglePromote(selected)}
>
{selected.promoted ? "Remove Promotion" : "Promote"}
</Button>

<Button
onClick={()=>toggleStatus(selected)}
>
{selected.status==="active" ? "Deactivate" : "Activate"}
</Button>

</DialogActions>

</>

)}

</Dialog>



</Box>

);

}