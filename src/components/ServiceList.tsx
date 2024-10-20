"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Service {
  id: string;
  name: string;
  description: string;
  charge: number;
  dateAdded: string;
  addedBy: string;
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: '', description: '', charge: '' });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch services from API
    // For now, we'll use mock data
    setServices([
      { id: '1', name: 'Service 1', description: 'Description 1', charge: 100, dateAdded: '2023-05-01', addedBy: 'Admin 1' },
      { id: '2', name: 'Service 2', description: 'Description 2', charge: 200, dateAdded: '2023-05-02', addedBy: 'Admin 2' },
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingService) {
      setEditingService({ ...editingService, [name]: name === 'charge' ? parseFloat(value) : value });
    } else {
      setNewService({ ...newService, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      // Update existing service
      const updatedServices = services.map(service => 
        service.id === editingService.id ? editingService : service
      );
      setServices(updatedServices);
      setEditingService(null);
    } else {
      // Add new service
      const service: Service = {
        id: Date.now().toString(),
        ...newService,
        charge: parseFloat(newService.charge),
        dateAdded: new Date().toISOString().split('T')[0],
        addedBy: session?.user?.name || 'Unknown',
      };
      setServices([...services, service]);
      setNewService({ name: '', description: '', charge: '' });
    }
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Service List</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Service</span>
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-black">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Service Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editingService ? editingService.name : newService.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={editingService ? editingService.description : newService.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="charge" className="block text-sm font-medium text-gray-700">Service Charge</label>
            <input
              type="number"
              id="charge"
              name="charge"
              value={editingService ? editingService.charge : newService.charge}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-black"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              {editingService ? 'Update Service' : 'Save Service'}
            </button>
            <button type="button" onClick={() => {setShowForm(false); setEditingService(null);}} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-black">{service.name}</td>
                <td className="px-6 py-4 text-black">{service.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">${service.charge.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{service.dateAdded}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{service.addedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button onClick={() => alert(`View details for ${service.name}`)} className="text-blue-600 hover:text-blue-900">View</button>
                    <button onClick={() => handleEdit(service)} className="text-indigo-600 hover:text-indigo-900">Update</button>
                    <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
