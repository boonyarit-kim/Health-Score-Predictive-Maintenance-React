import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { AlertLogEntry } from '../types';
import { generateHealthData } from '../data/mockData';
import HealthChart from './HealthChart';

const ACTION_OPTIONS = [
  { label: 'Acknowledge', color: '#facc15' },
  { label: 'Keep Follow-up', color: '#4ade80' },
  { label: 'Danger', color: '#f97316' },
  { label: 'Shutdown Monitor', color: '#ef4444' },
  { label: 'Standby Mode', color: '#818cf8' },
];

interface Props {
  entry: AlertLogEntry;
  onClose: () => void;
}

export default function ModelPopup({ entry, onClose }: Props) {
  const [selectedAction, setSelectedAction] = useState(ACTION_OPTIONS[0]);
  const [note, setNote] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartData] = useState(() => generateHealthData());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSave() {
    alert(`Saved: ${selectedAction.label} — ${note}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative rounded-lg shadow-2xl"
        style={{
          backgroundColor: '#1a2035',
          border: '1px solid #2d3748',
          width: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-4 py-3"
          style={{ borderBottom: '1px solid #2d3748' }}
        >
          <div>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              <span style={{ color: '#cbd5e1' }}>Model :</span> {entry.modelDisplayName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
              <span style={{ color: '#cbd5e1' }}>Tag :</span> {entry.tag}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: '#ef4444', border: '1px solid #ef4444' }}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-2">
          <HealthChart data={chartData} width={400} height={200} />
        </div>

        {/* Update Record */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
            Update Record
          </h3>

          <div className="flex gap-3">
            {/* Action dropdown */}
            <div className="flex-1">
              <p className="text-xs mb-1.5" style={{ color: '#f97316' }}>
                Action (Caution)
              </p>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded text-xs"
                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedAction.color }}
                    />
                    {selectedAction.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className="flex-shrink-0 transition-transform"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#6b7280' }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute left-0 right-0 z-10 mt-1 rounded shadow-xl"
                    style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  >
                    {ACTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => { setSelectedAction(opt); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-opacity-10"
                        style={{
                          color: '#e2e8f0',
                          backgroundColor: selectedAction.label === opt.label ? '#2d3748' : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2d3748')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedAction.label === opt.label ? '#2d3748' : 'transparent')}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="flex-1">
              <p className="text-xs mb-1.5" style={{ color: '#6b7280' }}>
                Note
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-2 py-1.5 rounded text-xs resize-none outline-none"
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
                placeholder="Enter note..."
              />
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={handleSave}
                  className="px-5 py-1.5 rounded text-xs font-semibold transition-colors"
                  style={{ backgroundColor: '#16a34a', color: '#fff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
