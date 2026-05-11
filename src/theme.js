// src/theme.js

import { createTheme } from "@mui/material/styles";

export const COLORS = {

  BG: "#000000",
  CARD: "#0A0A0A",
  CARD_ELEVATED: "#111111",
  BORDER: "#222222",

  GOLD: "#F4B400",
  GOLD_LIGHT: "#FFD54F",

  TEXT: "#FFFFFF",
  TEXT_SECONDARY: "#CCCCCC",
  TEXT_MUTED: "#888888"

};


// Golden Biashnet Global Theme

const theme = createTheme({

  palette: {

    mode: "dark",

    background: {
      default: COLORS.BG,
      paper: COLORS.CARD
    },

    text: {
      primary: COLORS.TEXT,
      secondary: COLORS.TEXT_SECONDARY
    },

    primary: {
      main: COLORS.GOLD,
      contrastText: "#000"
    }

  },


  typography: {

    fontFamily: "Inter, Roboto, Arial, sans-serif",

    allVariants: {
      color: COLORS.TEXT   // ✅ forces all Typography white
    },

    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }

  },


  components: {

    MuiCard: {

      styleOverrides: {

        root: {

          backgroundColor: COLORS.CARD,
          border: `1px solid ${COLORS.BORDER}`,
          color: COLORS.TEXT

        }

      }

    },


    MuiCardContent: {

      styleOverrides: {

        root: {
          color: COLORS.TEXT
        }

      }

    },


    MuiTypography: {

      styleOverrides: {

        root: {
          color: COLORS.TEXT
        }

      }

    },


    MuiButton: {

      styleOverrides: {

        containedPrimary: {

          backgroundColor: COLORS.GOLD,
          color: "#000",

          "&:hover": {
            backgroundColor: COLORS.GOLD_LIGHT
          }

        }

      }

    },


    MuiOutlinedInput: {

      styleOverrides: {

        root: {

          color: COLORS.TEXT,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.BORDER
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.GOLD
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: COLORS.GOLD
          }

        }

      }

    },


    MuiDivider: {

      styleOverrides: {

        root: {
          borderColor: COLORS.BORDER
        }

      }

    }

  }

});


export default theme;