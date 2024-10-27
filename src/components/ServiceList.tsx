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
      // Handle multiple services creation
      const responses = await Promise.all(
        serviceInputs.map(service =>
          fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service),
          })
        )
      );

      // Check if all requests were successful
      const hasError = responses.some(response => !response.ok);
      if (hasError) {
        throw new Error('One or more services failed to create');
      }

      await fetchServices();
      toast.success(`${serviceInputs.length} service(s) created successfully`);
      setShowForm(false);
      setServiceInputs([{ name: '', description: '', serviceCharge: 0 }]);
    } catch (error) {
      console.error('Error creating services:', error);
      toast.error('Failed to create services');
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
          <h3 className="text-xl font-semibold mb-4 text-black">Add New Services</h3>
          
          {serviceInputs.map((service, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-black">Service #{index + 1}</h4>
                {serviceInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceInput(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={service.name}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="w-full p-2 border rounded text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Description</label>
                <textarea
                  name="description"
                  value={service.description}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  className="w-full p-2 border rounded text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-black">Service Charge</label>
                <input
                  type="number"
                  name="serviceCharge"
                  value={service.serviceCharge}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded text-black"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addServiceInput}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Another Service
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create Services
            </button>
          </div>
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
