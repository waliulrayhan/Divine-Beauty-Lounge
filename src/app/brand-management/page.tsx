"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import BrandManagement from '@/components/BrandManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BrandManagementPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <BrandManagement />
      <ToastContainer />
    </Dashboard>
  );
};

export default BrandManagementPage;
