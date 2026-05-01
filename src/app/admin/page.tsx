"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Status = "New" | "In Progress" | "Done";

interface Request {
  id: number;
  name: string;
  email: string;
  message: string;
  status: Status;
  created_at: string;
}

const statusStyles: Record<Status, string> = {
  "New": "bg-blue-50 text-blue-600",
  "In Progress": "bg-amber-50 text-amber-600",
  "Done": "bg-green-50 text-green-600",
};

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<Status | "All">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) {
        setRequests(data as Request[]);
      }
      setLoading(false);
    }

    fetchRequests();
  }, []);

  async function updateStatus(id: number, status: Status) {
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );
    }
  }

  const filteredRequests =
    filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-sm text-gray-400">Manage incoming requests</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["All", "New", "In Progress", "Done"] as const).map((tab) => {
            const count =
              tab === "All"
                ? requests.length
                : requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === tab
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {tab}
                <span className="ml-1.5 text-gray-300">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Requests */}
        {loading ? (
          <div className="text-center py-16 text-gray-300 text-sm">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-gray-300 text-sm border border-dashed border-gray-200 rounded-2xl">
            {requests.length === 0 ? "No requests yet" : "No requests with this status"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-800">{req.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[req.status]}`}>
                    {req.status}
                  </span>
                </div>

                {/* Email + date */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">{req.email}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(req.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{req.message}</p>

                {/* Status buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, "In Progress")}
                    disabled={req.status === "In Progress" || req.status === "Done"}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, "Done")}
                    disabled={req.status === "Done"}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
