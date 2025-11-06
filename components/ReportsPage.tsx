
import React, { useState, useMemo } from 'react';
import { Transaction, Item, TransactionType } from '../types';

interface ReportsPageProps {
  transactions: Transaction[];
  items: Item[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions, items }) => {
  const [filterType, setFilterType] = useState('');
  const [filterItem, setFilterItem] = useState('');
  
  const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'N/A';
  const getItemSku = (itemId: string) => items.find(i => i.id === itemId)?.sku || 'N/A';

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filterType ? t.type === filterType : true;
      const itemMatch = filterItem ? t.itemId === filterItem : true;
      return typeMatch && itemMatch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, filterType, filterItem]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Transaction Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <option value="">All Transaction Types</option>
          {Object.values(TransactionType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={filterItem} onChange={e => setFilterItem(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <option value="">All Items</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity Change</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map(t => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(t.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{getItemName(t.itemId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getItemSku(t.itemId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    t.type === TransactionType.INBOUND ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    t.type === TransactionType.OUTBOUND ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                  t.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
