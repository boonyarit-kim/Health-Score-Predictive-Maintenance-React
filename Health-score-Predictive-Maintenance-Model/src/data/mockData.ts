import { ShutdownAlarm, AlertLogEntry, HealthDataPoint } from '../types';

export const shutdownAlarms: ShutdownAlarm[] = [
  { timeStamp: '2024-01-15 08:23:11', plantName: 'Plant A', machineTag: '2101-CM-001', status: 'Active' },
  { timeStamp: '2024-01-15 07:45:33', plantName: 'Plant B', machineTag: '2102-CM-003', status: 'Active' },
];

export const alertLogData: AlertLogEntry[] = [
  {
    id: 1,
    timeStamp: '2024-01-15 09:12:45',
    plantName: 'Plant A',
    machineTag: '2101-PD-02C',
    modelName: '2101PD02C (SEAL GAS DIF PRESS B)',
    modelDisplayName: '2101PD02C (SEAL GAS DIF PRESS B)',
    tag: '2101-CX-001',
    drop: 15.2,
    prev: 82.5,
    latest: 67.3,
    healthScore: 67,
    type: 'Spike',
    isAlert: true,
  },
  {
    id: 2,
    timeStamp: '2024-01-15 08:55:20',
    plantName: 'Plant A',
    machineTag: '2101-PD-03A',
    modelName: '2101PD03A (DISCHARGE PRESS)',
    modelDisplayName: '2101PD03A (DISCHARGE PRESS)',
    tag: '2101-PD-003',
    drop: 8.4,
    prev: 91.0,
    latest: 82.6,
    healthScore: 83,
    type: 'Drop',
    isAlert: false,
  },
  {
    id: 3,
    timeStamp: '2024-01-15 08:30:10',
    plantName: 'Plant B',
    machineTag: '2102-CM-001',
    modelName: '2102CM001 (COMPRESSOR MOTOR)',
    modelDisplayName: '2102CM001 (COMPRESSOR MOTOR)',
    tag: '2102-CM-001',
    drop: 5.1,
    prev: 88.3,
    latest: 83.2,
    healthScore: 83,
    type: 'Drop',
    isAlert: false,
  },
  {
    id: 4,
    timeStamp: '2024-01-15 08:10:05',
    plantName: 'Plant C',
    machineTag: '2103-PU-002',
    modelName: '2103PU002 (FEED PUMP B)',
    modelDisplayName: '2103PU002 (FEED PUMP B)',
    tag: '2103-PU-002',
    drop: 3.7,
    prev: 94.1,
    latest: 90.4,
    healthScore: 90,
    type: 'Spike',
    isAlert: false,
  },
  {
    id: 5,
    timeStamp: '2024-01-15 07:58:33',
    plantName: 'Plant A',
    machineTag: '2101-TU-001',
    modelName: '2101TU001 (TURBINE UNIT A)',
    modelDisplayName: '2101TU001 (TURBINE UNIT A)',
    tag: '2101-TU-001',
    drop: 2.2,
    prev: 96.8,
    latest: 94.6,
    healthScore: 95,
    type: 'Drop',
    isAlert: false,
  },
  {
    id: 6,
    timeStamp: '2024-01-15 07:40:12',
    plantName: 'Plant B',
    machineTag: '2102-HX-003',
    modelName: '2102HX003 (HEAT EXCHANGER C)',
    modelDisplayName: '2102HX003 (HEAT EXCHANGER C)',
    tag: '2102-HX-003',
    drop: 6.9,
    prev: 87.5,
    latest: 80.6,
    healthScore: 81,
    type: 'Spike',
    isAlert: false,
  },
];

export const generateHealthData = (): HealthDataPoint[] => {
  const data: HealthDataPoint[] = [];
  const base = 85;
  for (let i = 0; i < 30; i++) {
    const hour = String(i % 24).padStart(2, '0');
    const minute = String((i * 2) % 60).padStart(2, '0');
    const variation = (Math.random() - 0.5) * 4;
    data.push({
      time: `${hour}:${minute}`,
      score: Math.min(100, Math.max(0, base + variation + (i > 25 ? -15 : 0))),
    });
  }
  return data;
};
