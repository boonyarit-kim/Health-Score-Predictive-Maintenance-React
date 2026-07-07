import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

export default function App() {
  const [activePage, setActivePage] = useState('alarm');

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: '#0b0e1b' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-hidden">
        {activePage === 'alarm' && <Dashboard />}
        {activePage !== 'alarm' && (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: '#4b5563' }}
          >
            Select a page from the sidebar
          </div>
        )}
      </main>
    </div>
  );
}
