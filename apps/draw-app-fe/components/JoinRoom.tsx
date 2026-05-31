"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";

export function JoinRoom() {
  const [roomSlug, setRoomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinRoom = async () => {
    setLoading(true);
    setError(null);

    if (!roomSlug.trim()) {
      setError("Please enter a room name");
      setLoading(false);
      return;
    }

    try {
      // First, verify the room and check if password is needed
      const verifyResponse = await axios.post(`${HTTP_BACKEND}/room/verify`, {
        slug: roomSlug,
        password: password || undefined
      });

      if (verifyResponse.data.success) {
        if (password) {
          sessionStorage.setItem(`room_password_${roomSlug}`, password);
        }
        router.push(`/canvas/${roomSlug}`);
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { error?: string }; status?: number } };
      const errorMessage = errorResponse.response?.data?.error;
      
      if (errorMessage === "Incorrect password") {
        setError("Incorrect password");
        setShowPasswordField(true);
      } else if (errorResponse.response?.status === 403 && !showPasswordField) {
        // Room requires password
        setShowPasswordField(true);
        setError("This room requires a password");
      } else {
        setError(errorMessage || "Room not found");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 m-2 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl w-[450px]">
      <h1 className="text-white text-3xl text-center font-bold mb-2">
        Join a Room
      </h1>
      <p className="text-zinc-400 text-center mb-6 text-sm">
        Enter the room name to join the session
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Room Name
        </label>
        <Input
          type="text"
          placeholder="Enter room name"
          onChange={(e) => setRoomSlug(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleJoinRoom();
            }
          }}
          className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      {showPasswordField && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter room password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoinRoom();
              }
            }}
            className="w-full bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <Button
        className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
        onClick={handleJoinRoom}
      >
        {loading ? "Joining..." : "Join Room"}
      </Button>
    </div>
  );
}
