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
        try {
          const response = await fetch('/api/user/permissions');
          const data = await response.json();
          console.log("Raw permissions data:", data); // For debugging
          
          // Handle the permissions data structure
          const servicePermissions = data.permissions.service || [];
          console.log("Service permissions:", servicePermissions); // For debugging
          
          setPermissions(servicePermissions);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
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

  // Create a safeUser object to ensure email is a string
  const safeUser = {
    ...session.user,
    email: session.user.email ?? '', // Ensure email is a string
  };

  return (
    <Dashboard user={safeUser}>
      <ServiceList permissions={permissions} />
      <ToastContainer />
    </Dashboard>
  );
};

export default ServiceListPage;
