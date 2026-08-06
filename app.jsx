/* app.jsx — main shell, program sidebar, footer */

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

// ── Sidebar chọn chương trình (2 tầng: năm → hoạt động) ─
function ProgramSidebar({ selectedPrograms, onToggle, onBatchSet, onHomeClick }) {
  const allPrograms = window.PROGRAMS || [];
  const yearMap = window.PROGRAM_YEARS || {};

  // Nhóm chương trình theo năm
  const byYear = {};
  for (const p of allPrograms) {
    const y = String(yearMap[p] || "Khác");
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(p);
  }
  const allYears = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  // Tầng 1: năm nào đang được hiển thị (mặc định = chưa chọn năm nào)
  const [visibleYears, setVisibleYears] = useState(() => new Set());

  const toggleVisibleYear = (year) => {
    const willShow = !visibleYears.has(year);
    setVisibleYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
    // Khi hiện năm → tự chọn hết chương trình của năm đó
    // Khi ẩn năm → tự bỏ chọn hết chương trình của năm đó
    onBatchSet(byYear[year] || [], willShow);
  };

  // Chương trình hiển thị = chỉ những năm đang được tick
  const visiblePrograms = allPrograms.filter(p =>
    visibleYears.has(String(yearMap[p] || "Khác"))
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        {onHomeClick && (
          <div style={{ marginBottom: 15, fontSize: 13, color: '#006b5e', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }} onClick={onHomeClick}>
            <span style={{ fontSize: 16 }}>←</span> Quay lại
          </div>
        )}
        <span className="sidebar__title">Chương trình</span>
        <div className="sidebar__btns">
          <button className="sidebar__btn"
            onClick={() => onBatchSet(visiblePrograms, true)}>Chọn hết</button>
          <button className="sidebar__btn sidebar__btn--clear"
            onClick={() => onBatchSet(visiblePrograms, false)}>Xóa hết</button>
        </div>
      </div>

      {/* Tầng 1: chọn năm */}
      <div className="sidebar__year-section">
        <div className="sidebar__section-label">Chọn năm</div>
        <div className="sidebar__year-chips">
          {allYears.map(year => {
            const on = visibleYears.has(year);
            return (
              <label key={year} className={"sidebar__year-chip" + (on ? " sidebar__year-chip--on" : "")}>
                <input type="checkbox" checked={on} onChange={() => toggleVisibleYear(year)} />
                {year}
              </label>
            );
          })}
        </div>
      </div>

      {/* Tầng 2: chọn từng hoạt động */}
      <div className="sidebar__body">
        {visiblePrograms.length === 0 ? (
          <div style={{ padding: "16px 14px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            Chọn năm để xem hoạt động
          </div>
        ) : visiblePrograms.map(p => {
          const checked = selectedPrograms.has(p);
          return (
            <label key={p} className={"sidebar__item" + (checked ? " sidebar__item--on" : "")}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(p)} />
              <span className="sidebar__item-name">{p}</span>
            </label>
          );
        })}
      </div>

      <div className="sidebar__foot">
        {selectedPrograms.size}/{allPrograms.length} chương trình
      </div>
    </aside>
  );
}

// ── Báo cáo sau chương trình (tabs + bộ lọc khóa/khoa) ─
function ReportTabs({ responses }) {
  const tabs = [
    { id: "__SUMMARY__", label: "Tổng hợp", icon: Icon.ChartBar },
    ...FACTORS.map(f => ({ id: f.code, label: f.name })),
    { id: "__QUAL__", label: "Phản hồi mở", icon: Icon.Notes },
  ];
  const [active, setActive] = useState(() => {
    return localStorage.getItem("mymy.tab") || "__SUMMARY__";
  });
  useEffect(() => { localStorage.setItem("mymy.tab", active); }, [active]);

  const [cohortFilter, setCohortFilter] = useState("__ALL__");
  const [facultyFilter, setFacultyFilter] = useState("__ALL__");

  const availableCohorts = useMemo(() =>
    ["49", "50", "51"].filter(k => responses.some(r => r.cohort === k)),
    [responses]
  );
  const availableFaculties = useMemo(() =>
    [...new Set(responses.map(r => r.faculty).filter(Boolean))].sort(),
    [responses]
  );

  const filtered = useMemo(() => {
    let r = responses;
    if (cohortFilter !== "__ALL__") r = r.filter(x => x.cohort === cohortFilter);
    if (facultyFilter !== "__ALL__") r = r.filter(x => x.faculty === facultyFilter);
    return r;
  }, [responses, cohortFilter, facultyFilter]);

  const hasFilter = cohortFilter !== "__ALL__" || facultyFilter !== "__ALL__";

  return (
    <Section icon={Icon.Report} title="Báo cáo sau chương trình">

      {/* Bộ lọc khóa / khoa */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        marginBottom: 16, padding: "10px 14px",
        background: "var(--surface-soft,#f6f8fa)", borderRadius: 10,
        border: "1px solid var(--border,#e2e8f0)"
      }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>Lọc theo:</span>

        <select value={cohortFilter} onChange={e => setCohortFilter(e.target.value)}
          style={{
            fontFamily: "inherit", fontSize: 13,
            border: "1px solid #cbd5e1", borderRadius: 8,
            padding: "5px 10px", background: "#fff", cursor: "pointer"
          }}>
          <option value="__ALL__">— Tất cả khóa —</option>
          {availableCohorts.map(k => <option key={k} value={k}>Khóa {k}</option>)}
        </select>

        <select value={facultyFilter} onChange={e => setFacultyFilter(e.target.value)}
          style={{
            fontFamily: "inherit", fontSize: 13,
            border: "1px solid #cbd5e1", borderRadius: 8,
            padding: "5px 10px", background: "#fff", cursor: "pointer", maxWidth: 240
          }}>
          <option value="__ALL__">— Tất cả khoa —</option>
          {availableFaculties.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {hasFilter && (
          <button onClick={() => { setCohortFilter("__ALL__"); setFacultyFilter("__ALL__"); }}
            style={{
              fontSize: 12, color: "#dc2626", background: "#fef2f2",
              border: "1px solid #fca5a5", borderRadius: 6,
              padding: "4px 10px", cursor: "pointer"
            }}>
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
        if (active === "__QUAL__") return <QualitativeTabContent responses={filtered} />;
        const f = FACTORS.find(x => x.code === active);
        return f ? <FactorTabContent factor={f} responses={filtered} /> : null;
      })()}
    </Section>
  );
}

// ── Home Menu ──────────────────────────────────────────────
function HomeMenu({ onViewChange, onAddActivityClick }) {
  return (
    <div className="home-menu">
      <h2 className="home-menu__title">ĐOÀN - HỘI KHOA TOÁN - THỐNG KÊ</h2>

      <div className="home-menu__section">
        <div className="home-menu__header">Quản lý hoạt động</div>
        <div className="home-menu__cards">
          <div className="home-menu__card" onClick={onAddActivityClick}>
            <div className="home-menu__icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            </div>
            <h3 className="home-menu__card-title">Thêm khảo sát hoạt động</h3>
            <span className="home-menu__action-tag">→ Thực hiện</span>
          </div>
          <div className="home-menu__card" onClick={() => window.open('https://docs.google.com/spreadsheets/d/16TyqIj3iN1cEKuiVtctmi-om1sjW_LjrDLh0E17zIyY/edit?gid=0#gid=0', '_blank')}>
            <div className="home-menu__icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </div>
            <h3 className="home-menu__card-title">Tổng hợp báo cáo Hoạt động cơ sở</h3>
            <span className="home-menu__action-tag">→ Thực hiện</span>
          </div>
        </div>
      </div>

      <div className="home-menu__section">
        <div className="home-menu__header">Báo cáo kết quả khảo sát sau chương trình</div>
        <div className="home-menu__cards">
          <div className="home-menu__card" onClick={() => onViewChange('dashboard')}>
            <div className="home-menu__icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <h3 className="home-menu__card-title">Xem kết quả khảo sát sinh viên<br/>sau chương trình</h3>
            <span className="home-menu__action-tag">→ Thực hiện</span>
          </div>
        </div>
      </div>

      <div className="home-menu__section">
        <div className="home-menu__header">Tổng hợp Hòm thư lắng nghe</div>
        <div className="home-menu__cards">
          <div className="home-menu__card" onClick={() => onViewChange('mailbox')}>
            <div className="home-menu__icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="home-menu__card-title">Tổng hợp ý kiến sinh viên</h3>
            <span className="home-menu__action-tag">→ Thực hiện</span>
          </div>
          <div className="home-menu__card disabled">
            <div className="home-menu__icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </div>
            <h3 className="home-menu__card-title">Dữ liệu trả lời</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App root ───────────────────────────────────────────
function App() {
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['menu', 'dashboard', 'mailbox'].includes(hash) ? hash : 'menu';
  });
  const [selectedPrograms, setSelectedPrograms] = useState(() => new Set());
  const [dataKey, setDataKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [mailbox, setMailbox] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (window.location.hash !== `#${view}`) {
      window.location.hash = view;
    }
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['menu', 'dashboard', 'mailbox'].includes(hash)) {
        setView(hash);
      } else {
        setView('menu');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadData = () => {
    setLoading(true);
    fetch(APPS_SCRIPT_URL + '?action=getResponses')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          window.SURVEY_RESPONSES = data.responses || [];
          if (data.programs?.length > 0) {
            window.PROGRAMS = data.programs;
          }
          window.PARTICIPANT_MAP = data.participantMap || {};
          if (data.programYears) {
            window.PROGRAM_YEARS = { ...(window.PROGRAM_YEARS || {}), ...data.programYears };
          }
          if (data.programInfo) {
            window.PROGRAM_INFO = { ...(window.PROGRAM_INFO || {}), ...data.programInfo };
          }
          setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
          setDataKey(k => k + 1);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    fetch(APPS_SCRIPT_URL + '?action=getMailbox')
      .then(r => r.json())
      .then(data => { if (data.success) setMailbox(data.entries || []); })
      .catch(() => { });
  }, []);

  const responses = useMemo(
    () => selectedPrograms.size === 0 ? [] : window.filterByPrograms(selectedPrograms),
    [selectedPrograms, dataKey]
  );

  const handleToggle = p => {
    setSelectedPrograms(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  // Thêm hoặc bỏ một nhóm chương trình cùng lúc (dùng khi toggle năm)
  const handleBatchSet = (programs, shouldSelect) => {
    setSelectedPrograms(prev => {
      const next = new Set(prev);
      if (shouldSelect) programs.forEach(p => next.add(p));
      else programs.forEach(p => next.delete(p));
      return next;
    });
  };

  return (
    <>
      <TopNav />
      {!loading && updatedAt && (
        <div style={{ textAlign: 'right', padding: '4px 24px', fontSize: 11, color: '#888' }}>
          ✓ Cập nhật lúc {updatedAt}
          <button onClick={() => window.location.reload()} style={{
            marginLeft: 8, fontSize: 11, padding: '1px 8px',
            border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', background: '#fff'
          }}>↻ Làm mới</button>
        </div>
      )}

      {view === 'menu' && (
        <HomeMenu onViewChange={setView} onAddActivityClick={() => setShowAddModal(true)} />
      )}

      {view === 'dashboard' && (
        <div className="dashboard-layout">
          <ProgramSidebar
            selectedPrograms={selectedPrograms}
            onToggle={handleToggle}
            onBatchSet={handleBatchSet}
            onHomeClick={() => setView('menu')}
          />
          <main className="main dashboard-main">
            <ActivityCard selectedPrograms={selectedPrograms} responses={responses} />
            {selectedPrograms.size > 0 && (
              <>
                <DescriptiveSection responses={responses} selectedPrograms={selectedPrograms} />
                <ReportTabs responses={responses} />
              </>
            )}
          </main>
        </div>
      )}

      {view === 'mailbox' && (
        <div className="dashboard-layout" style={{ justifyContent: 'center' }}>
          <main className="main dashboard-main" style={{ maxWidth: 900, margin: '20px auto', width: '100%' }}>
            <div style={{ marginBottom: 20, fontSize: 14, color: '#006b5e', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setView('menu')}>
              <span style={{ fontSize: 18 }}>←</span> Quay lại
            </div>
            <MailboxSection entries={mailbox} />
          </main>
        </div>
      )}

      <Footer />
      {showAddModal && (
        <AddActivityModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </>
  );
}

// ── AddActivityModal: Panel/Form thêm hoạt động mới ────────────────
function AddActivityModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    courseName: '',
    participants: '',
    loaiHoatDong: '',
    quyMo: '',
    donViToChuc: '',
    donViPhoiHop: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    tongKinhPhi: '',
    soLieuKhacTen: '',
    soLieuKhacSl: '',
    linkVanBan: '',
    linkMinhChung: '',
    tomTatHd: '',
    danhGiaHieuQua: '',
    batDauKhaoSat: '',
    ketThucKhaoSat: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseName.trim()) {
      setError('Tên hoạt động không được để trống.');
      return;
    }
    if (!form.participants || isNaN(form.participants) || parseInt(form.participants) < 0) {
      setError('Số lượng tham gia phải là số nguyên dương.');
      return;
    }
    if (!form.loaiHoatDong.trim()) {
      setError('Loại hoạt động không được để trống.');
      return;
    }
    if (!form.quyMo.trim()) {
      setError('Quy mô hoạt động không được để trống.');
      return;
    }
    if (form.tongKinhPhi && (isNaN(form.tongKinhPhi) || parseFloat(form.tongKinhPhi) < 0)) {
      setError('Tổng kinh phí phải là số không âm.');
      return;
    }
    if (form.soLieuKhacSl && (isNaN(form.soLieuKhacSl) || parseInt(form.soLieuKhacSl) < 0)) {
      setError('Số lượng số liệu khác phải là số không âm.');
      return;
    }
    if (!form.ngayBatDau || !form.ngayKetThuc || !form.batDauKhaoSat || !form.ketThucKhaoSat) {
      setError('Vui lòng điền đầy đủ tất cả các mốc thời gian.');
      return;
    }
    setError('');
    setSaving(true);

    const params = new URLSearchParams({
      action: 'addActivity',
      ...form
    });

    fetch(APPS_SCRIPT_URL + '?' + params.toString())
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          onSaved();
        } else {
          setError(data.error || 'Lỗi không xác định.');
          setSaving(false);
        }
      })
      .catch(() => {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
        setSaving(false);
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>Thêm Hoạt Động Mới</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ color: 'var(--c-bad)', background: 'var(--c-bad-soft)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-field">
              <label>Tên hoạt động <span className="req">*</span></label>
              <input type="text" name="courseName" value={form.courseName} onChange={handleChange} required placeholder="Ví dụ: 2026_TTK_01_Hành trình Chín tháng Giêng liên khoa Toán - Thống kê và khoa Kinh tế" />
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Loại hoạt động <span className="req">*</span></label>
                <input type="text" name="loaiHoatDong" value={form.loaiHoatDong} onChange={handleChange} required placeholder="Ví dụ: Hoạt động của đơn vị" />
              </div>
              <div className="form-field">
                <label>Quy mô hoạt động <span className="req">*</span></label>
                <input type="text" name="quyMo" value={form.quyMo} onChange={handleChange} required placeholder="Ví dụ: Cấp cơ sở trực thuộc" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Đơn vị tổ chức</label>
                <input type="text" name="donViToChuc" value={form.donViToChuc} onChange={handleChange} placeholder="Ví dụ: LCH SV khoa Toán - Thống kê" />
              </div>
              <div className="form-field">
                <label>Đơn vị phối hợp</label>
                <input type="text" name="donViPhoiHop" value={form.donViPhoiHop} onChange={handleChange} placeholder="Ví dụ: LCH SV khoa Kinh tế" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Số lượng tham gia <span className="req">*</span></label>
                <input type="number" name="participants" value={form.participants} onChange={handleChange} required min="0" placeholder="Ví dụ: 52" />
              </div>
              <div className="form-field">
                <label>Tổng kinh phí (VNĐ)</label>
                <input type="number" name="tongKinhPhi" value={form.tongKinhPhi} onChange={handleChange} min="0" placeholder="Ví dụ: 1150000" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Số liệu khác - Tên số liệu</label>
                <input type="text" name="soLieuKhacTen" value={form.soLieuKhacTen} onChange={handleChange} placeholder="Ví dụ: Số phần việc thanh niên" />
              </div>
              <div className="form-field">
                <label>Số liệu khác - Số lượng (SL)</label>
                <input type="number" name="soLieuKhacSl" value={form.soLieuKhacSl} onChange={handleChange} min="0" placeholder="Ví dụ: 1" />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Link văn bản</label>
                <input type="text" name="linkVanBan" value={form.linkVanBan} onChange={handleChange} placeholder="Ví dụ: https://drive.google.com/file/d/..." />
              </div>
              <div className="form-field">
                <label>Link minh chứng</label>
                <input type="text" name="linkMinhChung" value={form.linkMinhChung} onChange={handleChange} placeholder="Ví dụ: https://www.facebook.com/share/p/..." />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Tóm tắt hoạt động</label>
                <textarea name="tomTatHd" value={form.tomTatHd} onChange={handleChange} placeholder="Tóm tắt ngắn gọn nội dung hoạt động..." />
              </div>
              <div className="form-field">
                <label>Đánh giá hiệu quả HĐ</label>
                <textarea name="danhGiaHieuQua" value={form.danhGiaHieuQua} onChange={handleChange} placeholder="Đánh giá kết quả, hiệu quả đạt được..." />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Ngày bắt đầu hoạt động <span className="req">*</span></label>
                <input type="date" name="ngayBatDau" value={form.ngayBatDau} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Ngày kết thúc hoạt động <span className="req">*</span></label>
                <input type="date" name="ngayKetThuc" value={form.ngayKetThuc} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>Ngày bắt đầu khảo sát <span className="req">*</span></label>
                <input type="date" name="batDauKhaoSat" value={form.batDauKhaoSat} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Hạn chót khảo sát <span className="req">*</span></label>
                <input type="date" name="ketThucKhaoSat" value={form.ketThucKhaoSat} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
