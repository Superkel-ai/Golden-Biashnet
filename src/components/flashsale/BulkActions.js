import React,{useMemo,useState} from "react";

import{

Box,
Paper,
Typography,
Stack,
Button,
Alert,
Fab,
Slide,
Divider,

FormControl,
InputLabel,
Select,
MenuItem,

TextField,

ToggleButton,
ToggleButtonGroup,

IconButton

} from "@mui/material";

import FlashOnIcon from "@mui/icons-material/FlashOn";
import CloseIcon from "@mui/icons-material/Close";

import{

writeBatch,
doc,
serverTimestamp

} from "firebase/firestore";

import {db} from "../../services/firebase";

const GOLD="#F4B400";

export default function BulkActions({

selected=[],
products=[],
reload

}){

const [open,setOpen]=useState(false);

const [loading,setLoading]=useState(false);

const [mode,setMode]=useState("percent");

const [discount,setDiscount]=useState(20);

const [fixedPrice,setFixedPrice]=useState("");

const [amountOff,setAmountOff]=useState("");

const [duration,setDuration]=useState(24);



const preview=useMemo(()=>{

if(selected.length===0){

return null;

}

const p=

products.find(

x=>selected.includes(x.id)

);

if(!p) return null;

const price=

Number(p.price);

let flashPrice=price;

if(mode==="percent"){

flashPrice=Math.round(

price*

(1-discount/100)

);

}

if(mode==="fixed"){

flashPrice=

Number(fixedPrice)||0;

}

if(mode==="amount"){

flashPrice=

price-

(Number(amountOff)||0);

}

return{

price,

flashPrice

};

},

[

selected,
products,

discount,

fixedPrice,

amountOff,

mode

]);



const applyFlashSale=async()=>{

if(selected.length===0){

return;

}

try{

setLoading(true);

const batch=

writeBatch(db);

const now=Date.now();

const end=

now+

duration*

60*

60*

1000;

selected.forEach(id=>{

const p=

products.find(

x=>x.id===id

);

if(!p) return;

const price=

Number(p.price);

let salePrice=price;

let percent=0;

if(mode==="percent"){

percent=

discount;

salePrice=

Math.round(

price*

(1-percent/100)

);

}

else if(mode==="fixed"){

salePrice=

Number(fixedPrice);

percent=

Math.round(

(

price-

salePrice

)

/

price

*100

);

}

else{

salePrice=

price-

Number(amountOff);

percent=

Math.round(

(

price-

salePrice

)

/

price

*100

);

}

batch.update(

doc(

db,

"products",

id

),

{

flashSale:true,

flashSaleType:

mode,

discount:

percent,

flashSalePrice:

salePrice,

amountOff:

mode==="amount"

?

Number(amountOff)

:

null,

fixedPrice:

mode==="fixed"

?

salePrice

:

null,

durationHours:

duration,

flashSaleStart:

new Date(now),

flashSaleEnd:

new Date(end),

updatedAt:

serverTimestamp()

}

);

});

await batch.commit();

reload();

setOpen(false);

}
catch(err){

console.log(err);

}
finally{

setLoading(false);

}

};



const removeFlashSale=async()=>{

const batch=

writeBatch(db);

selected.forEach(id=>{

batch.update(

doc(

db,

"products",

id

),

{

flashSale:false,

discount:0,

flashSalePrice:null,

amountOff:null,

fixedPrice:null,

flashSaleStart:null,

flashSaleEnd:null,

updatedAt:

serverTimestamp()

}

);

});

await batch.commit();

reload();

setOpen(false);

};



return(

<>

<Fab

onClick={()=>setOpen(true)}

sx={{

position:"fixed",

bottom:{

xs:90,

sm:95,

md:30

},

right:20,

width:62,

height:62,

background:GOLD,

color:"#000",

zIndex:9999,

boxShadow:

"0 10px 25px rgba(244,180,0,.35)",

"&:hover":{

background:"#dca300"

}

}}

>

<FlashOnIcon/>

</Fab>



<Slide

direction="up"

in={open}

mountOnEnter

unmountOnExit

>

<Paper

sx={{

position:"fixed",

bottom:{

xs:100,

md:30

},

right:20,

width:360,

maxWidth:"94vw",

background:"#111",

borderRadius:5,

padding:3,

zIndex:10000,

border:

"1px solid rgba(244,180,0,.2)",

boxShadow:

"0 20px 60px rgba(0,0,0,.55)"

}}

>

<Stack

direction="row"

justifyContent="space-between"

mb={2}

>

<Typography

fontWeight={900}

color={GOLD}

>

Flash Engine

</Typography>

<IconButton

onClick={()=>setOpen(false)}

sx={{

color:"#999"

}}

>

<CloseIcon/>

</IconButton>

</Stack>



<Alert

severity="info"

sx={{

mb:2

}}

>

Selected

<b>

{selected.length}

</b>

Products

</Alert>



<ToggleButtonGroup

value={mode}

exclusive

fullWidth

onChange={(e,val)=>{

if(val){

setMode(val);

}

}}

>

<ToggleButton value="percent">

%

</ToggleButton>

<ToggleButton value="fixed">

Price

</ToggleButton>

<ToggleButton value="amount">

KES Off

</ToggleButton>

</ToggleButtonGroup>



<Box mt={2}>



{

mode==="percent"

&&

(

<FormControl fullWidth>

<InputLabel>

Discount

</InputLabel>

<Select

value={discount}

onChange={(e)=>{

setDiscount(

e.target.value

);

}}

>

<MenuItem value={10}>10%</MenuItem>

<MenuItem value={20}>20%</MenuItem>

<MenuItem value={30}>30%</MenuItem>

<MenuItem value={40}>40%</MenuItem>

<MenuItem value={50}>50%</MenuItem>

<MenuItem value={60}>60%</MenuItem>

</Select>

</FormControl>

)

}



{

mode==="fixed"

&&

(

<TextField

fullWidth

label="Price"

type="number"

value={fixedPrice}

onChange={(e)=>{

setFixedPrice(

e.target.value

);

}}

/>

)

}



{

mode==="amount"

&&

(

<TextField

fullWidth

label="KES Off"

type="number"

value={amountOff}

onChange={(e)=>{

setAmountOff(

e.target.value

);

}}

/>

)

}

</Box>



<FormControl

fullWidth

sx={{

mt:2

}}

>

<InputLabel>

Duration

</InputLabel>

<Select

value={duration}

onChange={(e)=>{

setDuration(

e.target.value

);

}}

>

<MenuItem value={24}>

24 Hours

</MenuItem>

<MenuItem value={48}>

48 Hours

</MenuItem>

<MenuItem value={72}>

72 Hours

</MenuItem>

<MenuItem value={168}>

7 Days

</MenuItem>

</Select>

</FormControl>



{

preview && (

<Paper

sx={{

mt:2,

p:2,

background:"#090909"

}}

>

<Typography>

Current

KES

{

preview.price

.toLocaleString()

}

</Typography>

<Typography

color={GOLD}

>

Sale

KES

{

preview.flashPrice

.toLocaleString()

}

</Typography>

</Paper>

)

}



<Divider sx={{my:2}}/>



<Stack spacing={1}>

<Button

variant="contained"

onClick={applyFlashSale}

disabled={loading}

sx={{

background:GOLD,

color:"#000",

fontWeight:800

}}

>

Apply Flash Sale

</Button>



<Button

variant="outlined"

color="error"

onClick={removeFlashSale}

>

Remove Flash Sale

</Button>

</Stack>

</Paper>

</Slide>

</>

);

}