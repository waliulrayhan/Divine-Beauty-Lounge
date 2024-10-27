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

interface Brand {
  id: string;
  name: string;
  productId: string;  // Add this line
}

interface StockOut {
  id: string;
  productId: string;
  productName: string;
  serviceName: string;
  brandId: string;
  brandName: string;
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stockOutInputs, setStockOutInputs] = useState([{
    serviceId: '',
    productId: '',
    brandId: '',
    quantity: 0,
    comments: '',
  }]);
  const [editingStockOut, setEditingStockOut] = useState<StockOut | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null);

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

  const fetchBrands = async (productId: string) => {
    try {
      const response = await fetch(`/api/brands?productId=${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    }
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = [...stockOutInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: name === 'quantity' ? Number(value) : value
    };
    setStockOutInputs(newInputs);
    
    if (name === 'serviceId') {
      fetchProducts(value);
    } else if (name === 'productId') {
      fetchBrands(value);
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
        body: JSON.stringify(stockOutInputs),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStockOuts();
      toast.success(`Stock outs ${editingStockOut ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingStockOut(null);
      setStockOutInputs([{
        serviceId: '',
        productId: '',
        brandId: '',
        quantity: 0,
        comments: '',
      }]);
    } catch (error) {
      console.error(`Error ${editingStockOut ? 'updating' : 'creating'} stock outs:`, error);
      toast.error(`Failed to ${editingStockOut ? 'update' : 'create'} stock outs`);
    }
  };

  const handleEdit = (stockOut: StockOut) => {
    setEditingStockOut(stockOut);
    setStockOutInputs([{
      serviceId: services.find(s => s.name === stockOut.serviceName)?.id || "",
      productId: stockOut.productId,
      brandId: stockOut.brandId,
      quantity: stockOut.quantity,
      comments: stockOut.comments,
    }]);
    setShowForm(true);
    fetchProducts(services.find(s => s.name === stockOut.serviceName)?.id || "");
    fetchBrands(stockOut.productId);
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

  const handleViewDetails = (stockOut: StockOut) => {
    setSelectedStockOut(stockOut);
  };

  const addAnotherStockOut = () => {
    setStockOutInputs([...stockOutInputs, {
      serviceId: '',
      productId: '',
      brandId: '',
      quantity: 0,
      comments: '',
    }]);
  };

  const removeStockOut = (index: number) => {
    if (stockOutInputs.length > 1) {
      const newInputs = stockOutInputs.filter((_, i) => i !== index);
      setStockOutInputs(newInputs);
    }
  };

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const canCreate = isSuperAdmin || permissions.includes('create');
  const canEdit = isSuperAdmin || permissions.includes('edit');
  const canDelete = isSuperAdmin || permissions.includes('delete');
  const canView = isSuperAdmin || permissions.includes('view');

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
          <h3 className="text-xl font-semibold mb-4 text-black">
            {editingStockOut ? 'Edit Stock Out' : 'Add New Stock Out'}
          </h3>

          {stockOutInputs.map((stockOut, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-black">Stock Out #{index + 1}</h4>
                {!editingStockOut && stockOutInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStockOut(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove Entry
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-black">Service</label>
                  <select
                    name="serviceId"
                    value={stockOut.serviceId}
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

                <div>
                  <label className="block mb-2 text-black">Product</label>
                  <select
                    name="productId"
                    value={stockOut.productId}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="">Select a product</option>
                    {products
                      .filter(product => !stockOut.serviceId || product.serviceId === stockOut.serviceId)
                      .map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-black">Brand</label>
                  <select
                    name="brandId"
                    value={stockOut.brandId}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="">Select a brand</option>
                    {brands
                      .filter(brand => !stockOut.productId || brand.productId === stockOut.productId)
                      .map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-black">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={stockOut.quantity === 0 ? '' : stockOut.quantity}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    min="1"
                    className="w-full p-2 border rounded text-black"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 text-black">Comments</label>
                  <textarea
                    name="comments"
                    value={stockOut.comments}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
              </div>
            </div>
          ))}

          {!editingStockOut && (
            <button
              type="button"
              onClick={addAnotherStockOut}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Add Another Entry
            </button>
          )}

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {editingStockOut ? 'Update Stock Out' : 'Create Stock Out(s)'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-black uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">User Name</th>
              <th className="py-3 px-6 text-left">Brand Name</th>
              <th className="py-3 px-6 text-left">Product Name</th>
              <th className="py-3 px-6 text-left">Service Name</th>
              <th className="py-3 px-6 text-left">Quantity</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {stockOuts.map((stockOut) => (
              <tr key={stockOut.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{new Date(stockOut.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}</td>
                <td className="py-3 px-4">{stockOut.createdBy}</td>
                <td className="py-3 px-4">{stockOut.brandName}</td>
                <td className="py-3 px-4">{stockOut.productName}</td>
                <td className="py-3 px-4">{stockOut.serviceName}</td>
                <td className="py-3 px-4">{stockOut.quantity}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleViewDetails(stockOut)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    View
                  </button>
                  
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(stockOut)}
                      className="text-green-500 hover:text-green-700 mr-2"
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

      {selectedStockOut && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Stock Out Details</h3>
              <div className="mt-2 px-7 py-3 text-left">
                <p className="text-sm text-gray-500"><strong>Date:</strong> {new Date(selectedStockOut.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500"><strong>User Name:</strong> {selectedStockOut.createdBy}</p>
                <p className="text-sm text-gray-500"><strong>Brand Name:</strong> {selectedStockOut.brandName}</p>
                <p className="text-sm text-gray-500"><strong>Product Name:</strong> {selectedStockOut.productName}</p>
                <p className="text-sm text-gray-500"><strong>Service Name:</strong> {selectedStockOut.serviceName}</p>
                <p className="text-sm text-gray-500"><strong>Quantity:</strong> {selectedStockOut.quantity}</p>
                <p className="text-sm text-gray-500"><strong>Comments:</strong> {selectedStockOut.comments}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setSelectedStockOut(null)}
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

export default StockOutList;
