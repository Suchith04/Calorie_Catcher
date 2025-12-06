import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, TrendingDown, CheckCircle, DollarSign, Lock } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function getToken() { return localStorage.getItem("cc_token"); }

export default function DebtTracker() {
  const [debtData, setDebtData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    fetchDebtData();
    fetchActivities();
  }, []);

  async function fetchDebtData() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDebtData(data.debt);
      setPenalties(data.penalties || []);
    } catch (err) {
      console.error("Error fetching debt data:", err);
    }
  }

  async function fetchActivities() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  }

  async function completePenalty(penaltyId) {
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/penalties/${penaltyId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Penalty marked as completed!");
      fetchDebtData();
    } catch (err) {
      alert("Error completing penalty");
    }
  }

  if (!debtData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Calorie Debt System</h1>
        <p className="text-gray-600 mb-8">Track your calorie surplus and work it off through exercise</p>

        {/* Debt Status */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Debt</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-red-600">{debtData.currentDebt}</span>
                <span className="text-2xl text-gray-500">calories</span>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full text-lg font-semibold ${
              debtData.status === 'clear' ? 'bg-green-100 text-green-700' :
              debtData.status === 'high' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {debtData.status.toUpperCase()}
            </div>
          </div>

          {debtData.currentDebt > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-red-800">You are in calorie debt!</p>
                  <p className="text-red-700 mt-1">Clear your debt through exercise to get back on track.</p>
                </div>
              </div>
            </div>
          )}

          {/* Today's Balance */}
          {debtData.todayBalance && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Today's Balance</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consumed: {debtData.todayBalance.consumed} cal</span>
                <span className="text-gray-600">Target: {debtData.todayBalance.target} cal</span>
                <span className={`font-semibold ${debtData.todayBalance.isOverTarget ? 'text-red-600' : 'text-green-600'}`}>
                  {debtData.todayBalance.isOverTarget ? '+' : ''}{debtData.todayBalance.balance} cal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Exercises */}
        {debtData.currentDebt > 0 && debtData.suggestedExercises && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Clear Your Debt</h2>
              <p className="text-green-100">Choose an activity to start repaying your calorie debt</p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Exercise</th>
                  <th className="px-6 py-3 text-left text-gray-700">Duration Needed</th>
                  <th className="px-6 py-3 text-left text-gray-700">Burn Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {debtData.suggestedExercises.map((exercise, idx) => (
                  <tr key={idx} className="hover:bg-green-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{exercise.name}</td>
                    <td className="px-6 py-4 text-gray-600">{exercise.duration} minutes</td>
                    <td className="px-6 py-4 text-gray-600">{exercise.caloriesPerMin} cal/min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Penalties */}
        {penalties.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Active Penalties</h2>
              <p className="text-red-100">You've exceeded your calorie target significantly</p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Overage</th>
                  <th className="px-6 py-3 text-left text-gray-700">Penalty Type</th>
                  <th className="px-6 py-3 text-left text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penalties.map((penalty, idx) => (
                  <tr key={idx} className="hover:bg-red-50 transition">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(penalty.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-red-600">+{penalty.caloriesOver} cal</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {penalty.penaltyType === 'charity' ? (
                          <>
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">Donate ${penalty.amount}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-red-600" />
                            <span className="text-gray-700">Social Media Lock ({Math.ceil((penalty.endDate - new Date()) / (1000 * 60 * 60 * 24))} days)</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => completePenalty(penalty._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Mark Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
            <p className="text-blue-100">Track your debt repayment progress</p>
          </div>
          {activities.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No activities logged yet. Start exercising to clear your debt!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Activity</th>
                  <th className="px-6 py-3 text-left text-gray-700">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-700">Calories Burned</th>
                  <th className="px-6 py-3 text-left text-gray-700">Debt Repaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{activity.activityType}</td>
                    <td className="px-6 py-4 text-gray-600">{activity.duration} min</td>
                    <td className="px-6 py-4 font-semibold text-green-600">{activity.caloriesBurned} cal</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-600">-{activity.debtRepaid} cal</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Debt-Free Badge */}
        {debtData.currentDebt === 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Debt Free!</h2>
            <p className="text-green-50 text-lg">You're on track with your calorie goals. Keep it up!</p>
          </div>
        )}
      </div>
    </div>
  );
}