"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface User {
  id: string;
  employeeId: string;
  username: string;
  email: string;
  phoneNumber: string;
  nidNumber: string;
  jobStartDate: string;
  jobEndDate: string | null;
  isActive: boolean;
  role: "SUPER_ADMIN" | "NORMAL_ADMIN";
  permissions: {
    service: string[];
    product: string[];
    stockIn: string[];
    stockOut: string[];
  };
}

interface NewUser extends Omit<User, "id"> {
  password?: string;
}

type PermissionKey = "service" | "product" | "stockIn" | "stockOut";

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({
    employeeId: "",
    username: "",
    email: "",
    phoneNumber: "",
    nidNumber: "",
    jobStartDate: "",
    jobEndDate: "",
    isActive: true,
    role: "NORMAL_ADMIN",
    permissions: {
      service: ["view"],
      product: ["view"],
      stockIn: ["view"],
      stockOut: ["view"],
    },
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [feature, action] = e.target.name.split("-") as [
      PermissionKey,
      string
    ];
    setNewUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: e.target.checked
          ? [...prev.permissions[feature], action]
          : prev.permissions[feature].filter((a) => a !== action),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      // Ensure all features have 'view' permission before submission
      const updatedPermissions = { ...newUser.permissions };
      (["service", "product", "stockIn", "stockOut"] as const).forEach(
        (feature) => {
          if (!updatedPermissions[feature].includes("view")) {
            updatedPermissions[feature] = [
              "view",
              ...updatedPermissions[feature],
            ];
          }
        }
      );

      const userData = {
        ...newUser,
        permissions: JSON.stringify(updatedPermissions),
      };

      // Remove password field if it's empty or if we're editing
      if (editingUser || !userData.password) {
        delete userData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${editingUser ? "update" : "create"} user`
        );
      }
      await fetchUsers();
      toast.success(`User ${editingUser ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingUser(null);
      setNewUser({
        employeeId: "",
        username: "",
        email: "",
        phoneNumber: "",
        nidNumber: "",
        jobStartDate: "",
        jobEndDate: "",
        isActive: true,
        role: "NORMAL_ADMIN",
        permissions: {
          service: ["view"],
          product: ["view"],
          stockIn: ["view"],
          stockOut: ["view"],
        },
      });
    } catch (error) {
      console.error(
        `Error ${editingUser ? "updating" : "creating"} user:`,
        error
      );
      toast.error(
        (error as Error).message ||
          `Failed to ${editingUser ? "update" : "create"} user`
      );
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      ...user,
      jobStartDate: new Date(user.jobStartDate).toISOString().split("T")[0],
      jobEndDate: user.jobEndDate
        ? new Date(user.jobEndDate).toISOString().split("T")[0]
        : "",
      permissions:
        typeof user.permissions === "string"
          ? JSON.parse(user.permissions)
          : user.permissions,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        await fetchUsers();
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (session?.user?.role !== "SUPER_ADMIN") {
    return <div className="text-black">Access Denied</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setNewUser({
              employeeId: "",
              username: "",
              email: "",
              phoneNumber: "",
              nidNumber: "",
              jobStartDate: "",
              jobEndDate: "",
              isActive: true,
              role: "NORMAL_ADMIN",
              permissions: {
                service: ["view"],
                product: ["view"],
                stockIn: ["view"],
                stockOut: ["view"],
              },
            });
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New User
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingUser ? "Edit User Profile" : "Create New User"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={newUser.employeeId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter employee ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  NID Number
                </label>
                <input
                  type="text"
                  name="nidNumber"
                  value={newUser.nidNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter NID number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Job Start Date
                </label>
                <input
                  type="date"
                  name="jobStartDate"
                  value={newUser.jobStartDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Job End Date (Optional)
                </label>
                <input
                  type="date"
                  name="jobEndDate"
                  value={newUser.jobEndDate || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Status & Role
                </label>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={newUser.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Active</span>
                  </label>

                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="NORMAL_ADMIN">Normal Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password || ""}
                    onChange={handleInputChange}
                    required={!editingUser}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-black mb-4">
                  User Permissions
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {(["service", "product", "stockIn", "stockOut"] as const).map(
                    (feature) => (
                      <div key={feature} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-black mb-3 capitalize">
                          {feature}
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {["view", "create", "edit", "delete"].map(
                            (action) => (
                              <label
                                key={`${feature}-${action}`}
                                className="inline-flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  name={`${feature}-${action}`}
                                  checked={
                                    newUser.permissions[feature].includes(
                                      action
                                    ) ||
                                    (!editingUser && action === "view")
                                  }
                                  onChange={handlePermissionChange}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 capitalize">
                                  {action}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Employee ID
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Username
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Active
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="py-4 px-6 text-sm text-gray-800">
                    {user.employeeId}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {user.username}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {user.role}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {user.isActive ? "Yes" : "No"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-6xl w-full transform transition-all my-auto overflow-auto max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  User Profile Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                      Employee Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Employee ID
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.employeeId}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Username
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.username}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Email
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Personal Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Phone Number
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          NID Number
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.nidNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Employment Status
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Job Start Date
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {new Date(
                            selectedUser.jobStartDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Job End Date
                        </label>
                        <p className="text-gray-900 font-semibold mt-1">
                          {selectedUser.jobEndDate
                            ? new Date(
                                selectedUser.jobEndDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            Status
                          </label>
                          <span
                            className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              selectedUser.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedUser.isActive ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500">
                            Role
                          </label>
                          <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {selectedUser.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(
                        typeof selectedUser.permissions === "string"
                          ? JSON.parse(selectedUser.permissions)
                          : selectedUser.permissions
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            {key === "service" && (
                              <svg
                                className="w-4 h-4 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                            {key === "product" && (
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            )}
                            {key === "stockIn" && (
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                                />
                              </svg>
                            )}
                            {key === "stockOut" && (
                              <svg
                                className="w-4 h-4 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                                />
                              </svg>
                            )}
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {["view", "create", "edit", "delete"].map(
                              (action) => (
                                <span
                                  key={action}
                                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center gap-1 ${
                                    (value as string[]).includes(action)
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {action === "view" && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  )}
                                  {action === "create" && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                      />
                                    </svg>
                                  )}
                                  {action === "edit" && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  )}
                                  {action === "delete" && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  )}
                                  {action.charAt(0).toUpperCase() +
                                    action.slice(1)}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
