import { HealthDataPoint } from '../types';

interface Props {
  data: HealthDataPoint[];
  width?: number;
  height?: number;
}

export default function HealthChart({ data, width = 380, height = 200 }: Props) {
  const paddingLeft = 50;
  const paddingRight = 16;
  const paddingTop = 12;
  const paddingBottom = 36;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minVal = 0;
  const maxVal = 100;

  const toX = (i: number) => paddingLeft + (i / (data.length - 1)) * chartW;
  const toY = (val: number) => paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.score).toFixed(1)}`)
    .join(' ');

  const yTicks = [0, 20, 40, 60, 80, 100];
  const xTickIndices = [0, 5, 10, 15, 20, 25, 29];

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Background */}
      <rect x={paddingLeft} y={paddingTop} width={chartW} height={chartH} fill="#0d1117" rx="2" />

      {/* Horizontal grid lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={paddingLeft}
            y1={toY(tick)}
            x2={paddingLeft + chartW}
            y2={toY(tick)}
            stroke="#2a3040"
            strokeWidth="1"
          />
          <text
            x={paddingLeft - 6}
            y={toY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#6b7280"
            fontSize="10"
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Y-axis label */}
      <text
        x={12}
        y={paddingTop + chartH / 2}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="11"
        transform={`rotate(-90, 12, ${paddingTop + chartH / 2})`}
      >
        Health Score
      </text>

      {/* X-axis ticks */}
      {xTickIndices.map((idx) => (
        <text
          key={idx}
          x={toX(Math.min(idx, data.length - 1))}
          y={paddingTop + chartH + 16}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="9"
        >
          {data[Math.min(idx, data.length - 1)]?.time}
        </text>
      ))}

      {/* X-axis label */}
      <text
        x={paddingLeft + chartW / 2}
        y={height - 2}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="11"
      >
        Time Stamp
      </text>

      {/* Line */}
      <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Border */}
      <rect
        x={paddingLeft}
        y={paddingTop}
        width={chartW}
        height={chartH}
        fill="none"
        stroke="#2a3040"
        strokeWidth="1"
      />
    </svg>
  );
}
