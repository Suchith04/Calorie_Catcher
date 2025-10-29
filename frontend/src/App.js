import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

// =========================
// Minimal Tailwind-ready single-file React app
// Export default App component. Use this in a Vite or CRA project with Tailwind configured.
// Replace API_BASE with your backend base URL.
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

/* -------------------- Nav -------------------- */
function Nav() {
  const token = getToken();
  const navigate = useNavigate();
  function handleLogout() {
    clearToken();
    navigate("/");
  }
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">Calorie Catcher</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hidden sm:inline">Home</Link>
          <Link to="/dashboard" className="hidden sm:inline">Dashboard</Link>
          <Link to="/history" className="hidden sm:inline">History</Link>
          {token ? (
            <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white">Logout</button>
          ) : (
            <Link to="/login" className="px-3 py-1 rounded bg-blue-600 text-white">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* -------------------- Landing Page -------------------- */
function Landing() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl text-center p-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Calorie Catcher</h1>
        <p className="text-gray-700 mb-6">Snap a photo of your meal and get quick calorie estimates — keep track of what you eat with an easy history view.</p>
        <div className="space-x-3">
  {!getToken() ? (
    <>
      <Link
        to="/signup"
        className="px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        Get started
      </Link>
      <Link
        to="/login"
        className="px-6 py-3 border border-gray-300 rounded-lg"
      >
        Login
      </Link>
    </>
  ) : (
    <Link
      to="/dashboard"
      className="px-6 py-3 bg-blue-600 text-white rounded-lg"
    >
      Go to Dashboard
    </Link>
  )}
</div>

      </div>
      <div className="w-full max-w-5xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Feature title="Snap a photo" desc="Upload a photo of your meal." />
          <Feature title="Get calories" desc="AI estimates calories and returns results." />
          <Feature title="Track history" desc="See your past uploads with date & calories." />
        </div>
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

/* -------------------- Auth Pages -------------------- */
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
      if(!res.ok) throw new Error(data.message || "Login failed");
      saveToken(data.token);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
      <form onSubmit={handleLogin} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-2 border rounded" />
        <button className="w-full py-2 bg-blue-600 text-white rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">Don't have an account? <Link to="/signup" className="text-blue-600">Sign up</Link></p>
    </div>
  );
}

function Signup() {
  const [name,setName] = useState("");
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
        body: JSON.stringify({ name,email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      saveToken(data.token);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
      <form onSubmit={handleSignup} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" type="text" required className="w-full p-2 border rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full p-2 border rounded" />
        <button className="w-full py-2 bg-green-600 text-white rounded">Create account</button>
      </form>
      <p className="mt-3 text-sm">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
    </div>
  );
}

/* -------------------- Dashboard -------------------- */
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
      // expected backend to return { imageUrl, calories, date }
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
      <p className="text-sm text-gray-600 mb-4">Upload a photo of your food to receive calorie analysis.</p>
      <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex items-center gap-4 flex-col sm:flex-row">
          <label className="w-full sm:w-auto flex-1">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} className="w-full" />
          </label>
          <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Analyzing...' : 'Upload & Analyze'}</button>
        </div>
        {preview && <img src={preview} alt="preview" className="max-h-40 object-cover rounded" />}
      </form>

      {result && (
  <div className="mt-6 bg-white rounded p-4 shadow">
    <div className="flex gap-4 items-center mb-4">
      <img
        src={result.image_url}
        alt="result"
        className="w-32 h-24 object-cover rounded"
      />
      <div>
        <div className="text-xl font-semibold">{result.calories} kcal</div>
        <div className="text-sm text-gray-600">{result.date}</div>
      </div>
    </div>

    <hr className="my-3" />

    {/* Display the server's analysis response with proper formatting */}
    <div className="prose max-w-none text-gray-800">
      <h3 className="text-lg font-semibold mb-2">Server Analysis:</h3>
      <div
        className="text-sm whitespace-pre-line"
        dangerouslySetInnerHTML={{
          __html: result.response
            .replace(/\n/g, "<br/>") // preserve line breaks
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // make **bold** work
            .replace(/\*(.*?)\*/g, "<i>$1</i>"), // make *italic* work
        }}
      />
    </div>
  </div>
)}

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
        // expects array of { imageUrl, calories, date }
        const sorted = (data || []).sort((a,b)=> new Date(b.date) - new Date(a.date));
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
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      {loading ? (
        <div>Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-gray-600">No history yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((item, idx) => (
            <HistoryCard key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <img src={item.image_url} alt="food" className="w-full h-44 object-cover" />
      <div className="p-3">
        <div className="font-semibold text-lg">{item.calories} kcal</div>
        <div className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</div>
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
