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

  // Check permissions
  const canCreate = permissions.includes('create');
  const canEdit = permissions.includes('edit');
  const canDelete = permissions.includes('delete');
  const canView = permissions.includes('view');

  console.log("Current permissions:", permissions); // For debugging
  console.log("Can view:", canView); // For debugging

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: name === 'serviceCharge' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchServices();
      toast.success(`Service ${editingService ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingService(null);
      setNewService({ name: '', description: '', serviceCharge: 0 });
    } catch (error) {
      console.error(`Error ${editingService ? 'updating' : 'creating'} service:`, error);
      toast.error(`Failed to ${editingService ? 'update' : 'create'} service`);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      serviceCharge: service.serviceCharge,
    });
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Service List</h2>

      {/* Only show Add New Service button if user has create permission */}
      {canCreate && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New Service
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Service Charge</th>
              <th className="py-3 px-4 text-left">Created By</th>
              <th className="py-3 px-4 text-left">Created At</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {services.map((service) => (
              <tr key={service.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{service.name}</td>
                <td className="py-3 px-4">{service.description}</td>
                <td className="py-3 px-4">${service.serviceCharge}</td>
                <td className="py-3 px-4">{service.createdBy?.username}</td>
                <td className="py-3 px-4">
                  {new Date(service.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {/* Only show View button if user has view permission */}
                  {canView && (
                    <button
                      onClick={() => handleViewDetails(service)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View
                    </button>
                  )}
                  
                  {/* Only show Edit button if user has edit permission */}
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-green-500 hover:text-green-700 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  
                  {/* Only show Delete button if user has delete permission */}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(service.id)}
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

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-black">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
          <div className="mb-4">
            <label className="block mb-2 text-black">Service Name</label>
            <input
              type="text"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-black">Description</label>
            <textarea
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-black">Service Charge</label>
            <input
              type="number"
              name="serviceCharge"
              value={newService.serviceCharge}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            {editingService ? 'Update Service' : 'Create Service'}
          </button>
        </form>
      )}

      {selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedService.name} Details</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  <strong>Description:</strong> {selectedService.description}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Service Charge:</strong> ${selectedService.serviceCharge.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Created By:</strong> {selectedService.createdBy.username}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Created At:</strong> {new Date(selectedService.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setSelectedService(null)}
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

export default ServiceList;
