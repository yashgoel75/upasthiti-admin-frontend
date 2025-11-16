"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/context/theme";
import { Bell, Search } from "lucide-react";

export default function Account() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme == "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search your things"
              className={`w-full border-2 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors ${
                theme == "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <button
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
              theme == "dark"
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Bell
              className={`w-5 h-5 ${
                theme == "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </button>
        </div>
        <div
          className={`min-h-screen p-2 md:p-8 transition-colors ${
            theme == "dark" ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1
                className={`text-3xl font-bold transition-colors ${
                  theme == "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Manage Teachers
              </h1>
              <p
                className={`mt-1 transition-colors ${
                  theme == "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage teachers' information
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
