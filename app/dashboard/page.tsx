"use client";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
