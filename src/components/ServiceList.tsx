"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { usePermissions } from '@/hooks/usePermissions';

interface Service {
  id: string;
  name: string;
  description: string;
  serviceCharge: number;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface ServiceListProps {
  permissions: string[];
}

const ServiceList: React.FC<ServiceListProps> = ({ permissions }) => {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    serviceCharge: 0,
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { can, loading } = usePermissions('service');
  const [serviceInputs, setServiceInputs] = useState([{
    name: '',
    description: '',
    serviceCharge: 0,
  }]);
  const [isEditing, setIsEditing] = useState(false);

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
      serviceCharge: 0,
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
          body: JSON.stringify(serviceInputs[0]),
        });

        if (!response.ok) {
          throw new Error('Failed to update service');
        }

        toast.success('Service updated successfully');
      } else {
        // Handle create (existing code)
        const responses = await Promise.all(
          serviceInputs.map(service =>
            fetch('/api/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(service),
            })
          )
        );

        const hasError = responses.some(response => !response.ok);
        if (hasError) {
          throw new Error('One or more services failed to create');
        }

        toast.success(`${serviceInputs.length} service(s) created successfully`);
      }

      await fetchServices();
      setShowForm(false);
      setServiceInputs([{ name: '', description: '', serviceCharge: 0 }]);
      setIsEditing(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(isEditing ? 'Failed to update service' : 'Failed to create services');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setServiceInputs([{
      name: service.name,
      description: service.description,
      serviceCharge: service.serviceCharge,
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

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>
        {canCreate && (
          <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Service
        </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service Charge</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm text-black">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-black">{service.description}</td>
                  <td className="px-6 py-4 text-sm text-black">{service.serviceCharge} Tk</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {canView && (
                      <button
                        onClick={() => handleViewDetails(service)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(service.id)}
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

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">
                {isEditing ? 'Edit Service' : 'Add New Services'}
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
                  <h4 className="text-lg font-semibold text-black">Service #{index + 1}</h4>
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
                    <label className="block text-sm font-medium text-black mb-2">Service Name</label>
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
                    <label className="block text-sm font-medium text-black mb-2">Description</label>
                    <textarea
                      name="description"
                      value={service.description}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Service Charge</label>
                    <input
                      type="number"
                      name="serviceCharge"
                      value={service.serviceCharge}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              {/* <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button> */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={addServiceInput}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add Another Service
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                {isEditing ? 'Update Service' : 'Create Services'}
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
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Service Charge</h4>
                  <p className="text-gray-900 text-lg font-medium">
                    ${selectedService.serviceCharge.toFixed(2)}
                  </p>
                </div>
                
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
