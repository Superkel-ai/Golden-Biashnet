// src/components/PostGrid.js

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";


// ================= THEME =================

const GOLD = "#F4B400";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#222";


// ================= FORMAT PRICE =================

const formatPrice = (price) => {

  if (!price) return "";

  return "KES " + Number(price).toLocaleString();

};


// ================= SAFE IMAGE =================

const getImage = (post) => {

  const img =
    post.images?.[0]?.thumb ||
    post.images?.[0]?.full ||
    post.images?.[0];

  if (!img || img === "") return null;

  return img;

};


// ================= SAFE UNIQUE MERGE =================

const mergeUniquePosts = (posts) => {

  const map = new Map();

  posts.forEach(post => {

    if (!post?.id) return;

    // create globally unique key
    const uniqueKey = `${post.type}_${post.id}`;

    if (!map.has(uniqueKey)) {
      map.set(uniqueKey, {
        ...post,
        uniqueKey
      });
    }

  });

  return Array.from(map.values());

};



// ================= POST CARD =================

const PostCard = React.memo(({ post, navigate }) => {

  const image = getImage(post);

  if (!image) return null;

  const price =
    post.price ||
    post.rent ||
    post.fee ||
    post.salary;

  return (

    <Box
      onClick={() => navigate(`/post/${post.type}/${post.id}`)}
      sx={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",

        "&:hover": {
          border: `1px solid ${GOLD}`
        },

        "&:active": {
          transform: "scale(0.98)"
        }
      }}
    >

      {/* IMAGE */}

      <Box sx={{ position: "relative" }}>

        <img
          src={image}
          alt={post.title || "post"}
          loading="lazy"
          style={{
            width: "100%",
            height: "160px",
            objectFit: "cover"
          }}
        />

      </Box>


      {/* CONTENT */}

      <Box sx={{ p: 1.2 }}>

        {/* TITLE */}

        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#fff"
          }}
        >
          {post.title}
        </Typography>


        {/* PRICE */}

        {price && (

          <Typography
            sx={{
              color: GOLD,
              fontWeight: "bold",
              fontSize: "14px"
            }}
          >
            {formatPrice(price)}
          </Typography>

        )}


        {/* LOCATION */}

        {post.location && (

          <Typography
            sx={{
              fontSize: "11px",
              color: "#888"
            }}
          >
            {post.location}
          </Typography>

        )}

      </Box>

    </Box>

  );

});



// ================= SECTION =================

const Section = ({ title, posts, navigate }) => {

  if (!posts.length) return null;

  return (

    <Box sx={{ mb: 4 }}>

      {/* TITLE */}

      <Typography
        sx={{
          color: GOLD,
          fontWeight: "bold",
          fontSize: "18px",
          mb: 1,
          px: 1
        }}
      >
        {title}
      </Typography>


      {/* GRID */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
          px: 1
        }}
      >

        {posts.map(post => (

          <PostCard
            key={post.uniqueKey}
            post={post}
            navigate={navigate}
          />

        ))}

      </Box>

    </Box>

  );

};



// ================= MAIN COMPONENT =================

export default function PostGrid() {

  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);



  // ================= FETCH =================

  useEffect(() => {

    const fetchPosts = async () => {

      try {

        const collectionsList = [
          { name: "products", type: "product" },
          { name: "houses", type: "house" },
          { name: "services", type: "service" },
          { name: "events", type: "event" }
        ];


        let allPosts = [];


        await Promise.all(

          collectionsList.map(async col => {

            const q = query(
              collection(db, col.name),
              orderBy("createdAt", "desc"),
              limit(50)
            );

            const snap = await getDocs(q);

            const docs = snap.docs.map(doc => ({
              id: doc.id,
              type: col.type,
              ...doc.data()
            }));

            allPosts.push(...docs);

          })

        );


        // Remove duplicates safely
        const uniquePosts = mergeUniquePosts(allPosts);


        // Sort globally
        uniquePosts.sort(

          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)

        );


        setPosts(uniquePosts);

      }
      catch (error) {

        console.error("PostGrid error:", error);

      }
      finally {

        setLoading(false);

      }

    };

    fetchPosts();

  }, []);




  // ================= FILTERED SECTIONS =================

  const latest = useMemo(() =>
    posts.slice(0, 20),
    [posts]
  );

  const products = useMemo(() =>
    posts.filter(p => p.type === "product"),
    [posts]
  );

  const services = useMemo(() =>
    posts.filter(p => p.type === "service"),
    [posts]
  );

  const events = useMemo(() =>
    posts.filter(p => p.type === "event"),
    [posts]
  );

  const houses = useMemo(() =>
    posts.filter(p => p.type === "house"),
    [posts]
  );




  // ================= LOADING =================

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



  // ================= EMPTY =================

  if (!posts.length) {

    return (

      <Typography
        sx={{
          color: "#aaa",
          textAlign: "center",
          mt: 4
        }}
      >
        No posts available
      </Typography>

    );

  }



  // ================= RENDER =================

  return (

    <Box sx={{ background: BG, pb: 4 }}>

      <Section
        title="Latest"
        posts={latest}
        navigate={navigate}
      />

      <Section
        title="Products"
        posts={products}
        navigate={navigate}
      />

      <Section
        title="Services"
        posts={services}
        navigate={navigate}
      />

      <Section
        title="Events"
        posts={events}
        navigate={navigate}
      />

      <Section
        title="Housing"
        posts={houses}
        navigate={navigate}
      />

    </Box>

  );

}