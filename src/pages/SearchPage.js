import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  CircularProgress
} from "@mui/material";

import { useSearchParams,useNavigate } from "react-router-dom";

import { db } from "../services/firebase";
import {
  collection,
  getDocs
} from "firebase/firestore";

import SearchFilters  from "../components/SearchFilters";
const GOLD = "#F4B400";

const ROUTE_MAP = {
  products: "product",
  services: "service",
  houses: "house",
  adverts: "advert"
};

export default function SearchPage(){

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const type = params.get("type");
  const query = params.get("q");

  const [loading,setLoading] = useState(true);
  const [results,setResults] = useState([]);

  useEffect(()=>{

    const loadResults = async()=>{

      try{

        const ref = collection(db,type);

        const snap = await getDocs(ref);

        let items = [];

        snap.forEach(doc=>{
          items.push({
            id:doc.id,
            ...doc.data()
          });
        });

        if(query){

          items = items.filter(item =>
            item.title?.toLowerCase()
            .includes(query.toLowerCase())
          );

        }

        setResults(items);

      }catch(err){

        console.error(err);

      }

      setLoading(false);

    };

    loadResults();

  },[type,query]);



  if(loading){

    return(

      <Box textAlign="center" mt={6}>
        <CircularProgress sx={{color:GOLD}} />
      </Box>

    )

  }



  return(

    <Box p={3}>

      <Typography
        variant="h5"
        sx={{
          mb:3,
          color:GOLD
        }}
      >
        Search Results
      </Typography>

      {results.length===0 &&(

        <Typography color="#aaa">
          No results found
        </Typography>

      )}

      <Grid container spacing={2}>

        {results.map(item=>(

          <Grid item xs={12} sm={6} md={4} key={item.id}>

            <Box
              onClick={() =>navigate(`/post/${ROUTE_MAP[type]}/${item.id}`)
}
              sx={{
                background:"#111",
                border:"1px solid #222",
                borderRadius:2,
                p:2,
                cursor:"pointer"
              }}
            >

                <img
  src={
    item.images?.[0]?.thumb ||
    item.images?.[0]?.full ||
    "/no-image.jpg"
  }
  alt={item.title}
  style={{
    width:"100%",
    height:"180px",
    objectFit:"cover",
    borderRadius:8
  }}
/>

              

              <Typography
                sx={{
                  mt:1,
                  fontWeight:"bold"
                }}
              >
                {item.title}
              </Typography>

              {item.price &&(

                <Typography
                  sx={{
                    color:GOLD
                  }}
                >
                  KES {Number(item.price).toLocaleString()}
                </Typography>

              )}

            </Box>

          </Grid>

        ))}

      </Grid>

    </Box>

  );

}