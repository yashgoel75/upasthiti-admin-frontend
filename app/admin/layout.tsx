"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import logo from "../../public/assets/upasthiti-logo.png";
import { getAuth, signOut } from "firebase/auth";
import "../page.css";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.replace("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
    { icon: BarChart3, label: "Analytics", route: "/admin/analytics" },
    { icon: Users, label: "Teachers Details", route: "/admin/teachers" },
    {
      icon: GraduationCap,
      label: "Students Details",
      route: "/admin/students",
    },
    { icon: Calendar, label: "Time Table", route: "/admin/timetable" },
    { icon: UserIcon, label: "Account", route: "/admin/account" },
    { icon: Settings, label: "Settings", route: "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      localStorage.clear();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 inter-normal">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 lg:w-[22%] 
          bg-white border-r border-gray-200 
          flex flex-col justify-between p-4 lg:p-8 
          lg:mx-2 lg:my-2 lg:rounded-3xl shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div>
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
                    onClick={() => {
                      router.push(item.route);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      px-4 py-2.5 rounded-lg font-medium cursor-pointer
                      flex items-center gap-3
                      ${
                        pathname === item.route
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

      <main className="flex-1 p-4 lg:p-8 min-h-screen overflow-auto max-h-screen">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mb-4"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {children}
      </main>
    </div>
  );
}
