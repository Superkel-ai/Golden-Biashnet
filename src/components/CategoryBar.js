import React, { useState } from "react";

import {
  Box,
  Chip,
  Typography,
  Dialog,
  DialogContent,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";
const BORDER = "#333";

const CATEGORY_DATA = {

  products: [
    "Phones",
    "Laptops",
    "TVs",
    "Fashion",
    "Beauty",
    "Furniture",
    "Home Appliances",
    "Gaming",
    "Accessories"
  ],

  services: [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Repair",
    "Photography",
    "Graphic Design",
    "Transport",
    "Tutoring"
  ],

  houses: [
    "Apartments",
    "Bedsitters",
    "Hostels",
    "Land",
    "Commercial"
  ],

  adverts: [
    "Jobs",
    "Events",
    "Promotions",
    "Business Ads"
  ]

};

export default function CategoryBar(){

const navigate = useNavigate()

const [activeCategory,setActiveCategory] = useState(null)
const [open,setOpen] = useState(false)


/* OPEN CATEGORY WINDOW */

const openCategory = (cat)=>{

setActiveCategory(cat)
setOpen(true)

}


/* CLOSE WINDOW */

const closeWindow = ()=>{

setOpen(false)

}


/* SUBCATEGORY SEARCH */

const goToSubcategory = (sub)=>{

navigate(`/search?type=${activeCategory}&subcategory=${encodeURIComponent(sub)}`)

setOpen(false)

}


/* VIEW ALL CATEGORY */

const goToCategory = ()=>{

navigate(`/search?type=${activeCategory}`)

setOpen(false)

}


/* VIEW PROMOTED */

const goToPromoted = ()=>{

navigate(`/search?type=${activeCategory}&promoted=true`)

setOpen(false)

}


return(

<Box>


{/* CATEGORY BAR */}

<Box
sx={{
display:"flex",
gap:2,
overflowX:"auto",
pb:1
}}
>

{Object.keys(CATEGORY_DATA).map(cat=>(

<Chip
key={cat}

label={cat.toUpperCase()}

onClick={()=>openCategory(cat)}

sx={{
background:"#111",
color:GOLD,
border:`1px solid ${GOLD}`,
fontWeight:600,

"&:hover":{
background:GOLD,
color:"#000"
}
}}

 />

))}

</Box>



{/* CATEGORY WINDOW */}

<Dialog
open={open}
onClose={closeWindow}
maxWidth="md"
fullWidth
>

<DialogContent
sx={{
background:"#000",
color:"#fff"
}}
>


{/* CATEGORY TITLE */}

<Typography
variant="h5"
sx={{
color:GOLD,
fontWeight:700,
mb:3
}}
>

{activeCategory?.toUpperCase()}

</Typography>



{/* PROMOTED */}

<Card
onClick={goToPromoted}
sx={{
mb:2,
cursor:"pointer",
background:"#111",
border:`1px solid ${BORDER}`,

"&:hover":{
borderColor:GOLD
}
}}
>

<CardContent>

<Typography
sx={{
color:GOLD,
fontWeight:600
}}
>

⭐ Promoted {activeCategory}

</Typography>

<Typography sx={{color:"#aaa",fontSize:14}}>
See top promoted listings
</Typography>

</CardContent>

</Card>



{/* VIEW ALL */}

<Card
onClick={goToCategory}
sx={{
mb:3,
cursor:"pointer",
background:"#111",
border:`1px solid ${BORDER}`,

"&:hover":{
borderColor:GOLD
}
}}
>

<CardContent>

<Typography
sx={{
color:GOLD,
fontWeight:600
}}
>

Browse All {activeCategory}

</Typography>

<Typography sx={{color:"#aaa",fontSize:14}}>
See all listings in this category
</Typography>

</CardContent>

</Card>



{/* SUBCATEGORIES */}

<Grid container spacing={2}>

{activeCategory && CATEGORY_DATA[activeCategory].map(sub=>(

<Grid item xs={6} sm={4} md={3} key={sub}>

<Card
onClick={()=>goToSubcategory(sub)}

sx={{
cursor:"pointer",
background:"#111",
border:`1px solid ${BORDER}`,
textAlign:"center",

"&:hover":{
borderColor:GOLD,
background:"#1a1a1a"
}
}}
>

<CardContent>

<Typography
sx={{
color:"#fff",
fontWeight:500
}}
>

{sub}

</Typography>

</CardContent>

</Card>

</Grid>

))}

</Grid>


</DialogContent>

</Dialog>

</Box>

)

}