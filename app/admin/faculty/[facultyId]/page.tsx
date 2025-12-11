"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { UserPen } from "lucide-react";
import {
  Camera,
  Mail,
  Phone,
  Building2,
  User,
  CreditCard,
  Shield,
  IdCard,
} from "lucide-react";
import { useAuth } from "../../../context/auth";
import { useTheme } from "@/app/context/theme";
import Footer from "@/app/components/footer/page";
import { useParams } from "next/navigation";

interface Settings {
  appearance: {
    theme: string;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

interface Faculty {
  _id: string;
  name: string;
  officialEmail: string;
  phone: string;
  departmentId: string;
  subjects: string;
  timetable: string;
  type: string;
  uid: string;
  facultyId: string;
  schoolId: string;
  profilePicture: string;
}

export default function FacultyPage() {
  const params = useParams();
  console.log(params.facultyId);

  const { schoolData } = useAuth();

  const [facultyData, setFacultyData] = useState<Faculty | null>(null);
  useEffect(() => {
    fetchFacultyData();
  }, []);

  async function fetchFacultyData() {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/faculty?uid=${params.facultyId}`
      );
      const data = res.data;
      setFacultyData(data.data);
      console.log(data.data);
    } catch (error) {
      console.error(error);
    }
  }

  const [settings, setSettings] = useState<Settings>({
    appearance: {
      theme: "light",
    },
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
    }
  }, []);

  return (
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
            Faculty Details
          </h1>
          <p
            className={`mt-1 transition-colors ${
              theme == "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and manage your faculty's information
          </p>
        </div>

        {facultyData ? (
          <>
            <div
              className={`rounded-3xl shadow-sm overflow-hidden mb-6 transition-colors ${
                theme == "dark"
                  ? "bg-gray-800 border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <div
                className={`h-32 transition-colors ${
                  theme == "dark"
                    ? "bg-gradient-to-r from-red-800 to-red-800"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              ></div>

              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 mb-8">
                  <div className="relative">
                    <div className="relative w-32 h-32">
                      {facultyData.profilePicture ? (
                        <Image
                          src={facultyData.profilePicture}
                          alt="Profile"
                          fill
                          className={`rounded-full object-cover shadow-lg transition-colors ${
                            theme == "dark"
                              ? "border-4 border-gray-800"
                              : "border-4 border-white"
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-colors ${
                            theme == "dark"
                              ? "bg-red-600 text-white border-4 border-gray-800"
                              : "bg-red-500 text-white border-4 border-white"
                          }`}
                        >
                          {facultyData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left mt-16 sm:mt-20">
                    <h2
                      className={`text-2xl font-bold transition-colors ${
                        theme == "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {facultyData.name}
                    </h2>
                    <p
                      className={`mt-1 transition-colors ${
                        theme == "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {schoolData.name}
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg transition-colors ${
                        theme == "dark"
                          ? "bg-red-900/30 border border-red-700"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <UserPen
                        className={`w-4 h-4 ${
                          theme == "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          theme == "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        {facultyData.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-red-900/40" : "bg-red-100"
                        }`}
                      >
                        <CreditCard
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-red-400" : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Faculty ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.facultyId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-blue-900/40" : "bg-blue-100"
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          School ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.schoolId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-green-900/40" : "bg-green-100"
                        }`}
                      >
                        <Mail
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Official Email
                        </p>
                        <p
                          className={`text-base font-semibold truncate transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {settings.privacy.showEmail
                            ? facultyData.officialEmail
                            : "•••••"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-purple-900/40" : "bg-purple-100"
                        }`}
                      >
                        <Phone
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-purple-400"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Phone Number
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {settings.privacy.showPhone
                            ? facultyData.phone
                            : "•••••"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl shadow-sm p-6 transition-colors ${
                theme == "dark"
                  ? "bg-gray-800 border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 transition-colors ${
                  theme == "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                School Information
              </h3>
              <div
                className={`rounded-xl p-6 transition-colors ${
                  theme == "dark"
                    ? "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-800"
                    : "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      theme == "dark" ? "bg-red-600" : "bg-red-500"
                    }`}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-sm mb-1 transition-colors ${
                        theme == "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Affiliated School
                    </p>
                    <p
                      className={`text-lg font-bold transition-colors ${
                        theme == "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {schoolData.name}
                    </p>
                    <p
                      className={`text-sm mt-2 transition-colors ${
                        theme == "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      ID: {facultyData.schoolId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`rounded-3xl shadow-sm overflow-hidden transition-colors ${
              theme == "dark"
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-white border-2 border-gray-200"
            }`}
          >
            <div
              className={`h-32 animate-pulse ${
                theme == "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 mb-8">
                <div
                  className={`w-32 h-32 rounded-full animate-pulse ${
                    theme == "dark"
                      ? "bg-gray-700 border-4 border-gray-800"
                      : "bg-gray-300 border-4 border-white"
                  }`}
                ></div>
                <div className="flex-1 mt-20">
                  <div
                    className={`h-8 rounded w-1/2 mb-2 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-5 rounded w-1/3 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-16 rounded animate-pulse ${
                        theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
