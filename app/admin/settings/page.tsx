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
import { useTheme } from "@/app/context/theme";

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
  const { theme, setTheme } = useTheme();
  const [signInMethod, setSignInMethod] = useState<string>("google.com");
  const [userEmail, setUserEmail] = useState<string>("user@example.com");

 const [settings, setSettings] = useState<AppSettings>(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("appSettings");
    if (saved) return JSON.parse(saved);
  }

  return {
    appearance: { theme: "light" },
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
  };
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

    setSignInMethod("password");
    setShowAuthModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const confirmLinkGoogle = async () => {
    setSignInMethod("google.com");
    setShowAuthModal(false);
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

  const isDark = settings.appearance.theme === "dark";

  return (
    <div
      className={`min-h-screen p-2 md:p-8 transition-colors ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold transition-colors ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Settings
          </h1>
          <p
            className={`mt-1 transition-colors ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your application preferences and configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className={`border-2 rounded-3xl shadow-sm p-6 transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? "bg-purple-900" : "bg-purple-100"
                }`}
              >
                <Palette
                  className={`w-6 h-6 ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Appearance
                </h2>
                <p
                  className={`text-sm transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Customize your interface
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className={`text-sm font-semibold mb-3 block transition-colors ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => {
                        handleSelect("appearance", "theme", theme.value);
                        setTheme(theme.value);
                        const updated = {
                          ...settings,
                          appearance: { theme: theme.value },
                        };
                        setSettings(updated);
                        localStorage.setItem(
                          "appSettings",
                          JSON.stringify(updated)
                        );
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        settings.appearance.theme === theme.value
                          ? isDark
                            ? "border-red-500 bg-red-950"
                            : "border-red-500 bg-red-50"
                          : isDark
                          ? "border-gray-700 hover:border-gray-600 bg-gray-750"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <theme.icon
                        className={`w-5 h-5 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {theme.label}
                      </span>
                      {settings.appearance.theme === theme.value && (
                        <Check className="w-4 h-4 text-red-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-3xl shadow-sm p-6 transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? "bg-blue-900" : "bg-blue-100"
                }`}
              >
                <Shield
                  className={`w-6 h-6 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Privacy
                </h2>
                <p
                  className={`text-sm transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
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
                isDark={isDark}
              />
              <ToggleItem
                label="Show Phone Number"
                description="Display phone on profile"
                checked={settings.privacy.showPhone}
                onChange={() => handleToggle("privacy", "showPhone")}
                isDark={isDark}
              />
            </div>
          </div>

          <div
            className={`border-2 rounded-3xl shadow-sm p-6 transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? "bg-green-900" : "bg-green-100"
                }`}
              >
                <Lock
                  className={`w-6 h-6 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Security
                </h2>
                <p
                  className={`text-sm transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Protect your account
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleItem
                label="Two-Factor Authentication"
                description="Add extra layer of security"
                checked={settings.security.twoFactorAuth}
                onChange={() => handleToggle("security", "twoFactorAuth")}
                isDark={isDark}
              />
              <ToggleItem
                label="Login Alerts"
                description="Notify on new device login"
                checked={settings.security.loginAlerts}
                onChange={() => handleToggle("security", "loginAlerts")}
                isDark={isDark}
              />
            </div>
          </div>

          <div
            className={`border-2 rounded-3xl shadow-sm p-6 transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isDark ? "bg-orange-900" : "bg-orange-100"
                }`}
              >
                <Mail
                  className={`w-6 h-6 ${
                    isDark ? "text-orange-400" : "text-orange-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-xl font-bold transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Authentication
                </h2>
                <p
                  className={`text-sm transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Manage login method
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 border-2 rounded-xl transition-colors ${
                  isDark
                    ? "bg-gray-750 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className={`font-semibold transition-colors ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Current Method
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      signInMethod === "google.com"
                        ? isDark
                          ? "bg-blue-900 text-blue-300"
                          : "bg-blue-100 text-blue-700"
                        : isDark
                        ? "bg-green-900 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {signInMethod === "google.com"
                      ? "Google"
                      : "Email/Password"}
                  </span>
                </div>
                {signInMethod === "google.com" && (
                  <p
                    className={`text-sm mb-3 transition-colors ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Linked account: {userEmail}
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
            <div
              className={`rounded-2xl shadow-xl max-w-md w-full p-6 transition-colors ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-2 transition-colors ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {modalType === "unlinkGoogle"
                  ? "Switch to Email/Password"
                  : "Link Google Account"}
              </h3>
              <p
                className={`mb-6 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {modalType === "unlinkGoogle"
                  ? "Create a password to switch from Google authentication. This will unlink your Google account."
                  : "You'll be redirected to Google to link your account."}
              </p>

              {modalType === "unlinkGoogle" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 transition-colors ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a new password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-red-500 focus:outline-none transition-colors ${
                        isDark
                          ? "bg-gray-750 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 transition-colors ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-red-500 focus:outline-none transition-colors ${
                        isDark
                          ? "bg-gray-750 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className={`flex-1 px-4 py-3 border-2 font-semibold rounded-xl transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-750"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
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

        <div
          className={`border-2 rounded-3xl shadow-sm p-6 flex items-center justify-between transition-colors ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div>
            <h3
              className={`text-lg font-bold transition-colors ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Save Changes
            </h3>
            <p
              className={`text-sm transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
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
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
  isDark,
}: ToggleItemProps & { isDark: boolean }) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-2 rounded-xl transition-colors ${
        isDark
          ? "bg-gray-750 border-gray-700 hover:bg-gray-700"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
    >
      <div>
        <p
          className={`font-semibold transition-colors ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-sm transition-colors ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? "bg-red-500" : isDark ? "bg-gray-600" : "bg-gray-300"
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
