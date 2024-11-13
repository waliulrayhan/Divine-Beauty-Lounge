"use client";

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import ProductList from '@/components/ProductList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductListPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/permissions');
          const data = await response.json();
          console.log("Fetched permissions:", data.permissions);
          setPermissions(data.permissions.product || []);
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

  console.log("Passing permissions to ProductList:", permissions);

  return (
    <Dashboard user={safeUser}>
      <ProductList permissions={permissions} />
      <ToastContainer />
    </Dashboard>
  );
};

export default ProductListPage;
