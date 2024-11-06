import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';

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
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save brand');
      }
      
      await fetchBrands();
      toast.success(`Brand ${editingBrand ? 'updated' : 'created'} successfully`);
      handleCloseForm();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save brand');
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

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Brand Name', 
      flex: 1,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      type: 'string',
      align: 'center',
      headerAlign: 'center'
    },
    { 
      field: 'productName', 
      headerName: 'Product Name', 
      flex: 1,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      type: 'string',
      align: 'center',
      headerAlign: 'center'
    },
    { 
      field: 'serviceName', 
      headerName: 'Product Category', 
      flex: 1,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      type: 'string',
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div className="flex gap-2 justify-center items-center h-full mt-0">
          <button
            onClick={() => {
              console.log('Editing brand:', params.row);
              handleEdit(params.row);
            }}
            className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition duration-200 text-sm"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.row.id)}
            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition duration-200 text-sm"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ];

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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box sx={{ 
          height: 600, 
          width: '100%',
          '& .table-header': {
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
          '& .table-cell': {
            fontSize: '0.875rem',
            color: '#334155',
          },
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f1f5f9',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '2px solid #e2e8f0',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '1rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
          },
          '& .MuiButton-root': {
            color: '#475569',
          },
          '& .MuiInputBase-root': {
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            padding: '0.25rem 0.5rem',
          },
        }}>
          <DataGrid
            rows={brands}
            columns={columns}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f8fafc',
              },
            }}
          />
        </Box>
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
                <label className="block text-sm font-medium text-black mb-2">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={handleServiceChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select a Product Category</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-black mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
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
    </div>
  );
};

export default BrandManagement;
