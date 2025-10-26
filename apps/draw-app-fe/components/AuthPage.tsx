"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/${isSignin ? "signin" : "signup"}`,
        { email, password },
        {
          withCredentials: false, // set to true only if using cookie-based auth
        }
      );

      const { token, message } = response.data;

      if (token) {
        // ✅ Store JWT token in localStorage
        localStorage.setItem("token", token);

        // Optional: Redirect to dashboard
        // router.push("/dashboard");
        alert(message || "Success!");
      } else {
        throw new Error("No token received");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Auth failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-8 m-2 bg-white rounded border w-[300px]">
        <h1 className="text-black text-2xl text-center font-bold my-2">
          {isSignin ? "Sign in" : "Sign up"}
        </h1>

        <div className="p-2 text-black rounded">
          <Input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
        </div>

        <div className="p-2 text-black">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center my-2">{error}</p>
        )}

        <div className="p-2 flex justify-center">
          <Button
            className="bg-black text-white p-2 w-full rounded"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? "Loading..." : isSignin ? "Sign in" : "Sign up"}
          </Button>
        </div>

        <div className="text-center mt-2">
          <Link href={isSignin ? "/signup" : "/signin"}>
            {isSignin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
