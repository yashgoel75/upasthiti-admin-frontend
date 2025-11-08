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
import "../page.css";
import logo from "../../public/assets/upasthiti-logo.png";

export default function Dashboard() {
  interface Admin {
    adminId: string;
    name: string;
    profilePicture?: string;
    officialEmail: string;
    phoneNumber: number;
    uid: string;
    schoolId: string;
  }

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      console.log(user.uid);
      const res = await axios.patch("http://localhost:8080/api/user", {
        uid: user.uid,
        updates: { profilePicture: imageUrl },
      });

      const data = res.data;

      setAdminData((prev) => ({
        ...data.user,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    if (Number(hours) >= 3 && Number(hours) < 12) {
      setCurrentTime("morning");
      console.log("morning");
    } else if (Number(hours) >= 12 && Number(hours) < 16) {
      setCurrentTime("afternoon");
      console.log("afternoon");
    } else if (Number(hours) >= 16 && Number(hours) <= 24) {
      setCurrentTime("evening");
      console.log("evening");
    } else {
      setCurrentTime("hey");
      console.log("hey");
    }
  }, []);

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

  const fetchUserDetails = async (uid: String) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin?uid=${uid}`);
      setAdminData(res.data.data[0]);
      console.log(res.data.data[0]);
    } catch (error: unknown) {
      console.error("Error fetching admin:", error);
    }
  };

  return (
    <div className="min-h-screen max-h-screen flex bg-gray-50 inter-normal">
      <aside className="w-[22%] mx-2 my-2 bg-white border-r border-gray-200 flex flex-col justify-between p-8 rounded-3xl rounded-br-3xl shadow-sm">
        <div>
          <div className="flex justify-center mb-10">
            <Image src={logo} width={160} alt="logo" />
          </div>
          <div className="text-left space-y-8">
            <div>
              <p className="text-xs font-semibold mb-4 text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>
              <ul className="space-y-2">
                <li className="px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium cursor-pointer">
                  Dashboard
                </li>
                <li className="px-4 py-2.5 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-100">
                  Analytics
                </li>
                <li className="px-4 py-2.5 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-100">
                  Teacher Details
                </li>
                <li className="px-4 py-2.5 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-100">
                  Students Details
                </li>
                <li className="px-4 py-2.5 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-100">
                  Time Table
                </li>
                <li className="px-4 py-2.5 rounded-lg text-gray-700 font-medium cursor-pointer hover:bg-gray-100">
                  Settings
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-lg text-red-500 font-medium text-left hover:bg-red-50 cursor-pointer"
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 p-8 min-h-screen max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search your things"
            className="w-full max-w-lg border-2 border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
          <div className="ml-6 w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </div>
        </div>

        <section className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="relative w-32 h-32">
                {adminData?.profilePicture ? (
                  <Image
                    src={adminData?.profilePicture}
                    alt={`${adminData?.name}'s profile`}
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center bg-red-400 text-3xl font-semibold text-white">
                    {adminData?.name.charAt(0).toUpperCase()}
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
                className="absolute bottom-0 right-0 bg-red-500 border-1 border-white text-white p-2.5 rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Change profile picture"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {currentTime == "morning"
                  ? "Good Morning"
                  : currentTime == "afternoon"
                  ? "Good Afternoon"
                  : currentTime == "evening"
                  ? "Good Evening"
                  : "Hey"}
                , {adminData?.name || "Swati Sharma"}
              </h2>
              <p className="text-sm text-gray-600 font-medium mt-1">
                School of Engineering and Technology
              </p>
              <div className="flex gap-10 mt-3 text-sm">
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
                  <span className="text-gray-600">
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

          <div className="flex justify-between text-center">
            <div className="bg-gray-50 rounded-xl p-6 flex-1 mx-2 border border-gray-200">
              <p className="text-3xl font-bold text-gray-900">9</p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Associate Professor
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex-1 mx-2 border border-gray-200">
              <p className="text-3xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Assistant Professor
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex-1 mx-2 border border-gray-200">
              <p className="text-3xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Lab Assistants
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex-1 mx-2 border border-gray-200">
              <p className="text-3xl font-bold text-gray-900">1023</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Students</p>
            </div>
          </div>
        </section>

        <section className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Explore Branches
          </h3>
          <div className="grid grid-cols-4 gap-6 justify-items-center">
            {["CSE", "AIML", "AIDS", "VLSI", "IIOT", "CSE-AM", "CSE-CS"].map(
              (branch) => (
                <div
                  key={branch}
                  className="bg-white border-2 border-gray-200 rounded-xl w-52 p-6 text-center hover:border-red-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="text-xl font-bold text-gray-900">{branch}</p>
                  <p className="text-sm text-orange-600 font-semibold my-3">
                    No. of Students: 60
                  </p>
                  <button className="w-full border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all">
                    Explore
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <footer className="text-center text-xs mt-8 text-gray-500 font-medium">
          © 2025 Vivekananda Institute of Professional Studies - Technical
          Campus. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
