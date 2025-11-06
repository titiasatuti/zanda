
import React, { useState, useEffect, useRef } from 'react';
import { Item, Location } from '../types';

interface ItemFormProps {
  itemToEdit?: Item | null;
  locations: Location[];
  onSave: (itemData: Omit<Item, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ itemToEdit, locations, onSave, onCancel }) => {
  const initializeItem = () => {
    if (itemToEdit) {
      return {
        name: itemToEdit.name,
        sku: itemToEdit.sku,
        category: itemToEdit.category,
        locationId: itemToEdit.locationId,
        quantity: itemToEdit.quantity,
        minStock: itemToEdit.minStock,
        description: itemToEdit.description,
        imageUrl: itemToEdit.imageUrl || `https://picsum.photos/seed/${itemToEdit.sku}/400/300`
      };
    } else {
        const randomSku = `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        return {
            name: '',
            sku: randomSku,
            category: '',
            locationId: locations[0]?.id || '',
            quantity: 0,
            minStock: 10,
            description: '',
            imageUrl: `https://picsum.photos/seed/${randomSku}/400/300`
        };
    }
  };

  const isInitialized = useRef(false);
  const [item, setItem] = useState(initializeItem());

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    if (itemToEdit) {
      setItem({
        name: itemToEdit.name,
        sku: itemToEdit.sku,
        category: itemToEdit.category,
        locationId: itemToEdit.locationId,
        quantity: itemToEdit.quantity,
        minStock: itemToEdit.minStock,
        description: itemToEdit.description,
        imageUrl: itemToEdit.imageUrl || `https://picsum.photos/seed/${itemToEdit.sku}/400/300`
      });
    }
  }, [itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: name === 'quantity' || name === 'minStock' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.name || !item.sku || !item.category || !item.locationId) {
        alert("Please fill in all required fields.");
        return;
    }
    const dataToSave = itemToEdit ? { ...item, id: itemToEdit.id } : item;
    onSave(dataToSave);
  };
  
  const InputField: React.FC<{name: keyof typeof item, label: string, type?: string, required?: boolean, children?: React.ReactNode}> = ({ name, label, type = 'text', required = false, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children ? (
             <select id={name} name={name} value={item[name]} onChange={handleChange} required={required} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700">
                {children}
            </select>
        ) : (
            <input type={type} id={name} name={name} value={item[name]} onChange={handleChange} required={required} autoComplete="off" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2" />
        )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{itemToEdit ? 'Edit Item' : 'Add New Item'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="name" label="Item Name" required />
          <InputField name="sku" label="SKU (Stock Keeping Unit)" required />
          <InputField name="category" label="Category" required />
          <InputField name="locationId" label="Location" required>
            <option value="" disabled>Select a location</option>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </InputField>
          <InputField name="quantity" label="Initial Quantity" type="number" required />
          <InputField name="minStock" label="Minimum Stock Level" type="number" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" name="description" value={item.description} onChange={handleChange} rows={3} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 px-3 py-2"></textarea>
        </div>
        <InputField name="imageUrl" label="Image URL" />

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Save Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
