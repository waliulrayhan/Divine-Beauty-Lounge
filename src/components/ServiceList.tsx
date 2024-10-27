"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Service {
  id: string;
  name: string;
  description: string;
  serviceCharge: number;
  createdAt: string;
  createdBy: {
    username: string;
  };
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

  const canCreate = permissions.includes('create');
  const canEdit = permissions.includes('edit');
  const canDelete = permissions.includes('delete');

  console.log("Can create:", canCreate);
  console.log("Can edit:", canEdit);
  console.log("Can delete:", canDelete);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Service List</h2>
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add New Service
      </button>

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

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded mb-4">
          <thead>
            <tr className="bg-gray-200 text-black uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Description</th>
              <th className="py-3 px-6 text-left">Service Charge</th>
              <th className="py-3 px-6 text-left">Created By</th>
              <th className="py-3 px-6 text-left">Created At</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-black text-sm font-light">
            {services.map(service => (
              <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{service.name}</td>
                <td className="py-3 px-6 text-left">{service.description}</td>
                <td className="py-3 px-6 text-left">${service.serviceCharge.toFixed(2)}</td>
                <td className="py-3 px-6 text-left">{service.createdBy.username}</td>
                <td className="py-3 px-6 text-left">{new Date(service.createdAt).toLocaleString()}</td>
                <td className="py-3 px-6 text-left">
                  <button onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700 mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceList;
