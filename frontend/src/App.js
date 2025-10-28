import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Upload from "././components/Upload";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedin } from "./utils/auth";
import Navbar from "./components/Navbar";
import History from "./components/History";

function App() {
  // const hides = ["/login","/signup"];
  // const location = useLocation();
  // const showNavbar = !hides.includes(location.pathname);

  return (<>
      {/* {showNavbar && <Navbar/>} */}
      <Navbar/>
      <Routes>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Upload/>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/login"
          element={isLoggedin() ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedin() ? <Navigate to="/dashboard" /> : <Signup />}
        />

        
        
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      </>
  );
}

export default App;
