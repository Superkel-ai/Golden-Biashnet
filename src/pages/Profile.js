import React,{useEffect,useMemo,useState} from "react";
import {Box,Container,Typography,Avatar,Button,Grid,Card,CardContent,TextField,CircularProgress,Stack,Chip,Paper,LinearProgress,IconButton} from "@mui/material";
import {Edit,Save,Verified,WorkspacePremium,Diamond,Shield,Star,ShoppingBag,Inventory2,Bolt,LocationOn,Email,CameraAlt} from "@mui/icons-material";
import {doc,getDoc,addDoc,collection,updateDoc,serverTimestamp} from "firebase/firestore";
import {db,auth} from "../services/firebase";
import {useNavigate} from "react-router-dom";
import {calculateSellerTrust} from "../utils/sellerTrust";

const GOLD="#F4B400",BG="#050505",CARD="#101010",BORDER="#232323",SUB="#9e9e9e";

const BADGES=[
{id:"verified",title:"Verified Badge",price:250,color:"#42a5f5",icon:<Verified/>,desc:"Basic seller verification"},
{id:"premium",title:"Premium Badge",price:500,color:"#ab47bc",icon:<WorkspacePremium/>,desc:"Premium marketplace visibility"},
{id:"golden",title:"Golden Badge",price:1000,color:GOLD,icon:<Diamond/>,desc:"Elite trusted seller badge"}
];

const card={background:CARD,border:`1px solid ${BORDER}`,borderRadius:5};
const fieldStyle={InputProps:{sx:{color:"#fff"}},InputLabelProps:{sx:{color:"#888"}},sx:{"& .MuiOutlinedInput-root":{background:"#0b0b0b",borderRadius:3}}};

