import React from "react";
import { useState } from "react";
import axios from 'axios';
import {Routes,Route} from 'react-router-dom';
import Upload from "./components/Upload";
import Login from "./components/Login";
import Signup from "./components/Signup";


const App = () =>{
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Upload/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </>
  )
}

export default App;
