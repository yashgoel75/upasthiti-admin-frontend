"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Search, Bell, Camera } from "lucide-react";
import Footer from "@/app/components/footer/page";
import { useAuth } from "../..//context/auth";

interface Admin {
  adminId: string;
  name: string;
  profilePicture?: string;
  officialEmail: string;
  phoneNumber: number;
  uid: string;
  schoolId: string;
  school: {
    name: string;
  };
}

interface FacultyCounts {
  associateProfessor: number;
  assistantProfessor: number;
  labAssistant: number;
}

interface BranchCounts {
  [key: string]: number;
}

interface CountsData {
  studentCount: number;
  facultyCounts: FacultyCounts;
  branchCounts: BranchCounts;
}

interface PrivacySettings {
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function Dashboard() {
  const { user, setAdminData, adminData, loading } = useAuth();
  const [counts, setCounts] = useState<CountsData>({
    studentCount: 0,
    facultyCounts: {
      associateProfessor: 0,
      assistantProfessor: 0,
      labAssistant: 0,
    },
    branchCounts: {},
  });
  const [currentTime, setCurrentTime] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const branches = ["CSE", "AIML", "AIDS", "VLSI", "IIOT", "CSAM", "CSE-CS"];

  const CACHE_INTERVAL = 50000;

  const [settings, setSettings] = useState<PrivacySettings>({
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
    }
  }, []);

  const getCount = async () => {
    try {
      const res = await axios.get(
        "https://upasthiti-backend-production.up.railway.app/api/count"
      );
      const data = res.data;

      const branchCounts: BranchCounts = {};
      if (data.students?.byBranch) {
        Object.keys(data.students.byBranch).forEach((branch) => {
          branchCounts[branch] = data.students.byBranch[branch].count || 0;
        });
      }

      setCounts({
        studentCount: data.students?.total || 0,
        facultyCounts: {
          associateProfessor:
            data.faculty?.byType?.AssociateProfessor?.count || 0,
          assistantProfessor:
            data.faculty?.byType?.AssistantProfessor?.count || 0,
          labAssistant: data.faculty?.byType?.LabAssistant?.count || 0,
        },
        branchCounts,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    getCount();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const signRes = await fetch("/api/signprofilepicture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "profilepictures" }),
      });

      const { timestamp, signature, apiKey, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();
      const imageUrl = data.secure_url;

      await axios.patch(
        "https://upasthiti-backend-production.up.railway.app/api/admin/update",
        {
          uid: user.uid,
          updates: { profilePicture: imageUrl },
        }
      );

      setAdminData((prev: Admin) =>
        prev ? { ...prev, profilePicture: imageUrl } : prev
      );
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const facultyStats = [
    {
      count: counts.facultyCounts.associateProfessor,
      label: "Associate Professor",
    },
    {
      count: counts.facultyCounts.assistantProfessor,
      label: "Assistant Professor",
    },
    { count: counts.facultyCounts.labAssistant, label: "Lab Assistants" },
    { count: counts.studentCount, label: "Students" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your things"
            className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </div>
        <button className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Section */}
      <section className="bg-white border-2 border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative">
            <div className="relative w-28 h-28">
              {adminData?.profilePicture ? (
                <Image
                  src={adminData.profilePicture}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-red-400 text-3xl font-semibold text-white">
                  {adminData?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-red-500 border-2 border-white text-white p-2 rounded-full"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>

          <div className="text-center lg:text-left">
            {adminData ? (
              <>
                <h2 className="text-3xl font-bold">
                  {getGreeting()}, {adminData.name}
                </h2>
                <p className="text-gray-600">{adminData.school?.name}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-gray-700 text-sm">
                  <p>
                    <b>Admin ID:</b> {adminData.adminId}
                  </p>
                  <p>
                    <b>Email:</b>{" "}
                    {settings.privacy.showEmail
                      ? adminData.officialEmail
                      : "•••••"}
                  </p>
                  <p>
                    <b>Phone:</b>{" "}
                    {settings.privacy.showPhone
                      ? adminData.phoneNumber
                      : "•••••"}
                  </p>
                </div>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto lg:mx-0 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto lg:mx-0 mb-4"></div>
                <div className="flex flex-wrap gap-4 mt-3 justify-center lg:justify-start">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-center">
          {facultyStats.map((s, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-5 border border-gray-200"
            >
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branch Section */}
      <section className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Explore Branches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {branches.map((branch) => (
            <div
              key={branch}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <p className="text-lg font-bold text-gray-900">{branch}</p>
              <p className="text-sm text-orange-600 font-semibold mt-2">
                No. of Students: {counts.branchCounts[branch] || 0}
              </p>
              <button className="mt-4 border-2 border-red-500 text-red-500 px-6 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm">
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
