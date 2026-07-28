import React,{useEffect,useState,useMemo} from "react";

import {
Box,Typography,Paper,Avatar,Chip,TextField,InputAdornment,
Button,Grid,Stack,CircularProgress,Table,TableBody,
TableCell,TableHead,TableRow,Pagination
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

import {
collection,query,orderBy,getDocs,doc,
updateDoc,setDoc,serverTimestamp
} from "firebase/firestore";

import {db} from "../services/firebase";

const GOLD="#F4B400";

export default function AdminVerify(){

const [loading,setLoading]=useState(true);
const [verified,setVerified]=useState([]);
const [requests,setRequests]=useState([]);
const [search,setSearch]=useState("");
const [page,setPage]=useState(1);

const rowsPerPage=10;

useEffect(()=>{

initialize();

},[]);
const initialize = async () => {
  setLoading(true);

  await loadRequests();
  await loadVerified();

  setLoading(false);
};

const loadRequests = async () => {
  try {

    const q = query(
      collection(db, "verificationRequests"),
      orderBy("submittedAt", "desc")
    );

    const snap = await getDocs(q);

    setRequests(
      snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );

  } catch (e) {
    console.log(e);
  }
};

const approve = async (user) => {

  try {

    await updateDoc(
      doc(db, "verificationRequests", user.userId),
      {
        status: "approved",
        verified: true,
        approvedAt: serverTimestamp(),
        verifiedBy: "admin"
      }
    );

    await updateDoc(
      doc(db, "users", user.userId),
      {
        verified: true,
        verifiedSeller: true,
        sellerBadge: user.plan,
        verificationPlan: user.plan,
        verifiedAt: serverTimestamp()
      }
    );

    await setDoc(
      doc(db, "verifiedUsers", user.userId),
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        plan: user.plan,
        verified: true,
        status: "approved",
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        verifiedBy: "admin"
      },
      { merge: true }
    );

    initialize();

  } catch (e) {
    console.log(e);
  }

};
const loadVerified=async()=>{

try{

const q=query(

collection(
db,
"verifiedUsers"
),

orderBy(
"createdAt",
"desc"
)

);

const snap=await getDocs(q);

const data=snap.docs.map(doc=>({

id:doc.id,

...doc.data()

}));

setVerified(data);

}

catch(e){

console.log(e);

}

};

const revoke=async(user)=>{

try{

    await updateDoc(
      doc(db, "verificationRequests", user.userId),
      {
        status: "revoked",
        verified: false
      }
    );

await updateDoc(

doc(
db,
"users",
user.userId
),

{

verified:false,

verifiedSeller:false,

sellerBadge:null,

verificationPlan:null

}

);

await updateDoc(

doc(
db,
"verifiedUsers",
user.userId
),

{

verified:false,

status:"revoked"

}

);

initialize();

}

catch(e){

console.log(e);

}

};

const filtered = useMemo(() => {
  return requests.filter(
    u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );
}, [requests, search]);

const totalRequests = requests.length;

const totalVerified = requests.filter(
  u => u.status === "approved"
).length;

const pending = requests.filter(
  u => u.status === "pending"
).length;

const golden=verified.filter(

u=>u.plan==="golden"

).length;

const premium=verified.filter(

u=>u.plan==="premium"

).length;

const pages=Math.ceil(

filtered.length/

rowsPerPage

);

const current=filtered.slice(

(page-1)

*

rowsPerPage,

page*

rowsPerPage

);

if(loading){

return(

<Box

sx={{

minHeight:"100vh",

background:"#000",

display:"flex",

justifyContent:"center",

alignItems:"center"

}}

>

<CircularProgress/>

</Box>

);

}

return(

<Box

sx={{

background:"#000",

minHeight:"100vh",

p:2

}}

>

<Typography

variant="h5"

sx={{

color:GOLD,

fontWeight:800,

mb:3

}}

>

Verification Dashboard

</Typography>

<Grid container spacing={2} mb={3}>

<Grid item xs={6} md={3}>

<Paper sx={{p:2,bgcolor:"#111"}}>

<Typography color="#777">

Requests

</Typography>

<Typography

fontSize={28}

fontWeight={700}

color="#fff"

>

{totalRequests}

</Typography>

</Paper>

</Grid>

<Grid item xs={6} md={3}>

<Paper sx={{p:2,bgcolor:"#111"}}>

<Typography color="#777">

Verified

</Typography>

<Typography

fontSize={28}

fontWeight={700}

color="#fff"

>

{totalVerified}

</Typography>

</Paper>

</Grid>

<Grid item xs={6} md={3}>

<Paper sx={{p:2,bgcolor:"#111"}}>

<Typography color="#777">

Golden

</Typography>

<Typography

fontSize={28}

fontWeight={700}

color={GOLD}

>

{golden}

</Typography>

</Paper>

</Grid>

<Grid item xs={6} md={3}>

<Paper sx={{p:2,bgcolor:"#111"}}>

<Typography color="#777">

Premium

</Typography>

<Typography

fontSize={28}

fontWeight={700}

color="#4CAF50"

>

{premium}

</Typography>

</Paper>

</Grid>

</Grid>

<TextField

fullWidth

placeholder="Search sellers"

value={search}

onChange={e=>

setSearch(

e.target.value

)

}

InputProps={{

startAdornment:

<InputAdornment position="start">

<SearchIcon/>

</InputAdornment>

}}

sx={{

mb:3

}}

>

</TextField>

<Paper

sx={{

bgcolor:"#111",

overflow:"hidden"

}}

>

<Table>

<TableHead>

<TableRow>

<TableCell>

Seller

</TableCell>

<TableCell>

Plan

</TableCell>

<TableCell>

Phone

</TableCell>

<TableCell>

Status

</TableCell>

<TableCell>

Actions

</TableCell>

</TableRow>

</TableHead>

<TableBody>

{

current.map(user=>(

<TableRow key={user.id}>

<TableCell>

<Stack

direction="row"

spacing={1}

alignItems="center"

>

<Avatar

src={user.photoURL}

>

{user.name?.charAt(0)}

</Avatar>

<Box>

<Typography color="#fff">

{user.name}

</Typography>

<Typography

fontSize={12}

color="#777"

>

{user.email}

</Typography>

</Box>

</Stack>

</TableCell>

<TableCell>

<Chip

label={user.plan}

sx={{

bgcolor:

user.plan==="golden"

? GOLD

:"#4CAF50"

}}

>

</Chip>

</TableCell>

<TableCell>

{user.phone}

</TableCell>
<TableCell>
  <Chip
    label={user.status || "approved"}
    color={
      user.status === "pending"
        ? "warning"
        : user.status === "revoked"
        ? "error"
        : "success"
    }
    sx={{
      fontWeight: 700,
      textTransform: "capitalize",
      minWidth: 90,
    }}
  />
</TableCell>

<TableCell>
  <Stack
    direction="row"
    spacing={1}
    justifyContent="center"
    alignItems="center"
  >
    {user.status === "pending" ? (
      <Button
        variant="contained"
        color="success"
        size="small"
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 2,
          fontWeight: 700,
        }}
        onClick={() => approve(user)}
      >
        Approve
      </Button>
    ) : (
      <Button
        variant="outlined"
        color="warning"
        size="small"
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 2,
          fontWeight: 700,
        }}
        onClick={() => revoke(user)}
      >
        Revoke
      </Button>
    )}

  </Stack>
</TableCell>

</TableRow>

))

}

</TableBody>

</Table>

</Paper>

<Box

display="flex"

justifyContent="center"

mt={3}

>

<Pagination

page={page}

count={pages}

onChange={(e,v)=>

setPage(v)

}

/>

</Box>

</Box>

);

}