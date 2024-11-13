"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import BrandManagement from '@/components/BrandManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BrandManagementPage: NextPage = () => {
  const { data: session } = useSession(); // Removed `status` as it's not used

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return <div>Access Denied</div>;
  }
  
  const safeUser = {
    ...session.user,
    email: session.user.email ?? '', // Ensure email is a string
  };
  
  return (
    <Dashboard user={safeUser}>
      <BrandManagement />
      <ToastContainer />
    </Dashboard>
  );
};

export default BrandManagementPage;
