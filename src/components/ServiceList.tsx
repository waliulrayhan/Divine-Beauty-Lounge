"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';

interface Service {
  id: string;
  name: string;
  description: string;
  serviceCharge?: number;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface ServiceListProps {
  permissions: string[];
}

const ServiceList: React.FC<ServiceListProps> = ({ permissions }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceInputs, setServiceInputs] = useState([{
    name: '',
    description: '',
  }]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canCreate = permissions.includes('create');
  const canEdit = permissions.includes('edit');
  const canDelete = permissions.includes('delete');
  const canView = permissions.includes('view');

  console.log("Current permissions:", permissions);
  console.log("Can view:", canView);

  useEffect(() => {
    console.log("Permissions received:", permissions);
    fetchServices();
  }, [permissions]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newInputs = [...serviceInputs];
    newInputs[index] = {
      ...newInputs[index],
      [name]: name === 'serviceCharge' ? parseFloat(value) : value,
    };
    setServiceInputs(newInputs);
  };

  const addServiceInput = () => {
    setServiceInputs([...serviceInputs, {
      name: '',
      description: '',
    }]);
  };

  const removeServiceInput = (index: number) => {
    const newInputs = serviceInputs.filter((_, i) => i !== index);
    setServiceInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingService) {
        // Handle edit
        const response = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: serviceInputs[0].name,
            description: serviceInputs[0].description,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update service');
        }

        toast.success('Service updated successfully');
      } else {
        // Handle create
        const responses = await Promise.all(
          serviceInputs.map(service =>
            fetch('/api/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: service.name,
                description: service.description,
              }),
            })
          )
        );

        // Check each response and collect errors
        const results = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json();
            return { ok: response.ok, data };
          })
        );

        const errors = results
          .filter(result => !result.ok)
          .map(result => result.data.error);

        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        toast.success(`${serviceInputs.length} service(s) created successfully`);
      }

      await fetchServices();
      setShowForm(false);
      setServiceInputs([{ name: '', description: '' }]);
      setIsEditing(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setServiceInputs([{
      name: service.name,
      description: service.description,
    }]);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete service');
        await fetchServices();
        toast.success('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product category Name',
      flex: 1,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      headerClassName: 'table-header',
      cellClassName: 'table-cell',
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div className="flex gap-2 justify-center items-center h-full mt-0">
          {canView && (
            <button
              onClick={() => handleViewDetails(params.row)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition duration-200 text-sm"
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => handleEdit(params.row)}
              className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition duration-200 text-sm"
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(params.row.id)}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition duration-200 text-sm"
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Product Category Management</h2>
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product category
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Box sx={{ 
          height: 800, 
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
            rows={services}
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
                {isEditing ? 'Edit Product Category' : 'Add New Product Category'}
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
            
            {serviceInputs.map((service, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-black">Product Category #{index + 1}</h4>
                  {serviceInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeServiceInput(index)}
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
                    <label className="block text-sm font-medium text-black mb-2">
                      Product category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={service.name}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={service.description}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Service Charge <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="serviceCharge"
                      value={service.serviceCharge}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div> */}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {!isEditing && (
                <button
                  type="button"
                  onClick={addServiceInput}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add Another Product Category
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {isEditing ? 'Update Product Category' : 'Create Product Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedService.name} Details
                </h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="rounded-full p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-900">{selectedService.description}</p>
                </div>
                
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Service Charge</h4>
                  <p className="text-gray-900 text-lg font-medium">
                    ${selectedService.serviceCharge.toFixed(2)}
                  </p>
                </div> */}
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Created By</h4>
                    <p className="text-gray-900">{selectedService.createdBy.username}</p>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Created At</h4>
                    <p className="text-gray-900">{new Date(selectedService.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
