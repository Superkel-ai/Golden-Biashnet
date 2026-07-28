import React,
{
useEffect,
useState
}
from "react";

import {
Typography
}
from "@mui/material";

const GOLD = "#F4B400";

export default function CountdownTimer({

endDate,

color = GOLD,

fontSize = 14,

fontWeight = 700

}){

const [timeLeft,setTimeLeft]=
useState("");

useEffect(()=>{

const calculate=()=>{

if(!endDate){

setTimeLeft("No Date");

return;

}

let target;

if(endDate?.toDate){

target=

endDate
.toDate()
.getTime();

}

else{

target=

new Date(
endDate
)
.getTime();

}

const now=

Date.now();

const diff=

target-now;

if(diff<=0){

setTimeLeft(

"Expired"

);

return;

}

const days=

Math.floor(

diff/

86400000

);

const hours=

Math.floor(

(

diff%

86400000

)

/

3600000

);

const mins=

Math.floor(

(

diff%

3600000

)

/

60000

);

const secs=

Math.floor(

(

diff%

60000

)

/

1000

);

if(days>0){

setTimeLeft(

`${days}d ${hours}h ${mins}m`

);

}

else{

setTimeLeft(

`${hours}h ${mins}m ${secs}s`

);

}

};

calculate();

const interval=

setInterval(

calculate,

1000

);

return()=>{

clearInterval(

interval

);

};

},[endDate]);

return(

<Typography

sx={{

color,

fontSize,

fontWeight

}}

>

{timeLeft}

</Typography>

);

}