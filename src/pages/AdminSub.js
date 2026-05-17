import React,{useEffect,useState} from "react";
import {Box,Container,Typography,Card,CardContent,Grid,Stack,Chip,Button,CircularProgress,Avatar,TextField,Tabs,Tab} from "@mui/material";
import {Verified,WorkspacePremium,Diamond,CheckCircle,Cancel,Refresh,Search,PendingActions} from "@mui/icons-material";
import {collection,getDocs,doc,updateDoc,serverTimestamp,query,orderBy} from "firebase/firestore";
import {db} from "../services/firebase";

const GOLD="#F4B400",CARD="#101010",BORDER="#232323",BG="#000";

const badgeMap={
verified:{label:"Verified Seller",color:"#42a5f5",icon:<Verified/>,price:250},
premium:{label:"Premium Seller",color:"#ab47bc",icon:<WorkspacePremium/>,price:500},
golden:{label:"Golden Seller",color:GOLD,icon:<Diamond/>,price:1000}
};

export default function AdminSub(){

const [loading,setLoading]=useState(true);
const [requests,setRequests]=useState([]);
const [tab,setTab]=useState("pending");
const [search,setSearch]=useState("");

const loadRequests=async()=>{

try{

setLoading(true);

const q=query(
collection(db,"badgeRequests"),
orderBy("createdAt","desc")
);

const snap=await getDocs(q);

setRequests(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
);

}catch(err){

console.log(err);

}finally{

setLoading(false);

}

};

useEffect(()=>{
loadRequests();
},[]);

const approveBadge=async(req)=>{

try{

const badge=req.badgeId;

await updateDoc(
doc(db,"users",req.userId),
{

sellerVerified:true,

subscriptionActive:true,

subscriptionPlan:badge,

badgeLevel:badge,

sellerBadge:badge,

badgeStatus:"active",

badgeApprovedAt:serverTimestamp(),

updatedAt:serverTimestamp()

}
);

await updateDoc(
doc(db,"badgeRequests",req.id),
{

status:"approved",

approvedAt:serverTimestamp(),

updatedAt:serverTimestamp()

}
);

setRequests(prev=>
prev.map(r=>
r.id===req.id
?{...r,status:"approved"}
:r
)
);

alert("Badge approved successfully");

}catch(err){

console.log(err);

alert("Approval failed");

}

};

const rejectBadge=async(req)=>{

try{

await updateDoc(
doc(db,"badgeRequests",req.id),
{

status:"rejected",

updatedAt:serverTimestamp()

}
);

setRequests(prev=>
prev.map(r=>
r.id===req.id
?{...r,status:"rejected"}
:r
)
);

}catch(err){

console.log(err);

}

};

const filtered=requests.filter(r=>{

const matchStatus=
tab==="all"
?true
:r.status===tab;

const text=
`${r.name} ${r.email} ${r.phone}`
.toLowerCase();

return matchStatus &&
text.includes(search.toLowerCase());

});

if(loading){
return(
<Box sx={{background:BG,minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>
<CircularProgress sx={{color:GOLD}}/>
</Box>
);
}

return(
<Box sx={{background:BG,minHeight:"100vh",color:"#fff",py:3}}>
<Container maxWidth="xl">

<Stack direction={{xs:"column",md:"row"}} justifyContent="space-between" spacing={2} mb={3}>

<Box>

<Typography sx={{fontSize:{xs:26,md:34},fontWeight:900}}>
Badge Subscription Requests
</Typography>

<Typography sx={{color:"#888",mt:.5}}>
Manage seller badge approvals and marketplace trust.
</Typography>

</Box>

<Stack direction="row" spacing={1}>

<Button
startIcon={<Refresh/>}
onClick={loadRequests}
sx={{background:"#151515",border:`1px solid ${BORDER}`,color:"#fff"}}
>
Refresh
</Button>

</Stack>

</Stack>

<Card sx={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:5,mb:3}}>
<CardContent>

<Stack direction={{xs:"column",md:"row"}} spacing={2} justifyContent="space-between">

<Tabs
value={tab}
onChange={(e,v)=>setTab(v)}
textColor="inherit"
indicatorColor="primary"
sx={{"& .MuiTab-root":{color:"#999"},"& .Mui-selected":{color:GOLD}}}
>

<Tab value="pending" label="Pending"/>
<Tab value="approved" label="Approved"/>
<Tab value="rejected" label="Rejected"/>
<Tab value="all" label="All"/>

</Tabs>

<TextField
placeholder="Search user..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
InputProps={{
startAdornment:<Search sx={{mr:1,color:"#888"}}/>
}}
sx={{
minWidth:{xs:"100%",md:300},
"& .MuiOutlinedInput-root":{
background:"#0b0b0b",
color:"#fff",
borderRadius:3
}
}}
/>

</Stack>

</CardContent>
</Card>

<Grid container spacing={2}>

{filtered.map((req)=>{

const badge=badgeMap[req.badgeId] || badgeMap.verified;

return(

<Grid item xs={12} md={6} lg={4} key={req.id}>

<Card sx={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:5,height:"100%"}}>

<CardContent>

<Stack direction="row" spacing={2} alignItems="center" mb={2}>

<Avatar sx={{background:"rgba(255,255,255,.08)",color:badge.color,fontWeight:900}}>
{req.name?.[0]}
</Avatar>

<Box flex={1}>

<Typography sx={{fontWeight:800}}>
{req.name}
</Typography>

<Typography sx={{fontSize:13,color:"#888"}}>
{req.email}
</Typography>

</Box>

<Chip
label={req.status}
sx={{
textTransform:"capitalize",
background:
req.status==="approved"
?"rgba(76,175,80,.12)"
:req.status==="rejected"
?"rgba(244,67,54,.12)"
:"rgba(255,255,255,.06)",

color:
req.status==="approved"
?"#4caf50"
:req.status==="rejected"
?"#ff5252"
:"#fff"
}}
/>

</Stack>

<Chip
icon={badge.icon}
label={badge.label}
sx={{
background:"rgba(255,255,255,.05)",
color:badge.color,
border:`1px solid ${badge.color}`,
fontWeight:800,
mb:2
}}
/>

<Stack spacing={1.2} mb={2}>

<Typography sx={{fontSize:14,color:"#bbb"}}>
Phone: {req.phone}
</Typography>

<Typography sx={{fontSize:14,color:"#bbb"}}>
Amount: KES {req.badgePrice || badge.price}
</Typography>

<Typography sx={{fontSize:14,color:"#bbb"}}>
Till Number: 3141192
</Typography>

<Typography sx={{fontSize:14,color:"#bbb"}}>
Payment Method: MPESA
</Typography>

</Stack>

{req.status==="pending"&&(

<Stack direction="row" spacing={1}>

<Button
fullWidth
startIcon={<CheckCircle/>}
variant="contained"
onClick={()=>approveBadge(req)}
sx={{background:GOLD,color:"#000",fontWeight:800,borderRadius:3}}
>
Approve
</Button>

<Button
fullWidth
startIcon={<Cancel/>}
variant="outlined"
onClick={()=>rejectBadge(req)}
sx={{borderColor:"#ff5252",color:"#ff5252",borderRadius:3}}
>
Reject
</Button>

</Stack>

)}

</CardContent>

</Card>

</Grid>

);

})}

</Grid>

{filtered.length===0&&(

<Card sx={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:5,textAlign:"center",mt:4}}>
<CardContent>

<PendingActions sx={{fontSize:60,color:"#444"}}/>

<Typography sx={{fontSize:22,fontWeight:800,mt:1}}>
No Requests Found
</Typography>

<Typography sx={{color:"#888",mt:1}}>
No badge requests available in this category.
</Typography>

</CardContent>
</Card>

)}

</Container>
</Box>
);
}