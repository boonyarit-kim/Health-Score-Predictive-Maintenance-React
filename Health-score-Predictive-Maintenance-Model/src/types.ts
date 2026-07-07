export interface ShutdownAlarm {
  timeStamp: string;
  plantName: string;
  machineTag: string;
  status: string;
}

export interface AlertLogEntry {
  id: number;
  timeStamp: string;
  plantName: string;
  machineTag: string;
  modelName: string;
  modelDisplayName: string;
  tag: string;
  drop: number;
  prev: number;
  latest: number;
  healthScore: number;
  type: string;
  isAlert: boolean;
}

export interface HealthDataPoint {
  time: string;
  score: number;
}

export interface PipelineResult {
  alerts: AlertLogEntry[];
  shutdownAlarms: ShutdownAlarm[];
  totalShuttingDown: number;
  totalActiveSpike: number;
  healthHistory: Map<string, HealthDataPoint[]>; // key: "MODEL_NAME|MACHINE_TAG"
}
