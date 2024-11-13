"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import CurrentStock from '@/components/CurrentStock';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CurrentStockPage: NextPage = () => {
  const { data: session } = useSession(); // Removed `status` as it's not used

  if (!session) {
    return <div>Access Denied</div>;
  }

  const safeUser = {
    ...session.user,
    email: session.user.email ?? '', // Ensure email is a string
  };

  return (
    <Dashboard user={safeUser}>
      <CurrentStock />
      <ToastContainer />
    </Dashboard>
  );
};

export default CurrentStockPage;
