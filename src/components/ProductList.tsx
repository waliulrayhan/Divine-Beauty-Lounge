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
  const [productInputs, setProductInputs] = useState([{
    name: '',
    description: '',
    serviceId: '',
  }]);

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

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = [...productInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: value,
    };
    setProductInputs(newInputs);
  };

  const addProductInput = () => {
    setProductInputs([...productInputs, {
      name: '',
      description: '',
      serviceId: '',
    }]);
  };

  const removeProductInput = (index: number) => {
    const newInputs = productInputs.filter((_, i) => i !== index);
    setProductInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const responses = await Promise.all(
        productInputs.map(product =>
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          })
        )
      );

      const hasError = responses.some(response => !response.ok);
      if (hasError) {
        throw new Error('One or more products failed to create');
      }

      await fetchProducts();
      toast.success(`${productInputs.length} product(s) created successfully`);
      setShowForm(false);
      setProductInputs([{ name: '', description: '', serviceId: '' }]);
    } catch (error) {
      console.error('Error creating products:', error);
      toast.error('Failed to create products');
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
          <h3 className="text-xl font-semibold mb-4 text-black">Add New Products</h3>
          
          {productInputs.map((product, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-black">Product #{index + 1}</h4>
                {productInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="w-full p-2 border rounded text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Description</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="w-full p-2 border rounded text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Service</label>
                <select
                  name="serviceId"
                  value={product.serviceId}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="w-full p-2 border rounded text-black"
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addProductInput}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Another Product
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create Products
            </button>
          </div>
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
