/* app.jsx — main shell, tab routing, footer */

const { useState, useMemo, useEffect } = React;

// ── Live data từ Google Sheets ────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyP9XvRCgVKV7y_SEtQ4Oz1bBlNkgnKzhqT19DrtqhFngE4C3qLq0Yb60buuM_12H_R/exec';
// ─────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <Icon.Building className="footer__icon" />
        <div className="footer__brand-stack">
          <div>Mymy — Hệ thống tổng hợp khảo sát hoạt động sinh viên</div>
          <div>Ban Phát triển sinh viên</div>
          <div>CLB Học thuật Mymy</div>
        </div>
      </div>
      <div className="footer__row">
        <Icon.Pin className="footer__icon" />
        <div>123 Đường Demo, Phường Mẫu, Thành phố Hư Cấu</div>
      </div>
      <div className="footer__row">
        <Icon.Mail className="footer__icon" />
        <div>Email: hello@mymy.edu</div>
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

  return (
    <Section icon={Icon.Report} title="Báo cáo sau chương trình">
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
          return <SummaryTabContent responses={responses} onFactorClick={setActive} />;
        if (active === "__QUAL__")    return <QualitativeTabContent responses={responses} />;
        const f = FACTORS.find(x => x.code === active);
        return f ? <FactorTabContent factor={f} responses={responses} /> : null;
      })()}
    </Section>
  );
}

function App() {
  const [program, setProgram] = useState(() => {
    return localStorage.getItem("mymy.program") || PROGRAMS[0];
  });
  useEffect(() => { localStorage.setItem("mymy.program", program); }, [program]);

  // dataKey tăng khi live data về → ép React re-render với data mới
  const [dataKey,   setDataKey]   = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    fetch(APPS_SCRIPT_URL + '?action=getResponses')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          window.SURVEY_RESPONSES = data.responses || [];   // luôn ghi đè, kể cả khi rỗng
          if (data.programs?.length > 0) window.PROGRAMS = data.programs;
          setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
          setDataKey(k => k + 1);
        }
      })
      .catch(() => {}) // fallback: dùng dữ liệu tĩnh trong survey-data.js
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
        <DescriptiveSection responses={responses} />
        <ReportTabs responses={responses} />
      </main>
      <Footer />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
