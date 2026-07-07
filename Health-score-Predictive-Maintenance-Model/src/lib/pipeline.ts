import { RawRow } from './csvParser';
import {
  shiftedRollingMedian,
  shiftedRollingMAD,
  shiftedRollingMean,
  shiftedRollingMin,
  shiftedRollingSum,
  diffRollingMean,
  consecutiveStreak,
} from './mathUtils';

export interface ProcessedRow extends RawRow {
  HS_PREV: number | null;
  DROP: number | null;
  PREV_STATUS: string | null;
  VALID_ANALYSIS: boolean;
  ROLLING_MEAN: number | null;
  ROLLING_MAD: number | null;
  ROLLING_STD: number;
  Z_SCORE: number | null;
  RECOVERY_SLOPE: number | null;
  IS_DOWN: boolean;
  IS_UP: boolean;
  UP_STREAK: number;
  IS_RECOVERY: boolean;
  TREND_6H: number | null;
  IS_TREND_RECOVERY: boolean;
  CRITICAL_COLLAPSE: boolean;
  SPIKE_RATIO: number | null;
  LOCAL_MIN_HS: number | null;
  NET_BOUNCE_HEIGHT: number | null;
  IS_ATTEMPTED_SPIKE: boolean;
  ATTEMPT_COUNT_24H: number;
  VOLATILE_MODE: boolean;
  IS_ABNORMAL_SPIKE: boolean;
  ALERT_TYPE: string;
}

export interface AlertRow {
  TIME: Date;
  PLANT: string;
  MACHINE: string;
  MODEL_TYPE: string;
  COMPONENT: string;
  MODEL: string;
  PREV: number;
  LATEST: number;
  DROP: number;
  ALERT_TYPE: string;
  ACTIVE_SPIKE: number;
}

