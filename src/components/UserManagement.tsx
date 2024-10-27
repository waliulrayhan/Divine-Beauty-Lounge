"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

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
  role: 'SUPER_ADMIN' | 'NORMAL_ADMIN';
  permissions: {
    service: string[];
    product: string[];
    stockIn: string[];
    stockOut: string[];
  };
}

interface NewUser extends Omit<User, 'id'> {
  password?: string;
}

type PermissionKey = 'service' | 'product' | 'stockIn' | 'stockOut';

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({
    employeeId: '',
    username: '',
    email: '',
    phoneNumber: '',
    nidNumber: '',
    jobStartDate: '',
    jobEndDate: '',
    isActive: true,
    role: 'NORMAL_ADMIN',
    permissions: {
      service: ['view'],
      product: ['view'],
      stockIn: ['view'],
      stockOut: ['view'],
    },
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [feature, action] = e.target.name.split('-') as [PermissionKey, string];
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: e.target.checked
          ? [...prev.permissions[feature], action]
          : prev.permissions[feature].filter(a => a !== action),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      // Ensure all features have 'view' permission before submission
      const updatedPermissions = { ...newUser.permissions };
      (['service', 'product', 'stockIn', 'stockOut'] as const).forEach(feature => {
        if (!updatedPermissions[feature].includes('view')) {
          updatedPermissions[feature] = ['view', ...updatedPermissions[feature]];
        }
      });

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
      await fetchUsers();
      toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingUser(null);
      setNewUser({
        employeeId: '',
        username: '',
        email: '',
        phoneNumber: '',
        nidNumber: '',
        jobStartDate: '',
        jobEndDate: '',
        isActive: true,
        role: 'NORMAL_ADMIN',
        permissions: {
          service: ['view'],
          product: ['view'],
          stockIn: ['view'],
          stockOut: ['view'],
        },
      });
    } catch (error) {
      console.error(`Error ${editingUser ? 'updating' : 'creating'} user:`, error);
      toast.error((error as Error).message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      ...user,
      jobStartDate: new Date(user.jobStartDate).toISOString().split('T')[0],
      jobEndDate: user.jobEndDate ? new Date(user.jobEndDate).toISOString().split('T')[0] : '',
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        await fetchUsers();
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return <div className="text-black">Access Denied</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <button
        onClick={() => {
          setEditingUser(null);
          setNewUser({
            employeeId: '',
            username: '',
            email: '',
            phoneNumber: '',
            nidNumber: '',
            jobStartDate: '',
            jobEndDate: '',
            isActive: true,
            role: 'NORMAL_ADMIN',
            permissions: {
              service: ['view'],
              product: ['view'],
              stockIn: ['view'],
              stockOut: ['view'],
            },
          });
          setShowForm(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition duration-300"
      >
        Add New User
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={newUser.employeeId}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">NID Number</label>
              <input
                type="text"
                name="nidNumber"
                value={newUser.nidNumber}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Job Start Date</label>
              <input
                type="date"
                name="jobStartDate"
                value={newUser.jobStartDate}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Job End Date (Optional)</label>
              <input
                type="date"
                name="jobEndDate"
                value={newUser.jobEndDate || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Active Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newUser.isActive}
                  onChange={handleInputChange}
                  className="mr-2 focus:ring-2 focus:ring-blue-500"
                />
                <span>Active</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NORMAL_ADMIN">Normal Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            {!editingUser && (
              <div>
                <label className="block mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password || ''}
                  onChange={handleInputChange}
                  required={!editingUser}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Permissions</h4>
            {(['service', 'product', 'stockIn', 'stockOut'] as const).map(feature => (
              <div key={feature} className="mb-2">
                <h5 className="font-medium">{feature.charAt(0).toUpperCase() + feature.slice(1)}</h5>
                <div className="flex flex-wrap">
                  {['view', 'create', 'edit', 'delete'].map(action => (
                    <label key={`${feature}-${action}`} className="inline-flex items-center mr-4 mb-2">
                      <input
                        type="checkbox"
                        name={`${feature}-${action}`}
                        checked={newUser.permissions[feature].includes(action) || (!editingUser && action === 'view')}
                        onChange={handlePermissionChange}
                        className="mr-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">
            {editingUser ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Employee ID</th>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Active</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100 transition duration-300">
                <td className="py-3 px-6 text-left">{user.employeeId}</td>
                <td className="py-3 px-6 text-left">{user.username}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-left">{user.isActive ? 'Yes' : 'No'}</td>
                <td className="py-3 px-6 text-left">
                  <button onClick={() => handleViewDetails(user)} className="text-green-500 hover:text-green-700 mr-2 transition duration-300">View Details</button>
                  <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 mr-2 transition duration-300">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 transition duration-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setSelectedUser(null)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Details</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Employee ID:</strong> {selectedUser.employeeId}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Username:</strong> {selectedUser.username}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Phone Number:</strong> {selectedUser.phoneNumber}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">NID Number:</strong> {selectedUser.nidNumber}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Job Start Date:</strong> {new Date(selectedUser.jobStartDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Job End Date:</strong> {selectedUser.jobEndDate ? new Date(selectedUser.jobEndDate).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Active:</strong> {selectedUser.isActive ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong className="font-medium text-gray-700">Role:</strong> {selectedUser.role}
                </p>
                <div className="mt-4">
                  <strong className="font-medium text-gray-700">Permissions:</strong>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(typeof selectedUser.permissions === 'string' 
                      ? JSON.parse(selectedUser.permissions) 
                      : selectedUser.permissions).map(([key, value]) => (
                      <div key={key} className="bg-gray-100 p-2 rounded">
                        <h6 className="font-medium text-gray-700 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                        <div className="flex flex-wrap">
                          {['view', 'create', 'edit', 'delete'].map(action => (
                            <span key={action} className={`mr-2 ${(value as string[]).includes(action) ? 'text-green-500' : 'text-red-500'}`}>
                              {action.charAt(0).toUpperCase() + action.slice(1)} {(value as string[]).includes(action) ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="items-center px-4 py-3">
              <button
                id="ok-btn"
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
