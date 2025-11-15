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
    } catch (err: any) {
      const message = err.response?.data?.error || "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="p-10 bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-black text-3xl font-bold mb-2">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isSignin 
              ? "Sign in to continue to SyncDraw" 
              : "Get started with your free account"}
          </p>
        </div>

        {!isSignin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              onChange={(e: any) => setName(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="text"
            placeholder="you@example.com"
            onChange={(e: any) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            onChange={(e: any) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <Button
          className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg mb-4"
          onClick={handleAuth}
        >
          {loading ? "Loading..." : isSignin ? "Sign In" : "Create Account"}
        </Button>

        <div className="text-center">
          <Link 
            href={isSignin ? "/signup" : "/signin"}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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