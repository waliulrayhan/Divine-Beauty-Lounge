"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import ProfileManagement from '@/components/ProfileManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied</div>;
  }

  const dashboardUser = {
    username: session.user.username,
    email: session.user.email || '',
    role: session.user.role
  };

  return (
    <Dashboard user={dashboardUser}>
      <ProfileManagement />
      <ToastContainer />
    </Dashboard>
  );
};

export default ProfilePage; 