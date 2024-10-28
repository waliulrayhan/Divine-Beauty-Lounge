import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface User {
  id: string;
  employeeId: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

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

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">User List</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Employee ID</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Phone Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users
                .filter(user => user.isActive)
                .map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="py-4 px-6 text-sm text-gray-800">{user.employeeId}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.username}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.phoneNumber}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
