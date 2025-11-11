"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Mail,
  Volume2,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword,
  GoogleAuthProvider,
  linkWithPopup,
  unlink,
} from "firebase/auth";
import Footer from "@/app/components/footer/page";

interface AppearanceSettings {
  theme: "light" | "dark";
}

interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  dataSharing: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
}

interface AuthSettings {
  authMethod: "google" | "email";
  googleEmail?: string;
}

interface AppSettings {
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  auth: AuthSettings;
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

export default function SettingsPage() {
  const [signInMethod, setSignInMethod] = useState<String | null>("");
  const [User, setUser] = useState<FirebaseUser | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSignInMethod(user?.providerData[0].providerId || "");
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [settings, setSettings] = useState<AppSettings>({
    appearance: {
      theme: "light",
    },
    privacy: {
      showEmail: true,
      showPhone: false,
      dataSharing: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      loginAlerts: true,
    },
    auth: {
      authMethod: "google",
      googleEmail: "user@gmail.com",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalType, setModalType] = useState<
    "linkGoogle" | "unlinkGoogle" | null
  >(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (category: keyof AppSettings, key: string): void => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleSelect = (
    category: keyof AppSettings,
    key: string,
    value: string
  ): void => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const saveSettings = (): void => {
    setIsSaving(true);
    localStorage.setItem("appSettings", JSON.stringify(settings));

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage(true);
      setTimeout(() => setSaveMessage(false), 1500);
    }, 800);
  };

  const handleUnlinkGoogle = () => {
    setModalType("unlinkGoogle");
    setShowAuthModal(true);
  };

  const handleLinkGoogle = () => {
    setModalType("linkGoogle");
    setShowAuthModal(true);
  };

  const confirmUnlinkGoogle = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (!User) {
      alert("No user is signed in.");
      return;
    }

    try {
      await updatePassword(User, newPassword);
      await unlink(User, "google.com");

      setSettings((prev) => ({
        ...prev,
        auth: {
          authMethod: "email",
          googleEmail: undefined,
        },
      }));
      setShowAuthModal(false);
      setNewPassword("");
      setConfirmPassword("");
      alert("Successfully switched to email/password authentication!");
    } catch (error: any) {
      console.error("Error switching auth method:", error);
      if (error.code === "auth/requires-recent-login") {
        alert(
          "This operation is sensitive and requires recent authentication. Please sign in again and retry."
        );
      } else {
        alert(`Failed to update password: ${error.message}`);
      }
    }
  };

  const confirmLinkGoogle = async () => {
    if (!User) {
      alert("No user is signed in.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await linkWithPopup(User, provider);
      setSettings((prev) => ({
        ...prev,
        auth: {
          authMethod: "google",
          googleEmail: User.email || "user@gmail.com",
        },
      }));
      setShowAuthModal(false);
      alert("Successfully linked Google account!");
    } catch (error: any) {
      console.error("Error linking Google account:", error);
      if (error.code === "auth/credential-already-in-use") {
        alert("This Google account is already linked to another user.");
      } else {
        alert(`Failed to link Google account: ${error.message}`);
      }
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setModalType(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your application preferences and configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-600">
                  Customize your interface
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() =>
                        handleSelect("appearance", "theme", theme.value)
                      }
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.appearance.theme === theme.value
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <theme.icon className="w-5 h-5" />
                      <span className="font-medium">{theme.label}</span>
                      {settings.appearance.theme === theme.value && (
                        <Check className="w-4 h-4 text-red-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
                <p className="text-sm text-gray-600">
                  Control your data visibility
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleItem
                label="Show Email"
                description="Display email on profile"
                checked={settings.privacy.showEmail}
                onChange={() => handleToggle("privacy", "showEmail")}
              />
              <ToggleItem
                label="Show Phone Number"
                description="Display phone on profile"
                checked={settings.privacy.showPhone}
                onChange={() => handleToggle("privacy", "showPhone")}
              />
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-600">Protect your account</p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleItem
                label="Two-Factor Authentication"
                description="Add extra layer of security"
                checked={settings.security.twoFactorAuth}
                onChange={() => handleToggle("security", "twoFactorAuth")}
              />
              <ToggleItem
                label="Login Alerts"
                description="Notify on new device login"
                checked={settings.security.loginAlerts}
                onChange={() => handleToggle("security", "loginAlerts")}
              />
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Authentication
                </h2>
                <p className="text-sm text-gray-600">Manage login method</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">Current Method</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      signInMethod === "google.com"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {signInMethod === "google.com"
                      ? "Google"
                      : "Email/Password"}
                  </span>
                </div>
                {signInMethod === "google.com" &&
                  settings.auth.googleEmail && (
                    <p className="text-sm text-gray-600 mb-3">
                      Linked account: {User?.email}
                    </p>
                  )}
                <button
                  onClick={
                    signInMethod === "google.com"
                      ? handleUnlinkGoogle
                      : handleLinkGoogle
                  }
                  className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  {signInMethod === "google.com"
                    ? "Switch to Email/Password"
                    : "Link Google Account"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {modalType === "unlinkGoogle"
                  ? "Switch to Email/Password"
                  : "Link Google Account"}
              </h3>
              <p className="text-gray-600 mb-6">
                {modalType === "unlinkGoogle"
                  ? "Create a password to switch from Google authentication. This will unlink your Google account."
                  : "You'll be redirected to Google to link your account."}
              </p>

              {modalType === "unlinkGoogle" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a new password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    modalType === "unlinkGoogle"
                      ? confirmUnlinkGoogle
                      : confirmLinkGoogle
                  }
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Save Changes</h3>
            <p className="text-sm text-gray-600">
              Apply your settings configuration
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={saveSettings}
              disabled={isSaving || saveMessage}
              className="px-8 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : saveMessage ? "Saved" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? "bg-red-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}