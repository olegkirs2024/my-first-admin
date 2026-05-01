"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "New" | "In Progress" | "Done";
type Priority = "low" | "medium" | "high";

interface Request {
  id: number;
  name: string;
  email: string;
  message: string;
  status: Status;
  created_at: string;
}

interface AISummary {
  summary: string;
  priority: Priority;
  next_step: string;
}

const statusStyles: Record<Status, string> = {
  "New": "bg-blue-50 text-blue-600",
  "In Progress": "bg-amber-50 text-amber-600",
  "Done": "bg-green-50 text-green-600",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-red-50 text-red-500",
};

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<Status | "All">("All");
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<number, AISummary | "loading" | "error">>({});

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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

  async function fetchAISummary(req: Request) {
    setSummaries((prev) => ({ ...prev, [req.id]: "loading" }));
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: req.name, email: req.email, message: req.message }),
      });
      if (!res.ok) throw new Error();
      const data: AISummary = await res.json();
      setSummaries((prev) => ({ ...prev, [req.id]: data }));
    } catch {
      setSummaries((prev) => ({ ...prev, [req.id]: "error" }));
    }
  }

  const filteredRequests =
    filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo" width={120} height={48} className="object-contain" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-400">Manage incoming requests</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
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
            {filteredRequests.map((req) => {
              const summary = summaries[req.id];
              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

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

                  {/* AI Summary block */}
                  {summary === "loading" && (
                    <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-gray-400 animate-pulse">
                      Analyzing with AI...
                    </div>
                  )}
                  {summary === "error" && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-400">
                      Failed to get AI summary. Try again.
                    </div>
                  )}
                  {summary && summary !== "loading" && summary !== "error" && (
                    <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636 6.364l.707-.707M12 21v-1m-6.364-1.636l.707-.707" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Summary</span>
                        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyles[summary.priority]}`}>
                          {summary.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{summary.summary}</p>
                      <div className="flex items-start gap-1.5 pt-1">
                        <span className="text-xs text-gray-400 shrink-0 mt-0.5">→</span>
                        <p className="text-xs text-gray-500">{summary.next_step}</p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
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
                    <button
                      onClick={() => fetchAISummary(req)}
                      disabled={summary === "loading"}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636 6.364l.707-.707M12 21v-1m-6.364-1.636l.707-.707" />
                      </svg>
                      AI Summary
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
