"use client"

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Dashboard from '../../components/Dashboard';
import DashboardContent from '../../components/DashboardContent';

const DashboardPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <DashboardContent user={session.user} />
    </Dashboard>
  );
};

export default DashboardPage;
