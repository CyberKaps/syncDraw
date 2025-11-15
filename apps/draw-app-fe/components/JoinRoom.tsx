"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";

export function JoinRoom() {
  const [roomSlug, setRoomSlug] = useState("");
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
      const response = await axios.get(`${HTTP_BACKEND}/room/${roomSlug}`);

      const { room } = response.data;
      if (room) {
        router.push(`/canvas/${roomSlug}`);
      } else {
        setError("Room not found");
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Room not found";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 m-2 bg-white rounded-2xl border border-gray-200 shadow-2xl w-[450px]">
      <h1 className="text-black text-3xl text-center font-bold mb-2">
        Join a Room
      </h1>
      <p className="text-gray-500 text-center mb-6 text-sm">
        Enter the room name to join the session
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
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
