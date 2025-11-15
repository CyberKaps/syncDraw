"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { Button } from "@repo/ui/button";
import { Trash2, Lock, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Room {
  id: number;
  slug: string;
  password: string | null;
  createdAt: string;
}

export function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${HTTP_BACKEND}/user/rooms`, {
        headers: {
          Authorization: token,
        },
      });

      setRooms(response.data.rooms);
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${HTTP_BACKEND}/room/${slug}`, {
        headers: {
          Authorization: token,
        },
      });

      // Refresh the rooms list
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete room");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-lg mb-2">No rooms yet</p>
        <p className="text-gray-500 text-sm">Create your first room to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Rooms</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  {room.slug}
                  {room.password && (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                </h4>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteRoom(room.slug)}
                className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            
            <Button
              onClick={() => router.push(`/canvas/${room.slug}`)}
              className="w-full bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Open Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
