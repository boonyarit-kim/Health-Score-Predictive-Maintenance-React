import { LayoutDashboard, Bell, Cpu, BarChart2, Settings, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Bell, label: 'Alarm Monitor', id: 'alarm' },
  { icon: Cpu, label: 'Equipment', id: 'equipment' },
  { icon: BarChart2, label: 'Analytics', id: 'analytics' },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface Props {
  activePage?: string;
  onNavigate?: (id: string) => void;
}

export default function Sidebar({ activePage = 'alarm', onNavigate }: Props) {
  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: '60px',
        backgroundColor: '#0b0e1c',
        borderRight: '1px solid #1a2035',
      }}
    >
      {/* Logo area */}
      <div
        className="flex items-center justify-center py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a2035', height: '56px' }}
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: '#1e3a6e' }}
        >
          <ChevronRight size={16} color="#60a5fa" strokeWidth={2.5} />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 py-3 px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate?.(id)}
              title={label}
              className="group relative flex items-center justify-center w-full rounded-lg transition-all"
              style={{
                height: '44px',
                backgroundColor: isActive ? '#1e3a6e' : 'transparent',
                border: isActive ? '1px solid #2d5a8e' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#1a2540';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#60a5fa' : '#4b5563'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {/* Tooltip */}
              <span
                className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ backgroundColor: '#1e2d4a', color: '#e2e8f0', border: '1px solid #2d4070' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-1 py-3 px-2" style={{ borderTop: '1px solid #1a2035' }}>
        {BOTTOM_ITEMS.map(({ icon: Icon, label, id }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate?.(id)}
              title={label}
              className="group relative flex items-center justify-center w-full rounded-lg transition-all"
              style={{
                height: '44px',
                backgroundColor: isActive ? '#1e3a6e' : 'transparent',
                border: isActive ? '1px solid #2d5a8e' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#1a2540';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#60a5fa' : '#4b5563'}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ backgroundColor: '#1e2d4a', color: '#e2e8f0', border: '1px solid #2d4070' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
