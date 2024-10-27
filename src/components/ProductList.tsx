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
  description: string;
  serviceId: string;
  serviceName: string;
  createdBy: string;
  createdAt: string;
}

interface ProductListProps {
  permissions: string[];
}

const ProductList: React.FC<ProductListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    serviceId: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    console.log("Received permissions:", permissions);
    fetchProducts();
    fetchServices();
  }, [permissions]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchProducts();
      toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct({ name: '', description: '', serviceId: '' });
    } catch (error) {
      console.error(`Error ${editingProduct ? 'updating' : 'creating'} product:`, error);
      toast.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      serviceId: product.serviceId,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        await fetchProducts();
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const canCreate = isSuperAdmin || permissions.includes('create');
  const canEdit = isSuperAdmin || permissions.includes('edit');
  const canDelete = isSuperAdmin || permissions.includes('delete');
  const canView = permissions.includes('view');

  console.log("Can create:", canCreate);
  console.log("Can edit:", canEdit);
  console.log("Can delete:", canDelete);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Product List</h2>
      {canCreate && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New Product
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-black">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <div className="mb-4">
            <label className="block mb-2 text-black">Product Name</label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-black">Description</label>
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-black">Service</label>
            <select
              name="serviceId"
              value={newProduct.serviceId}
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
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-black uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Description</th>
              <th className="py-3 px-6 text-left">Service</th>
              <th className="py-3 px-6 text-left">Created By</th>
              <th className="py-3 px-6 text-left">Created At</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black text-sm font-light">
            {products.map(product => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{product.name}</td>
                <td className="py-3 px-6 text-left">{product.description}</td>
                <td className="py-3 px-6 text-left">{product.serviceName}</td>
                <td className="py-3 px-6 text-left">{product.createdBy}</td>
                <td className="py-3 px-6 text-left">{new Date(product.createdAt).toLocaleString()}</td>
                <td className="py-3 px-6 text-left">
                  <button 
                    onClick={() => handleViewDetails(product)} 
                    className="text-green-500 hover:text-green-700 mr-2"
                  >
                    View Details
                  </button>
                  {canEdit && (
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 mr-2">
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedProduct.name} Details</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  <strong>Description:</strong> {selectedProduct.description}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Service:</strong> {selectedProduct.serviceName}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Created By:</strong> {selectedProduct.createdBy}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Created At:</strong> {new Date(selectedProduct.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
