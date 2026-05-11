import React,{useState,useEffect} from "react";

import{
Box,
Typography,
Grid,
Card,
CardContent,
Button,
TextField,
CircularProgress,
Alert
}from "@mui/material";

import {useLocation,useNavigate} from "react-router-dom";

import {db,auth} from "../services/firebase";

import {
collection,
addDoc,
serverTimestamp
} from "firebase/firestore";

import {uploadToCloudinary} from "../utils/cloudinaryUpload";

const GOLD="#F4B400";
const BLACK="#000";
const CARD="#111";
const BORDER="#222";

const TILL="3141192";

const promotionPlans=[

{
id:"daily",
name:"Daily Boost",
price:50,
days:1,
description:"Appear at the top of search results for 24 hours"
},

{
id:"weekly",
name:"Weekly Boost",
price:250,
days:7,
description:"Priority listing in category and search"
},

{
id:"monthly",
name:"Monthly Featured",
price:800,
days:30,
description:"Top ranking on homepage and search"
}

];

export default function Promote(){

const location=useLocation();
const navigate=useNavigate();

const formData=location.state?.formData || {};
const type=formData.type || "products";

const[selectedPlan,setSelectedPlan]=useState(null);
const[mpesaCode,setMpesaCode]=useState("");

const[loading,setLoading]=useState(false);
const[error,setError]=useState("");
const[success,setSuccess]=useState(false);

/* AUTO SELECT PLAN FROM FORM */

useEffect(()=>{

if(formData.promotionPlan){

setSelectedPlan(formData.promotionPlan);

}

},[formData]);


/* CONFIRM PAYMENT + POST LISTING */

const handleConfirm=async()=>{

if(!selectedPlan){

setError("Please select a promotion plan");
return;

}

if(!mpesaCode){

setError("Please enter M-Pesa confirmation code");
return;

}

setError("");
setLoading(true);

try{

const plan=promotionPlans.find(p=>p.id===selectedPlan);

/* UPLOAD IMAGES */

const uploadedImages=[];

for(let img of formData.images){

const url=await uploadToCloudinary(img);
uploadedImages.push(url);

}

/* PROMOTION DATA */

const promotionData={

plan:plan.id,
price:plan.price,
days:plan.days,
mpesaCode:mpesaCode,

promoted:true,
featured:plan.id==="monthly",

startDate:new Date(),
status:"paid"

};

/* CREATE LISTING */

await addDoc(collection(db,type),{

...formData,

images:uploadedImages,

sellerId:auth.currentUser.uid,

promotion:promotionData,

status:"pending",
isActive:true,

views:0,
rating:0,

createdAt:serverTimestamp()

});


setLoading(false);
setSuccess(true);

/* REDIRECT AFTER SUCCESS */

setTimeout(()=>{

navigate("/");

},1500);

}catch(err){

console.error(err);
setError("Upload failed");
setLoading(false);

}

};



return(

<Box sx={{
background:"#0a0a0a",
minHeight:"100vh",
p:{xs:2,md:4}
}}>

<Typography
variant="h5"
sx={{
color:GOLD,
fontWeight:"bold",
mb:2
}}
>

Promote Your Listing

</Typography>

<Typography sx={{color:"#aaa",mb:4}}>

Featured listings appear first in search results and get more buyers.

</Typography>


{/* PROMOTION PLANS */}

<Grid container spacing={3}>

{promotionPlans.map(plan=>(

<Grid item xs={12} md={4} key={plan.id}>

<Card
onClick={()=>setSelectedPlan(plan.id)}
sx={{
background:CARD,
border:selectedPlan===plan.id?
`2px solid ${GOLD}`:`1px solid ${BORDER}`,
cursor:"pointer"
}}
>

<CardContent>

<Typography
variant="h6"
sx={{color:GOLD,fontWeight:"bold"}}
>

{plan.name}

</Typography>

<Typography sx={{
color:"#fff",
fontSize:28,
mt:1
}}>

KES {plan.price}

</Typography>

<Typography sx={{color:"#aaa",mt:1}}>

{plan.description}

</Typography>

<Typography sx={{color:"#888",mt:2}}>

Duration: {plan.days} days

</Typography>

</CardContent>

</Card>

</Grid>

))}

</Grid>



{/* PAYMENT */}

<Box sx={{
background:"#111",
p:3,
mt:5,
border:`1px solid ${BORDER}`,
borderRadius:2
}}>

<Typography sx={{
color:GOLD,
fontWeight:"bold",
mb:2
}}>

Pay with M-Pesa

</Typography>


<Typography sx={{color:"#aaa"}}>
1️⃣ Go to M-Pesa
</Typography>

<Typography sx={{color:"#aaa"}}>
2️⃣ Select Lipa na M-Pesa
</Typography>

<Typography sx={{color:"#aaa"}}>
3️⃣ Select Buy Goods & Services
</Typography>

<Typography sx={{color:"#aaa"}}>
4️⃣ Enter Till Number
</Typography>

<Typography sx={{
color:"#fff",
fontSize:26,
fontWeight:"bold",
mt:1
}}>
{TILL}
</Typography>

<Typography sx={{color:"#aaa",mt:2}}>
After paying, paste the confirmation code below.
</Typography>



<TextField
fullWidth
placeholder="Example: QGH7H2K9L"
value={mpesaCode}
onChange={(e)=>setMpesaCode(e.target.value)}
sx={{
mt:2,
input:{color:"#fff"},
"& .MuiOutlinedInput-root":{
"& fieldset":{borderColor:"#333"},
"&:hover fieldset":{borderColor:GOLD},
"&.Mui-focused fieldset":{borderColor:GOLD}
}
}}
/>



{error&&(

<Alert severity="error" sx={{mt:2}}>
{error}
</Alert>

)}

{success&&(

<Alert severity="success" sx={{mt:2}}>
Payment received. Listing submitted for review.
</Alert>

)}



<Button
fullWidth
onClick={handleConfirm}
disabled={loading}
sx={{
mt:3,
background:GOLD,
color:BLACK,
fontWeight:"bold",
height:50,
"&:hover":{background:"#FFD54F"}
}}
>

{loading?

<CircularProgress size={24}/>

:

"Confirm Payment & Publish Listing"

}

</Button>

</Box>

</Box>

);

}