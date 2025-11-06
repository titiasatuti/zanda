
import React, { useState, useCallback, useMemo } from 'react';
import { Item, Location, Transaction, Page, TransactionType } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ItemDetail from './components/ItemDetail';
import ItemForm from './components/ItemForm';
import ScannerPage from './components/ScannerPage';
import LocationsPage from './components/LocationsPage';
import ReportsPage from './components/ReportsPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  // Mock Data
  const [locations, setLocations] = useState<Location[]>([
    { id: 'loc1', name: 'Warehouse A - Rack 1' },
    { id: 'loc2', name: 'Warehouse A - Rack 2' },
    { id: 'loc3', name: 'Warehouse B - Shelf 1' },
  ]);

  const [items, setItems] = useState<Item[]>([
    { id: 'item1', name: 'Heavy Duty Widget', sku: 'HDW-001', category: 'Widgets', locationId: 'loc1', quantity: 50, minStock: 10, description: 'A very heavy and durable widget.', imageUrl: 'https://picsum.photos/seed/item1/400/300' },
    { id: 'item2', name: 'Lightweight Gizmo', sku: 'LWG-002', category: 'Gizmos', locationId: 'loc2', quantity: 8, minStock: 5, description: 'A lightweight and portable gizmo.', imageUrl: 'https://picsum.photos/seed/item2/400/300' },
    { id: 'item3', name: 'Standard Sprocket', sku: 'STS-003', category: 'Sprockets', locationId: 'loc1', quantity: 120, minStock: 25, description: 'A standard issue sprocket for everyday use.', imageUrl: 'https://picsum.photos/seed/item3/400/300' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
      { id: 't1', itemId: 'item1', type: TransactionType.INBOUND, quantityChange: 50, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 't2', itemId: 'item2', type: TransactionType.INBOUND, quantityChange: 20, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 't3', itemId: 'item2', type: TransactionType.OUTBOUND, quantityChange: -12, timestamp: new Date().toISOString() },
  ]);

  const navigateTo = (page: Page, itemId?: string) => {
    setCurrentPage(page);
    if (itemId) {
      setSelectedItemId(itemId);
    } else {
        setSelectedItemId(null);
    }
    setItemToEdit(null);
  };
  
  const handleViewItem = (itemId: string) => {
    navigateTo(Page.ITEM_DETAIL, itemId);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setCurrentPage(Page.ITEM_FORM);
  };

  const handleAddNewItem = () => {
    setItemToEdit(null);
    setCurrentPage(Page.ITEM_FORM);
  };
  
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        // Also remove related transactions for demo purposes
        setTransactions(prev => prev.filter(t => t.itemId !== itemId));
        if (currentPage === Page.ITEM_DETAIL) {
            navigateTo(Page.INVENTORY);
        }
    }
  };

  const saveItem = (itemData: Omit<Item, 'id'> & { id?: string }) => {
    if (itemData.id) {
        setItems(prev => prev.map(item => item.id === itemData.id ? { ...item, ...itemData } as Item : item));
    } else {
        const newItem: Item = { ...itemData, id: `item${Date.now()}`};
        setItems(prev => [...prev, newItem]);
    }
    navigateTo(Page.INVENTORY);
  };

  const updateStock = useCallback((sku: string, quantityChange: number, type: TransactionType, notes?: string) => {
    const itemToUpdate = items.find(item => item.sku === sku);
    if (!itemToUpdate) {
        alert('Item with this SKU not found!');
        return false;
    }
    
    setItems(prev => prev.map(item => 
        item.sku === sku ? { ...item, quantity: item.quantity + quantityChange } : item
    ));

    const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        itemId: itemToUpdate.id,
        type,
        quantityChange: quantityChange,
        timestamp: new Date().toISOString(),
        notes,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  }, [items]);


  const selectedItem = useMemo(() => {
    return items.find(item => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);


  const renderContent = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard items={items} transactions={transactions} onNavigate={navigateTo} />;
      case Page.INVENTORY:
        return <InventoryList items={items} locations={locations} onView={handleViewItem} onEdit={handleEditItem} onDelete={handleDeleteItem} onAddNew={handleAddNewItem} />;
      case Page.ITEM_DETAIL:
        return selectedItem ? <ItemDetail item={selectedItem} locations={locations} transactions={transactions.filter(t => t.itemId === selectedItem.id)} onEdit={handleEditItem} onDelete={handleDeleteItem} /> : <p>Item not found</p>;
      case Page.ITEM_FORM:
        return <ItemForm itemToEdit={itemToEdit} locations={locations} onSave={saveItem} onCancel={() => navigateTo(itemToEdit ? Page.ITEM_DETAIL : Page.INVENTORY, itemToEdit?.id)} />;
      case Page.SCANNER:
        return <ScannerPage onStockUpdate={updateStock} onNavigateToDetail={(sku) => {
            const item = items.find(i => i.sku === sku);
            if (item) navigateTo(Page.ITEM_DETAIL, item.id);
            else alert('Item not found');
        }} />;
      case Page.LOCATIONS:
        return <LocationsPage locations={locations} setLocations={setLocations} />;
      case Page.REPORTS:
        return <ReportsPage transactions={transactions} items={items} />;
      default:
        return <Dashboard items={items} transactions={transactions} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <Header onNavigate={navigateTo} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
