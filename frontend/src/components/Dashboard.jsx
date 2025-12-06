import React, { useState, useEffect } from 'react';
import { Upload, Flame, TrendingUp, Activity as ActivityIcon, Moon, AlertTriangle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function getToken() { return localStorage.getItem("cc_token"); }

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [sleepHours, setSleepHours] = useState(8);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activityType: '',
    duration: '',
    caloriesBurned: ''
  });
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function fetchDashboardData() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Choose a photo");
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/meals`, {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      console.log(data);
      setResult(data);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSleepUpdate() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/sleep`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sleepHours })
      });
      const data = await res.json();
      alert(data.recommendation);
      setShowSleepModal(false);
      fetchDashboardData();
    } catch (err) {
      alert("Error updating sleep");
    }
  }

  async function handleActivitySubmit() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activityForm)
      });
      const data = await res.json();
      alert(`Activity logged! ${data.debtRepaid} calories repaid from debt.`);
      setShowActivityModal(false);
      setActivityForm({ activityType: '', duration: '', caloriesBurned: '' });
      fetchDashboardData();
    } catch (err) {
      alert("Error logging activity");
    }
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Stats Overview Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Metric</th>
                <th className="px-6 py-4 text-left">Today</th>
                <th className="px-6 py-4 text-left">This Week</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-orange-50 transition">
                <td className="px-6 py-4 font-semibold flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Calories</span>
                </td>
                <td className="px-6 py-4">{dashboardData.stats.today.calories} / {dashboardData.stats.today.target}</td>
                <td className="px-6 py-4">{dashboardData.stats.week.avgCalories} avg</td>
                <td className="px-6 py-4">
                  {dashboardData.stats.today.remaining >= 0 ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{dashboardData.stats.today.remaining} left</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{Math.abs(dashboardData.stats.today.remaining)} over</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-orange-50 transition">
                <td className="px-6 py-4 font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Meals Logged</span>
                </td>
                <td className="px-6 py-4">{dashboardData.stats.today.mealCount}</td>
                <td className="px-6 py-4">{dashboardData.stats.user.totalMeals} total</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{dashboardData.stats.user.streak} day streak</span>
                </td>
              </tr>
              <tr className="hover:bg-orange-50 transition">
                <td className="px-6 py-4 font-semibold flex items-center space-x-2">
                  <ActivityIcon className="w-5 h-5 text-green-500" />
                  <span>Exercise</span>
                </td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">{dashboardData.stats.week.totalBurned} cal burned</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{dashboardData.stats.week.totalExerciseMinutes} min</span>
                </td>
              </tr>
              <tr className="hover:bg-red-50 transition">
                <td className="px-6 py-4 font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Calorie Debt</span>
                </td>
                <td className="px-6 py-4 text-red-600 font-bold">{dashboardData.debt.currentDebt} cal</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    dashboardData.debt.status === 'clear' ? 'bg-green-100 text-green-700' :
                    dashboardData.debt.status === 'high' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {dashboardData.debt.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowSleepModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Moon className="w-5 h-5" />
            <span>Update Sleep ({dashboardData.sleep.lastSleepHours}h)</span>
          </button>
          <button
            onClick={() => setShowActivityModal(true)}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-4 rounded-lg hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <ActivityIcon className="w-5 h-5" />
            <span>Log Activity</span>
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload Meal</h2>
          <input
            type="file"
            id="foodImage"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="hidden"
          />
          <label
            htmlFor="foodImage"
            className="cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 transition bg-orange-50"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-60 rounded-lg" />
            ) : (
              <>
                <Upload className="w-16 h-16 text-orange-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700">Click to upload</p>
              </>
            )}
          </label>
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          )}
        </div>

        {/* Result */}
        {result && (

          <div className="relative w-full">
        {/* Outer Card */}
        <div className="animate-fadeIn bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200">

          {/* Header: Image + Calories */}
          <div className="flex items-start gap-6">

            {/* Meal Image */}
            <div className="relative">
              <img
                src={result.image_url}
                alt="Meal"
                className="w-40 h-32 rounded-xl object-cover shadow-md"
              />

              {/* Confidence Badge */}
              <span className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-md">
                Confidence: <span className="font-semibold">{result.analysis?.confidence}</span>
              </span>
            </div>

            {/* Calories */}
            <div className="flex flex-col justify-center">
              <div className="text-4xl font-extrabold text-orange-600 drop-shadow-sm">
                {result.analysis.calories} cal
              </div>

              {result.warning && (
                <div className="mt-2 text-red-600 font-semibold">
                  {result.warning}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-300"></div>

          {/* Food Items */}
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            🍽️ Food Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {result.analysis?.foodItems?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition shadow-sm"
              >
                <div className="text-lg font-semibold text-gray-700">{item.name}</div>
                <div className="text-sm text-gray-500">{item.portion}</div>
                <div className="mt-1 font-bold text-orange-600">{item.calories} kcal</div>
              </div>
            ))}
          </div>

          {/* Macros */}
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            ⚡ Macronutrients
          </h2>

          <div className="space-y-4 mb-6">
            {["protein", "carbs", "fats"].map((macro) => {
              const value = result.analysis.macronutrients[macro];
              const label = macro.charAt(0).toUpperCase() + macro.slice(1);

              return (
                <div key={macro}>
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>{label}</span>
                    <span>{value}g</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        macro === "protein"
                          ? "from-blue-400 to-blue-600"
                          : macro === "carbs"
                          ? "from-green-400 to-green-600"
                          : "from-red-400 to-red-600"
                      }`}
                      style={{ width: `${Math.min(value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Health Notes */}
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            💡 Health Notes
          </h2>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm text-gray-700 leading-relaxed">
            {(result.analysis.fullText || "").replace(/\*\*/g, "")}
          </div>

        </div>
          </div>
        )}


        {/* Modals */}
        {showSleepModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">Update Sleep Hours</h3>
              <input
                type="number"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg mb-4"
                placeholder="Hours of sleep"
                step="0.5"
                min="0"
                max="24"
              />
              <div className="flex space-x-3">
                <button onClick={handleSleepUpdate} className="flex-1 bg-indigo-500 text-white py-3 rounded-lg">
                  Update
                </button>
                <button onClick={() => setShowSleepModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">Log Activity</h3>
              <input
                type="text"
                value={activityForm.activityType}
                onChange={(e) => setActivityForm({...activityForm, activityType: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg mb-3"
                placeholder="Activity type (e.g., Running)"
              />
              <input
                type="number"
                value={activityForm.duration}
                onChange={(e) => setActivityForm({...activityForm, duration: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg mb-3"
                placeholder="Duration (minutes)"
              />
              <input
                type="number"
                value={activityForm.caloriesBurned}
                onChange={(e) => setActivityForm({...activityForm, caloriesBurned: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg mb-4"
                placeholder="Calories burned"
              />
              <div className="flex space-x-3">
                <button onClick={handleActivitySubmit} className="flex-1 bg-green-500 text-white py-3 rounded-lg">
                  Log Activity
                </button>
                <button onClick={() => setShowActivityModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}