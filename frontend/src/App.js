import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { Flame, LogOut, Menu, X } from 'lucide-react';

import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import Dashboard from './components/Dashboard';
import History from './components/History';
import DebtTracker from './components/DebtTracker';
// 1. Import the new component
import ChatAssistant from './components/ChatAssistant'; 

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// ... (Keep existing saveToken, getToken, clearToken, ProtectedRoute as they are) ...
function saveToken(token) { localStorage.setItem("cc_token", token); }
function getToken() { return localStorage.getItem("cc_token"); }
function clearToken() { localStorage.removeItem("cc_token"); }

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ... (Keep existing Nav component as is) ...
function Nav() {
    // ... your existing Nav code ...
    // (I am omitting the full Nav code here for brevity, keep it exactly as you have it)
    const token = getToken();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    function handleLogout() {
      clearToken();
      navigate("/");
    }
  
    return (
      <nav className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">Calorie Catcher</span>
            </Link>
  
            {token ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <Link to="/dashboard" className="text-white hover:text-orange-200 px-3 py-2 rounded transition">
                    Dashboard
                  </Link>
                  <Link to="/history" className="text-white hover:text-orange-200 px-3 py-2 rounded transition">
                    History
                  </Link>
                  <Link to="/debt" className="text-white hover:text-orange-200 px-3 py-2 rounded transition">
                    Debt Tracker
                  </Link>
                  <button onClick={handleLogout} className="text-white hover:text-orange-200 px-3 py-2 rounded transition flex items-center space-x-1">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition">
                Login
              </Link>
            )}
          </div>
        </div>
        {/* Mobile menu code... */}
      </nav>
    );
}

export default function App() {
  // We can check token existence here to conditionally render the Chatbot
  const token = getToken();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 relative"> {/* Added 'relative' just in case */}
        <Nav />
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/debt" element={<ProtectedRoute><DebtTracker /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* 2. Add ChatAssistant here. 
            It is outside Routes so it persists.
            It checks if token exists so it only shows when logged in. 
        */}
        {token && <ChatAssistant />}
        
      </div>
    </Router>
  );
}