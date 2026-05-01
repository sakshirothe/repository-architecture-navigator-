import { useState } from 'react';
import { Network, Info } from 'lucide-react';

const TYPE_COLORS = {
  entry:  { bg: '#6ee7b7', text: '#0a0a0f', border: '#6ee7b7' },
  config: { bg: '#818cf8', text: '#0a0a0f', border: '#818cf8' },
  core:   { bg: '#f472b6', text: '#0a0a0f', border: '#f472b6' },
  docs:   { bg: '#fbbf24', text: '#0a0a0f', border: '#fbbf24' },
  source: { bg: '#38bdf8', text: '#0a0a0f', border: '#38bdf8' },
  other:  { bg: '#64748b', text: '#e2e8f0', border: '#64748b' },
};

function layoutNodes(nodes) {
  // Arrange nodes in a circular-ish layout
  const groups = {};
  nodes.forEach(n => { (groups[n.type] = groups[n.type] || []).push(n); });

  const cx = 360, cy = 220, radius = 160;
  const types = Object.keys(groups);
  const positioned = [];

  types.forEach((type, ti) => {
    const group = groups[type];
    const angleOffset = (ti / types.length) * Math.PI * 2;
    group.forEach((node, gi) => {
      const spread = group.length > 1 ? (gi / (group.length - 1) - 0.5) * 0.6 : 0;
      const angle = angleOffset + spread;
      const r = type === 'entry' ? 90 : radius;
      positioned.push({
        ...node,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    });
  });
  return positioned;
}

export default function GraphPanel({ nodes = [], edges = [] }) {
  const [hovered, setHovered] = useState(null);

  if (!nodes.length) return null;

  const positioned = layoutNodes(nodes.slice(0, 16));
  const posMap = Object.fromEntries(positioned.map(n => [n.id, n]));

  const legend = [
    { type: 'entry', label: 'Entry Point' },
    { type: 'config', label: 'Config' },
    { type: 'core', label: 'Core' },
    { type: 'docs', label: 'Docs' },
    { type: 'source', label: 'Source' },
  ];

  return (
    <div className="card animate-fade-in-delay-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-[#6ee7b7]" />
          <h3 className="font-display text-sm font-bold text-white">ARCHITECTURE GRAPH</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#475569]">
          <Info size={11} />
          <span>{nodes.length} nodes · {edges.length} connections</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {legend.map(({ type, label }) => {
          const c = TYPE_COLORS[type];
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.bg }} />
              <span className="text-xs text-[#475569] font-mono">{label}</span>
            </div>
          );
        })}
      </div>

      {/* SVG Graph */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 720 440" className="w-full max-w-full" style={{ minHeight: 280 }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e1e2e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="720" height="440" fill="url(#grid)" />

          {/* Edges */}
          {edges.slice(0, 20).map((edge, i) => {
            const src = posMap[edge.source];
            const tgt = posMap[edge.target];
            if (!src || !tgt) return null;
            return (
              <g key={i}>
                <line
                  x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke="#2a2a3e" strokeWidth="1.5" strokeDasharray="4 3"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {positioned.map(node => {
            const c = TYPE_COLORS[node.type] || TYPE_COLORS.other;
            const isHovered = hovered === node.id;
            const label = node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label;
            return (
              <g key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                {/* Glow */}
                {isHovered && (
                  <circle cx={node.x} cy={node.y} r={28}
                    fill={c.bg} opacity={0.15} />
                )}
                {/* Circle */}
                <circle
                  cx={node.x} cy={node.y} r={isHovered ? 22 : 18}
                  fill={isHovered ? c.bg : '#111118'}
                  stroke={c.border}
                  strokeWidth={isHovered ? 2 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                {/* Label */}
                <text
                  x={node.x} y={node.y + 36}
                  textAnchor="middle"
                  fill={isHovered ? c.bg : '#94a3b8'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  style={{ transition: 'fill 0.2s', userSelect: 'none' }}
                >
                  {label}
                </text>
                {/* Type dot */}
                <circle cx={node.x} cy={node.y} r={5}
                  fill={c.bg} opacity={isHovered ? 1 : 0.8} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && (() => {
        const n = positioned.find(p => p.id === hovered);
        if (!n) return null;
        return (
          <div className="mt-2 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-xs font-mono text-[#94a3b8]">
            <span className="text-[#6ee7b7]">{n.label}</span>
            <span className="text-[#475569] mx-2">·</span>
            <span>{n.path}</span>
          </div>
        );
      })()}
    </div>
  );
}
