// components/flashsale/Analytics.js

import React,
{
useEffect,
useState
}
from "react";

import {

Paper,
Typography,
Grid,
Box,
CircularProgress

}
from "@mui/material";

import {

BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,

PieChart,
Pie,
Cell,

LineChart,
Line,
CartesianGrid

}
from "recharts";

import {

collection,
getDocs

}
from "firebase/firestore";

import { db }
from "../../services/firebase";

const GOLD="#F4B400";

const COLORS=[

"#F4B400",
"#FF9800",
"#FFD54F",
"#FFC107"

];

export default function Analytics(){

const [loading,setLoading]=useState(true);

const [revenueData,setRevenueData]=useState([]);

const [categoryData,setCategoryData]=useState([]);

const [sellerData,setSellerData]=useState([]);

useEffect(()=>{

loadAnalytics();

},[]);

const loadAnalytics=async()=>{

try{

const snap=
await getDocs(

collection(
db,
"orders"
)

);

const orders=[];

snap.forEach(doc=>{

orders.push(doc.data());

});

processOrders(
orders
);

}

catch(err){

console.log(err);

}

finally{

setLoading(false);

}

};

const processOrders=(orders)=>{

const revenueMap={};

const categoryMap={};

const sellerMap={};

orders.forEach(order=>{

const category=
order.category ||
"Unknown";

const seller=
order.sellerName ||
"Seller";

const amount=
Number(order.amount)||0;

categoryMap[category]=

(categoryMap[category]||0)

+ amount;

sellerMap[seller]=

(sellerMap[seller]||0)

+ amount;

const month=

new Date(

order.createdAt?.seconds

*1000

)

.toLocaleString(

"default",

{

month:"short"

}

);

revenueMap[month]=

(revenueMap[month]||0)

+ amount;

});

setRevenueData(

Object.keys(revenueMap)

.map(key=>({

month:key,

revenue:

revenueMap[key]

}))

);

setCategoryData(

Object.keys(categoryMap)

.map(key=>({

name:key,

value:

categoryMap[key]

}))

);

setSellerData(

Object.keys(sellerMap)

.map(key=>({

name:key,

sales:

sellerMap[key]

}))

);

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

<Grid

container

spacing={3}

>

{/* Revenue */}

<Grid

item

xs={12}

md={8}

>

<Paper

sx={{

p:3,

background:"#111",

color:"#fff"

}}

>

<Typography

fontWeight={700}

mb={2}

>

Revenue Trend

</Typography>

<ResponsiveContainer

width="100%"

height={300}

>

<LineChart

data={revenueData}

>

<CartesianGrid

stroke="#333"

/>

<XAxis

dataKey="month"

/>

<YAxis/>

<Tooltip/>

<Line

type="monotone"

dataKey="revenue"

stroke="#F4B400"

strokeWidth={3}

/>

</LineChart>

</ResponsiveContainer>

</Paper>

</Grid>

{/* Categories */}

<Grid

item

xs={12}

md={4}

>

<Paper

sx={{

p:3,

background:"#111",

color:"#fff"

}}

>

<Typography

fontWeight={700}

mb={2}

>

Top Categories

</Typography>

<ResponsiveContainer

width="100%"

height={300}

>

<PieChart>

<Pie

data={categoryData}

dataKey="value"

label

>

{

categoryData.map(

(entry,index)=>(

<Cell

key={index}

fill={

COLORS[

index%

COLORS.length

]

}

/>

)

)

}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</Paper>

</Grid>

{/* Sellers */}

<Grid

item

xs={12}

>

<Paper

sx={{

p:3,

background:"#111"

}}

>

<Typography

fontWeight={700}

mb={2}

color="#fff"

>

Top Sellers

</Typography>

<ResponsiveContainer

width="100%"

height={300}

>

<BarChart

data={sellerData}

>

<XAxis

dataKey="name"

/>

<YAxis/>

<Tooltip/>

<Bar

dataKey="sales"

fill="#F4B400"

/>

</BarChart>

</ResponsiveContainer>

</Paper>

</Grid>

</Grid>

);

}