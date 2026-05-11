import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase";

const GOLD = "#F4B400";
const BG = "#000";
const CARD = "#000000";

/* ================= CARD ================= */
const Card = ({ item, type }) => {
  const navigate = useNavigate();

  const image =
    item.images?.[0]?.thumb ||
    item.images?.[0]?.full ||
    item.images?.[0];

  return (
    <Box
      onClick={() => navigate(`/post/${type}/${item.id}`)}
      sx={{
        minWidth: 140,
        background: CARD,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer"
      }}
    >
      <Box
        component="img"
        src={image}
        sx={{
          width: "100%",
          height: 120,
          objectFit: "cover"
        }}
      />

      <Box p={1}>
        <Typography sx={{ color: "#fff", fontSize: 12 }} noWrap>
          {item.title}
        </Typography>

        {item.price && (
          <Typography sx={{ color: GOLD, fontSize: 12 }}>
            KES {Number(item.price).toLocaleString()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/* ================= SECTION ================= */
const Section = ({ title, data, type }) => {
  const scrollRef = useRef();

  // 🔥 AUTO SCROLL EFFECT
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollAmount = 0;

    const interval = setInterval(() => {
      if (scrollAmount >= el.scrollWidth - el.clientWidth) {
        scrollAmount = 0;
      } else {
        scrollAmount += 1;
      }

      el.scrollTo({
        left: scrollAmount,
        behavior: "smooth"
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box mt={3}>
      <Typography sx={{ color: GOLD, px: 1, mb: 1 }}>
        {title}
      </Typography>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          px: 1,
          "&::-webkit-scrollbar": { display: "none" }
        }}
      >
        {data.map((item) => (
          <Card key={item.id} item={item} type={type} />
        ))}
      </Box>
    </Box>
  );
};

/* ================= MAIN ================= */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [houses, setHouses] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const getData = async (collectionName) => {
          const q = query(
            collection(db, collectionName),
            orderBy("createdAt", "desc"),
            limit(10)
          );

          const snap = await getDocs(q);

          return snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
        };

        const [p, s, h, a] = await Promise.all([
          getData("products"),
          getData("services"),
          getData("houses"),
          getData("adverts")
        ]);

        setProducts(p);
        setServices(s);
        setHouses(h);
        setAdverts(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: BG, pb: 4 }}>
      
      {/* 🔥 HEADER */}
      <Box px={1.5} pt={2}>
        <Typography sx={{ color: GOLD, fontWeight: "bold", fontSize: 18 }}>
          Golden Biashnet
        </Typography>

        <Typography sx={{ color: "#aaa", fontSize: 12 }}>
          Discover. Connect. Trade.
        </Typography>
      </Box>

      {/* 🔥 CATEGORIES (PLACEHOLDER) */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          px: 1,
          py: 2
        }}
      >
        {["Electronics", "Fashion", "Food", "Services"].map((cat) => (
          <Box
            key={cat}
            sx={{
              px: 2,
              py: 1,
              background: "#222",
              borderRadius: 2,
              color: "#fff",
              fontSize: 12
            }}
          >
            {cat}
          </Box>
        ))}
      </Box>

      {/* 🔥 SECTIONS */}
      <Section title="🔥 Trending Products" data={products} type="product" />
      <Section title="🛠 Popular Services" data={services} type="service" />
      <Section title="🏠 Available Houses" data={houses} type="house" />
      <Section title="📢 Sponsored Ads" data={adverts} type="advert" />

    </Box>
  );
}