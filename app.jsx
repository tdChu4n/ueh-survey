/* app.jsx — main shell, tab routing, footer */

const { useState, useMemo, useEffect } = React;

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

  const responses = useMemo(
    () => filterByProgram(program),
    [program]
  );

  return (
    <>
      <TopNav />
      <Banner crumb="Chi tiết hoạt động" title={
        program === "__ALL__" ? "Tổng quan tất cả chương trình" : program
      } />
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
