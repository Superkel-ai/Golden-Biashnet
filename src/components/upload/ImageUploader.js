import React, { useRef } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Card,
  CardMedia
} from "@mui/material";

import { Add, Delete } from "@mui/icons-material";

const MAX_IMAGES = 4;
// =============================
// Compress image function
// =============================
const compressImage = (file) => {

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event) => {

      const img = new Image();

      img.src = event.target.result;

      img.onload = () => {

        const canvas = document.createElement("canvas");

        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {

            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);

          },
          "image/jpeg",
          0.7 // compression quality
        );

      };

    };

  });

};


// =============================
// Component
// =============================
const ImageUploader = ({ images, setImages }) => {

  const inputRef = useRef();


  // =============================
  // Handle select
  // =============================
  const handleSelect = async (e) => {
  const files = Array.from(e.target.files);

  const remaining = MAX_IMAGES - images.length;

  // ❌ already full
  if (remaining <= 0) {
    alert(`You can only upload ${MAX_IMAGES} images`);
    return;
  }

  // ✅ only allow remaining slots
  const selectedFiles = files.slice(0, remaining);

  const compressedImages = [];

  for (let file of selectedFiles) {
    const compressed = await compressImage(file);
    compressedImages.push(compressed);
  }

  setImages((prev) => [...prev, ...compressedImages]);

  // 🔥 reset input (important for re-selecting same image)
  e.target.value = "";
};

  // =============================
  // Remove image
  // =============================
  const removeImage = (index) => {

    const updated = [...images];

    updated.splice(index, 1);

    setImages(updated);

  };


  return (

    <Box>

      {/* Title */}
      <Typography
        sx={{
          color: "#F4B400",
          mb: 2,
          fontWeight: "bold"
        }}
      >
        Upload Images
      </Typography>


      {/* Upload button */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => inputRef.current.click()}
        sx={{
          background: "#F4B400",
          color: "#000",
          mb: 2,

          "&:hover": {
            background: "#FFD54F"
          }
        }}
      >
        Select Images
      </Button>


      {/* Hidden input */}
      <input
        type="file"
        hidden
        multiple
        accept="image/*"
        ref={inputRef}
        onChange={handleSelect}
      />


      {/* Preview grid */}
      <Grid container spacing={2}>

        {images.map((file, index) => (

          <Grid item xs={4} key={index}>

            <Card
              sx={{
                background: "#111",
                position: "relative"
              }}
            >

              <CardMedia
                component="img"
                image={URL.createObjectURL(file)}
                sx={{
                  height: 120,
                  objectFit: "cover"
                }}
              />

              {/* Delete button */}
              <IconButton
                onClick={() => removeImage(index)}
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff"
                }}
              >
                <Delete />
              </IconButton>

            </Card>

          </Grid>

        ))}

      </Grid>


      {/* Helper text */}
      <Typography
        sx={{
          opacity: 0.6,
          fontSize: 13,
          mt: 2
        }}
      >
        
      
      </Typography>


    </Box>

  );

};

export default ImageUploader;