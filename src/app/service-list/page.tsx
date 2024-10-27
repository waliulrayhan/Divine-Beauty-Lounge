"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import ServiceList from '@/components/ServiceList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServiceListPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/user/permissions');
        const data = await response.json();
        console.log("Fetched permissions:", data.permissions);
        setPermissions(data.permissions.service || []);
      }
    };

    if (session) {
      fetchPermissions();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied</div>;
  }

  return (
    <Dashboard user={session.user}>
      <ServiceList permissions={permissions} />
      <ToastContainer />
    </Dashboard>
  );
};

export default ServiceListPage;
