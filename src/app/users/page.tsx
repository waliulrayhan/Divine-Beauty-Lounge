"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import UserList from '@/components/UserList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UsersPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'NORMAL_ADMIN') {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <UserList />
      <ToastContainer />
    </Dashboard>
  );
};

export default UsersPage;
