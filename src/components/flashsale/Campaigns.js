import React,{
useEffect,
useState
}
from "react";

import {

Paper,
Typography,
Box,
Stack,
Button,
Chip,
Divider,
CircularProgress

}

from "@mui/material";

import {

Visibility,
Edit,
Delete,
ContentCopy

}

from "@mui/icons-material";

import {

collection,
onSnapshot

}

from "firebase/firestore";

import {

db

}

from "../../services/firebase";

const GOLD="#F4B400";

export default function Campaigns(){

const [

campaigns,

setCampaigns

]

=

useState([]);

const [

loading,

setLoading

]

=

useState(true);

useEffect(()=>{

const unsub=

onSnapshot(

collection(

db,

"flashCampaigns"

),

(snapshot)=>{

const data=

snapshot.docs.map(

doc=>({

id:doc.id,

...doc.data()

})

);

setCampaigns(

data

);

setLoading(false);

}

);

return()=>unsub();

},[]);

const getColor=(status)=>{

switch(status){

case "active":

return "#22c55e";

case "paused":

return "#f59e0b";

case "ended":

return "#ef4444";

default:

return "#666";

}

};

if(loading){

return(

<Box

display="flex"

justifyContent="center"

py={5}

>

<CircularProgress

sx={{

color:GOLD

}}

/>

</Box>

);

}

return(

<Paper

sx={{

background:"#111",

border:

"1px solid #222",

borderRadius:4,

p:3

}}

>

<Typography

sx={{

fontSize:22,

fontWeight:800,

color:GOLD,

mb:3

}}

>

Campaigns

</Typography>

{

campaigns.length===0 && (

<Box

textAlign="center"

py={4}

>

<Typography

color="#888"

>

No campaigns created

</Typography>

</Box>

)

}

{

campaigns.map(

campaign=>(

<Paper

key={campaign.id}

sx={{

mb:2,

p:2,

background:"#090909",

border:

"1px solid #1f1f1f"

}}

>

<Stack

direction={{

xs:"column",

md:"row"

}}

justifyContent=

"space-between"

spacing={2}

>

<Box>

<Typography

sx={{

fontSize:18,

fontWeight:800,

color:"#fff"

}}

>

{

campaign.campaignName

}

</Typography>

<Stack

direction="row"

spacing={1}

mt={1}

>

<Chip

label={

`${campaign.discountPercent}% OFF`

}

sx={{

background:GOLD,

color:"#000",

fontWeight:700

}}

/>

<Chip

label={

`${campaign.productIds?.length||0} Products`

}

sx={{

background:"#222",

color:"#fff"

}}

/>

<Chip

label={

campaign.status

}

sx={{

background:

getColor(

campaign.status

),

color:"#fff"

}}

/>

</Stack>

<Typography

mt={2}

fontSize={13}

color="#888"

>

Starts:

{

campaign.startDate

?.toDate()

.toLocaleString()

}

</Typography>

<Typography

fontSize={13}

color="#888"

>

Ends:

{

campaign.endDate

?.toDate()

.toLocaleString()

}

</Typography>

</Box>

<Stack

direction="row"

spacing={1}

alignItems="center"

>

<Button

variant="outlined"

startIcon={

<Visibility/>

}

sx={{

borderColor:GOLD,

color:GOLD

}}

>

Preview

</Button>

<Button

variant="outlined"

startIcon={

<Edit/>

}

sx={{

borderColor:"#555",

color:"#fff"

}}

>

Edit

</Button>

<Button

variant="outlined"

startIcon={

<ContentCopy/>

}

sx={{

borderColor:"#3b82f6",

color:"#3b82f6"

}}

>

Duplicate

</Button>

<Button

variant="outlined"

startIcon={

<Delete/>

}

sx={{

borderColor:"#ef4444",

color:"#ef4444"

}}

>

Delete

</Button>

</Stack>

</Stack>

<Divider

sx={{

mt:2,

borderColor:"#222"

}}

/>

</Paper>

)

)

}

</Paper>

);

}