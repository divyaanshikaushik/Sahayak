import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Brain, Activity, Heart, ArrowRight, Users, BarChart as ChartBar } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-lg p-2 rounded-full">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-white">Sahayak</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all duration-200"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="relative z-10 mb-12 lg:mb-0">
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-2xl ring-1 ring-white/20">
                <h1 className="text-5xl font-bold tracking-tight text-white mb-6">
                  Advanced Medical
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                    Diagnostic System
                  </span>
                </h1>
                <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                  Revolutionizing healthcare with AI-powered diagnostics. Enhance your medical practice with precise analysis and data-driven insights.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="group inline-flex items-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center ring-1 ring-white/20">
                  <div className="text-3xl font-bold text-white mb-1">90%</div>
                  <div className="text-sm text-blue-200">Accuracy</div>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center ring-1 ring-white/20">
                  <div className="text-3xl font-bold text-white mb-1">5K+</div>
                  <div className="text-sm text-blue-200">Active Doctors</div>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center ring-1 ring-white/20">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-blue-200">Availability</div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="relative">
              <div className="space-y-6">
                {/* AI Analysis Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-lg rounded-2xl p-6 ring-1 ring-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <Brain className="h-8 w-8 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI-Powered Analysis</h3>
                      <p className="text-sm text-blue-200">Advanced diagnostic support system</p>
                    </div>
                  </div>
                </div>

                {/* Patient Management Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 ring-1 ring-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Patient Management</h3>
                      <p className="text-sm text-blue-200">Streamlined patient care workflow</p>
                    </div>
                  </div>
                </div>

                {/* Real-time Monitoring Card */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-6 ring-1 ring-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Real-time Monitoring</h3>
                      <p className="text-sm text-blue-200">Continuous health tracking</p>
                    </div>
                  </div>
                </div>

                {/* Analytics Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 ring-1 ring-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <ChartBar className="h-8 w-8 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Advanced Analytics</h3>
                      <p className="text-sm text-blue-200">Data-driven medical insights</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Heart Animation */}
              <div className="absolute -top-4 -right-4 animate-pulse">
                <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-lg p-8 rounded-full">
                  <Heart className="h-12 w-12 text-red-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}