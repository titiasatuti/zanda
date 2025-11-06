
import React, { useState } from 'react';
import { Location } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';

interface LocationsPageProps {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
}

const LocationsPage: React.FC<LocationsPageProps> = ({ locations, setLocations }) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      const newLocation: Location = {
        id: `loc${Date.now()}`,
        name: newLocationName.trim(),
      };
      setLocations(prev => [...prev, newLocation]);
      setNewLocationName('');
    }
  };

  const handleDeleteLocation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
    }
  };

  const handleUpdateLocation = () => {
    if (editingLocation && editingLocation.name.trim()) {
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? editingLocation : loc));
      setEditingLocation(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>
        <form onSubmit={handleAddLocation} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="New location name (e.g., Warehouse C - Bay 4)"
            className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
          <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            <PlusIcon /> Add
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Locations</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {locations.map(location => (
            <li key={location.id} className="py-4 flex items-center justify-between">
              {editingLocation?.id === location.id ? (
                <div className="flex-grow flex gap-4">
                  <input
                    type="text"
                    value={editingLocation.name}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                  <button onClick={handleUpdateLocation} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingLocation(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="text-lg">{location.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingLocation(location)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200 p-2"><EditIcon /></button>
                    <button onClick={() => handleDeleteLocation(location.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2"><TrashIcon /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LocationsPage;
