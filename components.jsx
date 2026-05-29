/* components.jsx — shared UI atoms */

const { useState } = React;

// ---------- Icons (lucide-style, hand-picked) ----------
const Icon = {
  Home: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>,

  Activity: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h12M3 12h18M3 18h9" />
      <path d="M19 6l2 2-2 2" />
    </svg>,

  Admin: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12" />
      <path d="M16 3l5 5M14 5l5 5-7 7H7v-5l7-7Z" />
    </svg>,

  ChartBar: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V3" /><rect x="6" y="14" width="3" height="6" />
      <rect x="11" y="9" width="3" height="11" /><rect x="16" y="4" width="3" height="16" />
    </svg>,

  Report: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h6M8 16h4" />
    </svg>,

  Notes: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h11l4 4v14a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0V3Z" />
      <path d="M15 3v5h5M8 13h8M8 17h5" />
    </svg>,

  PieIcon: (p) =>
  <svg {...p} width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
      <path d="M14 3v7h7" />
    </svg>,

  Attach: (p) =>
  <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6l-7 7a3 3 0 0 0 4 4l8-8a5 5 0 0 0-7-7l-8 8a7 7 0 0 0 10 10l6-6" />
    </svg>,

  Logout: (p) =>
  <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>,

  Building: (p) =>
  <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6" />
    </svg>,

  Pin: (p) =>
  <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>,

  Mail: (p) =>
  <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>

};

// ---------- Top nav ----------
function TopNav() {
  return (
    <header className="nav">
      <div className="nav__brand">
        <div className="nav__mark" style={{ letterSpacing: "0.6px" }}>MY</div>
        <div>
          <div className="nav__brand-name">Mymy</div>
          <div className="nav__brand-sub">Activity Insight</div>
        </div>
      </div>
      <nav className="nav__links">
        <a className="nav__link nav__link--active"><Icon.Home /> Trang chủ</a>
        <a className="nav__link"><Icon.Activity /> Hoạt động</a>
        <a className="nav__link"><Icon.Admin /> Quản trị</a>
      </nav>
      <div className="nav__spacer" />
      <div className="nav__user">
        <div className="nav__avatar">AN</div>
        <div>
          <div className="nav__user-name">An Nguyễn — Ban điều phối</div>
          <div className="nav__user-mail">an.nguyen@mymy.edu</div>
        </div>
        <svg className="nav__user-chev" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </header>);

}

// ---------- Banner ----------
function Banner({ crumb, title }) {
  return (
    <section className="banner">
      {crumb && <div className="banner__crumb">{crumb}</div>}
      <h1 className="banner__title">{title}</h1>
    </section>);

}

// ---------- Section wrapper ----------
function Section({ icon: I, title, children, soft, style }) {
  return (
    <section className={"section" + (soft ? " section--soft" : "")} style={style}>
      <div className="section__head">
        {I ? <I className="section__head-icon" /> : null}
        <h2 className="section__title">{title}</h2>
      </div>
      {children}
    </section>);

}

// ---------- Single horizontal bar row ----------
function BarRow({ code, label, value, max = 7, tone }) {
  const pct = Math.max(0, Math.min(100, (value - 1) / (max - 1) * 100));
  const fillCls =
  tone === "good" ? "bar__fill" :
  tone === "mid" ? "bar__fill bar__fill--mid" :
  tone === "low" ? "bar__fill bar__fill--low" :
  tone === "bad" ? "bar__fill bar__fill--bad" : "bar__fill";
  return (
    <div className="bar-row">
      <div className="bar-row__head">
        <div className="bar-row__label">
          {code ? <strong>{code}</strong> : null}{code ? " — " : ""}{label}
        </div>
        <span className={"badge badge--" + tone}>{ratingLabel(value).text}</span>
        <span className="bar-row__pct">{value.toFixed(2)}</span>
      </div>
      <div className="bar"><div className={fillCls} style={{ width: pct + "%" }} /></div>
    </div>);

}

// ---------- Generic progress bar with percentage on right ----------
function ProgramBar({ label, value, max, tone }) {
  const pct = max ? Math.round(value / max * 100) : 0;
  const fillCls =
  tone === "good" ? "bar__fill" :
  tone === "mid" ? "bar__fill bar__fill--mid" :
  "bar__fill bar__fill--low";
  return (
    <div className="bar-row">
      <div className="bar-row__head">
        <div className="bar-row__label">{label}</div>
        <span className="bar-row__pct">{pct}% · n={value}</span>
      </div>
      <div className="bar"><div className={fillCls} style={{ width: pct + "%" }} /></div>
    </div>);

}

Object.assign(window, {
  Icon, TopNav, Banner, Section, BarRow, ProgramBar
});