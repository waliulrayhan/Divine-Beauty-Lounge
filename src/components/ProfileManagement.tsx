"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface UserProfile {
  employeeId: string;
  username: string;
  email: string;
  phoneNumber: string;
  nidNumber: string;
  jobStartDate: string;
  jobEndDate: string | null;
  isActive: boolean;
  role: string;
}

interface PasswordChange {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileManagement = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        setProfile({
          ...data,
          jobStartDate: new Date(data.jobStartDate).toISOString().split("T")[0],
          jobEndDate: data.jobEndDate
            ? new Date(data.jobEndDate).toISOString().split("T")[0]
            : null,
        });
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      );
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 font-semibold">
        Failed to load profile
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Profile Management
      </h2>

      {/* Profile Information Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Profile Information
        </h3>
        <form onSubmit={handleProfileSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={profile.employeeId}
                onChange={(e) =>
                  setProfile({ ...profile, employeeId: e.target.value })
                }
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phoneNumber}
                onChange={(e) =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NID Number
              </label>
              <input
                type="text"
                value={profile.nidNumber}
                onChange={(e) =>
                  setProfile({ ...profile, nidNumber: e.target.value })
                }
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>

            {/* Job Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Start Date
              </label>
              <input
                type="date"
                value={profile.jobStartDate}
                onChange={(e) =>
                  setProfile({ ...profile, jobStartDate: e.target.value })
                }
                disabled={!isSuperAdmin}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>

            {/* Job End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job End Date
              </label>
              <input
                type="date"
                value={profile.jobEndDate || ""}
                onChange={(e) =>
                  setProfile({ ...profile, jobEndDate: e.target.value || null })
                }
                disabled={!isSuperAdmin}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
              />
            </div>

            {/* Active Status */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Active Status
                </label>
                <select
                  value={profile.isActive.toString()}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      isActive: e.target.value === "true",
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}

            {/* Role */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={profile.role}
                  onChange={(e) =>
                    setProfile({ ...profile, role: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="NORMAL_ADMIN">Normal Admin</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Change Password
        </h3>
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-6 max-w-md mx-auto"
        >
          {/* Old Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Old Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    old: !showPasswords.old,
                  })
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.old ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManagement;
