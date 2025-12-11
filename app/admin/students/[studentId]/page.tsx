"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/app/context/theme";
import { ArrowLeft, Phone, Mail, BookOpen, Hash } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  batchEnd: string;
  enrollmentNo: string;
  uid: string;
}

export default function SingleStudent() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();

  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/student?uid=${studentId}`
      );
      const json = await res.json();
      setStudent(json.data);
    } catch (err) {
      console.error("Failed to fetch student:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-gray-50"
        }`}
      >
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center text-center p-6 ${
          theme === "dark" ? "bg-gray-900 text-gray-400" : "bg-gray-50"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-2">Student Not Found</h2>
        <p>The requested student does not exist.</p>

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
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/students")}
          className={`flex items-center gap-2 mb-6 text-sm px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>

        {/* Main Card */}
        <div
          className={`rounded-2xl p-8 shadow-xl ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {student.name}
          </h1>

          <p
            className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            UID: {student.uid}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <DetailCard
              theme={theme}
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={student.email}
            />
            <DetailCard
              theme={theme}
              icon={<Phone className="w-5 h-5" />}
              label="Phone"
              value={student.phone}
            />
            <DetailCard
              theme={theme}
              icon={<BookOpen className="w-5 h-5" />}
              label="Branch"
              value={student.branch}
            />
            <DetailCard
              theme={theme}
              icon={<Hash className="w-5 h-5" />}
              label="Enrollment No."
              value={student.enrollmentNo}
            />
            <DetailCard
              theme={theme}
              icon={<Hash className="w-5 h-5" />}
              label="Batch"
              value={`Class of ${student.batchEnd}`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-10">
            <button
              className={`px-6 py-3 rounded-xl ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Edit Student
            </button>

            <button
              className={`px-6 py-3 rounded-xl ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Delete Student
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
