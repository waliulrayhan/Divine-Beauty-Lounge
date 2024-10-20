'use client';

import React from 'react';

interface DashboardContentProps {
  user: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-gray-700 text-3xl font-medium">Welcome, {user?.name}</h3>
      <div className="mt-4">
        <div className="flex flex-wrap -mx-6">
          <div className="w-full px-6 sm:w-1/2 xl:w-1/3">
            <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
              <div className="p-3 rounded-full bg-indigo-600 bg-opacity-75">
                {/* Icon */}
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-gray-700">8,282</h4>
                <div className="text-gray-500">New Orders</div>
              </div>
            </div>
          </div>
          <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
            <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
              <div className="p-3 rounded-full bg-orange-600 bg-opacity-75">
                {/* Icon */}
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-gray-700">200,521</h4>
                <div className="text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
          <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
            <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
              <div className="p-3 rounded-full bg-pink-600 bg-opacity-75">
                {/* Icon */}
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-gray-700">215,542</h4>
                <div className="text-gray-500">Available Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add more dashboard widgets and content as needed */}
    </div>
  );
};

export default DashboardContent;
