/* app.jsx — main shell, tab routing, footer */

const { useState, useMemo, useEffect } = React;

// ── Live data từ Google Sheets ────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyP9XvRCgVKV7y_SEtQ4Oz1bBlNkgnKzhqT19DrtqhFngE4C3qLq0Yb60buuM_12H_R/exec';
// ─────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer" style={{ background: '#006b5e' }}>
      <div className="footer__row">
        <Icon.Building className="footer__icon" />
        <div className="footer__brand-stack">
          <div>Đoàn Thanh niên - Hội Sinh viên Đại học Kinh tế TP. Hồ Chí Minh</div>
          <div>Đoàn khoa Toán - Thống kê</div>
          <div>Liên Chi hội sinh viên khoa Toán - Thống kê</div>
        </div>
      </div>
      <div className="footer__row">
        <Icon.Pin className="footer__icon" />
        <div>279 Nguyễn Tri Phương, Phường Diên Hồng, Thành phố Hồ Chí Minh</div>
      </div>
      <div className="footer__row">
        <Icon.Mail className="footer__icon" />
        <div>Email: doanhoi.ttk@ueh.edu.vn</div>
      </div>
    </footer>
  );
}

function ReportTabs({ responses }) {
  const tabs = [
    { id: "__SUMMARY__", label: "Tổng hợp", icon: Icon.ChartBar },
    ...FACTORS.map(f => ({ id: f.code, label: f.code })),
    { id: "__QUAL__", label: "Định tính", icon: Icon.Notes },
  ];
  const [active, setActive] = useState(() => {
    return localStorage.getItem("mymy.tab") || "__SUMMARY__";
  });
  useEffect(() => { localStorage.setItem("mymy.tab", active); }, [active]);

  const [cohortFilter,  setCohortFilter]  = useState("__ALL__");
  const [facultyFilter, setFacultyFilter] = useState("__ALL__");

  const availableCohorts = useMemo(() =>
    ["49","50","51"].filter(k => responses.some(r => r.cohort === k)),
    [responses]
  );
  const availableFaculties = useMemo(() =>
    [...new Set(responses.map(r => r.faculty).filter(Boolean))].sort(),
    [responses]
  );

  const filtered = useMemo(() => {
    let r = responses;
    if (cohortFilter  !== "__ALL__") r = r.filter(x => x.cohort  === cohortFilter);
    if (facultyFilter !== "__ALL__") r = r.filter(x => x.faculty === facultyFilter);
    return r;
  }, [responses, cohortFilter, facultyFilter]);

  const hasFilter = cohortFilter !== "__ALL__" || facultyFilter !== "__ALL__";

  return (
    <Section icon={Icon.Report} title="Báo cáo sau chương trình">

      {/* Bộ lọc */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        marginBottom: 16, padding: "10px 14px",
        background: "var(--surface-soft,#f6f8fa)", borderRadius: 10,
        border: "1px solid var(--border,#e2e8f0)"
      }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>Lọc theo:</span>

        <select value={cohortFilter} onChange={e => setCohortFilter(e.target.value)}
                style={{ fontFamily: "inherit", fontSize: 13,
                         border: "1px solid #cbd5e1", borderRadius: 8,
                         padding: "5px 10px", background: "#fff", cursor: "pointer" }}>
          <option value="__ALL__">— Tất cả khóa —</option>
          {availableCohorts.map(k => <option key={k} value={k}>Khóa {k}</option>)}
        </select>

        <select value={facultyFilter} onChange={e => setFacultyFilter(e.target.value)}
                style={{ fontFamily: "inherit", fontSize: 13,
                         border: "1px solid #cbd5e1", borderRadius: 8,
                         padding: "5px 10px", background: "#fff", cursor: "pointer", maxWidth: 240 }}>
          <option value="__ALL__">— Tất cả khoa —</option>
          {availableFaculties.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {hasFilter && (
          <button onClick={() => { setCohortFilter("__ALL__"); setFacultyFilter("__ALL__"); }}
                  style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2",
                           border: "1px solid #fca5a5", borderRadius: 6,
                           padding: "4px 10px", cursor: "pointer" }}>
            ✕ Bỏ lọc
          </button>
        )}

        {hasFilter && (
          <span style={{ fontSize: 12, color: "#64748b" }}>
            — {filtered.length} / {responses.length} phiếu
          </span>
        )}
      </div>

      <div className="tabs">
        {tabs.map(t => {
          const Ico = t.icon;
          return (
            <button key={t.id}
                    className={"tab" + (active === t.id ? " tab--active" : "")}
                    onClick={() => setActive(t.id)}>
              {Ico ? <Ico style={{ width: 16, height: 16 }} /> : null}
              {t.label}
            </button>
          );
        })}
      </div>
      {(() => {
        if (active === "__SUMMARY__")
          return <SummaryTabContent responses={filtered} onFactorClick={setActive} />;
        if (active === "__QUAL__")    return <QualitativeTabContent responses={filtered} />;
        const f = FACTORS.find(x => x.code === active);
        return f ? <FactorTabContent factor={f} responses={filtered} /> : null;
      })()}
    </Section>
  );
}

function App() {
  const [program, setProgram] = useState(() => {
    return localStorage.getItem("mymy.program") || PROGRAMS[0];
  });
  useEffect(() => { localStorage.setItem("mymy.program", program); }, [program]);

  const [dataKey,   setDataKey]   = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    fetch(APPS_SCRIPT_URL + '?action=getResponses')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          window.SURVEY_RESPONSES = data.responses || [];
          if (data.programs?.length > 0) window.PROGRAMS = data.programs;
          window.PARTICIPANT_MAP  = data.participantMap || {};
          setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
          setDataKey(k => k + 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const responses = useMemo(
    () => filterByProgram(program),
    [program, dataKey]
  );

  return (
    <>
      <TopNav />
      <Banner crumb="Chi tiết hoạt động" title={
        program === "__ALL__" ? "Tổng quan tất cả chương trình" : program
      } />
      {loading && (
        <div style={{ textAlign:'center', padding:'8px', background:'#fffbe6', fontSize:13, color:'#856404' }}>
          ⏳ Đang tải dữ liệu từ Google Sheets...
        </div>
      )}
      {!loading && updatedAt && (
        <div style={{ textAlign:'right', padding:'4px 24px', fontSize:11, color:'#888' }}>
          ✓ Cập nhật lúc {updatedAt}
          <button onClick={() => window.location.reload()} style={{
            marginLeft:8, fontSize:11, padding:'1px 8px',
            border:'1px solid #ccc', borderRadius:3, cursor:'pointer', background:'#fff'
          }}>↻ Làm mới</button>
        </div>
      )}
      <main className="main">
        <ActivityCard program={program} onChange={setProgram} responses={responses} />
        <DescriptiveSection responses={responses} program={program} />
        <ReportTabs responses={responses} />
      </main>
      <Footer />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
