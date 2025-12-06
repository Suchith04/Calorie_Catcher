import React from "react";
import { Link } from "react-router-dom";
import { Flame, Camera, TrendingUp, AlertCircle, Activity } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function saveToken(token) { localStorage.setItem("cc_token", token); }
function getToken() { return localStorage.getItem("cc_token"); }

export function Landing() {
  const token = getToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Flame className="w-4 h-4" />
              <span>Gamified Nutrition Tracking</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Track Calories.
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Pay Your Debt.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              A revolutionary approach to nutrition tracking with calorie debt, social penalties, and sleep-based adjustments. Stay accountable or face the consequences!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!token ? (
                <>
                  <Link to="/signup" className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="px-8 py-4 bg-white text-orange-500 border-2 border-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-200">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Unique Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border-t-4 border-orange-500">
              <AlertCircle className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calorie Debt System</h3>
              <p className="text-gray-600 text-sm">Overeat today? Go into debt. Exercise later to pay it back. It's like a calorie bank account!</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border-t-4 border-red-500">
              <Camera className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Penalties</h3>
              <p className="text-gray-600 text-sm">Exceed limits significantly? Face charity donations or social media lockouts. Stay accountable!</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border-t-4 border-blue-500">
              <Activity className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sleep Adjustment</h3>
              <p className="text-gray-600 text-sm">Slept poorly? Your calorie target adjusts automatically to protect your health and recovery.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border-t-4 border-green-500">
              <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Food Recognition</h3>
              <p className="text-gray-600 text-sm">Snap a photo, get instant calorie analysis. Powered by advanced image recognition technology.</p>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Serious About Nutrition?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join the accountability revolution. Track, debt, and pay it back through action.
          </p>
          <Link to="/signup" className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Start Your Journey
          </Link>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-white">Calorie Catcher</span>
          </div>
          <p className="text-sm">Your gamified nutrition accountability partner</p>
        </div>
      </footer>
    </div>
  );
}