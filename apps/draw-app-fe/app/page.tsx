"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Pencil, Share2, Users2, Sparkles, Github, Palette, Video, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateRoom } from "@/components/CreateRoom";
import { JoinRoom } from "@/components/JoinRoom";
import { Dashboard } from "@/components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Palette className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Collab Canvas
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="h-10 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    Create Room
                  </Button>
                  <Button 
                    className="h-10 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    Join Room
                  </Button>
                  <Button 
                    className="h-10 px-4 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button className="h-10 px-4 text-gray-600 hover:text-gray-900 transition-colors">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="h-10 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal for Create Room */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="relative animate-in zoom-in duration-200">
            <button
              onClick={() => setShowCreateRoom(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10 border border-gray-200"
            >
              ✕
            </button>
            <CreateRoom />
          </div>
        </div>
      )}

      {/* Modal for Join Room */}
      {showJoinRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="relative animate-in zoom-in duration-200">
            <button
              onClick={() => setShowJoinRoom(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10 border border-gray-200"
            >
              ✕
            </button>
            <JoinRoom />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Real-time collaborative whiteboard</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Draw Together,
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block mt-2">
                Create Better
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate collaborative whiteboard for teams. Draw, brainstorm, and create together in real-time from anywhere in the world.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="h-14 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg font-medium flex items-center gap-2"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    Create New Room
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    className="h-14 px-8 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-lg font-medium"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    Join Existing Room
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="h-14 px-8 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg font-medium flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button className="h-14 px-8 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-lg font-medium">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free forever • Unlimited collaborators
            </p>
          </div>
        </div>
      </header>

      {/* Dashboard Section - Only visible when logged in */}
      {isLoggedIn && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Dashboard />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make remote collaboration feel effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Share2 className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together with your team in real-time. See changes instantly as they happen with low-latency WebSocket connections.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiplayer Editing</h3>
              <p className="text-gray-600 leading-relaxed">
                Multiple users can edit the same canvas simultaneously. Perfect for brainstorming sessions and team workshops.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Pencil className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Drawing Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                Circles, rectangles, arrows, lines, diamonds, and freehand drawing. Everything you need to express your ideas.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Built with performance in mind. No lag, no delays. Just smooth, responsive drawing experience.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                All changes are synced in real-time across all connected users. No refresh needed, ever.
              </p>
            </Card>

            <Card className="p-8 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-2xl bg-white">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Simple & Intuitive</h3>
              <p className="text-gray-600 leading-relaxed">
                Clean interface that gets out of your way. Start drawing in seconds with no learning curve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get started in seconds
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start collaborating
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up for free in seconds. No credit card required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create or Join Room</h3>
              <p className="text-gray-600">
                Start a new room or join an existing one with a room code.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Drawing</h3>
              <p className="text-gray-600">
                Collaborate in real-time with your team. It&apos;s that simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to start creating together?
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Join thousands of teams already using SyncDraw for their collaborative whiteboarding needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="h-14 px-8 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg text-lg font-medium flex items-center gap-2"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    Create New Room
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    className="h-14 px-8 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all text-lg font-medium"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    Join a Room
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="h-14 px-8 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg text-lg font-medium flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button className="h-14 px-8 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all text-lg font-medium">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">SyncDraw</span>
            </div>
            
            <p className="text-sm">
              © 2025 SyncDraw. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <a href="https://github.com" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;