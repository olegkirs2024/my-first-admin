"use client";

import { useState } from "react";

type Status = "New" | "In Progress" | "Done";

interface Request {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
  status: Status;
}

const statusStyles: Record<Status, string> = {
  "New": "bg-blue-50 text-blue-600",
  "In Progress": "bg-amber-50 text-amber-600",
  "Done": "bg-green-50 text-green-600",
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<Status | "All">("All");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;

    const newRequest: Request = {
      id: Date.now(),
      name,
      email,
      message,
      date: new Date().toLocaleString("ru-RU"),
      status: "New",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setName("");
    setEmail("");
    setMessage("");
  }

  const filteredRequests = filter === "All"
    ? requests
    : requests.filter((req) => req.status === filter);

  function updateStatus(id: number, status: Status) {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
          <p className="mt-2 text-gray-400 text-sm">My first AI-built app</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!name || !email || !message}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Requests list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Requests
            {requests.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </h2>

          {/* Filter tabs */}
          {requests.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["All", "New", "In Progress", "Done"] as const).map((tab) => {
                const count = tab === "All"
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
                    <span className={`ml-1.5 ${filter === tab ? "text-gray-300" : "text-gray-300"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-300 text-sm border border-dashed border-gray-200 rounded-2xl">
              {requests.length === 0 ? "No requests yet" : "No requests with this status"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  {/* Top row: name + status badge */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800">{req.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[req.status]}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Email + date */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{req.email}</p>
                    <p className="text-xs text-gray-300">{req.date}</p>
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

      </div>
    </main>
  );
}
