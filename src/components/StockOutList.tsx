"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface Service {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  serviceId: string;
}

interface StockOut {
  id: string;
  productId: string;
  productName: string;
  serviceName: string;
  quantity: number;
  comments: string;
  createdBy: string;
  createdAt: string;
}

interface StockOutListProps {
  permissions: string[];
}

const StockOutList: React.FC<StockOutListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newStockOut, setNewStockOut] = useState({
    serviceId: "",
    productId: "",
    quantity: 0,
    comments: "",
  });
  const [editingStockOut, setEditingStockOut] = useState<StockOut | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStockOuts();
    fetchServices();
  }, []);

  const fetchStockOuts = async () => {
    try {
      const response = await fetch("/api/stock-out");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStockOuts(data);
    } catch (error) {
      console.error("Error fetching stock outs:", error);
      toast.error("Failed to load stock outs");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
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
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStockOut(prev => ({ ...prev, [name]: value }));
    if (name === 'serviceId') {
      fetchProducts(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStockOut ? `/api/stock-out/${editingStockOut.id}` : '/api/stock-out';
      const method = editingStockOut ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStockOut),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStockOuts();
      toast.success(`Stock out ${editingStockOut ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingStockOut(null);
      setNewStockOut({
        serviceId: '',
        productId: '',
        quantity: 0,
        comments: '',
      });
    } catch (error) {
      console.error(`Error ${editingStockOut ? 'updating' : 'creating'} stock out:`, error);
      toast.error(`Failed to ${editingStockOut ? 'update' : 'create'} stock out`);
    }
  };

  const handleEdit = (stockOut: StockOut) => {
    setEditingStockOut(stockOut);
    setNewStockOut({
      serviceId: services.find(s => s.name === stockOut.serviceName)?.id || "",
      productId: stockOut.productId,
      quantity: stockOut.quantity,
      comments: stockOut.comments,
    });
    setShowForm(true);
    fetchProducts(services.find(s => s.name === stockOut.serviceName)?.id || "");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stock out?")) {
      try {
        const response = await fetch(`/api/stock-out/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchStockOuts();
        toast.success("Stock out deleted successfully");
      } catch (error) {
        console.error("Error deleting stock out:", error);
        toast.error("Failed to delete stock out");
      }
    }
  };

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const canCreate = isSuperAdmin || permissions.includes('create');
  const canEdit = isSuperAdmin || permissions.includes('edit');
  const canDelete = isSuperAdmin || permissions.includes('delete');

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Stock Out List</h2>
      {canCreate && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New Stock Out
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-black">{editingStockOut ? 'Edit Stock Out' : 'Add New Stock Out'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-black">Service</label>
              <select
                name="serviceId"
                value={newStockOut.serviceId}
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
                value={newStockOut.productId}
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
              <label className="block mb-2 text-black">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={newStockOut.quantity}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-2 text-black">Comments</label>
              <textarea
                name="comments"
                value={newStockOut.comments}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
            {editingStockOut ? 'Update Stock Out' : 'Create Stock Out'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-black uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-left">Service</th>
              <th className="py-3 px-6 text-left">Quantity</th>
              <th className="py-3 px-6 text-left">Comments</th>
              <th className="py-3 px-6 text-left">Created By</th>
              <th className="py-3 px-6 text-left">Created At</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black text-sm font-light">
            {stockOuts.map((stockOut) => (
              <tr
                key={stockOut.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">{stockOut.productName}</td>
                <td className="py-3 px-6 text-left">{stockOut.serviceName}</td>
                <td className="py-3 px-6 text-left">{stockOut.quantity}</td>
                <td className="py-3 px-6 text-left">{stockOut.comments}</td>
                <td className="py-3 px-6 text-left">{stockOut.createdBy}</td>
                <td className="py-3 px-6 text-left">
                  {new Date(stockOut.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-left">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(stockOut)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(stockOut.id)}
                      className="text-red-500 hover:text-red-700"
                    >
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

export default StockOutList;
