"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '@/components/Dashboard';
import CurrentStock from '@/components/CurrentStock';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CurrentStockPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <CurrentStock />
      <ToastContainer />
    </Dashboard>
  );
};

export default CurrentStockPage;
