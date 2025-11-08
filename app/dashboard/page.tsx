"use client";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import axios from "axios";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
  Search,
  Bell,
  Camera,
  Menu,
  X,
} from "lucide-react";
import "../page.css";
import logo from "../../public/assets/upasthiti-logo.png";

interface Admin {
  adminId: string;
  name: string;
  profilePicture?: string;
  officialEmail: string;
  phoneNumber: number;
  uid: string;
  schoolId: string;
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

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Consolidated state for all counts
  const [counts, setCounts] = useState<CountsData>({
    studentCount: 0,
    facultyCounts: {
      associateProfessor: 0,
      assistantProfessor: 0,
      labAssistant: 0,
    },
    branchCounts: {},
  });

  const branches = ["CSE", "AIML", "AIDS", "VLSI", "IIOT", "CSAM", "CSECS"];

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: BarChart3, label: "Analytics", active: false },
    { icon: Users, label: "Teacher Details", active: false },
    { icon: GraduationCap, label: "Students Details", active: false },
    { icon: Calendar, label: "Time Table", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  useEffect(() => {
    getCount();
  }, []);

  const getCount = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/counts");
      const data = res.data;

      // Extract branch counts dynamically
      const branchCounts: BranchCounts = {};
      if (data.students?.byBranch) {
        Object.keys(data.students.byBranch).forEach((branch) => {
          branchCounts[branch] = data.students.byBranch[branch].count || 0;
        });
      }

      // Update all counts in one state update
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
    } catch (error: unknown) {
      console.error("Error fetching counts:", error);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!file) return;

    const signRes = await fetch("/api/signprofilepicture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    return data.secure_url;
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadProfilePicture(file);
      const res = await axios.patch("http://localhost:8080/api/user", {
        uid: user.uid,
        updates: { profilePicture: imageUrl },
      });

      setAdminData(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 3 && hours < 12) {
      setCurrentTime("morning");
    } else if (hours >= 12 && hours < 16) {
      setCurrentTime("afternoon");
    } else if (hours >= 16 && hours <= 24) {
      setCurrentTime("evening");
    } else {
      setCurrentTime("hey");
    }
  }, []);

  const getGreeting = () => {
    const greetings: { [key: string]: string } = {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
      hey: "Hey",
    };
    return greetings[currentTime] || "Hey";
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.uid) fetchUserDetails(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserDetails = async (uid: string) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin?uid=${uid}`
      );
      setAdminData(res.data.data[0]);
    } catch (error: unknown) {
      console.error("Error fetching admin:", error);
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
    <div className="min-h-screen flex bg-gray-50 inter-normal">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-[22%] 
        bg-white border-r border-gray-200 
        flex flex-col justify-between p-4 lg:p-8 
        lg:mx-2 lg:my-2 lg:rounded-3xl shadow-sm
        transform transition-transform duration-300 ease-in-out
        max-h-screen
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div>
          {/* Close button for mobile */}
          <button
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-10">
            <Image src={logo} width={160} alt="logo" />
          </div>
          <div className="text-left space-y-8">
            <div>
              <p className="text-xs font-semibold mb-4 text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li
                    key={item.label}
                    className={`
                      px-4 py-2.5 rounded-lg font-medium cursor-pointer
                      flex items-center gap-3
                      ${
                        item.active
                          ? "bg-red-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-lg text-red-500 font-medium text-left hover:bg-red-50 cursor-pointer flex items-center gap-3"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 min-h-screen overflow-auto max-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 lg:mb-8">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your things"
              className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>
          <button className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Profile Section */}
        <section className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-8 mb-6 lg:mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                {adminData?.profilePicture ? (
                  <Image
                    src={adminData?.profilePicture}
                    alt={`${adminData?.name}'s profile`}
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-red-400 text-2xl lg:text-3xl font-semibold text-white">
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
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 bg-red-500 border-2 border-white text-white p-2 rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {getGreeting()}, {adminData?.name || "Swati Sharma"}
              </h2>
              <p className=" text-gray-600 font-medium mt-1">
                School of Engineering and Technology
              </p>
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-10 mt-3">
                <p>
                  <strong className="font-semibold text-gray-900">
                    Admin ID:
                  </strong>{" "}
                  <span className="text-gray-600">
                    {adminData?.adminId || "UD1230R9234FU23"}
                  </span>
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">
                    Email:
                  </strong>{" "}
                  <span className="text-gray-600 break-all">
                    {adminData?.officialEmail || "swatisharma69@vipstc.edu.in"}
                  </span>
                </p>
                <p>
                  <strong className="font-semibold text-gray-900">
                    Phone:
                  </strong>{" "}
                  <span className="text-gray-600">
                    {adminData?.phoneNumber || "8932453138"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 text-center">
            {facultyStats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200"
              >
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {stat.count}
                </p>
                <p className="text-xs lg:text-sm text-gray-600 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Branches Section */}
        <section className="bg-white border-2 border-gray-200 rounded-3xl p-4 lg:p-8 shadow-sm">
          <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-center text-gray-900">
            Explore Branches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {branches.map((branch) => (
              <div
                key={branch}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 lg:p-6 text-center hover:border-red-500 hover:shadow-md transition-all cursor-pointer"
              >
                <p className="text-lg lg:text-xl font-bold text-gray-900">
                  {branch}
                </p>
                <p className="text-sm text-orange-600 font-semibold my-2 lg:my-3">
                  No. of Students: {counts.branchCounts[branch] || 0}
                </p>
                <button className="w-full border-2 border-red-500 text-red-500 px-4 py-1.5 lg:py-2 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all cursor-pointer text-sm lg:text-base">
                  Explore
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs lg:text-sm mt-6 lg:mt-8 text-gray-500 font-medium px-4">
          © {new Date().getFullYear()} Vivekananda Institute of Professional
          Studies - Technical Campus. All rights reserved.
        </footer>
      </main>
    </div>
  );
}