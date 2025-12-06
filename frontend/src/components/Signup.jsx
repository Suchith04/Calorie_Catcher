import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function saveToken(token) { localStorage.setItem("cc_token", token); }
function getToken() { return localStorage.getItem("cc_token"); }

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      navigate("/login");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Flame className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
            Join Calorie Catcher
          </h2>
          {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{err}</div>}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              Create Account
            </button>
          </form>
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}