import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface StockItem {
  id: string;
  brandName: string;
  productName: string;
  serviceName: string;
  totalStockIn: number;
  totalStockOut: number;
  currentStock: number;
}

const CurrentStock: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentStock();
  }, []);

  const fetchCurrentStock = async () => {
    try {
      const response = await fetch('/api/current-stock');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockItems(data);
    } catch (error) {
      console.error('Error fetching current stock:', error);
      toast.error('Failed to load current stock');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Current Stock Overview</h2>
          {/* <div className="flex space-x-3">
            <button 
              onClick={fetchCurrentStock}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Stock
            </button>
          </div> */}
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock In</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock Out</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.brandName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.serviceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{item.totalStockIn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{item.totalStockOut}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
                        ${item.currentStock <= 2 
                          ? 'text-red-800' 
                          : item.currentStock <= 5
                            ? 'text-yellow-800'
                            : 'text-green-800'
                        }`}>
                        {item.currentStock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStock;
