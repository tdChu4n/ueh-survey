/* sections.jsx — page sections (descriptive, factor tab content, qualitative) */

const { useState: _useState, useMemo: _useMemo } = React;

// ---------- Activity info card (program selector + table) ----------
function ActivityCard({ program, onChange, responses }) {
  const dates = responses.map(r => r.ts).filter(Boolean);
  const sorted = [...dates].sort();
  const first = sorted[0]?.split(" ")[0] ?? "—";
  const last  = sorted.at(-1)?.split(" ")[0] ?? "—";
  const displayTitle = program === "__ALL__"
    ? "Tổng quan tất cả chương trình"
    : program;

  return (
    <div className="activity">
      <div className="activity__head">
        <Icon.Attach style={{ color: "var(--brand-500)" }} />
        <div className="activity__title">{displayTitle}</div>
        <div className="activity__select">
          <span className="muted" style={{ fontSize: 12 }}>Chương trình:</span>
          <select value={program} onChange={(e) => onChange(e.target.value)}>
            <option value="__ALL__">— Tất cả chương trình —</option>
            {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <table className="activity-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Loại</th>
            <th>Quy mô</th>
            <th>Đơn vị tổ chức</th>
            <th>Đơn vị phối hợp</th>
            <th>Phản hồi đầu</th>
            <th>Phản hồi cuối</th>
            <th>Số lượt phản hồi</th>
            <th>Điểm tổng quan TB</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01</td>
            <td>Khảo sát sau hoạt động</td>
            <td>Cấp khoa</td>
            <td>Đoàn khoa Toán - Thống kê</td>
            <td>Liên Chi hội sinh viên khoa Toán - Thống kê</td>
            <td className="mono">{first}</td>
            <td className="mono">{last}</td>
            <td className="mono">{responses.length}</td>
            <td className="mono">
              {responses.length
                ? (responses.reduce((a, r) => a + r.overall, 0) / responses.length).toFixed(2)
                : "—"} / 7
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------- Descriptive section: stat cards + donut + program bars ----------
function DescriptiveSection({ responses }) {
  // Distribution of overall ratings → tone buckets
  const buckets = [
    { key: "good", label: "Tốt (≥6)", color: "var(--c-good)" },
    { key: "ok",   label: "Khá (5)", color: "oklch(0.65 0.14 200)" },
    { key: "mid",  label: "TB (3–4)", color: "var(--c-low)" },
  ];
  const counts = { good: 0, ok: 0, mid: 0 };
  for (const r of responses) {
    if (r.overall >= 6) counts.good++;
    else if (r.overall >= 5) counts.ok++;
    else counts.mid++;
  }
  const donutData = buckets.map((b) => ({
    label: b.label, value: counts[b.key], color: b.color
  }));
  const overallAvg = responses.length
    ? responses.reduce((a, r) => a + r.overall, 0) / responses.length
    : 0;

  // Program participation bars (count per program)
  const programCounts = PROGRAMS.map((p) => ({
    program: p,
    n: SURVEY_RESPONSES.filter(r => r.program === p).length,
  })).sort((a, b) => b.n - a.n);
  const maxN = Math.max(1, ...programCounts.map(x => x.n));

  // Concern-tag bars (mối quan tâm học kỳ)
  const tagCounts = {};
  for (const r of SURVEY_RESPONSES) {
    const k = r.interest;
    if (!k) continue;
    tagCounts[k] = (tagCounts[k] || 0) + 1;
  }
  const interests = Object.entries(tagCounts)
    .map(([k, v]) => ({ label: k, n: v }))
    .sort((a, b) => b.n - a.n);
  const maxInterest = Math.max(1, ...interests.map(x => x.n));

  return (
    <Section icon={Icon.ChartBar} title="Thống kê mô tả" soft>
      <div className="stat-grid">
        {/* Left column: 2 stacked stat cards */}
        <div className="stat-card__col">
          <div className="stat-card">
            <div className="stat-card__label">Tổng số phản hồi</div>
            <div className="stat-card__value">{responses.length}</div>
            <div className="stat-card__sub">phiếu khảo sát hợp lệ</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Điểm tổng quan TB</div>
            <div className="stat-card__value">{overallAvg.toFixed(2)}</div>
            <div className="stat-card__sub">trên thang điểm 7</div>
          </div>
        </div>

        {/* Donut */}
        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.PieIcon style={{ color: "var(--ink-soft)" }} />
            Phân bố mức đánh giá
          </h3>
          <div className="donut-wrap">
            <Donut
              data={donutData}
              centerValue={overallAvg.toFixed(1)}
              centerLabel="điểm TB"
            />
            <div className="donut-legend">
              {donutData.map((d, i) => (
                <div key={i} className="donut-legend__item">
                  <div className="donut-legend__row">
                    <span className="donut-legend__dot" style={{ background: d.color }} />
                    <span>{d.label}</span>
                  </div>
                  <span className="donut-legend__pct">
                    {responses.length ? Math.round((d.value / responses.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-program participation */}
        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.Report style={{ color: "var(--ink-soft)" }} />
            Phản hồi theo chương trình
          </h3>
          {programCounts.map((p) => (
            <ProgramBar
              key={p.program}
              label={p.program}
              value={p.n}
              max={SURVEY_RESPONSES.length}
              tone={p.n >= 3 ? "good" : p.n >= 2 ? "mid" : "low"}
            />
          ))}
        </div>
      </div>

      <div className="stat-grid--bottom stat-grid">
        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.ChartBar style={{ color: "var(--ink-soft)" }} />
            Mối quan tâm học kỳ này
          </h3>
          {interests.map((it, i) => (
            <ProgramBar
              key={i}
              label={it.label}
              value={it.n}
              max={SURVEY_RESPONSES.length}
              tone={it.n >= 4 ? "good" : it.n >= 2 ? "mid" : "low"}
            />
          ))}
        </div>

        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.Report style={{ color: "var(--ink-soft)" }} />
            Điểm TB theo nhân tố
          </h3>
          {FACTORS.map((f) => {
            const m = factorMean(responses, f);
            const tone = ratingLabel(m).tone;
            return (
              <BarRow key={f.code} code={f.code} label={f.name} value={m} tone={tone} />
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ---------- A factor tab (DVTT/CLCT/...) ----------
function FactorTabContent({ factor, responses }) {
  const factorAvg = factorMean(responses, factor);
  const tone = ratingLabel(factorAvg).tone;
  const { hi, lo } = factorExtremes(responses, factor);

  // bar items
  const barItems = factor.items.map((it) => {
    const v = itemMean(responses, it.code);
    const t = ratingLabel(v).tone;
    return {
      label: it.code, value: v,
      color:
        t === "good" ? "var(--c-good)" :
        t === "low"  ? "var(--c-low)"  :
        t === "bad"  ? "var(--c-bad)"  : "var(--c-mid)",
    };
  });

  // line series
  const palette = [
    "oklch(0.65 0.16 145)",
    "oklch(0.7 0.14 230)",
    "oklch(0.75 0.15 70)",
    "oklch(0.6 0.18 320)",
    "oklch(0.62 0.18 25)",
    "oklch(0.55 0.18 200)",
  ];
  const series = factor.items.map((it, i) => ({
    name: it.code,
    color: palette[i % palette.length],
    data: itemDistribution(responses, it.code),
  }));

  return (
    <div className="col" style={{ gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge--mid" style={{
          background: "var(--brand-100)", color: "var(--brand-500)", fontSize: 13, padding: "4px 12px"
        }}>{factor.code}</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>— {factor.name}</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {factor.items.length} biến quan sát
        </span>
      </div>
      <p className="muted" style={{ margin: "0", fontSize: 13, marginTop: -8 }}>
        {factor.desc}
      </p>

      {/* Stat strip */}
      <div className="stat-strip">
        <div className={"stat-strip__item stat-strip__item--" + (
          tone === "good" ? "good" : tone === "low" || tone === "bad" ? "bad" : "mid"
        )}>
          <div className="stat-strip__label">Điểm TB nhân tố</div>
          <div className={"stat-strip__value stat-strip__value--" + (
            tone === "good" ? "good" : tone === "low" || tone === "bad" ? "bad" : "low"
          )}>
            {factorAvg.toFixed(2)}
          </div>
          <div className="stat-strip__sub">{ratingLabel(factorAvg).text}</div>
        </div>
        <div className="stat-strip__item stat-strip__item--good">
          <div className="stat-strip__label">Biến cao nhất</div>
          <div className="stat-strip__value stat-strip__value--good">
            {hi.mean.toFixed(2)}
          </div>
          <div className="stat-strip__sub">{hi.code}</div>
        </div>
        <div className="stat-strip__item stat-strip__item--bad">
          <div className="stat-strip__label">Biến thấp nhất</div>
          <div className="stat-strip__value stat-strip__value--bad">
            {lo.mean.toFixed(2)}
          </div>
          <div className="stat-strip__sub">{lo.code}</div>
        </div>
        <div className="stat-strip__item stat-strip__item--neutral">
          <div className="stat-strip__label">Số mẫu</div>
          <div className="stat-strip__value">{responses.length}</div>
          <div className="stat-strip__sub">phiếu hợp lệ</div>
        </div>
      </div>

      <div className="two-col">
        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.ChartBar style={{ color: "var(--ink-soft)" }} />
            Điểm TB từng biến (ngang)
          </h3>
          <HBarChart items={barItems} />
        </div>

        <div className="sub-card">
          <h3 className="sub-card__title">
            <Icon.Report style={{ color: "var(--ink-soft)" }} />
            Phân phối phản hồi (điểm 1–7)
          </h3>
          <LineChart
            series={series}
            xLabels={[1,2,3,4,5,6,7]}
          />
          <div className="legend">
            {series.map((s, i) => (
              <span key={i} className="legend__item">
                <span className="legend__dot" style={{
                  background: "transparent",
                  border: `2px solid ${s.color}`,
                }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sub-card">
        <h3 className="sub-card__title">
          <Icon.Report style={{ color: "var(--ink-soft)" }} />
          Mức độ đánh giá từng biến
        </h3>
        {factor.items.map((it) => {
          const v = itemMean(responses, it.code);
          return (
            <BarRow key={it.code} code={it.code} label={it.label}
                    value={v} tone={ratingLabel(v).tone} />
          );
        })}
      </div>

      <div className="sub-card">
        <h3 className="sub-card__title">Nhận xét & đánh giá tổng hợp</h3>
        <div className="callout">
          <div className="callout__title">
            Đánh giá tổng thể: {ratingLabel(factorAvg).text.toUpperCase()}
          </div>
          <div className="callout__body">
            Nhân tố <strong>{factor.code}</strong> đạt mức <strong>{ratingLabel(factorAvg).text}</strong>{" "}
            ({factorAvg.toFixed(2)}/7).{" "}
            {factorAvg < 5
              ? "Cần ưu tiên cải thiện trong các chương trình kế tiếp."
              : factorAvg < 6
                ? "Có tiềm năng cải thiện thêm để đạt mức tốt. Tập trung vào biến có điểm thấp nhất."
                : "Duy trì cách triển khai hiện tại và tiếp tục phát huy."}
          </div>
        </div>
        <div className="split">
          <div className="split__col split__col--good">
            <div className="split__title">Điểm mạnh</div>
            <div style={{ fontSize: 13 }}>
              <strong>{hi.code}</strong> đạt cao nhất ({hi.mean.toFixed(2)}/7) — {hi.label}.
            </div>
          </div>
          <div className="split__col split__col--bad">
            <div className="split__title">Cần cải thiện</div>
            <div style={{ fontSize: 13 }}>
              Ưu tiên cải thiện <strong>{lo.code}</strong> ({lo.mean.toFixed(2)}/7) — {lo.label}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Per-factor color palette ----------
const FACTOR_COLORS = {
  DVTT: "oklch(0.62 0.16 240)",   // blue
  CLCT: "oklch(0.6 0.16 145)",    // green
  CSVC: "oklch(0.65 0.16 60)",    // amber/orange
  GTCT: "oklch(0.66 0.18 5)",     // pink-red
  SHL:  "oklch(0.55 0.18 290)",   // purple
  LTT:  "oklch(0.5 0.13 175)",    // teal
};

// ---------- Summary tab (Tổng hợp) ----------
function SummaryTabContent({ responses, onFactorClick }) {
  // factor means
  const factorMeans = FACTORS.map((f) => ({
    code: f.code, name: f.name,
    mean: factorMean(responses, f),
    color: FACTOR_COLORS[f.code],
  }));
  const factorRanked = [...factorMeans].sort((a, b) => b.mean - a.mean);

  // composite mean = mean of all factor means
  const compositeAvg = factorMeans.reduce((a, f) => a + f.mean, 0) / FACTORS.length;
  const overallAvg = responses.length
    ? responses.reduce((a, r) => a + r.overall, 0) / responses.length : 0;

  // satisfaction rate: % of responses with SHL avg >= 5
  const shlFactor = FACTORS.find(f => f.code === "SHL");
  const satCount = responses.filter(r => {
    const vals = shlFactor.items.map(it => r[it.code]).filter(v => typeof v === "number");
    if (!vals.length) return false;
    return (vals.reduce((a,b)=>a+b,0) / vals.length) >= 5;
  }).length;
  const satPct = responses.length ? Math.round((satCount / responses.length) * 100) : 0;

  // overall histogram
  const overallHist = [0,0,0,0,0,0,0];
  for (const r of responses) {
    if (r.overall >= 1 && r.overall <= 7) overallHist[r.overall - 1]++;
  }

  return (
    <div className="col" style={{ gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge--good" style={{ fontSize: 13, padding: "4px 12px" }}>
          TỔNG HỢP
        </span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          — Bức tranh toàn cảnh 6 nhân tố
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          {responses.length} phản hồi · 6 nhân tố · 21 biến quan sát
        </span>
      </div>

      {/* Top stat strip */}
      <div className="stat-strip">
        <div className="stat-strip__item stat-strip__item--neutral">
          <div className="stat-strip__label">Số mẫu khảo sát</div>
          <div className="stat-strip__value" style={{ color: "oklch(0.55 0.13 230)" }}>
            {responses.length}
          </div>
          <div className="stat-strip__sub">phiếu hợp lệ</div>
        </div>
        <div className="stat-strip__item stat-strip__item--mid">
          <div className="stat-strip__label">Điểm TB tổng hợp</div>
          <div className="stat-strip__value stat-strip__value--low">
            {compositeAvg.toFixed(2)}
          </div>
          <div className="stat-strip__sub">{ratingLabel(compositeAvg).text}</div>
        </div>
        <div className="stat-strip__item stat-strip__item--neutral"
             style={{ background: "oklch(0.95 0.025 230)", borderColor: "oklch(0.9 0.04 230)" }}>
          <div className="stat-strip__label">Điểm tổng thể (Q.cuối)</div>
          <div className="stat-strip__value" style={{ color: "oklch(0.5 0.16 230)" }}>
            {overallAvg.toFixed(2)}
          </div>
          <div className="stat-strip__sub">trên thang 7 điểm</div>
        </div>
        <div className="stat-strip__item stat-strip__item--good">
          <div className="stat-strip__label">Tỷ lệ hài lòng (SHL ≥ 5)</div>
          <div className="stat-strip__value stat-strip__value--good">
            {satPct}%
          </div>
          <div className="stat-strip__sub">{satCount}/{responses.length} người tham dự</div>
        </div>
      </div>

      {/* Radar + vertical bar comparison */}
      <div className="two-col">
        <div className="sub-card">
          <h3 className="sub-card__title">Biểu đồ radar — 6 nhân tố</h3>
          <div style={{ display: "grid", placeItems: "center", padding: "12px 0" }}>
            <RadarChart
              axes={FACTORS.map(f => f.code)}
              values={factorMeans.map(f => f.mean)}
              max={7} min={1} size={300}
              color="var(--brand-500)"
            />
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
            marginTop: 4,
          }}>
            {factorMeans.map(f => (
              <div key={f.code} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 11, fontFamily: "var(--font-mono)"
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: f.color, flexShrink: 0
                }} />
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{f.code}</span>
                <span style={{ color: "var(--ink-muted)" }}>{f.mean.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sub-card">
          <h3 className="sub-card__title">So sánh điểm TB các nhân tố</h3>
          <VBarChart
            items={factorMeans.map(f => ({
              label: f.code, value: f.mean, color: f.color
            }))}
            max={7} min={1} height={300}
          />
        </div>
      </div>

      {/* Overall distribution histogram */}
      <div className="sub-card">
        <h3 className="sub-card__title">
          Phân phối điểm tổng thể — câu đánh giá cuối
          <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
            n = {responses.length} phiếu
          </span>
        </h3>
        <Histogram
          data={overallHist}
          xLabels={[1,2,3,4,5,6,7]}
          colors={[
            "oklch(0.62 0.18 25)",   // 1 — đỏ
            "oklch(0.66 0.18 5)",    // 2 — đỏ-hồng
            "oklch(0.7 0.16 60)",    // 3 — cam/amber
            "oklch(0.62 0.16 240)",  // 4 — xanh dương nhạt
            "oklch(0.55 0.18 240)",  // 5 — xanh dương đậm (điểm phổ biến nhất thường rơi vào 5)
            "oklch(0.6 0.16 145)",   // 6 — xanh lá
            "oklch(0.55 0.18 145)",  // 7 — xanh lá đậm
          ]}
        />
        <div className="hist-legend">
          {[
            { range: "1–2", label: "Không hài lòng", color: "oklch(0.62 0.18 25)" },
            { range: "3",   label: "Yếu",            color: "oklch(0.7 0.16 60)" },
            { range: "4–5", label: "Trung bình – Khá", color: "oklch(0.55 0.18 240)" },
            { range: "6–7", label: "Tốt – Rất tốt",  color: "oklch(0.55 0.18 145)" },
          ].map((g, i) => (
            <div key={i} className="hist-legend__item">
              <span className="hist-legend__chip" style={{
                background: g.color, opacity: 0.28,
                borderColor: g.color
              }} />
              <span className="hist-legend__range">{g.range}</span>
              <span className="hist-legend__label">{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked factor list */}
      <div className="sub-card">
        <h3 className="sub-card__title">
          Xếp hạng nhân tố
          <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
            — nhấn để xem chi tiết
          </span>
        </h3>
        <div className="col" style={{ gap: 10 }}>
          {factorRanked.map((r, i) => {
            const tone = ratingLabel(r.mean).tone;
            const pct = Math.max(0, Math.min(100, ((r.mean - 1) / 6) * 100));
            return (
              <button key={r.code}
                      onClick={() => onFactorClick && onFactorClick(r.code)}
                      className="rank-row">
                <span className="rank-row__num">{i + 1}</span>
                <span className="rank-row__code" style={{ color: r.color }}>{r.code}</span>
                <span className="rank-row__name">{r.name}</span>
                <span className="rank-row__bar">
                  <span className="rank-row__fill" style={{
                    width: pct + "%", background: r.color
                  }} />
                </span>
                <span className="rank-row__val">{r.mean.toFixed(2)}</span>
                <span className={"badge badge--" + tone}>{ratingLabel(r.mean).text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Qualitative tab ----------
function QualitativeTabContent({ responses }) {
  const cols = [
    { key: "learn",    title: "Bài học & giá trị có thể áp dụng" },
    { key: "trouble",  title: "Khó khăn / trải nghiệm chưa thoải mái" },
    { key: "interest", title: "Mối quan tâm trong học kỳ này" },
    { key: "feedback", title: "Góp ý cho chương trình" },
  ];
  return (
    <div className="col" style={{ gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="badge badge--mid" style={{ fontSize: 13, padding: "4px 12px" }}>
          ĐỊNH TÍNH
        </span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          — Phản hồi mở từ người tham gia
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          {responses.length} phản hồi · 4 chủ đề
        </span>
      </div>
      <div className="two-col">
        {cols.map(c => (
          <div key={c.key} className="sub-card">
            <h3 className="sub-card__title">{c.title}</h3>
            <div className="qual-list">
              {responses.map((r, i) => (
                <div key={r.id + c.key} className="qual-item">
                  <div className="qual-item__quote">{r[c.key]}</div>
                  <div className="qual-item__meta">
                    {r.id} · {r.program} · {r.ts.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  ActivityCard, DescriptiveSection, FactorTabContent, SummaryTabContent, QualitativeTabContent
});
