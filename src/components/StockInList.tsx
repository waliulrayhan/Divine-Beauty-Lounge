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

// Add Brand interface
interface Brand {
  id: string;
  name: string;
  productId: string;
}

const StockInList: React.FC<StockInListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockInInputs, setStockInInputs] = useState([{
    serviceId: '',
    productId: '',
    brandName: '',
    quantity: 0,
    pricePerUnit: 0,
    comments: '',
  }]);
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
  const [inputProducts, setInputProducts] = useState<{ [key: number]: Product[] }>({});
  const [inputBrands, setInputBrands] = useState<{ [key: number]: Brand[] }>({});
  const [showBrandSuggestions, setShowBrandSuggestions] = useState<{ [key: number]: boolean }>({});
  const [filteredBrands, setFilteredBrands] = useState<{ [key: number]: Brand[] }>({});

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

  const fetchProducts = async (serviceId: string, index: number) => {
    try {
      const response = await fetch(`/api/products?serviceId=${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
      setInputProducts(prev => ({
        ...prev,
        [index]: data
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchBrands = async (productId: string, index: number) => {
    try {
      const response = await fetch(`/api/brands?productId=${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInputBrands(prev => ({
        ...prev,
        [index]: data
      }));
      setFilteredBrands(prev => ({
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
    const newInputs = [...stockInInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: name === 'quantity' || name === 'pricePerUnit' 
        ? Number(value)
        : value
    };
    setStockInInputs(newInputs);
    
    if (name === 'serviceId') {
      fetchProducts(value, index);
    } else if (name === 'productId') {
      fetchBrands(value, index);
    } else if (name === 'brandName') {
      // Filter brands based on input
      const filtered = inputBrands[index]?.filter(brand => 
        brand.name.toLowerCase().includes(value.toLowerCase())
      ) || [];
      setFilteredBrands(prev => ({
        ...prev,
        [index]: filtered
      }));
      setShowBrandSuggestions(prev => ({
        ...prev,
        [index]: true
      }));
    }
  };

  const handleBrandSelect = (index: number, brandName: string) => {
    const newInputs = [...stockInInputs];
    newInputs[index] = {
      ...newInputs[index],
      brandName
    };
    setStockInInputs(newInputs);
    setShowBrandSuggestions(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const addAnotherStockIn = () => {
    const currentIndex = stockInInputs.length;
    if (currentIndex > 0) {
      const lastIndex = currentIndex - 1;
      if (inputProducts[lastIndex]) {
        setInputProducts(prev => ({
          ...prev,
          [currentIndex]: inputProducts[lastIndex]
        }));
      }
    }
    setStockInInputs([...stockInInputs, {
      serviceId: '',
      productId: '',
      brandName: '',
      quantity: 0,
      pricePerUnit: 0,
      comments: '',
    }]);
  };

  const removeStockIn = (index: number) => {
    if (stockInInputs.length > 1) {
      const newInputs = stockInInputs.filter((_, i) => i !== index);
      setStockInInputs(newInputs);
    }
  };

  const createBrand = async (productId: string, brandName: string) => {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name: brandName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create brand');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all(
        stockInInputs.map(async (stockIn) => {
          if (stockIn.productId && stockIn.brandName) {
            await createBrand(stockIn.productId, stockIn.brandName);
          }
        })
      );

      const responses = await Promise.all(
        stockInInputs.map(stockIn =>
          fetch('/api/stock-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockIn),
          })
        )
      );

      const hasError = responses.some(response => !response.ok);
      if (hasError) {
        throw new Error('One or more stock ins failed to create');
      }

      await fetchStockIns();
      toast.success(`${stockInInputs.length} stock in(s) created successfully`);
      setShowForm(false);
      setStockInInputs([{
        serviceId: '',
        productId: '',
        brandName: '',
        quantity: 0,
        pricePerUnit: 0,
        comments: '',
      }]);
    } catch (error) {
      console.error('Error creating stock ins:', error);
      toast.error('Failed to create stock ins');
    }
  };

  const handleEdit = (stockIn: StockIn) => {
    setEditingStockIn(stockIn);
    setStockInInputs([{
      serviceId: services.find(s => s.name === stockIn.serviceName)?.id || '',
      productId: stockIn.productId,
      brandName: stockIn.brandName,
      quantity: stockIn.quantity,
      pricePerUnit: stockIn.pricePerUnit,
      comments: stockIn.comments || '',
    }]);
    
    const serviceId = services.find(s => s.name === stockIn.serviceName)?.id;
    if (serviceId) {
      fetchProducts(serviceId, 0);
    }
    
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

  const handleViewDetails = (stockIn: StockIn) => {
    setSelectedStockIn(stockIn);
  };

  // Check permissions
  const canCreate = permissions.includes('create');
  const canEdit = permissions.includes('edit');
  const canDelete = permissions.includes('delete');
  const canView = permissions.includes('view');

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
          <h3 className="text-xl font-semibold mb-4 text-black">
            {editingStockIn ? 'Edit Stock In' : 'Add New Stock In'}
          </h3>

          {stockInInputs.map((stockIn, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-black">Stock In #{index + 1}</h4>
                {!editingStockIn && stockInInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStockIn(index)}
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
                    value={stockIn.serviceId}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-black">Product</label>
                  <select
                    name="productId"
                    value={stockIn.productId}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    className="w-full p-2 border rounded text-black"
                  >
                    <option value="">Select a product</option>
                    {(inputProducts[index] || [])
                      .filter(product => !stockIn.serviceId || product.serviceId === stockIn.serviceId)
                      .map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-black">Brand Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="brandName"
                      value={stockIn.brandName}
                      onChange={(e) => handleInputChange(index, e)}
                      onFocus={() => setShowBrandSuggestions(prev => ({ ...prev, [index]: true }))}
                      required
                      className="w-full p-2 border rounded text-black"
                      placeholder="Type to search or add new brand"
                      autoComplete="off"
                    />
                    {showBrandSuggestions[index] && filteredBrands[index]?.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredBrands[index].map(brand => (
                          <div
                            key={brand.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                            onClick={() => handleBrandSelect(index, brand.name)}
                          >
                            {brand.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-black">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={stockIn.quantity === 0 ? '' : stockIn.quantity}
                    onChange={(e) => handleInputChange(index, e)}
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
                    value={stockIn.pricePerUnit === 0 ? '' : stockIn.pricePerUnit}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-black">Comments</label>
                  <textarea
                    name="comments"
                    value={stockIn.comments}
                    onChange={(e) => handleInputChange(index, e)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
              </div>
            </div>
          ))}

          {!editingStockIn && (
            <button
              type="button"
              onClick={addAnotherStockIn}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Add Another Entry
            </button>
          )}

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {editingStockIn ? 'Update Stock In' : 'Create Stock In(s)'}
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
              <th className="py-3 px-6 text-left">Unit Price</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {stockIns.map((stockIn) => (
              <tr key={stockIn.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{new Date(stockIn.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' })}</td>
                <td className="py-3 px-4">{stockIn.createdBy}</td>
                <td className="py-3 px-4">{stockIn.brandName}</td>
                <td className="py-3 px-4">{stockIn.productName}</td>
                <td className="py-3 px-4">{stockIn.serviceName}</td>
                <td className="py-3 px-4">{stockIn.quantity}</td>
                <td className="py-3 px-4">${stockIn.pricePerUnit.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleViewDetails(stockIn)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    View
                  </button>
                  
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(stockIn)}
                      className="text-green-500 hover:text-green-700 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(stockIn.id)}
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

      {selectedStockIn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Stock In Details</h3>
              <div className="mt-2 px-7 py-3 text-left">
                <p className="text-sm text-gray-500"><strong>Product:</strong> {selectedStockIn.productName}</p>
                <p className="text-sm text-gray-500"><strong>Service:</strong> {selectedStockIn.serviceName}</p>
                <p className="text-sm text-gray-500"><strong>Brand:</strong> {selectedStockIn.brandName}</p>
                <p className="text-sm text-gray-500"><strong>Quantity:</strong> {selectedStockIn.quantity}</p>
                <p className="text-sm text-gray-500"><strong>Price Per Unit:</strong> ${selectedStockIn.pricePerUnit.toFixed(2)}</p>
                <p className="text-sm text-gray-500"><strong>Total Value:</strong> ${(selectedStockIn.quantity * selectedStockIn.pricePerUnit).toFixed(2)}</p>
                <p className="text-sm text-gray-500"><strong>Comments:</strong> {selectedStockIn.comments}</p>
                <p className="text-sm text-gray-500"><strong>Created By:</strong> {selectedStockIn.createdBy}</p>
                <p className="text-sm text-gray-500"><strong>Created At:</strong> {new Date(selectedStockIn.createdAt).toLocaleString()}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setSelectedStockIn(null)}
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

export default StockInList;
