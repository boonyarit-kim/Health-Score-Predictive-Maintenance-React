export interface RawRow {
  OPC_CREATED_DT: Date;
  PLANT_NAME: string;
  MACHINE_TAG: string;
  MODEL_NAME: string;
  MODEL_TYPE: string;
  COMPONENT_NAME: string;
  HEALTH_SCORE: number;
  STATUS: string;
  [key: string]: unknown;
}

// Parses Python strptime format '%Y-%m-%d-%H.%M.%S.%f'
// e.g. "2024-01-15-08.30.00.000000"
function parseDatetime(s: string): Date {
  const trimmed = s.trim();
  // Try: YYYY-MM-DD-HH.MM.SS.ffffff
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})\.(\d{2})\.(\d{2})\.(\d+)$/);
  if (m) {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`);
  }
  // Fallback: standard ISO or any format Date can handle
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

// Minimal RFC-4180 CSV parser (handles quoted fields)
function parseCSVLine(line: string, delimiter = ','): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields.map((f) => f.trim());
}

export function parseCSV(text: string): RawRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

  // Auto-detect delimiter
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));

  const requiredCols = ['OPC_CREATED_DT', 'MACHINE_TAG', 'MODEL_NAME', 'HEALTH_SCORE', 'STATUS'];
  for (const col of requiredCols) {
    if (!headers.includes(col)) throw new Error(`Missing required column: ${col}`);
  }

  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i], delimiter);
    if (vals.length < headers.length) continue;

    const raw: Record<string, unknown> = {};
    headers.forEach((h, idx) => { raw[h] = vals[idx] ?? ''; });

    rows.push({
      OPC_CREATED_DT: parseDatetime(raw['OPC_CREATED_DT'] as string),
      PLANT_NAME: (raw['PLANT_NAME'] as string) ?? '',
      MACHINE_TAG: (raw['MACHINE_TAG'] as string) ?? '',
      MODEL_NAME: (raw['MODEL_NAME'] as string) ?? '',
      MODEL_TYPE: (raw['MODEL_TYPE'] as string) ?? '',
      COMPONENT_NAME: (raw['COMPONENT_NAME'] as string) ?? '',
      HEALTH_SCORE: parseFloat(raw['HEALTH_SCORE'] as string),
      STATUS: ((raw['STATUS'] as string) ?? '').trim().toUpperCase(),
      ...raw,
    });
  }

  return rows.filter((r) => !isNaN(r.OPC_CREATED_DT.getTime()) && !isNaN(r.HEALTH_SCORE));
}
