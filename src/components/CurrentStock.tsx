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
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Current Stock</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Brand Name</th>
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-left">Service</th>
              <th className="py-3 px-6 text-center">Total Stock In</th>
              <th className="py-3 px-6 text-center">Total Stock Out</th>
              <th className="py-3 px-6 text-center">Current Stock</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {stockItems.map(item => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left font-medium">{item.brandName}</td>
                <td className="py-3 px-6 text-left">{item.productName}</td>
                <td className="py-3 px-6 text-left">{item.serviceName}</td>
                <td className="py-3 px-6 text-center">{item.totalStockIn}</td>
                <td className="py-3 px-6 text-center">{item.totalStockOut}</td>
                <td className={`py-3 px-6 text-center font-medium ${
                  item.currentStock <= 10 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {item.currentStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentStock;
