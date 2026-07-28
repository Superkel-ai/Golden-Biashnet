import React, {
  useEffect,
  useState
} from "react";

import {

Paper,
Grid,
Typography,
Box,
LinearProgress,
CircularProgress

}

from "@mui/material";

import {

Inventory2,
Bolt,
Payments,
Sell,
TrendingUp

}

from "@mui/icons-material";

import {

collection,
onSnapshot

}

from "firebase/firestore";

import { db } from "../../services/firebase";

const GOLD="#F4B400";

export default function Dashboard(){

const [loading,setLoading]=
useState(true);

const [stats,setStats]=
useState({

products:0,

activeSales:0,

sold:0,

revenue:0,

discount:0,

averageDiscount:0,

endingSoon:0

});

useEffect(()=>{

const unsub=

onSnapshot(

collection(
db,
"products"
),

(snapshot)=>{

let total=0;

let active=0;

let sold=0;

let revenue=0;

let discount=0;

let endingSoon=0;

let percentTotal=0;

snapshot.docs.forEach(doc=>{

const p=
doc.data();

total++;

if(p.flashSale){

active++;

percentTotal+=
Number(

p.flashSalePercent||0

);

const now=
Date.now();

const end=

p.flashSaleEnd
?.toMillis?.()

||

new Date(

p.flashSaleEnd

).getTime();

const diff=

end-now;

if(

diff<
86400000

&&

diff>0

){

endingSoon++;

}

const save=

(

p.price||0

)

-

(

p.flashSalePrice||0

);

discount+=save;

}

sold+=
p.totalSold||0;

revenue+=
p.revenue||0;

});

const avg=

active

?

Math.round(

percentTotal/

active

)

:0;

setStats({

products:total,

activeSales:active,

sold,

revenue,

discount,

averageDiscount:avg,

endingSoon

});

setLoading(false);

}

);

return()=>unsub();

},[]);

if(loading){

return(

<Box
display="flex"
justifyContent="center"
py={4}
>

<CircularProgress
sx={{
color:GOLD
}}
/>

</Box>

);

}

const cards=[

{

title:"Products",

value:

stats.products,

icon:

<Inventory2

sx={{

color:GOLD,

fontSize:35

}}

/>

},

{

title:

"Flash Sales",

value:

stats.activeSales,

icon:

<Bolt

sx={{

color:GOLD,

fontSize:35

}}

/>

},

{

title:

"Revenue",

value:

`KES ${

stats.revenue

.toLocaleString()

}`,

icon:

<Payments

sx={{

color:GOLD,

fontSize:35

}}

/>

},

{

title:

"Sold",

value:

stats.sold,

icon:

<Sell

sx={{

color:GOLD,

fontSize:35

}}

/>

},

{

title:

"Saved",

value:

`KES ${

stats.discount

.toLocaleString()

}`,

icon:

<TrendingUp

sx={{

color:GOLD,

fontSize:35

}}

/>

}

];

const coverage=

stats.products

?

Math.round(

(

stats.activeSales/

stats.products

)

*100

)

:0;

return(

<Box>

<Grid
container
spacing={2}
>

{

cards.map(card=>(

<Grid

item

xs={12}

sm={6}

md={2.4}

key={card.title}

>

<Paper

sx={{

background:"#111",

border:

"1px solid #222",

p:3,

borderRadius:4

}}

>

<Box

display="flex"

justifyContent=

"space-between"

>

<Box>

<Typography

sx={{

color:"#888",

fontSize:13

}}

>

{card.title}

</Typography>

<Typography

sx={{

fontWeight:800,

fontSize:26,

color:"#fff"

}}

>

{card.value}

</Typography>

</Box>

{card.icon}

</Box>

</Paper>

</Grid>

))

}

</Grid>

<Paper

sx={{

mt:3,

background:"#111",

p:3,

borderRadius:4

}}

>

<Typography

sx={{

fontWeight:700,

mb:2,

color:"#fff"

}}

>

Flash Sale Coverage

</Typography>

<LinearProgress

variant=

"determinate"

value={coverage}

sx={{

height:12,

borderRadius:10,

background:

"#222",

"& .MuiLinearProgress-bar":{

background:GOLD

}

}}/>

<Box

display="flex"

justifyContent=

"space-between"

mt={1}

>

<Typography

sx={{

color:"#999"

}}

>

{stats.activeSales}

active products

</Typography>

<Typography

sx={{

color:GOLD,

fontWeight:700

}}

>

{coverage}%

</Typography>

</Box>

</Paper>

<Paper

sx={{

mt:3,

p:3,

background:"#111",

borderRadius:4

}}

>

<Grid
container
spacing={3}
>

<Grid
item
xs={4}
>

<Typography
color="#999"
>

Average Discount

</Typography>

<Typography

sx={{

color:GOLD,

fontSize:30,

fontWeight:800

}}

>

{stats.averageDiscount}%

</Typography>

</Grid>

<Grid
item
xs={4}
>

<Typography
color="#999"
>

Ending Soon

</Typography>

<Typography

sx={{

fontSize:30,

fontWeight:800,

color:"#fff"

}}

>

{stats.endingSoon}

</Typography>

</Grid>

<Grid
item
xs={4}
>

<Typography
color="#999"
>

Coverage

</Typography>

<Typography

sx={{

fontSize:30,

fontWeight:800,

color:"#fff"

}}

>

{coverage}%

</Typography>

</Grid>

</Grid>

</Paper>

</Box>

);

}