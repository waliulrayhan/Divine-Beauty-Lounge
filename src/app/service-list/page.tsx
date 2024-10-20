"use client"

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import ServiceList from '@/components/ServiceList';
import Dashboard from '@/components/Dashboard';

const ServiceListPage: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <ServiceList />
    </Dashboard>
  );
};

export default ServiceListPage;
