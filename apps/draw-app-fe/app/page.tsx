"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Pencil, Share2, Users2, Sparkles, Github, Palette, Video, Zap, ArrowRight, Layers, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateRoom } from "@/components/CreateRoom";
import { JoinRoom } from "@/components/JoinRoom";
import { Dashboard } from "@/components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen animate-pulse" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? "bg-black/50 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                syncDraw
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                How it works
              </a>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/5 backdrop-blur-sm"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    Join Room
                  </Button>
                  <Button 
                    className="h-10 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] border border-indigo-500/30"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    Create Room
                  </Button>
                  <Button 
                    className="h-10 px-4 text-zinc-400 hover:text-white transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button className="h-10 px-5 text-zinc-400 hover:text-white transition-colors font-medium">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-lg transition-all font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowCreateRoom(false)}
              className="absolute -top-4 -right-4 bg-zinc-800 text-zinc-400 rounded-full p-2 hover:bg-zinc-700 hover:text-white transition-colors z-10 border border-white/10 shadow-xl"
            >
              ✕
            </button>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <CreateRoom />
            </div>
          </div>
        </div>
      )}

      {showJoinRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowJoinRoom(false)}
              className="absolute -top-4 -right-4 bg-zinc-800 text-zinc-400 rounded-full p-2 hover:bg-zinc-700 hover:text-white transition-colors z-10 border border-white/10 shadow-xl"
            >
              ✕
            </button>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <JoinRoom />
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Collaborative Whiteboard</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-8 animate-fade-in-up animation-delay-100">
              Draw Together,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Better
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              The ultimate collaborative canvas for forward-thinking teams. Brainstorm, design, and ideate in real-time with limitless creativity.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up animation-delay-300">
              {isLoggedIn ? (
                <>
                  <Button 
                    className="h-14 px-8 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all text-lg font-semibold flex items-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:scale-105 transform duration-300"
                    onClick={() => setShowCreateRoom(true)}
                  >
                    Start a Canvas
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    className="h-14 px-8 bg-zinc-900/50 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition-all text-lg font-medium backdrop-blur-sm hover:border-white/20"
                    onClick={() => setShowJoinRoom(true)}
                  >
                    Join Existing
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="h-14 px-8 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all text-lg font-semibold flex items-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:scale-105 transform duration-300">
                      Start Drawing Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button className="h-14 px-8 bg-zinc-900/50 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition-all text-lg font-medium backdrop-blur-sm hover:border-white/20">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mockup Preview */}
            <div className="mt-24 relative max-w-5xl mx-auto animate-fade-in-up animation-delay-400">
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10 h-full w-full" />
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-sm shadow-2xl transform perspective-1000 rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                <div className="rounded-xl overflow-hidden bg-black border border-white/5 relative aspect-video flex items-center justify-center">
                   <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                   <div className="relative flex flex-col items-center gap-4 opacity-50">
                     <MousePointer2 className="h-12 w-12 text-indigo-400" />
                     <p className="text-zinc-500 font-mono text-sm">Real-time canvas rendering</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        {isLoggedIn && (
          <section className="py-20 bg-zinc-900/30 border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-indigo-900/5 to-black/0"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="mb-12 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Your Workspace</h2>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                <Dashboard />
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">speed and flow</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Everything you need to capture ideas instantly, without the clutter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Share2 className="h-6 w-6 text-indigo-400" />,
                  title: "Real-time Sync",
                  desc: "Zero-latency collaboration powered by robust WebSockets. See cursors dance in real-time.",
                  bg: "bg-indigo-500/10",
                  border: "group-hover:border-indigo-500/50"
                },
                {
                  icon: <Users2 className="h-6 w-6 text-purple-400" />,
                  title: "Multiplayer Engine",
                  desc: "Handle dozens of concurrent users on the same canvas without breaking a sweat.",
                  bg: "bg-purple-500/10",
                  border: "group-hover:border-purple-500/50"
                },
                {
                  icon: <Layers className="h-6 w-6 text-pink-400" />,
                  title: "Infinite Canvas",
                  desc: "Never run out of space. Pan and zoom infinitely across a limitless workspace.",
                  bg: "bg-pink-500/10",
                  border: "group-hover:border-pink-500/50"
                },
                {
                  icon: <Zap className="h-6 w-6 text-amber-400" />,
                  title: "60 FPS Performance",
                  desc: "Hardware-accelerated rendering ensures buttery smooth drawing even on heavy boards.",
                  bg: "bg-amber-500/10",
                  border: "group-hover:border-amber-500/50"
                },
                {
                  icon: <Video className="h-6 w-6 text-emerald-400" />,
                  title: "State Persistence",
                  desc: "Your strokes are saved instantly. Drop off and pick right back up where you left.",
                  bg: "bg-emerald-500/10",
                  border: "group-hover:border-emerald-500/50"
                },
                {
                  icon: <Pencil className="h-6 w-6 text-cyan-400" />,
                  title: "Vector Perfection",
                  desc: "Crisp vector graphics that look perfect at any zoom level. No pixelation ever.",
                  bg: "bg-cyan-500/10",
                  border: "group-hover:border-cyan-500/50"
                }
              ].map((feature, i) => (
                <div key={i} className={`group p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm hover:bg-zinc-800/80 transition-all duration-300 ${feature.border}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} transition-transform group-hover:scale-110 duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center bg-zinc-900/80 border border-white/10 rounded-[3rem] p-12 md:p-20 backdrop-blur-xl shadow-2xl">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Elevate your team's creativity
              </h2>
              <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                Join the thousands of teams who have transformed their brainstorming process with syncDraw.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                {isLoggedIn ? (
                  <>
                    <Button 
                      className="h-14 px-10 bg-white text-black rounded-full hover:bg-zinc-200 transition-all text-lg font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:scale-105 duration-300"
                      onClick={() => setShowCreateRoom(true)}
                    >
                      Create a Canvas Now
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button className="h-14 px-10 bg-white text-black rounded-full hover:bg-zinc-200 transition-all text-lg font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:scale-105 duration-300">
                        Get Started for Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Palette className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-xl font-bold text-white">syncDraw</span>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-sm text-zinc-500">
            <p>
              © {new Date().getFullYear()} syncDraw. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span>Built with passion.</span>
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