import React, { useState, useEffect } from 'react';
import { Calendar, Flame, TrendingUp, X, ChevronRight, Award, AlertCircle, BarChart3, Table2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function getToken() { return localStorage.getItem("cc_token"); }

export default function History() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [trendViewMode, setTrendViewMode] = useState('table'); // 'table' or 'graph'

  useEffect(() => {
    fetchHistory();
    fetchTrend();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/meals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrend() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/trends?days=14`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Transform data for recharts
      const formattedData = data.map(item => ({
        date: item._id,
        calories: item.calories,
        formattedDate: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
      setTrendData(formattedData);
    } catch (err) {
      console.error("Error fetching trends:", err);
    }
  }

  function openMealDetail(meal) {
    setSelectedMeal(meal);
    setShowDetailPanel(true);
  }

  function closeMealDetail() {
    setShowDetailPanel(false);
    setTimeout(() => setSelectedMeal(null), 300); // Wait for animation
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Meal History</h1>
        <p className="text-gray-600 mb-8">Review your nutrition journey</p>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800">14-Day Calorie Trend</h2>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTrendViewMode('table')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                    trendViewMode === 'table'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  <span className="font-medium">Table</span>
                </button>
                <button
                  onClick={() => setTrendViewMode('graph')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                    trendViewMode === 'graph'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Graph</span>
                </button>
              </div>
            </div>

            {trendViewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-gray-700">Total Calories</th>
                      <th className="px-4 py-3 text-left text-gray-700">Visual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trendData.map((day, idx) => (
                      <tr key={idx} className="hover:bg-orange-50 transition">
                        <td className="px-4 py-3 text-gray-600">{day.formattedDate}</td>
                        <td className="px-4 py-3 font-semibold text-orange-600">{day.calories} cal</td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((day.calories / 3000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Area Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Calorie Intake Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                        label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCalories)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Daily Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                        label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                        cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                      />
                      <Bar 
                        dataKey="calories" 
                        fill="#f97316"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Trend Line</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                        label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Average</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(trendData.reduce((sum, d) => sum + d.calories, 0) / trendData.length)}
                    </p>
                    <p className="text-xs text-gray-500">cal/day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Highest</p>
                    <p className="text-2xl font-bold text-red-600">
                      {Math.max(...trendData.map(d => d.calories))}
                    </p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Lowest</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.min(...trendData.map(d => d.calories))}
                    </p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meals Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">All Meals</h2>
            <p className="text-orange-100 text-sm">Click any meal to view detailed breakdown</p>
          </div>

          {meals.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No meals logged yet. Start by uploading your first meal!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">Image</th>
                    <th className="px-6 py-3 text-left text-gray-700">Date & Time</th>
                    <th className="px-6 py-3 text-left text-gray-700">Meal Type</th>
                    <th className="px-6 py-3 text-left text-gray-700">Calories</th>
                    <th className="px-6 py-3 text-left text-gray-700">Confidence</th>
                    <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {meals.map((meal, idx) => (
                    <tr key={idx} className="hover:bg-orange-50 transition cursor-pointer" onClick={() => openMealDetail(meal)}>
                      <td className="px-6 py-4">
                        <img
                          src={meal.image_url}
                          alt="Meal"
                          className="w-20 h-16 object-cover rounded-lg shadow"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {new Date(meal.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(meal.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          meal.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-700' :
                          meal.mealType === 'lunch' ? 'bg-green-100 text-green-700' :
                          meal.mealType === 'dinner' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {meal.mealType || 'snack'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          <span className="font-bold text-orange-600">{meal.calories}</span>
                          <span className="text-gray-500 text-sm">kcal</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 w-fit ${
                          meal.confidence === 'High' ? 'bg-green-100 text-green-700' :
                          meal.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {meal.confidence === 'High' && <Award className="w-3 h-3" />}
                          {meal.confidence === 'Medium' && <AlertCircle className="w-3 h-3" />}
                          {meal.confidence === 'Low' && <AlertCircle className="w-3 h-3" />}
                          <span>{meal.confidence}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openMealDetail(meal);
                          }}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {meals.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white">
              <p className="text-orange-100 mb-1">Total Meals</p>
              <p className="text-4xl font-bold">{meals.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg p-6 text-white">
              <p className="text-blue-100 mb-1">Total Calories</p>
              <p className="text-4xl font-bold">
                {meals.reduce((sum, m) => sum + m.calories, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg shadow-lg p-6 text-white">
              <p className="text-green-100 mb-1">Avg per Meal</p>
              <p className="text-4xl font-bold">
                {Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / meals.length)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel Detail View */}
      {showDetailPanel && selectedMeal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={closeMealDetail}
          ></div>

          {/* Side Panel */}
          <div className={`fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ${
            showDetailPanel ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-2xl font-bold text-white">Meal Details</h3>
                <p className="text-orange-100 text-sm">
                  {new Date(selectedMeal.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={closeMealDetail}
                className="p-2 hover:bg-orange-600 rounded-full transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={selectedMeal.image_url}
                  alt="Meal"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Total Calories</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{selectedMeal.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Confidence</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{selectedMeal.confidence}</p>
                  <p className="text-xs text-gray-500">AI accuracy</p>
                </div>
              </div>

              {/* Meal Type & Debt Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Meal Type</span>
                  <div className={`mt-1 px-4 py-2 rounded-full text-sm font-medium inline-block ${
                    selectedMeal.mealType === 'breakfast' ? 'bg-yellow-100 text-yellow-700' :
                    selectedMeal.mealType === 'lunch' ? 'bg-green-100 text-green-700' :
                    selectedMeal.mealType === 'dinner' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedMeal.mealType || 'snack'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Target Status</span>
                  <div className={`mt-1 px-4 py-2 rounded-full text-sm font-medium inline-block ${
                    selectedMeal.withinTarget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedMeal.withinTarget ? '✓ Within Target' : `+${selectedMeal.contributedToDebt} cal debt`}
                  </div>
                </div>
              </div>

              {/* Food Items Breakdown */}
              {selectedMeal.foodItems && selectedMeal.foodItems.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <span>🍽️</span>
                    <span>Food Items Breakdown</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedMeal.foodItems.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.portion}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{item.calories}</p>
                            <p className="text-xs text-gray-500">kcal</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Macronutrients */}
              {selectedMeal.macronutrients && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">📊 Macronutrients</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center border border-red-200">
                      <p className="text-sm text-gray-600 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-red-600">{selectedMeal.macronutrients.protein}g</p>
                      <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((selectedMeal.macronutrients.protein / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
                      <p className="text-sm text-gray-600 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-yellow-600">{selectedMeal.macronutrients.carbs}g</p>
                      <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((selectedMeal.macronutrients.carbs / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Fats</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedMeal.macronutrients.fats}g</p>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((selectedMeal.macronutrients.fats / 70) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Notes */}
              {selectedMeal.healthNotes && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">💡 Health Notes</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedMeal.healthNotes}</p>
                  </div>
                </div>
              )}

              {/* Full AI Analysis */}
              {selectedMeal.analysisText && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">🤖 Full AI Analysis</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedMeal.analysisText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}