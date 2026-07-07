import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { shutdownAlarms, alertLogData } from '../data/mockData';
import { AlertLogEntry } from '../types';
import ModelPopup from './ModelPopup';

const ALARMS_PER_PAGE = 3;
const ALERTS_PER_PAGE = 6;

function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-end gap-0.5 px-3 py-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-5 h-5 flex items-center justify-center text-xs disabled:opacity-30 transition-opacity"
        style={{ color: '#6b7280' }}
      >
        <ChevronLeft size={12} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="w-6 h-5 flex items-center justify-center text-xs rounded font-medium transition-colors"
          style={{
            backgroundColor: page === p ? '#3b82f6' : 'transparent',
            color: page === p ? '#fff' : '#9ca3af',
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-5 h-5 flex items-center justify-center text-xs disabled:opacity-30 transition-opacity"
        style={{ color: '#6b7280' }}
      >
        <ChevronRight size={12} />
      </button>
      <span className="text-xs ml-1" style={{ color: '#374151' }}>
        xxxx
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plantVal, setPlantVal] = useState('');
  const [machineVal, setMachineVal] = useState('');
  const [componentVal, setComponentVal] = useState('');
  const [alarmPage, setAlarmPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AlertLogEntry | null>(null);

  const pagedAlarms = shutdownAlarms.slice(
    (alarmPage - 1) * ALARMS_PER_PAGE,
    alarmPage * ALARMS_PER_PAGE
  );

  const pagedAlerts = alertLogData.slice(
    (alertPage - 1) * ALERTS_PER_PAGE,
    alertPage * ALERTS_PER_PAGE
  );

  const totalShuttingDown = shutdownAlarms.length;
  const totalActiveSpike = alertLogData.filter((a) => a.type === 'Spike').length;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: '#0b0e1b', padding: '20px 24px 16px' }}
    >
      {/* ── Filter panel ── */}
      <div
        className="flex-shrink-0 rounded-xl px-5 py-3 mb-5"
        style={{ backgroundColor: '#151c30', border: '1px solid #1e2a45' }}
      >
        {/* Row 1: date range + search */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-xs font-medium flex-shrink-0" style={{ color: '#9ca3af' }}>Start</span>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1.5 rounded text-xs outline-none w-40"
            style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0' }}
          />
          <span className="flex-shrink-0 text-xs" style={{ color: '#4b5563' }}>──▶</span>
          <span className="text-xs font-medium flex-shrink-0" style={{ color: '#9ca3af' }}>End</span>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1.5 rounded text-xs outline-none w-40"
            style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0' }}
          />
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: '#1e2a45', border: '1px solid #2d3f60' }}
          />
          <div className="flex-1 mx-2">
            <input
              type="text"
              placeholder=""
              className="w-full px-3 py-1.5 rounded text-xs outline-none"
              style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0' }}
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: '#1e2a45',
              color: '#c0cfe8',
              border: '1px solid #2d3f60',
            }}
          >
            <Search size={11} />
            search
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: '#1e2a45',
              color: '#c0cfe8',
              border: '1px solid #2d3f60',
            }}
          >
            <AlertTriangle size={11} />
            Hide
          </button>
        </div>

        {/* Row 2: PLANT / MACHINE / COMPONENT */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#c0cfe8' }}>PLANT</span>
          <input
            type="text"
            value={plantVal}
            onChange={(e) => setPlantVal(e.target.value)}
            className="px-2 py-1 rounded text-xs outline-none"
            style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0', width: '160px' }}
          />
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#c0cfe8' }}>MACHINE</span>
          <input
            type="text"
            value={machineVal}
            onChange={(e) => setMachineVal(e.target.value)}
            className="px-2 py-1 rounded text-xs outline-none"
            style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0', width: '160px' }}
          />
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#c0cfe8' }}>COMPONENT</span>
          <input
            type="text"
            value={componentVal}
            onChange={(e) => setComponentVal(e.target.value)}
            className="px-2 py-1 rounded text-xs outline-none"
            style={{ backgroundColor: '#0d1220', border: '1px solid #1e2a45', color: '#e2e8f0', width: '160px' }}
          />
          <div className="flex-1" />
          <button
            className="px-4 py-1 rounded text-xs font-medium flex-shrink-0"
            style={{ backgroundColor: '#1e2a45', color: '#c0cfe8', border: '1px solid #2d3f60' }}
          >
            Tuning list
          </button>
        </div>
      </div>

      {/* ── Shutdown Alarms heading ── */}
      <h2 className="text-xl font-bold mb-3 flex-shrink-0" style={{ color: '#ffffff' }}>
        Shutdown Alarms
      </h2>

      {/* ── Shutdown Alarms table + Stat cards ── */}
      <div className="flex gap-4 flex-shrink-0 mb-4" style={{ height: '200px' }}>
        {/* Table */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{ flex: '0 0 58%', backgroundColor: '#151c30', border: '1px solid #1e2a45' }}
        >
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: '#1d2845' }}>
                  {['Time stamp', 'Plant name', 'Machine tag', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-medium"
                      style={{ color: '#c0cfe8', borderBottom: '1px solid #1e2a45' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedAlarms.map((row, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#1a2035' : '#222840' }}>
                    <td className="px-4 py-2.5" style={{ color: '#c8d5e8' }}>{row.timeStamp}</td>
                    <td className="px-4 py-2.5" style={{ color: '#c8d5e8' }}>{row.plantName}</td>
                    <td className="px-4 py-2.5" style={{ color: '#c8d5e8' }}>{row.machineTag}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: '#7f1d1d', color: '#fca5a5' }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 3 - pagedAlarms.length) }).map((_, i) => (
                  <tr
                    key={`empty-${i}`}
                    style={{ backgroundColor: (pagedAlarms.length + i) % 2 === 0 ? '#1a2035' : '#222840' }}
                  >
                    <td className="px-4 py-3" colSpan={4}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ borderTop: '1px solid #1e2a45' }}>
            <Pagination
              page={alarmPage}
              total={shutdownAlarms.length}
              perPage={ALARMS_PER_PAGE}
              onChange={setAlarmPage}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex gap-4 flex-1">
          <div
            className="flex-1 flex flex-col items-center justify-center rounded-xl"
            style={{ backgroundColor: '#141929', border: '1px solid #1e2a45' }}
          >
            <span className="font-bold leading-none" style={{ color: '#ef4444', fontSize: '56px' }}>
              {totalShuttingDown}
            </span>
            <span className="text-sm font-semibold mt-2" style={{ color: '#e2e8f0' }}>
              Total Shutting down
            </span>
          </div>
          <div
            className="flex-1 flex flex-col items-center justify-center rounded-xl"
            style={{ backgroundColor: '#141929', border: '1px solid #1e2a45' }}
          >
            <span className="font-bold leading-none" style={{ color: '#ef4444', fontSize: '56px' }}>
              {totalActiveSpike}
            </span>
            <span className="text-sm font-semibold mt-2" style={{ color: '#e2e8f0' }}>
              Total Active Spike
            </span>
          </div>
        </div>
      </div>

      {/* ── Alert log ── */}
      <h2 className="text-xl font-bold mb-3 flex-shrink-0" style={{ color: '#ffffff' }}>
        Alert log
      </h2>

      <div
        className="flex-1 flex flex-col rounded-lg overflow-hidden min-h-0"
        style={{ backgroundColor: '#151c30', border: '1px solid #1e2a45' }}
      >
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: '#1d2845' }}>
                {['Time stamp', 'Plant name', 'Machine tag', 'Model name', 'Drop', 'PREV', 'LATEST', 'Health score', 'Type'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                    style={{ color: '#7ecbf5', borderBottom: '1px solid #1e2a45' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedAlerts.map((row, i) => {
                const isRed = row.isAlert;
                const rowBg = isRed ? '#ff2222' : i % 2 === 0 ? '#1a2035' : '#222840';
                const textCol = isRed ? '#ffffff' : '#c8d5e8';

                return (
                  <tr key={row.id} style={{ backgroundColor: rowBg }}>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: textCol }}>{row.timeStamp}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: textCol }}>{row.plantName}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: textCol }}>{row.machineTag}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEntry(row)}
                        className="underline underline-offset-2 transition-colors"
                        style={{ color: isRed ? '#ffffff' : '#60a5fa' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = isRed ? '#e5e7eb' : '#93c5fd')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = isRed ? '#ffffff' : '#60a5fa')}
                      >
                        {row.modelName}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" style={{ color: textCol }}>{row.drop.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" style={{ color: textCol }}>{row.prev.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" style={{ color: textCol }}>{row.latest.toFixed(1)}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span
                        className="font-semibold"
                        style={{
                          color: isRed
                            ? '#ffffff'
                            : row.healthScore >= 90
                            ? '#4ade80'
                            : row.healthScore >= 75
                            ? '#facc15'
                            : '#ef4444',
                        }}
                      >
                        {row.healthScore}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={
                          isRed
                            ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                            : row.type === 'Spike'
                            ? { backgroundColor: '#7c2d12', color: '#fdba74' }
                            : { backgroundColor: '#1e3a5f', color: '#93c5fd' }
                        }
                      >
                        {row.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0" style={{ borderTop: '1px solid #1e2a45' }}>
          <Pagination
            page={alertPage}
            total={alertLogData.length}
            perPage={ALERTS_PER_PAGE}
            onChange={setAlertPage}
          />
        </div>
      </div>

      {selectedEntry && (
        <ModelPopup entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
