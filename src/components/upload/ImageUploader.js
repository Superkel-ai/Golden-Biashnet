import React, {
  useRef,
  useEffect
} from "react";

import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Card,
  CardMedia,
  LinearProgress
} from "@mui/material";

import {
  Add,
  Delete
} from "@mui/icons-material";

const MAX_IMAGES = 4;


/* =====================================
COMPRESS IMAGE
===================================== */

const compressImage = (file) => {

  return new Promise((resolve) => {

    const img = new Image();

    const src = URL.createObjectURL(file);

    img.src = src;

    img.onload = () => {

      const canvas =
        document.createElement("canvas");

      const MAX_WIDTH = 900;

      const width =
        Math.min(
          img.width,
          MAX_WIDTH
        );

      const scale =
        width / img.width;

      canvas.width = width;

      canvas.height =
        img.height * scale;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(

        img,

        0,

        0,

        canvas.width,

        canvas.height

      );

      canvas.toBlob(

        blob => {

          URL.revokeObjectURL(src);

          resolve({

            file:

            new File(

              [blob],

              file.name,

              {

                type:

                "image/jpeg"

              }

            ),

            preview:

            URL.createObjectURL(

              blob

            )

          });

        },

        "image/jpeg",

        0.75

      );

    };

  });

};



/* =====================================
COMPONENT
===================================== */

export default function ImageUploader({

images,

setImages

}){

const inputRef =
useRef();

const handleSelect =
async(e)=>{

const files=

Array.from(

e.target.files

);

const remaining=

MAX_IMAGES-

images.length;


if(

remaining<=0

){

alert(

`Maximum ${MAX_IMAGES} images`

);

return;

}


const selected=

files.slice(

0,

remaining

);


try{

const compressed=

await Promise.all(

selected.map(

compressImage

)

);


setImages(prev=>

[

...prev,

...compressed

]

);

}

catch(err){

console.log(err);

}


e.target.value="";

};



const removeImage=

(index)=>{

const item=

images[index];

if(

item?.preview

){

URL.revokeObjectURL(

item.preview

);

}


setImages(

images.filter(

(_,i)=>

i!==index

)

);

};



useEffect(()=>{

return()=>{

images.forEach(

img=>{

if(

img.preview

){

URL.revokeObjectURL(

img.preview

);

}

}

);

};

},[]);



return(

<Box>

<Typography

sx={{

color:"#F4B400",

fontWeight:700,

mb:2

}}

>

Upload Images

</Typography>


<Button

variant="contained"

startIcon={<Add/>}

onClick={()=>

inputRef.current.click()

}

sx={{

background:"#F4B400",

color:"#000",

mb:2,

fontWeight:700,

"&:hover":{

background:"#FFD54F"

}

}}

>

Select Images

</Button>


<input

hidden

multiple

accept="image/*"

type="file"

ref={inputRef}

onChange={handleSelect}

/>


<Grid

container

spacing={1}

>

{

images.map(

(img,index)=>(

<Grid

item

xs={6}

sm={4}

md={3}

key={index}

>

<Card

sx={{

position:

"relative",

borderRadius:3,

overflow:

"hidden",

background:

"#111"

}}

>

<CardMedia

component="img"

image={

img.preview

}

sx={{

height:120,

objectFit:

"cover"

}}

/>


<IconButton

size="small"

onClick={()=>

removeImage(

index

)

}

sx={{

position:

"absolute",

top:6,

right:6,

bgcolor:

"rgba(0,0,0,.7)",

color:"#fff"

}}

>

<Delete/>

</IconButton>

</Card>

</Grid>

)

)

}

</Grid>


<Box mt={2}>

<LinearProgress

variant="determinate"

value={

(images.length/

MAX_IMAGES)

*100

}

sx={{

height:8,

borderRadius:5

}}

/>

</Box>


<Typography

sx={{

fontSize:13,

mt:1,

opacity:.7

}}

>

{images.length}

/

{MAX_IMAGES}

images selected

</Typography>

</Box>

);

}