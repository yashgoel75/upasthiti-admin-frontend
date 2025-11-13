"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
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
import { useAuth } from "../..//context/auth";
import Footer from "@/app/components/footer/page";

interface Admin {
  _id: string;
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

interface PrivacySettings {
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function AccountPage() {
  const { user, setAdminData, adminData, loading } = useAuth();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">
            View and manage your profile information
          </p>
        </div>

        {adminData ? (
          <>
            <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-red-500 to-red-600"></div>

              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 mb-8">
                  <div className="relative">
                    <div className="relative w-32 h-32">
                      {adminData.profilePicture ? (
                        <Image
                          src={adminData.profilePicture}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-red-500 text-4xl font-bold text-white border-4 border-white shadow-lg">
                          {adminData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="absolute bottom-0 right-0 bg-red-500 border-4 border-white text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left mt-16 sm:mt-20">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {adminData.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {adminData.school?.name}
                    </p>
                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">
                        Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <IdCard className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          Admin ID
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {adminData.adminId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          School ID
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {adminData.schoolId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          Official Email
                        </p>
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {settings.privacy.showEmail
                            ? adminData.officialEmail
                            : "•••••"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          Phone Number
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {settings.privacy.showPhone
                            ? adminData.phoneNumber
                            : "•••••"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          Firebase UID
                        </p>
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {adminData.uid}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                School Information
              </h3>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Affiliated School
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {adminData.school?.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      ID: {adminData.schoolId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="h-32 bg-gray-300 animate-pulse"></div>
            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 mb-8">
                <div className="w-32 h-32 rounded-full bg-gray-300 animate-pulse border-4 border-white"></div>
                <div className="flex-1 mt-20">
                  <div className="h-8 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5"
                  >
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
