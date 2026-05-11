import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";

const GOLD = "#F4B400";

export default function SearchFilters({
  type,
  price,
  setPrice,
  sort,
  setSort
}){

return(

<Box
sx={{
display:"flex",
gap:2,
mb:3,
flexWrap:"wrap"
}}
>

<TextField
select
label="Price"
size="small"
value={price}
onChange={(e)=>setPrice(e.target.value)}
sx={{
minWidth:140,
background:"#111",
input:{color:"#fff"},
label:{color:"#aaa"}
}}
>

<MenuItem value="">Any</MenuItem>
<MenuItem value="low">Low Price</MenuItem>
<MenuItem value="high">High Price</MenuItem>

</TextField>


<TextField
select
label="Sort"
size="small"
value={sort}
onChange={(e)=>setSort(e.target.value)}
sx={{
minWidth:140,
background:"#111",
input:{color:"#fff"},
label:{color:"#aaa"}
}}
>

<MenuItem value="">Default</MenuItem>
<MenuItem value="new">Newest</MenuItem>
<MenuItem value="old">Oldest</MenuItem>

</TextField>

</Box>

)

}