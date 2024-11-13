"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import UserManagement from '@/components/UserManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserManagementPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return <div>Access Denied</div>;
  }

  // Create a safeUser object to ensure email is a string
  const safeUser = {
    ...session.user,
    email: session.user.email ?? '', // Ensure email is a string
  };

  return (
    <Dashboard user={safeUser}>
      <UserManagement />
      <ToastContainer />
    </Dashboard>
  );
};

export default UserManagementPage;
