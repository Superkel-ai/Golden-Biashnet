import React, { useEffect, useState } from "react";

import {
Box,
Typography,
Grid,
Card,
CardMedia,
CardContent,
TextField,
MenuItem,
Select,
InputAdornment,
IconButton,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Chip,
Stack
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import {
collection,
getDocs,
doc,
updateDoc,
deleteDoc
} from "firebase/firestore";

import { db } from "../services/firebase";

const GOLD = "#F4B400";

export default function AdminHouses(){

const [houses,setHouses] = useState([]);
const [filtered,setFiltered] = useState([]);
const [search,setSearch] = useState("");
const [sort,setSort] = useState("newest");

const [selected,setSelected] = useState(null);
const [open,setOpen] = useState(false);


// ================= FETCH =================

const fetchHouses = async()=>{

const snap = await getDocs(collection(db,"houses"));

const list = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setHouses(list);
setFiltered(list);

};


useEffect(()=>{
fetchHouses();
},[]);


// ================= SEARCH =================

useEffect(()=>{

let data = [...houses];

if(search){

data = data.filter(h=>
h.title?.toLowerCase().includes(search.toLowerCase()) ||
h.location?.toLowerCase().includes(search.toLowerCase())
);

}


// ================= SORT =================

if(sort==="rent-asc"){

data.sort((a,b)=>a.rent-b.rent);

}

if(sort==="rent-desc"){

data.sort((a,b)=>b.rent-a.rent);

}

if(sort==="newest"){

data.sort((a,b)=>b.createdAt?.seconds-a.createdAt?.seconds);

}

if(sort==="oldest"){

data.sort((a,b)=>a.createdAt?.seconds-b.createdAt?.seconds);

}

setFiltered(data);

},[search,sort,houses]);



// ================= OPEN DETAILS =================

const openDetails=(house)=>{

setSelected(house);
setOpen(true);

};

const closeDetails=()=>{

setOpen(false);

};



// ================= DELETE =================

const deleteHouse=async(house)=>{

await deleteDoc(doc(db,"houses",house.id));

setHouses(prev=>prev.filter(p=>p.id!==house.id));

setOpen(false);

};



// ================= HIDE =================

const toggleHide=async(house)=>{

await updateDoc(doc(db,"houses",house.id),{

status:house.status==="hidden" ? "approved" : "hidden"

});

fetchHouses();

};


// ================= PROMOTE =================

const togglePromote=async(house)=>{

await updateDoc(doc(db,"houses",house.id),{

"promotion.featured":!house.promotion?.featured

});

fetchHouses();

};


// ================= APPROVE =================

const approveHouse=async(house)=>{

await updateDoc(doc(db,"houses",house.id),{

status:"approved"

});

fetchHouses();

};



return(

<Box sx={{p:3}}>

{/* ================= HEADER ================= */}

<Typography
variant="h4"
sx={{fontWeight:700,mb:3}}
>
Admin Houses
</Typography>


{/* ================= SEARCH + SORT ================= */}

<Grid container spacing={2} sx={{mb:3}}>

<Grid item xs={12} md={6}>

<TextField
fullWidth
placeholder="Search houses..."
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
<MenuItem value="rent-asc">Rent Asc</MenuItem>
<MenuItem value="rent-desc">Rent Desc</MenuItem>

</Select>

</Grid>

</Grid>



{/* ================= GRID ================= */}

<Grid container spacing={3}>

{filtered.map(house=>(

<Grid item xs={12} sm={6} md={4} lg={3} key={house.id}>

<Card>

<CardMedia
component="img"
height="180"
image={house.images?.[0]?.thumb}
alt={house.title}
/>

<CardContent>

<Typography fontWeight={700}>
{house.title}
</Typography>

<Typography>
Rent: KES {house.rent}
</Typography>

<Typography variant="body2">
{house.location}
</Typography>

<Stack direction="row" spacing={1} sx={{mt:1}}>

{house.promotion?.featured && (
<Chip label="Promoted" sx={{background:GOLD}}/>
)}

<Chip
label={house.status}
color={
house.status==="approved"?"success":
house.status==="pending"?"warning":"default"
}
/>

</Stack>

<Button
fullWidth
variant="outlined"
sx={{mt:2}}
onClick={()=>openDetails(house)}
>
View
</Button>

</CardContent>

</Card>

</Grid>

))}

</Grid>



{/* ================= DETAILS WINDOW ================= */}

<Dialog
open={open}
onClose={closeDetails}
maxWidth="md"
fullWidth
>

{selected && (

<>

{/* Header */}

<DialogTitle>

<Stack direction="row" alignItems="center" spacing={1}>

<IconButton onClick={closeDetails}>
<ArrowBackIcon/>
</IconButton>

<Typography fontWeight={700}>
House Details
</Typography>

</Stack>

</DialogTitle>


{/* Content */}

<DialogContent>

<Grid container spacing={3}>

<Grid item xs={12} md={6}>

<img
src={selected.images?.[0]?.full}
width="100%"
style={{borderRadius:8}}
alt=""
/>

</Grid>


<Grid item xs={12} md={6}>

<Typography variant="h6" fontWeight={700}>
{selected.title}
</Typography>

<Typography>
Rent: KES {selected.rent}
</Typography>

<Typography>
Price: {selected.price}
</Typography>

<Typography>
Location: {selected.location}
</Typography>

<Typography>
Bedrooms: {selected.bedrooms}
</Typography>

<Typography>
Bathrooms: {selected.bathrooms}
</Typography>

<Typography>
Property Type: {selected.propertyType}
</Typography>

<Typography>
Hunting Fee: {selected.huntingFee}
</Typography>

<Typography>
Phone: {selected.phone || "N/A"}
</Typography>

<Typography>
Status: {selected.status}
</Typography>

<Typography>
Promoted: {selected.promotion?.featured ? "Yes" : "No"}
</Typography>

<Typography sx={{mt:2}}>
{selected.description}
</Typography>

</Grid>

</Grid>

</DialogContent>



{/* Actions */}

<DialogActions>

<Button
color="error"
onClick={()=>deleteHouse(selected)}
>
Delete
</Button>

<Button
onClick={()=>toggleHide(selected)}
>
{selected.status==="hidden" ? "Unhide" : "Hide"}
</Button>

<Button
onClick={()=>togglePromote(selected)}
>
{selected.promotion?.featured ? "Remove Promotion" : "Promote"}
</Button>

<Button
onClick={()=>approveHouse(selected)}
>
Approve
</Button>

</DialogActions>

</>

)}

</Dialog>

</Box>

);

}