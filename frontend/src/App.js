import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { Camera, TrendingUp, History as HistoryIcon, LogOut, Menu, X, Upload, Calendar, Flame } from 'lucide-react';

// =========================
// Calorie Catcher - Complete React App
// Configure Tailwind CSS and replace API_BASE with your backend URL
// =========================

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

/* -------------------- Helpers -------------------- */
function saveToken(token) {
  localStorage.setItem("cc_token", token);
}
function getToken() {
  return localStorage.getItem("cc_token");
}
function clearToken() {
  localStorage.removeItem("cc_token");
}

/* -------------------- ProtectedRoute -------------------- */
function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* -------------------- Navigation -------------------- */
function Nav() {
  const token = getToken();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    clearToken();
    navigate("/");
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
              Calorie Catcher
            </span>
          </Link>

          {token ? (
            <>
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-orange-500 transition"
                >
                  <Camera className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/history"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-orange-500 transition"
                >
                  <HistoryIcon className="w-5 h-5" />
                  <span>History</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-500 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && token && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-orange-50"
            >
              <Camera className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-orange-50"
            >
              <HistoryIcon className="w-5 h-5" />
              <span>History</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* -------------------- Landing Page -------------------- */
function Landing() {
  const token = getToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Flame className="w-4 h-4" />
              <span>Track Your Nutrition Effortlessly</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Snap. Analyze.
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Track.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Take control of your nutrition with instant calorie analysis. Simply snap a photo of your meal and let our advanced technology do the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!token ? (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white text-orange-500 border-2 border-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Instant Food Recognition
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Upload a photo of any meal and get instant calorie analysis powered by advanced image recognition technology.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-red-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track Your Progress
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your daily calorie intake and visualize your nutrition journey with detailed tracking and insights.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <HistoryIcon className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete History
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access your entire food history anytime. Review past meals and track your eating patterns over time.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Nutrition Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of users who are making healthier choices every day.
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Tracking Now
          </Link>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-white">Calorie Catcher</span>
          </div>
          <p className="text-sm">Your personal nutrition tracking companion</p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------- Login Page -------------------- */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      saveToken(data.token);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
            Welcome Back
          </h2>
          {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{err}</div>}
          <div className="space-y-6">
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
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Signup Page -------------------- */
function Signup() {
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
      // saveToken(data.token);
      navigate("/login");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
            Create Account
          </h2>
          {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{err}</div>}
          <div className="space-y-6">
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
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              Create Account
            </button>
          </div>
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

/* -------------------- Dashboard Page -------------------- */
function Dashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Choose a photo");
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/meals`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          Welcome Back!
        </h1>
        <p className="text-gray-600 mb-8">Upload a photo of your meal to analyze its calories</p>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <input
              type="file"
              id="foodImage"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="hidden"
            />
            <label
              htmlFor="foodImage"
              className="cursor-pointer inline-flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 transition bg-orange-50 hover:bg-orange-100"
            >
              {preview ? (
                <img src={preview} alt="Selected food" className="max-h-60 rounded-lg object-cover" />
              ) : (
                <>
                  <Upload className="w-16 h-16 text-orange-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Click to upload food image</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                </>
              )}
            </label>
          </div>

          {file && (
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Upload & Analyze'}
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
              <p className="mt-4 text-gray-600">Analyzing your food...</p>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex gap-4 items-center mb-4">
              <img
                src={result.image_url}
                alt="result"
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">{result.calories} kcal</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(result.date).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="prose max-w-none text-gray-800">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Analysis Details:</h3>
              <div
                className="text-sm whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: result.response
                    .replace(/\n/g, "<br/>")
                    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                    .replace(/\*(.*?)\*/g, "<i>$1</i>"),
                }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
            <p className="text-sm opacity-90 mb-1">Today's Calories</p>
            <p className="text-3xl font-bold">1,450</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-xl shadow-lg">
            <p className="text-sm opacity-90 mb-1">Meals Logged</p>
            <p className="text-3xl font-bold">3</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-6 rounded-xl shadow-lg">
            <p className="text-sm opacity-90 mb-1">Weekly Average</p>
            <p className="text-3xl font-bold">1,680</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- History Page -------------------- */
function History() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/meals`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setList(sorted);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
          Food History
        </h1>
        <p className="text-gray-600 mb-8">Track all your previous meals and calorie intake</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No history yet. Start by uploading your first meal!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105">
                <img src={item.image_url} alt="food" className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                      <Flame className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="font-bold text-orange-600">{item.calories} kcal</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- App -------------------- */
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}