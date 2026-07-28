// src/pages/Houses.js

import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Avatar,
  Skeleton
} from "@mui/material";

import {
  Search,
  Campaign,
  Build,
  ShoppingCart,
  LocationOn,
  Bed,
  Bathtub,
  Verified,
  Bolt,
  Apartment,
  Add,
  Star
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

import { db } from "../services/firebase";

/* =========================================================
THEME
========================================================= */

const GOLD = "#F4B400";

const BG = "#050505";

const CARD = "#111111";

const BORDER = "#232323";

/* =========================================================
FORMAT PRICE
========================================================= */

const formatPrice = (price) => {

  if (!price) return "KES 0";

  return `KES ${Number(price).toLocaleString()}`;

};

/* =========================================================
IMAGE
========================================================= */

const getImage = (house) =>
  house.images?.[0]?.thumb ||
  house.images?.[0]?.full ||
  house.images?.[0] ||
  "";

/* =========================================================
HOUSE CARD
========================================================= */

const HouseCard = ({ house }) => {

  const navigate = useNavigate();

  const image = getImage(house);

  return (

    <Box
      onClick={() =>
        navigate(`/post/house/${house.id}`)
      }
      sx={{

        background: CARD,

        border:
          `1px solid ${BORDER}`,

        borderRadius: 4,

        overflow: "hidden",

        cursor: "pointer",

        position: "relative",

        transition: "0.25s",

        "&:hover": {

          borderColor: GOLD,

          transform:
            "translateY(-3px)"

        }

      }}
    >

      {/* =====================================
         IMAGE
      ===================================== */}

      <Box
        sx={{

          position: "relative",

          width: "100%",

          aspectRatio: "1/1"

        }}
      >

        <Box
          component="img"
          src={image}
          alt={house.title}
          sx={{

            width: "100%",

            height: "100%",

            objectFit: "cover"

          }}
        />

        {/* =====================================
           GRADIENT
        ===================================== */}

        <Box
          sx={{

            position: "absolute",

            inset: 0,

            background:
              "linear-gradient(to top,rgba(0,0,0,.85),transparent)"

          }}
        />

        {/* =====================================
           VERIFIED
        ===================================== */}

        {house.verified && (

          <Chip
            icon={
              <Verified
                sx={{
                  color: "#fff !important"
                }}
              />
            }

            label="Verified"

            size="small"

            sx={{

              position: "absolute",

              top: 8,

              left: 8,

              background:
                "#1b5e20",

              color: "#fff",

              fontWeight: 700

            }}
          />

        )}

        {/* =====================================
           FEATURED
        ===================================== */}

        {house.featured && (

          <Chip
            icon={
              <Bolt
                sx={{
                  color: "#000 !important"
                }}
              />
            }

            label="Featured"

            size="small"

            sx={{

              position: "absolute",

              top: 8,

              right: 8,

              background: GOLD,

              color: "#000",

              fontWeight: 900

            }}
          />

        )}

        {/* =====================================
           BOTTOM INFO
        ===================================== */}

        <Box
          sx={{

            position: "absolute",

            bottom: 8,

            left: 8,

            right: 8

          }}
        >

          <Typography
            sx={{

              color: "#fff",

              fontWeight: 800,

              fontSize: 13,

              lineHeight: 1.2

            }}
          >
            {house.title}
          </Typography>

          <Typography
            sx={{

              color: GOLD,

              fontWeight: 900,

              fontSize: 14,

              mt: .3

            }}
          >
            {formatPrice(house.rent)}
          </Typography>

        </Box>

      </Box>

      {/* =====================================
         CONTENT
      ===================================== */}

      <Box sx={{ p: 1 }}>

        {/* LOCATION */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: .5
          }}
        >

          <LocationOn
            sx={{
              color: "#888",
              fontSize: 14
            }}
          />

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 11
            }}
          >
            {house.location || "Juja"}
          </Typography>

        </Box>

        {/* HOUSE INFO */}

        <Box
          sx={{

            display: "flex",

            alignItems: "center",

            gap: 1,

            mt: 1

          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: .4
            }}
          >

            <Bed
              sx={{
                fontSize: 14,
                color: "#777"
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                color: "#ccc"
              }}
            >
              {house.bedrooms || 0}
            </Typography>

          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: .4
            }}
          >

            <Bathtub
              sx={{
                fontSize: 14,
                color: "#777"
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                color: "#ccc"
              }}
            >
              {house.bathrooms || 0}
            </Typography>

          </Box>

        </Box>

        {/* HUNTING FEE */}

        <Typography
          sx={{

            color: "#00e676",

            fontWeight: 700,

            fontSize: 11,

            mt: 1

          }}
        >
          Hunting Fee:
          {" "}
          {formatPrice(
            house.huntingFee || 0
          )}
        </Typography>

        {/* TAGS */}

        <Box
          sx={{
            display: "flex",
            gap: .5,
            flexWrap: "wrap",
            mt: 1
          }}
        >

          {house.studentFriendly && (

            <Chip
              label="Student Friendly"

              size="small"

              sx={{
                height: 20,
                fontSize: 9
              }}
            />

          )}

          {house.newListing && (

            <Chip
              label="New"

              size="small"

              sx={{
                height: 20,
                fontSize: 9,
                background: GOLD,
                color: "#000"
              }}
            />

          )}

        </Box>

      </Box>

    </Box>

  );

};

