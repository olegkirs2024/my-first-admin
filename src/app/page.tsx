"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    const { error } = await supabase
      .from("requests")
      .insert([{ name, email, message, status: "New" }]);

    if (!error) {
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo" width={120} height={48} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contact Us</h1>
          <p className="mt-2 text-sm text-gray-400">Fill in the form and we'll get back to you</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Request submitted successfully</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccess(false); }}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSuccess(false); }}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setSuccess(false); }}
                placeholder="Write your message..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!name || !email || !message || loading}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