export interface ShutdownRow {
  TIME: Date;
  EVENT_TYPE: 'SHUTDOWN' | 'RUNNING';
  PLANT: string;
  MACHINE: string;
  STATUS: string;
  PREV_STATUS: string;
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = keyFn(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function trackDownwardSlope(group: ProcessedRow[]): ProcessedRow[] {
  const g = group.map((r) => ({ ...r }));

  const spikeIndices = g.map((r, i) => (r.IS_ABNORMAL_SPIKE ? i : -1)).filter((i) => i >= 0);

  for (const spikeIdx of spikeIndices) {
    if (!g[spikeIdx].IS_ABNORMAL_SPIKE) continue;

    let startIdx = spikeIdx;
    let lowestSoFar = g[startIdx].HEALTH_SCORE;
    let startTime = g[startIdx].OPC_CREATED_DT;

    let scanIdx = startIdx + 1;
    while (scanIdx < g.length) {
      const hoursDiff = (g[scanIdx].OPC_CREATED_DT.getTime() - startTime.getTime()) / 3_600_000;
      if (hoursDiff > 3) break;
      if (g[scanIdx].STATUS !== 'RUNNING') break;

      const currentScore = g[scanIdx].HEALTH_SCORE;

      if (currentScore < lowestSoFar) {
        const oldStartIdx = startIdx;
        startIdx = scanIdx;
        lowestSoFar = currentScore;
        startTime = g[startIdx].OPC_CREATED_DT;

        if (oldStartIdx !== spikeIdx) {
          g[oldStartIdx].IS_ABNORMAL_SPIKE = false;
          g[oldStartIdx].ALERT_TYPE = 'NORMAL';
        }

        for (let m = oldStartIdx + 1; m < scanIdx; m++) {
          g[m].IS_ABNORMAL_SPIKE = false;
          g[m].ALERT_TYPE = 'NORMAL';
        }

        g[startIdx].IS_ABNORMAL_SPIKE = true;
        g[startIdx].ALERT_TYPE = 'SLOPE';
      } else if (currentScore > lowestSoFar + 20) {
        break;
      }

      scanIdx++;
    }
  }

  return g;
}

export class PredictiveMaintenancePipeline {
  private window: number;
  private minPeriods: number;
  private zThreshold: number;
  private minSpike: number;
  private minStd: number;

  private historyRows: ProcessedRow[] = [];
  private shutdownEvents: RawRow[] = [];
  private runningEvents: RawRow[] = [];

  constructor(
    window = 24,
    minPeriods = 5,
    zThreshold = 2.8,
    minSpike = 5.0,
    minStd = 5.0
  ) {
    this.window = window;
    this.minPeriods = minPeriods;
    this.zThreshold = zThreshold;
    this.minSpike = minSpike;
    this.minStd = minStd;
  }

  fitTransform(rawRows: RawRow[]): ProcessedRow[] {
    // Sort by MODEL_NAME, MACHINE_TAG, MODEL_TYPE, OPC_CREATED_DT
    const sorted = [...rawRows].sort((a, b) => {
      const k1 = `${a.MODEL_NAME}|${a.MACHINE_TAG}|${a.MODEL_TYPE}|${a.OPC_CREATED_DT.getTime()}`;
      const k2 = `${b.MODEL_NAME}|${b.MACHINE_TAG}|${b.MODEL_TYPE}|${b.OPC_CREATED_DT.getTime()}`;
      return k1 < k2 ? -1 : k1 > k2 ? 1 : 0;
    });

    // ── Compute per-group rolling features ──────────────────────────
    const groups = groupBy(sorted, (r) => `${r.MODEL_NAME}|${r.MACHINE_TAG}|${r.MODEL_TYPE}`);
    const processedGroups: ProcessedRow[][] = [];

    for (const group of groups.values()) {
      const n = group.length;
      const hs = group.map((r) => r.HEALTH_SCORE);
      const statuses = group.map((r) => r.STATUS);

      const hsPrev: (number | null)[] = [null, ...hs.slice(0, n - 1)];
      const drop: (number | null)[] = hsPrev.map((p, i) => (p !== null ? p - hs[i] : null));
      const prevStatus: (string | null)[] = [null, ...statuses.slice(0, n - 1)];
      const validAnalysis = statuses.map((s, i) => s === 'RUNNING' && prevStatus[i] === 'RUNNING');

      const rollingMean = shiftedRollingMedian(drop, this.window, this.minPeriods);
      const rollingMadArr = shiftedRollingMAD(drop, this.window, this.minPeriods);
      const rollingStd = rollingMadArr.map((v) => Math.max((v ?? 0) * 1.4826, this.minStd));
      const zScore = drop.map((d, i) =>
        d !== null && rollingMean[i] !== null ? (d - rollingMean[i]!) / rollingStd[i] : null
      );

      const recoverySlope = diffRollingMean(hs, 6, 3);
      const isUp = hs.map((h, i) => hsPrev[i] !== null && h > hsPrev[i]!);
      const upStreakArr = consecutiveStreak(isUp);
      const isRecovery = hs.map(
        (h, i) => (recoverySlope[i] ?? 0) > 8 && upStreakArr[i] >= 4 && h > 50
      );

      const trend6h = shiftedRollingMean(hs, 6, 3);
      const isTrendRecovery = hsPrev.map(
        (p, i) => p !== null && trend6h[i] !== null && p < trend6h[i]!
      );

      const criticalCollapse = hs.map(
        (h, i) => hsPrev[i] !== null && drop[i] !== null && hsPrev[i]! < 80 && h < 80 && drop[i]! >= 20
      );

      const spikeRatio = drop.map((d, i) =>
        d !== null && hsPrev[i] !== null ? d / Math.max(hsPrev[i]!, 1) : null
      );

      const localMinHs = shiftedRollingMin(hs, 12, 3);
      const netBounceHeight = hsPrev.map((p, i) =>
        p !== null && localMinHs[i] !== null ? p - localMinHs[i]! : null
      );

      const isAttempted = hs.map(
        (h, i) => drop[i] !== null && drop[i]! >= this.minSpike * 2 && h < 80 && drop[i]! > 0
      );
      const attemptCount = shiftedRollingSum(isAttempted, 24);
      const volatileMode = rollingStd.map((v) => v > 20);

      const rows: ProcessedRow[] = group.map((r, i) => ({
        ...r,
        HS_PREV: hsPrev[i],
        DROP: drop[i],
        PREV_STATUS: prevStatus[i],
        VALID_ANALYSIS: validAnalysis[i],
        ROLLING_MEAN: rollingMean[i],
        ROLLING_MAD: rollingMadArr[i],
        ROLLING_STD: rollingStd[i],
        Z_SCORE: zScore[i],
        RECOVERY_SLOPE: recoverySlope[i],
        IS_DOWN: drop[i] !== null && drop[i]! < 0,
        IS_UP: isUp[i],
        UP_STREAK: upStreakArr[i],
        IS_RECOVERY: isRecovery[i],
        TREND_6H: trend6h[i],
        IS_TREND_RECOVERY: isTrendRecovery[i],
        CRITICAL_COLLAPSE: criticalCollapse[i],
        SPIKE_RATIO: spikeRatio[i],
        LOCAL_MIN_HS: localMinHs[i],
        NET_BOUNCE_HEIGHT: netBounceHeight[i],
        IS_ATTEMPTED_SPIKE: isAttempted[i],
        ATTEMPT_COUNT_24H: attemptCount[i],
        VOLATILE_MODE: volatileMode[i],
        IS_ABNORMAL_SPIKE: false,
        ALERT_TYPE: 'NORMAL',
      }));

      // Apply spike detection
      rows.forEach((row) => {
        row.IS_ABNORMAL_SPIKE = this.checkSpike(row);
        row.ALERT_TYPE = row.IS_ABNORMAL_SPIKE ? 'SPIKE' : 'SLOPE';
      });

      processedGroups.push(trackDownwardSlope(rows));
    }

    // ── Flatten all groups ───────────────────────────────────────────
    this.historyRows = processedGroups.flat();

    // ── Shutdown detection (grouped by MACHINE_TAG only) ────────────
    const machineGroups = groupBy(sorted, (r) => r.MACHINE_TAG);
    const shutdownEvts: RawRow[] = [];
    const runningEvts: RawRow[] = [];

    for (const mGroup of machineGroups.values()) {
      const mg = [...mGroup].sort((a, b) => a.OPC_CREATED_DT.getTime() - b.OPC_CREATED_DT.getTime());
      for (let i = 1; i < mg.length; i++) {
        const prev = mg[i - 1];
        const cur = mg[i];
        const diffHours = (cur.OPC_CREATED_DT.getTime() - prev.OPC_CREATED_DT.getTime()) / 3_600_000;
        if (Math.abs(diffHours - 1) > 0.01) continue; // must be exactly 1h apart

        if (cur.STATUS === 'SHUTDOWN' && prev.STATUS === 'RUNNING') {
          shutdownEvts.push(cur);
        } else if (cur.STATUS === 'RUNNING' && prev.STATUS === 'SHUTDOWN') {
          runningEvts.push(cur);
        }
      }
    }

    this.shutdownEvents = shutdownEvts;
    this.runningEvents = runningEvts;

    return this.historyRows;
  }

  private checkSpike(row: ProcessedRow): boolean {
    if (row.HS_PREV === null) return false;
    if (!row.VALID_ANALYSIS) return false;
    if (row.HS_PREV >= 80) return false;
    if (row.IS_RECOVERY) return false;

    if (row.VOLATILE_MODE && row.ATTEMPT_COUNT_24H > 0) return false;

    const isDownward = (row.DROP ?? 0) > 0;
    const isUnder80Zone = row.HS_PREV < 80 && row.HEALTH_SCORE < 80;
    const isDropStat = (row.Z_SCORE ?? 0) > this.zThreshold;
    const isSignificantDrop = (row.DROP ?? 0) >= this.minSpike;
    const isSignificantRatio = (row.DROP ?? 0) / Math.max(row.HS_PREV, 1) >= 0.3;

    const statisticalDrop =
      isDownward && isUnder80Zone && isDropStat && isSignificantDrop && isSignificantRatio;

    const isStableBefore = row.ROLLING_STD < 10;
    const criticalCollapse =
      row.HS_PREV < 80 &&
      row.HEALTH_SCORE < 30 &&
      (row.DROP ?? 0) >= 30 &&
      (row.SPIKE_RATIO ?? 0) >= 0.4 &&
      isStableBefore;

    return statisticalDrop || criticalCollapse;
  }

  getAlerts(): AlertRow[] {
    const spikes = this.historyRows.filter((r) => r.IS_ABNORMAL_SPIKE);
    if (spikes.length === 0) return [];

    const alerts: AlertRow[] = spikes.map((r) => ({
      TIME: r.OPC_CREATED_DT,
      PLANT: r.PLANT_NAME,
      MACHINE: r.MACHINE_TAG,
      MODEL_TYPE: r.MODEL_TYPE,
      COMPONENT: r.COMPONENT_NAME,
      MODEL: r.MODEL_NAME,
      PREV: r.HS_PREV ?? 0,
      LATEST: r.HEALTH_SCORE,
      DROP: r.DROP ?? 0,
      ALERT_TYPE: r.ALERT_TYPE,
      ACTIVE_SPIKE: 0,
    }));

    // Sort by [MODEL, MACHINE, TIME]
    alerts.sort((a, b) => {
      const k1 = `${a.MODEL}|${a.MACHINE}|${a.TIME.getTime()}`;
      const k2 = `${b.MODEL}|${b.MACHINE}|${b.TIME.getTime()}`;
      return k1 < k2 ? -1 : 1;
    });

    // Mark ACTIVE_SPIKE: latest TIME per (MODEL, MACHINE) = 1
    const latestIdx = new Map<string, number>();
    alerts.forEach((r, idx) => {
      const key = `${r.MODEL}|${r.MACHINE}`;
      const prev = latestIdx.get(key);
      if (prev === undefined || r.TIME > alerts[prev].TIME) latestIdx.set(key, idx);
    });
    latestIdx.forEach((idx) => { alerts[idx].ACTIVE_SPIKE = 1; });

    // Sort by TIME descending for display
    return alerts.sort((a, b) => b.TIME.getTime() - a.TIME.getTime());
  }

  getShutdowns(): ShutdownRow[] {
    const fmt = (events: RawRow[], type: 'SHUTDOWN' | 'RUNNING'): ShutdownRow[] =>
      events.map((r) => ({
        TIME: r.OPC_CREATED_DT,
        EVENT_TYPE: type,
        PLANT: r.PLANT_NAME,
        MACHINE: r.MACHINE_TAG,
        STATUS: r.STATUS,
        PREV_STATUS: (r as ProcessedRow).PREV_STATUS ?? '',
      }));

    const combined = [...fmt(this.shutdownEvents, 'SHUTDOWN'), ...fmt(this.runningEvents, 'RUNNING')];
    return combined.sort((a, b) => b.TIME.getTime() - a.TIME.getTime());
  }

  getShutdownRunningScore(): number {
    if (this.shutdownEvents.length === 0) return 0;
    return new Set(this.shutdownEvents.map((r) => r.MACHINE_TAG)).size;
  }

  getHealthHistory(modelName: string, machineTag: string): { time: Date; score: number }[] {
    return this.historyRows
      .filter((r) => r.MODEL_NAME === modelName && r.MACHINE_TAG === machineTag)
      .sort((a, b) => a.OPC_CREATED_DT.getTime() - b.OPC_CREATED_DT.getTime())
      .map((r) => ({ time: r.OPC_CREATED_DT, score: r.HEALTH_SCORE }));
  }
}
