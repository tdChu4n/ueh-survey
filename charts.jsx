/* charts.jsx — small SVG chart primitives, no chart library */

const { useMemo } = React;

// ---------- Donut chart (overall rating distribution by program) ----------
function Donut({ data, size = 180, thickness = 28, centerLabel, centerValue }) {
  // data: [{ label, value, color }]
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  const arcs = data.map((d) => {
    const start = acc / total;
    acc += d.value;
    const end = acc / total;
    return { ...d, start, end };
  });
  function arcPath(start, end) {
    if (end - start >= 0.999) {
      // full circle as two arcs
      return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
    }
    const a0 = start * 2 * Math.PI - Math.PI / 2;
    const a1 = end * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.95 0.01 280)" strokeWidth={thickness} />
      {arcs.map((a, i) => (
        <path key={i} d={arcPath(a.start, a.end)} fill="none" stroke={a.color}
              strokeWidth={thickness} strokeLinecap="butt" />
      ))}
      {centerValue !== undefined && (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-mono)"
                fontSize={28} fontWeight={600} fill="var(--ink)" style={{letterSpacing:"-0.02em"}}>
            {centerValue}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={11}
                fill="var(--ink-muted)">
            {centerLabel}
          </text>
        </>
      )}
    </svg>
  );
}

// ---------- Horizontal bars for factor items ----------
function HBarChart({ items, max = 7 }) {
  // items: [{ label, value, color }]
  const width = 360, rowH = 38, padL = 70, padR = 40;
  const height = items.length * rowH + 30;
  const innerW = width - padL - padR;
  const ticks = [1,2,3,4,5,6,7];
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* gridlines */}
      {ticks.map(t => {
        const x = padL + ((t - 1) / (max - 1)) * innerW;
        return <line key={t} x1={x} y1={10} x2={x} y2={height - 20}
                      stroke="oklch(0.93 0.005 280)" strokeWidth={1} />;
      })}
      {/* bars */}
      {items.map((it, i) => {
        const y = 10 + i * rowH;
        const w = ((it.value - 1) / (max - 1)) * innerW;
        return (
          <g key={i}>
            <text x={padL - 10} y={y + rowH/2 - 2} textAnchor="end"
                  fontSize={12} fill="var(--ink)" fontFamily="var(--font-mono)" fontWeight={500}>
              {it.label}
            </text>
            <rect x={padL} y={y + 6} width={innerW} height={rowH - 18}
                  fill="oklch(0.97 0.008 280)" rx={3} />
            <rect x={padL} y={y + 6} width={Math.max(2, w)} height={rowH - 18}
                  fill={it.color} fillOpacity="0.35" stroke={it.color} strokeWidth={1.2} rx={3} />
            <text x={padL + w + 6} y={y + rowH/2 - 1} fontSize={11}
                  fontFamily="var(--font-mono)" fill="var(--ink-soft)">
              {it.value.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* x ticks */}
      {ticks.map(t => {
        const x = padL + ((t - 1) / (max - 1)) * innerW;
        return <text key={t} x={x} y={height - 6} textAnchor="middle"
                      fontSize={10} fill="var(--ink-muted)" fontFamily="var(--font-mono)">{t}</text>;
      })}
    </svg>
  );
}

// ---------- Multi-line distribution chart ----------
function LineChart({ series, xLabels, yMax }) {
  // series: [{ name, color, data: number[] }], data length === xLabels.length
  const width = 460, height = 240;
  const padL = 36, padR = 12, padT = 12, padB = 44;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxY = yMax ?? Math.max(1, ...series.flatMap(s => s.data));
  // round up to nice number
  const niceMax = Math.ceil(maxY / 5) * 5;
  const yTicks = [];
  const step = niceMax <= 10 ? 2 : niceMax <= 20 ? 5 : 10;
  for (let v = 0; v <= niceMax; v += step) yTicks.push(v);
  const xs = xLabels.map((_, i) =>
    padL + (i / Math.max(1, xLabels.length - 1)) * innerW
  );
  const yFor = v => padT + innerH - (v / niceMax) * innerH;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* gridlines */}
      {yTicks.map(t => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={width - padR} y2={yFor(t)}
                stroke="oklch(0.94 0.005 280)" strokeWidth={1} />
          <text x={padL - 6} y={yFor(t) + 3} textAnchor="end" fontSize={10}
                fontFamily="var(--font-mono)" fill="var(--ink-muted)">{t}</text>
        </g>
      ))}
      {/* x labels */}
      {xLabels.map((lab, i) => (
        <text key={i} x={xs[i]} y={height - padB + 16} textAnchor="middle"
              fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
          {lab}
        </text>
      ))}
      <text x={padL - 28} y={padT + 8} fontSize={10} fill="var(--ink-muted)"
            fontFamily="var(--font-mono)">Số phiếu</text>
      {/* lines */}
      {series.map((s, i) => {
        const pts = s.data.map((v, idx) => `${xs[idx]},${yFor(v)}`).join(" ");
        return (
          <g key={i}>
            <polyline fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round"
                      points={pts} />
            {s.data.map((v, idx) => (
              <circle key={idx} cx={xs[idx]} cy={yFor(v)} r={3.5}
                      fill="white" stroke={s.color} strokeWidth={1.6} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Radar / spider chart ----------
function RadarChart({ axes, values, size = 280, max = 7, min = 1, color = "var(--brand-500)" }) {
  // axes: string[], values: number[] (same length)
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 44;
  const n = axes.length;
  // Polar to cart
  function pt(value, idx) {
    const norm = Math.max(0, (value - min) / (max - min));
    const a = (idx / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * norm * Math.cos(a), cy + r * norm * Math.sin(a)];
  }
  // gridline rings (values 2..7)
  const rings = [];
  for (let v = min + 1; v <= max; v++) rings.push(v);
  // axis tip at value=max
  function axisTip(idx) {
    const a = (idx / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  // value polygon
  const valPts = values.map((v, i) => pt(v, i)).map(([x,y]) => `${x},${y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* rings */}
      {rings.map((v, i) => {
        const ringPts = axes.map((_, idx) => {
          const a = (idx / n) * 2 * Math.PI - Math.PI / 2;
          const norm = (v - min) / (max - min);
          return [cx + r * norm * Math.cos(a), cy + r * norm * Math.sin(a)];
        });
        const d = ringPts.map(([x,y]) => `${x},${y}`).join(" ");
        return (
          <polygon key={v} points={d} fill="none"
                   stroke="oklch(0.9 0.01 280)" strokeWidth={1} />
        );
      })}
      {/* axes */}
      {axes.map((_, idx) => {
        const [x,y] = axisTip(idx);
        return <line key={idx} x1={cx} y1={cy} x2={x} y2={y}
                      stroke="oklch(0.9 0.01 280)" strokeWidth={1} />;
      })}
      {/* value polygon */}
      <polygon points={valPts}
               fill={color} fillOpacity="0.15"
               stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* value dots */}
      {values.map((v, i) => {
        const [x,y] = pt(v, i);
        return <circle key={i} cx={x} cy={y} r={4}
                        fill="white" stroke={color} strokeWidth={2} />;
      })}
      {/* axis labels */}
      {axes.map((label, idx) => {
        const a = (idx / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a) + 4;
        return (
          <text key={idx} x={lx} y={ly} textAnchor="middle"
                fontSize={12} fontWeight={600} fill="var(--ink)"
                fontFamily="var(--font-mono)">{label}</text>
        );
      })}
      {/* ring value labels along top axis */}
      {rings.map((v) => {
        const norm = (v - min) / (max - min);
        const ly = cy - r * norm;
        return (
          <text key={v} x={cx + 4} y={ly + 3} fontSize={9}
                fill="var(--ink-muted)" fontFamily="var(--font-mono)">{v}</text>
        );
      })}
    </svg>
  );
}

// ---------- Vertical bar comparison chart ----------
function VBarChart({ items, max = 7, min = 1, height = 260 }) {
  // items: [{ label, value, color }]
  const width = 420;
  const padL = 32, padR = 16, padT = 12, padB = 50;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const n = items.length;
  const slot = innerW / n;
  const barW = Math.min(40, slot * 0.55);
  const ticks = [];
  for (let v = min; v <= max; v++) ticks.push(v);
  const yFor = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* y gridlines */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={width - padR} y2={yFor(t)}
                stroke="oklch(0.94 0.005 280)" strokeWidth={1} />
          <text x={padL - 6} y={yFor(t) + 3} textAnchor="end"
                fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
            {t}
          </text>
        </g>
      ))}
      {/* bars */}
      {items.map((it, i) => {
        const x = padL + slot * i + (slot - barW) / 2;
        const y = yFor(it.value);
        const h = padT + innerH - y;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h}
                  fill={it.color} fillOpacity="0.25"
                  stroke={it.color} strokeWidth={1.4} rx={3} />
            <text x={x + barW/2} y={height - padB + 16} textAnchor="middle"
                  fontSize={11} fontWeight={600} fontFamily="var(--font-mono)"
                  fill={it.color}>{it.label}</text>
            <text x={x + barW/2} y={height - padB + 30} textAnchor="middle"
                  fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
              {it.value.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Histogram (single-series vertical bars) ----------
function Histogram({ data, xLabels, color = "var(--c-mid)", colors, yLabel = "Số phiếu", xLabel = "Điểm" }) {
  const width = 520, height = 260;
  const padL = 44, padR = 16, padT = 36, padB = 50;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxY = Math.max(1, ...data);
  const niceMax = Math.ceil(maxY / 5) * 5 || 5;
  const yTicks = [];
  const step = niceMax / 5;
  for (let v = 0; v <= niceMax; v += step) yTicks.push(v);
  const n = data.length;
  const slot = innerW / n;
  const barW = Math.min(56, slot * 0.7);
  const yFor = (v) => padT + innerH - (v / niceMax) * innerH;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Y-axis title — placed safely above the topmost tick */}
      <text x={padL - 6} y={padT - 18} fontSize={11} fill="var(--ink-muted)"
            fontFamily="var(--font-mono)" textAnchor="start">
        {yLabel}
      </text>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yFor(t)} x2={width - padR} y2={yFor(t)}
                stroke="oklch(0.94 0.005 280)" strokeWidth={1} />
          <text x={padL - 8} y={yFor(t) + 3} textAnchor="end"
                fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = padL + slot * i + (slot - barW) / 2;
        const y = yFor(v);
        const h = padT + innerH - y;
        const c = (colors && colors[i]) || color;
        const labelGap = 6;
        return (
          <g key={i}>
            {v > 0 && (
              <rect x={x} y={y} width={barW} height={Math.max(2, h)}
                    fill={c} fillOpacity="0.28"
                    stroke={c} strokeWidth={1.6} rx={4} />
            )}
            {v > 0 && (
              <text x={x + barW/2} y={y - labelGap} textAnchor="middle"
                    fontSize={12} fontFamily="var(--font-mono)" fontWeight={700}
                    fill={c}>
                {v}
              </text>
            )}
            <text x={x + barW/2} y={height - padB + 18} textAnchor="middle"
                  fontSize={12} fontFamily="var(--font-mono)" fontWeight={600}
                  fill="var(--ink)">
              {xLabels[i]}
            </text>
          </g>
        );
      })}
      {/* X-axis title — placed below tick labels */}
      <text x={padL + innerW/2} y={height - 8} textAnchor="middle"
            fontSize={11} fill="var(--ink-muted)" fontFamily="var(--font-mono)">
        {xLabel}
      </text>
    </svg>
  );
}

// Stack into window so other files can reference.
Object.assign(window, { Donut, HBarChart, LineChart, RadarChart, VBarChart, Histogram });
