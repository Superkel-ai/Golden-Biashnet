import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack
} from "@mui/material";

import WarningAmberRoundedIcon
from "@mui/icons-material/WarningAmberRounded";

const GOLD = "#F4B400";

export default function ConfirmDialog({

  open,

  onClose,

  onConfirm,

  title = "Confirm Action",

  message = "Are you sure?",

  confirmText = "Confirm",

  cancelText = "Cancel",

  loading = false

}) {

  return (

    <Dialog

      open={open}

      onClose={loading ? undefined : onClose}

      maxWidth="xs"

      fullWidth

      PaperProps={{

        sx:{

          bgcolor:"#111",

          borderRadius:4,

          border:
            "1px solid rgba(244,180,0,.15)",

          color:"#fff"

        }

      }}

    >

      <DialogTitle>

        <Stack

          direction="row"

          spacing={1}

          alignItems="center"

        >

          <WarningAmberRoundedIcon

            sx={{

              color:GOLD,

              fontSize:30

            }}

          />

          <Typography

            sx={{

              fontWeight:800,

              fontSize:20

            }}

          >

            {title}

          </Typography>

        </Stack>

      </DialogTitle>

      <DialogContent>

        <Typography

          sx={{

            color:"#aaa",

            lineHeight:1.8

          }}

        >

          {message}

        </Typography>

      </DialogContent>

      <DialogActions
        sx={{
          px:3,
          pb:3
        }}
      >

        <Button

          variant="outlined"

          onClick={onClose}

          disabled={loading}

          sx={{

            color:"#aaa",

            borderColor:"#333",

            "&:hover":{

              borderColor:"#555"

            }

          }}

        >

          {cancelText}

        </Button>

        <Button

          variant="contained"

          onClick={onConfirm}

          disabled={loading}

          sx={{

            bgcolor:GOLD,

            color:"#000",

            fontWeight:800,

            px:3,

            "&:hover":{

              bgcolor:"#FFD54F"

            }

          }}

        >

          {

            loading

            ?

            "Processing..."

            :

            confirmText

          }

        </Button>

      </DialogActions>

    </Dialog>

  );

}