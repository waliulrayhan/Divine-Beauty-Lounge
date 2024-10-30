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
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">
          Change Password
        </h3>
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-6 max-w-lg mx-auto"
        >
          {/* Old Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPasswords.old ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                className="block w-full pr-10 sm:text-sm rounded-lg border-gray-300 border text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out py-3 px-4"
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
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
              >
                {showPasswords.old ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="block w-full pr-10 sm:text-sm rounded-lg border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out py-3 px-4"
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
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
              >
                {showPasswords.new ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="block w-full pr-10 sm:text-sm rounded-lg border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out py-3 px-4"
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
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
              >
                {showPasswords.confirm ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManagement;
