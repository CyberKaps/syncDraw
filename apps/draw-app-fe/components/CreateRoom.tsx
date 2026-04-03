"use client";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";

export function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in first");
      setLoading(false);
      router.push("/signin");
      return;
    }

    try {
      const payload: { name: string; password?: string } = { name: roomName };
      if (usePassword && password) {
        payload.password = password;
      }

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const { slug } = response.data;
      if (slug) {
        router.push(`/canvas/${slug}`);
      } else {
        throw new Error("Failed to create room");
      }
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to create room";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 m-2 bg-white rounded-2xl border border-gray-200 shadow-2xl w-[450px]">
      <h1 className="text-black text-3xl text-center font-bold mb-2">
        Create a Room
      </h1>
      <p className="text-gray-500 text-center mb-6 text-sm">
        Start a new collaborative whiteboard session
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Name
        </label>
        <Input
          type="text"
          placeholder="e.g., Team Brainstorm"
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={usePassword}
            onChange={(e) => setUsePassword(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Protect with password (optional)
          </span>
        </label>
      </div>

      {usePassword && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter room password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <Button
        className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
        onClick={handleCreateRoom}
      >
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </div>
  );
}