/* =========================================================
PAGE
========================================================= */

export default function HousesPage() {

  const navigate = useNavigate();

  const [houses, setHouses] =
    useState([]);

  const [filtered, setFiltered] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("All");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {

    const fetchHouses =
      async () => {

      try {

        const q = query(

          collection(db, "houses"),

          where(
            "status",
            "in",
            ["available", "approved"]
          ),

          orderBy(
            "createdAt",
            "desc"
          ),

          limit(60)

        );

        const snap =
          await getDocs(q);

        const data =
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

        setHouses(data);

        setFiltered(data);

        const cats = [

          "All",

          ...new Set(

            data.map(
              (h) =>
                `${h.bedrooms || 0} Bedroom`
            )

          )

        ];

        setCategories(cats);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

    fetchHouses();

  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  useEffect(() => {

    let result = houses;

    if (
      selectedCategory !== "All"
    ) {

      result = result.filter(

        (h) =>

          `${h.bedrooms || 0} Bedroom`
          === selectedCategory

      );

    }

    if (search) {

      result = result.filter(

        (h) =>

          h.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          h.location
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )

      );

    }

    setFiltered(result);

  }, [
    search,
    selectedCategory,
    houses
  ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <Box
        sx={{

          minHeight: "70vh",

          display: "flex",

          justifyContent:
            "center",

          alignItems: "center",

          background: BG

        }}
      >

        <CircularProgress
          sx={{
            color: GOLD
          }}
        />

      </Box>

    );

  }

  return (

    <Box
      sx={{
        background: BG,
        minHeight: "100vh",
        pb: 10
      }}
    >

      {/* =================================================
         HERO
      ================================================= */}

      <Box
        sx={{
          px: 1.5,
          pt: 2
        }}
      >

        <Typography
          sx={{

            color: GOLD,

            fontWeight: 900,

            fontSize: 22

          }}
        >
          Find Vacant Houses
        </Typography>

        <Typography
          sx={{

            color: "#aaa",

            fontSize: 12,

            mt: .5

          }}
        >
          Discover rooms, bedsitters,
          hostels, and apartments
          around Juja and nearby areas.
        </Typography>

      </Box>

      {/* =================================================
         EARN MONEY CARD
      ================================================= */}

      <Box sx={{ px: 1.5, mt: 2 }}>

        <Box
          sx={{

            background:
              "linear-gradient(135deg,#0a0a0a,#1a1a1a)",

            borderRadius: 4,

            p: 2,

            color: "#000"

          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              mt: .7
            }}
          >
            Spot an empty room,
            bedsitter, hostel,
            apartment, or house
            around you?
            Upload it and earn
            commission when tenants
            get connected.
          </Typography>

          <Button
            startIcon={<Add />}
            onClick={() =>
              navigate("/uploads")
            }
            sx={{

              mt: 2,

              background: "#000",

              color: "#ffd000",

              fontWeight: 800,

              "&:hover": {
                background: "#111"
              }

            }}
          >
            Upload Vacant House
          </Button>

        </Box>

      </Box>

      {/* =================================================
         SEARCH
      ================================================= */}

      <Box sx={{ px: 1.9, mt: 2 }}>

        <TextField
          fullWidth

          size="small"

          placeholder=
            "Search houses by area..."

          value={search}

          onChange={(e) =>
            setSearch(e.target.value)
          }

          InputProps={{

            startAdornment: (

              <InputAdornment
                position="start"
              >

                <Search
                  sx={{
                    color: GOLD
                  }}
                />

              </InputAdornment>

            ),

            sx: {

              background: "#161616",

              borderRadius: 3,

              color: "#fff"

            }

          }}
        />

      </Box>

      {/* =================================================
         CATEGORY BAR
      ================================================= */}

      <Box
        sx={{

          display: "flex",

          gap: 1,

          overflowX: "auto",

          px: 1.5,

          py: 2,

          "&::-webkit-scrollbar": {
            display: "none"
          }

        }}
      >

        {categories.map((cat) => (

          <Chip
            key={cat}

            label={cat}

            onClick={() =>
              setSelectedCategory(cat)
            }

            sx={{

              background:

                selectedCategory === cat
                  ? GOLD
                  : "#1a1a1a",

              color:

                selectedCategory === cat
                  ? "#000"
                  : "#fff",

              fontWeight: 700

            }}
          />

        ))}

      </Box>

      {/* =================================================
         STATS
      ================================================= */}

      <Box
        sx={{

          display: "grid",

          gridTemplateColumns:
            "repeat(3,1fr)",

          gap: 1,

          px: 1.5,

          mb: 2

        }}
      >

        <Box
          sx={{

            background: CARD,

            borderRadius: 3,

            p: 1.5,

            textAlign: "center"

          }}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900
            }}
          >
            {houses.length}+
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 11
            }}
          >
            Vacancies
          </Typography>

        </Box>

        <Box
          sx={{

            background: CARD,

            borderRadius: 3,

            p: 1.5,

            textAlign: "center"

          }}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900
            }}
          >
            24H
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 11
            }}
          >
            Fast Support
          </Typography>

        </Box>

        <Box
          sx={{

            background: CARD,

            borderRadius: 3,

            p: 1.5,

            textAlign: "center"

          }}
        >

          <Typography
            sx={{
              color: GOLD,
              fontWeight: 900
            }}
          >
            Trusted
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 11
            }}
          >
            Listings
          </Typography>

        </Box>

      </Box>

      {/* =================================================
         GRID
      ================================================= */}

      <Box
        sx={{

          display: "grid",

          gridTemplateColumns: {

            xs: "repeat(2,1fr)",

            sm: "repeat(3,1fr)",

            md: "repeat(4,1fr)"

          },

          gap: 1,

          px: 1.2

        }}
      >

        {filtered.length > 0 ? (

          filtered.map((house) => (

            <HouseCard
              key={house.id}
              house={house}
            />

          ))

        ) : (

          <Box
            sx={{

              gridColumn: "1 / -1",

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              py: 8,

              textAlign: "center"

            }}
          >

            <Apartment
              sx={{
                fontSize: 70,
                color: "#333"
              }}
            />

            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                mt: 2,
                fontSize: 18
              }}
            >
              No Houses Found
            </Typography>

            <Typography
              sx={{
                color: "#888",
                fontSize: 13,
                mt: 1,
                maxWidth: 300
              }}
            >
              We could not find any house
              matching your search or
              selected category.
            </Typography>

            <Button
              onClick={() => {

                setSearch("");

                setSelectedCategory(
                  "All"
                );

              }}

              sx={{

                mt: 3,

                background: GOLD,

                color: "#000",

                fontWeight: 800,

                borderRadius: 3,

                px: 3,

                "&:hover": {

                  background: "#ffca28"

                }

              }}
            >
              Reset Filters
            </Button>

          </Box>

        )}

      </Box>

      {/* =================================================
         BOTTOM CTA
      ================================================= */}

      <Box
        sx={{
          px: 1.5,
          mt: 5
        }}
      >

        <Box
          sx={{

            background: CARD,

            border:
              `1px solid ${BORDER}`,

            borderRadius: 4,

            p: 2,

            textAlign: "center"

          }}
        >

          <Typography
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 18
            }}
          >
            Are You a House Agent
            or Landlord?
          </Typography>

          <Typography
            sx={{
              color: "#aaa",
              fontSize: 13,
              mt: 1
            }}
          >
            Reach thousands of students
            and residents by listing
            your vacancies on Biashnet LTD.
          </Typography>

          <Button
            startIcon={<Add />}

            onClick={() =>
              navigate("/uploads")
            }

            sx={{

              mt: 2,

              background: GOLD,

              color: "#000",

              fontWeight: 900,

              px: 3,

              borderRadius: 3,

              "&:hover": {

                background: "#ffca28"

              }

            }}
          >
            Post Vacancy
          </Button>

        </Box>

      </Box>

    </Box>

  );

}