export default function Profile(){

const navigate=useNavigate();
const uid=auth.currentUser?.uid;

const [loading,setLoading]=useState(true);
const [editing,setEditing]=useState(false);
const [saving,setSaving]=useState(false);
const [user,setUser]=useState(null);

const [form,setForm]=useState({name:"",phone:"",location:"",bio:""});

const loadUser=async()=>{
try{
const snap=await getDoc(doc(db,"users",uid));
if(snap.exists()){
const d=snap.data();
setUser(d);
setForm({
name:d.name||"",
phone:d.phone||"",
location:d.location||"",
bio:d.bio||""
});
}
}catch(err){console.log(err);}
setLoading(false);
};

useEffect(()=>{
if(!uid)return navigate("/login");
loadUser();
},[]);

const trust=useMemo(()=>user?calculateSellerTrust(user):null,[user]);

const saveProfile=async()=>{
try{
setSaving(true);
await updateDoc(doc(db,"users",uid),{...form,updatedAt:serverTimestamp()});
setEditing(false);
loadUser();
}catch(err){console.log(err);}
setSaving(false);
};

const buyBadge=async(b)=>{
try{

await addDoc(collection(db,"badgeRequests"),{

userId:uid,

name:user?.name||"",

email:user?.email||"",

phone:user?.phone||"",

badgeId:b.id,

badgeTitle:b.title,

badgePrice:b.price,

badgeColor:b.color,

status:"pending",

paymentMethod:"mpesa",

tillNumber:"3141192",

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

});

const text=`Hello Admin, I have requested the ${b.title} on Golden Biashnet.%0A%0AAmount: KES ${b.price}%0A%0ATill Number: 3141192%0A%0APlease confirm my payment and activate my badge.`;

window.open(`https://wa.me/254758922614?text=${text}`,"_blank");

alert("Badge request submitted successfully.");

}catch(err){

console.log(err);

alert("Failed to submit badge request");

}
};

if(loading||!trust){
return(
<Box sx={{background:BG,minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>
<CircularProgress sx={{color:GOLD}}/>
</Box>
);
}

const {trustScore,sellerRating,badge,status}=trust;

const stats=[
{title:"Listings",value:user?.listingsCount||0,icon:<Inventory2/>},
{title:"Orders",value:user?.ordersCount||0,icon:<ShoppingBag/>},
{title:"Completed",value:user?.completedOrders||0,icon:<Bolt/>},
{title:"Ratings",value:user?.totalRatings||0,icon:<Star/>}
];

const actions=[
{title:"My Uploads",route:"/my-uploads"},
{title:"Customer Orders",route:"/seller-orders"},
{title:"My Purchases",route:"/my-orders"},
{title:"Marketplace Loans",route:"/lend"}
];

return(
<Box sx={{background:BG,minHeight:"100vh",color:"#fff",pb:10}}>
<Container maxWidth="lg" sx={{pt:2}}>

<Paper sx={{...card,overflow:"hidden",position:"relative",mb:3,background:"linear-gradient(180deg,#151515,#0b0b0b)"}}>
<Box sx={{position:"absolute",top:-100,right:-100,width:220,height:220,borderRadius:"50%",background:"rgba(244,180,0,.08)",filter:"blur(50px)"}}/>

<Box sx={{p:3}}>
<Grid container spacing={3} alignItems="center">

<Grid item xs={12} md={8}>
<Stack direction="row" spacing={2} alignItems="center">

<Box sx={{position:"relative"}}>
<Avatar src={user?.photoURL} sx={{width:90,height:90,fontSize:32,fontWeight:900,border:`2px solid ${badge.border}`,background:badge.bg,color:badge.color}}>
{user?.name?.[0]}
</Avatar>

<IconButton sx={{position:"absolute",bottom:-5,right:-5,background:GOLD,color:"#000","&:hover":{background:GOLD}}}>
<CameraAlt sx={{fontSize:18}}/>
</IconButton>
</Box>

<Box flex={1}>
<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
<Typography sx={{fontSize:{xs:22,md:28},fontWeight:900}}>{user?.name}</Typography>

<Chip
icon={<Verified/>}
label={badge.label}
sx={{background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,fontWeight:800}}
/>
</Stack>

<Typography sx={{color:SUB,mt:.5}}>{status}</Typography>

<Stack direction="row" spacing={2} flexWrap="wrap" mt={1}>
<Stack direction="row" spacing={.5} alignItems="center">
<Email sx={{color:GOLD,fontSize:18}}/>
<Typography sx={{color:SUB,fontSize:14}}>{user?.email}</Typography>
</Stack>

<Stack direction="row" spacing={.5} alignItems="center">
<LocationOn sx={{color:GOLD,fontSize:18}}/>
<Typography sx={{color:SUB,fontSize:14}}>{user?.location||"Location not set"}</Typography>
</Stack>
</Stack>
</Box>

</Stack>
</Grid>

<Grid item xs={12} md={4}>
<Stack spacing={1.5}>

<Button
startIcon={editing?<Save/>:<Edit/>}
variant={editing?"contained":"outlined"}
onClick={editing?saveProfile:()=>setEditing(true)}
disabled={saving}
sx={editing?{background:GOLD,color:"#000",fontWeight:800,py:1.2,borderRadius:3}:{borderColor:GOLD,color:GOLD,py:1.2,borderRadius:3}}
>
{editing?"Save Profile":"Edit Profile"}
</Button>

<Button variant="contained" onClick={()=>navigate("/my-uploads")} sx={{background:"#1c1c1c",color:"#fff",py:1.2,borderRadius:3}}>
My Uploads
</Button>

</Stack>
</Grid>

</Grid>
</Box>
</Paper>

<Card sx={{...card,mb:3}}>
<CardContent>

<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
<Typography sx={{fontWeight:800,fontSize:18}}>Seller Trust Score</Typography>
<Shield sx={{color:GOLD}}/>
</Stack>

<Typography sx={{fontSize:42,fontWeight:900,color:GOLD}}>{trustScore}%</Typography>

<LinearProgress variant="determinate" value={trustScore} sx={{mt:1.5,height:10,borderRadius:10,background:"#1e1e1e","& .MuiLinearProgress-bar":{background:GOLD}}}/>

<Stack direction="row" spacing={1} alignItems="center" mt={2}>
<Star sx={{color:GOLD}}/>
<Typography sx={{fontWeight:700}}>{sellerRating.toFixed(1)} Seller Rating</Typography>
</Stack>

</CardContent>
</Card>

<Grid container spacing={2} mb={3}>
{stats.map((s,i)=>(
<Grid item xs={6} md={3} key={i}>
<Card sx={{...card,borderRadius:4}}>
<CardContent>
<Stack direction="row" justifyContent="space-between" alignItems="center">
<Box>
<Typography sx={{color:SUB,fontSize:13}}>{s.title}</Typography>
<Typography sx={{fontWeight:900,fontSize:28}}>{s.value}</Typography>
</Box>
<Box sx={{color:GOLD}}>{s.icon}</Box>
</Stack>
</CardContent>
</Card>
</Grid>
))}
</Grid>

{editing&&(
<Card sx={{...card,mb:3}}>
<CardContent>

<Typography sx={{fontWeight:800,fontSize:18,mb:2}}>Edit Profile</Typography>

<Grid container spacing={2}>

{["name","phone","location"].map((k,i)=>(
<Grid item xs={12} md={6} key={i}>
<TextField fullWidth label={k.charAt(0).toUpperCase()+k.slice(1)} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} {...fieldStyle}/>
</Grid>
))}

<Grid item xs={12}>
<TextField fullWidth multiline rows={4} label="Bio" value={form.bio} onChange={(e)=>setForm({...form,bio:e.target.value})} {...fieldStyle}/>
</Grid>

</Grid>

</CardContent>
</Card>
)}

<Card sx={{...card,mb:3}}>
<CardContent>

<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
<Typography sx={{fontWeight:800,fontSize:18}}>Seller Badge Store</Typography>
<WorkspacePremium sx={{color:GOLD}}/>
</Stack>

<Typography sx={{color:SUB,mb:3,fontSize:14}}>
Pay via Till Number 3141192 then contact admin for activation.
</Typography>

<Grid container spacing={2}>
{BADGES.map((b,i)=>(
<Grid item xs={12} md={4} key={i}>
<Paper sx={{background:"#0b0b0b",border:`1px solid ${BORDER}`,borderRadius:4,p:2.5,height:"100%"}}>

<Box sx={{color:b.color,mb:2}}>{b.icon}</Box>

<Typography sx={{fontWeight:800,fontSize:18}}>
{b.title}
</Typography>

<Typography sx={{color:SUB,mt:1,minHeight:48}}>
{b.desc}
</Typography>

<Typography sx={{mt:2,fontSize:28,fontWeight:900,color:b.color}}>
KES {b.price}
</Typography>

<Button fullWidth variant="contained" onClick={()=>buyBadge(b)} sx={{mt:2,background:b.color,color:"#000",fontWeight:800,borderRadius:3,py:1.2}}>
Buy Badge
</Button>

</Paper>
</Grid>
))}
</Grid>

</CardContent>
</Card>

<Card sx={card}>
<CardContent>

<Typography sx={{fontWeight:800,fontSize:18,mb:2}}>
Dashboard
</Typography>

<Grid container spacing={2}>
{actions.map((a,i)=>(
<Grid item xs={6} md={3} key={i}>
<Button fullWidth onClick={()=>navigate(a.route)} sx={{background:"#151515",border:`1px solid ${BORDER}`,color:"#fff",borderRadius:3,py:1.4,fontWeight:700,textTransform:"none"}}>
{a.title}
</Button>
</Grid>
))}
</Grid>

</CardContent>
</Card>

</Container>
</Box>
);
}