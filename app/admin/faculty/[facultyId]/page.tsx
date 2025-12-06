"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/app/context/theme";
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  UserCheck,
  FileText,
  IdCard,
} from "lucide-react";

interface Faculty {
  _id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  subjects: string;
  timetable: string;
  type: string;
  uid: string;
  facultyId: string;
}

export default function SingleFaculty() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();

  const facultyId = params.facultyId as string;

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFaculty = async () => {
    try {
      const res = await fetch(
        `https://upasthiti-backend-production.up.railway.app/api/faculty/single?uid=${facultyId}`
      );
      const json = await res.json();
        const data = json.data[0];
        console.log(data);
      setFaculty(json.data);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-50"
        }`}
      >
        Loading faculty details...
      </div>
    );
  }

  if (!faculty) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center text-center p-6 ${
          theme === "dark" ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-2">Faculty Not Found</h2>
        <p>The requested faculty member does not exist.</p>

        <button
          onClick={() => router.back()}
          className={`mt-6 px-6 py-3 rounded-xl ${
            theme === "dark"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-5 md:p-10 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/faculty")}
          className={`flex items-center gap-2 mb-6 text-sm px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Faculty
        </button>

        {/* Profile Header */}
        <div
          className={`rounded-2xl p-8 shadow-xl ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {faculty.name}
              </h1>

              <p
                className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Faculty ID: {faculty.facultyId}
              </p>
            </div>

            <span
              className={`
                mt-4 md:mt-0 text-xs font-medium px-4 py-2 rounded-full
                ${
                  theme === "dark"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {faculty.type || "Faculty"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <DetailCard
              theme={theme}
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={faculty.email}
            />

            <DetailCard
              theme={theme}
              icon={<Phone className="w-5 h-5" />}
              label="Phone"
              value={faculty.phone}
            />

            <DetailCard
              theme={theme}
              icon={<BookOpen className="w-5 h-5" />}
              label="Department"
              value={faculty.departmentId}
            />

            <DetailCard
              theme={theme}
              icon={<UserCheck className="w-5 h-5" />}
              label="UID"
              value={faculty.uid}
            />
          </div>

          {/* Subjects
          <div
            className={`mt-12 p-6 rounded-xl ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Subjects Taught
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {faculty.subjects
                .split(",")
                .map((sub) => sub.trim())
                .filter(Boolean)
                .map((subject) => (
                  <span
                    key={subject}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-800 text-gray-200"
                        : "bg-white shadow text-gray-700"
                    }`}
                  >
                    {subject}
                  </span>
                ))}
            </div>
          </div> */}

          {/* Timetable */}
          {faculty.timetable && (
            <div
              className={`mt-10 p-6 rounded-xl border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-semibold flex items-center gap-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                <FileText className="w-5 h-5" /> Timetable
              </h2>

              <p className="text-sm mt-3 opacity-70">
                Faculty timetable file uploaded.
              </p>

              <a
                href={faculty.timetable}
                target="_blank"
                className={`mt-4 inline-block px-5 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                View / Download Timetable
              </a>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex gap-4 mt-12">
            <button
              className={`px-6 py-3 rounded-xl ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Edit Faculty
            </button>

            <button
              className={`px-6 py-3 rounded-xl ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Delete Faculty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  theme,
  icon,
  label,
  value,
}: {
  theme: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`p-5 rounded-xl border ${
        theme === "dark"
          ? "bg-gray-700 border-gray-600"
          : "bg-gray-100 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {label}
          </p>
          <h3
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
