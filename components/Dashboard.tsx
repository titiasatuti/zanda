
import React, { useMemo } from 'react';
import { Item, Transaction, Page, TransactionType } from '../types';
import { ScanIcon, PlusCircleIcon, BarChartIcon, AlertTriangleIcon, CubeIcon } from './icons';

// Make sure Recharts is available in the global scope from the CDN
declare const Recharts: any;


interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions, onNavigate }) => {
  // FIX: Access Recharts from the window object inside the component to avoid race conditions with the CDN script loading.
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = (window as any).Recharts || {};

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minStock).length;
  
  const recentTransactions = useMemo(() => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map(date => {
        const dailyInbound = transactions
            .filter(t => t.timestamp.startsWith(date) && t.type === TransactionType.INBOUND)
            .reduce((sum, t) => sum + t.quantityChange, 0);
        const dailyOutbound = transactions
            .filter(t => t.timestamp.startsWith(date) && t.type === TransactionType.OUTBOUND)
            .reduce((sum, t) => sum + Math.abs(t.quantityChange), 0);
        return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            Inbound: dailyInbound,
            Outbound: dailyOutbound
        };
    });
    return data;
  }, [transactions]);


  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:-translate-y-1">
      <div className="text-indigo-500 dark:text-indigo-400">{icon}</div>
      <span className="font-medium text-center">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<CubeIcon />} title="Total Item SKUs" value={totalItems} color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" />
        <StatCard icon={<ArchiveIcon />} title="Total Stock Quantity" value={totalStock} color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" />
        <StatCard icon={<AlertTriangleIcon />} title="Low Stock Items" value={lowStockItems} color="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ActionButton icon={<ScanIcon />} label="Scan Item" onClick={() => onNavigate(Page.SCANNER)} />
        <ActionButton icon={<PlusCircleIcon />} label="Add New Item" onClick={() => onNavigate(Page.ITEM_FORM)} />
        <ActionButton icon={<ListIcon />} label="View Inventory" onClick={() => onNavigate(Page.INVENTORY)} />
        <ActionButton icon={<BarChartIcon />} label="View Reports" onClick={() => onNavigate(Page.REPORTS)} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Stock Movements (Last 7 Days)</h2>
        <div style={{ width: '100%', height: 300 }}>
          {ResponsiveContainer && BarChart ? (
            <ResponsiveContainer>
              <BarChart data={recentTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                    borderColor: 'rgba(75, 85, 99, 1)' // border-gray-600
                  }}
                />
                <Legend />
                <Bar dataKey="Inbound" fill="#4ade80" />
                <Bar dataKey="Outbound" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading Chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons not available in the central icons file are defined locally.
const ArchiveIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const ListIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;

export default Dashboard;
