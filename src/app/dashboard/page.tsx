"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard';
import DashboardContent from '../../components/DashboardContent';

const DashboardPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        const response = await fetch(`/api/user?email=${session.user.email}`);
        const data = await response.json();
        setUserData(data);
      }
    };

    if (session) {
      fetchUserData();
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
      <DashboardContent user={userData} />
    </Dashboard>
  );
};

export default DashboardPage;
