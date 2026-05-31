"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignin ? "/signin" : "/signup";
      const payload = isSignin 
        ? { username: email, password }
        : { username: email, password, name };

      const response = await axios.post(
        `${HTTP_BACKEND}${endpoint}`,
        payload
      );

      if (isSignin) {
        const { token } = response.data;
        if (token) {
          localStorage.setItem("token", token);
          router.push("/");
        } else {
          throw new Error("No token received");
        }
      } else {
        const { userId } = response.data;
        if (userId) {
          router.push("/signin");
        } else {
          throw new Error("Signup failed");
        }
      }
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4 relative overflow-hidden">
      {/* Dynamic Background identical to page.tsx */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen animate-pulse" />
      </div>

      <div className="p-10 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isSignin 
              ? "Sign in to continue to SyncDraw" 
              : "Get started with your free account"}
          </p>
        </div>

        {!isSignin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email Address
          </label>
          <Input
            type="text"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg mb-4"
          onClick={handleAuth}
        >
          {loading ? "Loading..." : isSignin ? "Sign In" : "Create Account"}
        </Button>

        <div className="text-center mt-6">
          <Link 
            href={isSignin ? "/signup" : "/signin"}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isSignin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}