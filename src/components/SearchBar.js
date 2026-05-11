import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  MenuItem
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const GOLD = "#F4B400";

export default function SearchBar() {

  const navigate = useNavigate();

  const [keyword,setKeyword] = useState("");
  const [type,setType] = useState("products");

  const handleSearch = () => {

    if(!keyword.trim()) return;

    navigate(`/search?type=${type}&q=${keyword}`);

  };

  return(

    <Box
      sx={{
        display:"flex",
        background:"#111",
        borderRadius:2,
        border:"1px solid #222"
      }}
    >

      <TextField
        select
        value={type}
        onChange={(e)=>setType(e.target.value)}
        variant="standard"
        sx={{
          minWidth:120,
          px:2,
          color:"#fff"
        }}
      >
        <MenuItem value="products">Products</MenuItem>
        <MenuItem value="services">Services</MenuItem>
        <MenuItem value="houses">Housing</MenuItem>
        <MenuItem value="adverts">Adverts</MenuItem>
      </TextField>

      <TextField
        fullWidth
        placeholder="Search for products, services, housing..."
        value={keyword}
        onChange={(e)=>setKeyword(e.target.value)}
        variant="standard"
        sx={{
          px:2,
          input:{color:"#fff"}
        }}
        onKeyDown={(e)=>{
          if(e.key==="Enter"){
            handleSearch();
          }
        }}
        InputProps={{
          disableUnderline:true,
          endAdornment:(
            <InputAdornment position="end">
              <IconButton onClick={handleSearch}>
                <SearchIcon sx={{color:GOLD}} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

    </Box>

  );

}