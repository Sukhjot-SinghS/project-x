import type { Genome } from '@/types';

interface GenomeRadarProps {
  genome: Genome;
}

const dimensions: { key: keyof Genome; label: string }[] = [
  { key: 'reliability', label: 'Reliability' },
  { key: 'flexibility', label: 'Flexibility' },
  { key: 'fun', label: 'Fun' },
  { key: 'safety', label: 'Safety' },
  { key: 'contribution', label: 'Contribution' },
];

export function GenomeRadar({ genome }: GenomeRadarProps) {
  const size = 220;
  const center = size / 2;
  const radius = 72;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = dimensions.map((d, i) => getPoint(genome[d.key], i));
  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const points = dimensions
          .map((_, i) => {
            const p = getPoint(level, i);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#D97A5C"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const p = getPoint(1, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#D97A5C"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPath}
        fill="#5A7D7C"
        fillOpacity={0.35}
        stroke="#5A7D7C"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#5A7D7C" />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelR = radius + 18;
        const x = center + labelR * Math.cos(angle);
        const y = center + labelR * Math.sin(angle);
        const anchor =
          Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        return (
          <text
            key={d.key}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#2C2C2C"
            fontSize={9}
            fontWeight={500}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
