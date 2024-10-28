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
  const [inputProducts, setInputProducts] = useState<{ [key: number]: Product[] }>({});
  const [inputBrands, setInputBrands] = useState<{ [key: number]: Brand[] }>({});

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

  const fetchProducts = async (serviceId: string, index: number) => {
    try {
      const response = await fetch(`/api/products?serviceId=${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data); // Keep this for backward compatibility
      setInputProducts(prev => ({
        ...prev,
        [index]: data
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchBrands = async (productId: string, index: number) => {
    try {
      const response = await fetch(`/api/brands?productId=${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBrands(data); // Keep this for backward compatibility
      setInputBrands(prev => ({
        ...prev,
        [index]: data
      }));
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
      fetchProducts(value, index);
    } else if (name === 'productId') {
      fetchBrands(value, index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate that required fields are filled
      const hasEmptyFields = stockOutInputs.some(
        input => !input.productId || !input.brandId || !input.quantity
      );

      if (hasEmptyFields) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await fetch('/api/stock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockOutInputs), // Send entire array of inputs
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create stock outs');
      }

      await fetchStockOuts();
      toast.success(`Stock outs created successfully`);
      
      // Reset form
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
      console.error('Error creating stock outs:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process stock outs');
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
    fetchProducts(services.find(s => s.name === stockOut.serviceName)?.id || "", 0);
    fetchBrands(stockOut.productId, 0);
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
    const currentIndex = stockOutInputs.length;
    // Copy products and brands from the last entry if they exist
    if (currentIndex > 0) {
      const lastIndex = currentIndex - 1;
      if (inputProducts[lastIndex]) {
        setInputProducts(prev => ({
          ...prev,
          [currentIndex]: inputProducts[lastIndex]
        }));
      }
      if (inputBrands[lastIndex]) {
        setInputBrands(prev => ({
          ...prev,
          [currentIndex]: inputBrands[lastIndex]
        }));
      }
    }
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
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Stock Out Management</h2>
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center gap-2"
          >
            <span>Add New Stock Out</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingStockOut ? 'Edit Stock Out' : 'Add New Stock Out'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {stockOutInputs.map((stockOut, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-black">Stock Out #{index + 1}</h4>
                  {!editingStockOut && stockOutInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStockOut(index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Service</label>
                    <select
                      name="serviceId"
                      value={stockOut.serviceId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Product</label>
                    <select
                      name="productId"
                      value={stockOut.productId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a product</option>
                      {(inputProducts[index] || [])
                        .filter(product => !stockOut.serviceId || product.serviceId === stockOut.serviceId)
                        .map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Brand</label>
                    <select
                      name="brandId"
                      value={stockOut.brandId}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">Select a brand</option>
                      {(inputBrands[index] || [])
                        .filter(brand => !stockOut.productId || brand.productId === stockOut.productId)
                        .map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={stockOut.quantity === 0 ? '' : stockOut.quantity}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Comments</label>
                    <textarea
                      name="comments"
                      value={stockOut.comments}
                      onChange={(e) => handleInputChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {!editingStockOut && (
                <button
                  type="button"
                  onClick={addAnotherStockOut}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add Another Entry
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingStockOut ? 'Update Stock Out' : 'Create Stock Out(s)'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Brand Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockOuts.map((stockOut) => (
                <tr key={stockOut.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm text-black">{new Date(stockOut.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}</td>
                  <td className="px-6 py-4 text-sm text-black">{stockOut.createdBy}</td>
                  <td className="px-6 py-4 text-sm text-black">{stockOut.brandName}</td>
                  <td className="px-6 py-4 text-sm text-black">{stockOut.productName}</td>
                  <td className="px-6 py-4 text-sm text-black">{stockOut.serviceName}</td>
                  <td className="px-6 py-4 text-sm text-black">{stockOut.quantity}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {canView && (
                      <button
                        onClick={() => handleViewDetails(stockOut)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(stockOut)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(stockOut.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
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

      {selectedStockOut && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900">
                  Stock Out Details
                </h3>
                <button
                  onClick={() => setSelectedStockOut(null)}
                  className="rounded-full p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Date</h4>
                  <p className="text-gray-900">{new Date(selectedStockOut.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">User Name</h4>
                  <p className="text-gray-900">{selectedStockOut.createdBy}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Brand Name</h4>
                    <p className="text-gray-900">{selectedStockOut.brandName}</p>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Product Name</h4>
                    <p className="text-gray-900">{selectedStockOut.productName}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Service Name</h4>
                    <p className="text-gray-900">{selectedStockOut.serviceName}</p>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Quantity</h4>
                    <p className="text-gray-900">{selectedStockOut.quantity}</p>
                  </div>
                </div>

                {selectedStockOut.comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Comments</h4>
                    <p className="text-gray-900">{selectedStockOut.comments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOutList;
