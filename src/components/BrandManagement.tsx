import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Brand {
  id: string;
  name: string;
  productId: string;  // Add this line
  productName: string;
  serviceName: string;
}

interface Service {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  serviceId: string;
}

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchServices();
  }, []);

  useEffect(() => {
    console.log('Current brands:', brands);
  }, [brands]);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      console.log('Fetched brands data:', data); // Debug log
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
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
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    setSelectedProduct('');
    if (serviceId) {
      fetchProducts(serviceId);
    } else {
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    try {
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newBrand,
          productId: selectedProduct
        }),
      });

      if (!response.ok) throw new Error('Failed to save brand');
      
      await fetchBrands();
      toast.success(`Brand ${editingBrand ? 'updated' : 'created'} successfully`);
      handleCloseForm();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Failed to save brand');
    }
  };

  const resetForm = () => {
    setNewBrand('');
    setSelectedService('');
    setSelectedProduct('');
    setEditingBrand(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      const response = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete brand');
      
      await fetchBrands();
      toast.success('Brand deleted successfully');
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  const handleEdit = async (brand: Brand) => {
    try {
      console.log('Starting edit process for brand:', brand);
      setShowForm(true);

      if (!brand.productId) {
        throw new Error('Product ID is missing from brand data');
      }

      // First, fetch the product details to get the serviceId
      const productResponse = await fetch(`/api/products/${brand.productId}`);
      console.log('Product response status:', productResponse.status);
      
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details');
      }

      const productData = await productResponse.json();
      console.log('Product data received:', productData);

      // Set the service first
      setSelectedService(productData.serviceId);
      
      // Fetch products for this service
      await fetchProducts(productData.serviceId);
      
      // Set the product and brand name
      setSelectedProduct(brand.productId);
      setNewBrand(brand.name);
      setEditingBrand(brand);

      console.log('Edit form setup completed successfully');
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load edit form');
      setShowForm(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-black">Brand Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Brand
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Service</label>
                <select
                  value={selectedService}
                  onChange={handleServiceChange}
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
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Brand Name</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Enter brand name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {editingBrand ? 'Update Brand' : 'Create Brand'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Brand Name</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Service</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="py-4 px-6 text-sm text-gray-800">{brand.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{brand.productName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{brand.serviceName}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('Editing brand:', brand);
                          handleEdit(brand);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
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

export default BrandManagement;
