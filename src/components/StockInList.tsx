"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Service {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  serviceId: string;
}

interface StockIn {
  id: string;
  productId: string;
  productName: string;
  serviceName: string;
  brandName: string;
  quantity: number;
  pricePerUnit: number;
  comments: string;
  createdBy: string;
  createdAt: string;
}

interface StockInListProps {
  permissions: string[];
}

const StockInList: React.FC<StockInListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newStockIn, setNewStockIn] = useState({
    serviceId: '',
    productId: '',
    brandName: '',
    quantity: 0,
    pricePerUnit: 0,
    comments: '',
  });
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStockIns();
    fetchServices();
  }, []);

  const fetchStockIns = async () => {
    try {
      const response = await fetch('/api/stock-in');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockIns(data);
    } catch (error) {
      console.error('Error fetching stock ins:', error);
      toast.error('Failed to load stock ins');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchProducts = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/products?serviceId=${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStockIn(prev => ({ ...prev, [name]: value }));
    if (name === 'serviceId') {
      fetchProducts(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStockIn ? `/api/stock-in/${editingStockIn.id}` : '/api/stock-in';
      const method = editingStockIn ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStockIn),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStockIns();
      toast.success(`Stock in ${editingStockIn ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingStockIn(null);
      setNewStockIn({
        serviceId: '',
        productId: '',
        brandName: '',
        quantity: 0,
        pricePerUnit: 0,
        comments: '',
      });
    } catch (error) {
      console.error(`Error ${editingStockIn ? 'updating' : 'creating'} stock in:`, error);
      toast.error(`Failed to ${editingStockIn ? 'update' : 'create'} stock in`);
    }
  };

  const handleEdit = (stockIn: StockIn) => {
    setEditingStockIn(stockIn);
    setNewStockIn({
      serviceId: services.find(s => s.name === stockIn.serviceName)?.id || '',
      productId: stockIn.productId,
      brandName: stockIn.brandName,
      quantity: stockIn.quantity,
      pricePerUnit: stockIn.pricePerUnit,
      comments: stockIn.comments,
    });
    fetchProducts(services.find(s => s.name === stockIn.serviceName)?.id || '');
    setShowForm(true);
  };

  const handleDelete = async (stockInId: string) => {
    if (window.confirm('Are you sure you want to delete this stock in record?')) {
      try {
        const response = await fetch(`/api/stock-in/${stockInId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete stock in');
        await fetchStockIns();
        toast.success('Stock in record deleted successfully');
      } catch (error) {
        console.error('Error deleting stock in:', error);
        toast.error('Failed to delete stock in record');
      }
    }
  };

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const canCreate = isSuperAdmin || permissions.includes('create');
  const canEdit = isSuperAdmin || permissions.includes('edit');
  const canDelete = isSuperAdmin || permissions.includes('delete');

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Stock In List</h2>
      {canCreate && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New Stock In
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-black">{editingStockIn ? 'Edit Stock In' : 'Add New Stock In'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-black">Service</label>
              <select
                name="serviceId"
                value={newStockIn.serviceId}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-black">Product</label>
              <select
                name="productId"
                value={newStockIn.productId}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded text-black"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-black">Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={newStockIn.brandName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-2 text-black">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={newStockIn.quantity}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-2 text-black">Price Per Unit</label>
              <input
                type="number"
                name="pricePerUnit"
                value={newStockIn.pricePerUnit}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-2 text-black">Comments</label>
              <textarea
                name="comments"
                value={newStockIn.comments}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
            {editingStockIn ? 'Update Stock In' : 'Create Stock In'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-black uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">User Name</th>
              <th className="py-3 px-6 text-left">Brand Name</th>
              <th className="py-3 px-6 text-left">Product Name</th>
              <th className="py-3 px-6 text-left">Service Name</th>
              <th className="py-3 px-6 text-left">Quantity</th>
              <th className="py-3 px-6 text-left">Unit Price</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black text-sm font-light">
            {stockIns.map(stockIn => (
              <tr key={stockIn.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{new Date(stockIn.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' })}</td>
                <td className="py-3 px-6 text-left">{stockIn.createdBy}</td>
                <td className="py-3 px-6 text-left">{stockIn.brandName}</td>
                <td className="py-3 px-6 text-left">{stockIn.productName}</td>
                <td className="py-3 px-6 text-left">{stockIn.serviceName}</td>
                <td className="py-3 px-6 text-left">{stockIn.quantity}</td>
                <td className="py-3 px-6 text-left">${stockIn.pricePerUnit.toFixed(2)}</td>
                <td className="py-3 px-6 text-left">
                  {canEdit && (
                    <button onClick={() => handleEdit(stockIn)} className="text-blue-500 hover:text-blue-700 mr-2">
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(stockIn.id)} className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockInList;