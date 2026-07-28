import React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Chip,
  Stack
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import LocalFireDepartmentIcon
from "@mui/icons-material/LocalFireDepartment";

import CountdownTimer
from "./CountdownTimer";

const GOLD = "#F4B400";

export default function PreviewDialog({

  open,

  onClose,

  product

}) {

  if (!product) return null;

  const discount =
    product.flashSalePercent || 0;

  const original =
    Number(product.price || 0);

  const flash =
    Number(
      product.flashSalePrice || 0
    );

  return (

    <Dialog

      open={open}

      onClose={onClose}

      maxWidth="sm"

      fullWidth

      PaperProps={{

        sx:{

          background:"#0a0a0a",

          border:
          `1px solid rgba(244,180,0,.15)`,

          borderRadius:4

        }

      }}

    >

      <DialogTitle>

        <Stack

          direction="row"

          justifyContent="space-between"

          alignItems="center"

        >

          <Typography

            sx={{

              color:GOLD,

              fontWeight:800,

              fontSize:18

            }}

          >

            Customer Preview

          </Typography>

          <IconButton

            onClick={onClose}

            sx={{color:"#fff"}}

          >

            <CloseIcon />

          </IconButton>

        </Stack>

      </DialogTitle>

      <DialogContent>

        <Box

          sx={{

            background:"#111",

            borderRadius:4,

            overflow:"hidden",

            border:
            "1px solid rgba(255,255,255,.08)"

          }}

        >

          <Box

            sx={{

              position:"relative"

            }}

          >

            <img

              src={
                product.images?.[0] ||

                product.image ||

                "/placeholder.png"
              }

              alt={product.title}

              style={{

                width:"100%",

                height:280,

                objectFit:"cover"

              }}

            />

            <Chip

              icon={
                <LocalFireDepartmentIcon />
              }

              label={`${discount}% OFF`}

              sx={{

                position:"absolute",

                top:15,

                left:15,

                bgcolor:"#e53935",

                color:"#fff",

                fontWeight:800

              }}

            />

          </Box>

          <Box p={3}>

            <Typography

              sx={{

                color:"#fff",

                fontWeight:700,

                fontSize:22

              }}

            >

              {product.title}

            </Typography>

            <Typography

              sx={{

                color:"#888",

                mt:1

              }}

            >

              {product.category}

            </Typography>

            <Typography

              sx={{

                color:"#888",

                fontSize:13

              }}

            >

              Seller:

              {" "}

              {product.sellerName}

            </Typography>

            <Stack

              direction="row"

              spacing={2}

              alignItems="center"

              mt={3}

            >

              <Typography

                sx={{

                  textDecoration:
                  "line-through",

                  color:"#666",

                  fontSize:18

                }}

              >

                KES

                {" "}

                {original.toLocaleString()}

              </Typography>

              <Typography

                sx={{

                  color:GOLD,

                  fontSize:32,

                  fontWeight:900

                }}

              >

                KES

                {" "}

                {flash.toLocaleString()}

              </Typography>

            </Stack>

            <Box mt={3}>

              <CountdownTimer

                endDate={
                  product.flashSaleEnd
                }

              />

            </Box>

            <Button

              fullWidth

              sx={{

                mt:3,

                bgcolor:GOLD,

                color:"#000",

                fontWeight:800,

                borderRadius:3,

                py:1.5,

                "&:hover":{

                  bgcolor:"#FFD54F"

                }

              }}

            >

              BUY NOW

            </Button>

          </Box>

        </Box>

      </DialogContent>

    </Dialog>

  );

}