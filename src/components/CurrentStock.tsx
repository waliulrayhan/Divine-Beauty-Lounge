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
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-black">Current Stock Overview</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Brand Name</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Service</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Total Stock In</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Total Stock Out</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="py-4 px-6 text-sm text-gray-800">{item.brandName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.productName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.serviceName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.totalStockIn}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{item.totalStockOut}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
                      ${item.currentStock <= 2 
                        ? 'text-red-600' 
                        : item.currentStock <= 5
                          ? 'text-yellow-600'
                          : 'text-green-600'
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
  );
};

export default CurrentStock;
