// ═══════════════════════════════════════════════════════════════════
//  UEH Survey System — Google Apps Script
// ═══════════════════════════════════════════════════════════════════

const SPREADSHEET_ID    = '1aVz5dF1EBr9FOiiDrLKr8dK2awj1ovEtS_euRK8EayA';
const SHEET_ASSIGNMENTS = 'Assignments';
const SHEET_RESPONSES   = 'Responses';
const SHEET_MAILBOX     = 'Mailbox';

// Cấu trúc sheet "Assignments" (admin quản lý):
// A: courseName      — tên chương trình
// B: participants    — số lượng tham gia
// C: (không dùng - trước đây là locked)
// D: loaiHoatDong   — mã loại hoạt động (1 / 2 / 3)
// E: quyMo           — quy mô (3 / 4)
// F: donViToChuc     — đơn vị tổ chức
// G: donViPhoiHop    — đơn vị phối hợp
// H: ngayBatDau      — ngày bắt đầu (yyyy-mm-dd) → năm được tự lấy từ cột này
// I: ngayKetThuc     — ngày kết thúc (yyyy-mm-dd)
// J: batDauKhaoSat   — bắt đầu khảo sát (yyyy-mm-dd)
// K: ketThucKhaoSat  — kết thúc khảo sát (yyyy-mm-dd)

// Cấu trúc sheet "Responses" (tự động tạo nếu chưa có):
// timestamp | email | year | program | gender | cohort | faculty |
// DVTT1-4 | CLCT1-5 | CSVC1-3 | GTCT1-2 | SHL1-3 | LTT1-4 |
// overall | learn | trouble | interest | feedback


// ── Web App entry point ──────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getCourses')    return handleGetCourses(e.parameter.email);
  if (action === 'submitSurvey')  return handleSubmitSurvey(e.parameter);
  if (action === 'getResponses')  return handleGetResponses();
  if (action === 'submitMailbox') return handleSubmitMailbox(e.parameter);
  if (action === 'getMailbox')    return handleGetMailbox();
  if (action === 'getStats')      return handleGetStats();
  if (action === 'addActivity')   return handleAddActivity(e.parameter);
  return jsonOut({ error: 'Unknown action' });
}


// ── Lấy danh sách chương trình + trạng thái của user ────────────
function handleGetCourses(email) {
  if (!email) return jsonOut({ success: false, courses: [] });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
  if (!assignSheet) return jsonOut({ success: true, courses: [] });
  const aRows = assignSheet.getDataRange().getValues();

  const respSheet = ss.getSheetByName(SHEET_RESPONSES);
  const completed = new Set();
  if (respSheet) {
    const respRows = respSheet.getDataRange().getValues();
    const norm = email.trim().toLowerCase();
    for (let i = 0; i < respRows.length; i++) {
      const rowEmail = String(respRows[i][1]).trim();
      if (!rowEmail.includes('@')) continue;
      if (rowEmail.toLowerCase() === norm) completed.add(String(respRows[i][3]).trim());
    }
  }

  const courses = [];
  for (let i = 1; i < aRows.length; i++) {
    const [courseName] = aRows[i];
    if (!courseName) continue;
    const name   = String(courseName).trim();
    
    // Tự động khoá theo ngày hạn chót khảo sát (Cột K, index 10)
    let locked = false;
    const deadlineVal = aRows[i][10];
    if (deadlineVal) {
      const deadlineDate = new Date(deadlineVal);
      if (!isNaN(deadlineDate.getTime())) {
        // Hạn chót kéo dài hết ngày ghi trong ô khảo sát (đến 23:59:59)
        deadlineDate.setHours(23, 59, 59, 999);
        if (new Date() > deadlineDate) {
          locked = true;
        }
      }
    }
    
    const year   = aRows[i][7] ? new Date(aRows[i][7]).getFullYear() : '';
    courses.push({
      rowIndex:       i + 1,
      year:           String(year),
      courseName:     name,
      locked,
      status:         completed.has(name) ? 'Đã thực hiện' : (locked ? 'Đã khoá' : 'Chưa thực hiện'),
      loaiHoatDong:   String(aRows[i][3] || '').trim(),
      quyMo:          String(aRows[i][4] || '').trim(),
      donViToChuc:    String(aRows[i][5] || '').trim(),
      donViPhoiHop:   String(aRows[i][6] || '').trim(),
      ngayBatDau:     fmtDateOnly(aRows[i][7]),
      ngayKetThuc:    fmtDateOnly(aRows[i][8]),
      batDauKhaoSat:  fmtDateOnly(aRows[i][9]),
      ketThucKhaoSat: fmtDateOnly(aRows[i][10]),
    });
  }

  return jsonOut({ success: true, courses });
}


// ── Lưu phản hồi khảo sát ───────────────────────────────────────
function handleSubmitSurvey(p) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Kiểm tra xem chương trình đã quá hạn khảo sát chưa trước khi lưu
    const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
    if (assignSheet) {
      const aRows = assignSheet.getDataRange().getValues();
      for (let i = 1; i < aRows.length; i++) {
        if (String(aRows[i][0]).trim() === String(p.program).trim()) {
          const deadlineVal = aRows[i][10];
          if (deadlineVal) {
            const deadlineDate = new Date(deadlineVal);
            if (!isNaN(deadlineDate.getTime())) {
              deadlineDate.setHours(23, 59, 59, 999);
              if (new Date() > deadlineDate) {
                return jsonOut({ success: false, error: 'Khảo sát đã đóng do quá hạn chót.' });
              }
            }
          }
          break;
        }
      }
    }

    let respSheet = ss.getSheetByName(SHEET_RESPONSES);
    if (!respSheet) {
      respSheet = ss.insertSheet(SHEET_RESPONSES);
      respSheet.appendRow([
        'Dấu thời gian','Email','Năm','Chương trình',
        'Giới tính','Khóa','Khoa',
        'DVTT1','DVTT2','DVTT3','DVTT4',
        'CLCT1','CLCT2','CLCT3','CLCT4','CLCT5',
        'CSVC1','CSVC2','CSVC3','GTCT1','GTCT2',
        'SHL1','SHL2','SHL3','LTT1','LTT2','LTT3','LTT4',
        'Tổng quan','Bài học/Giá trị áp dụng',
        'Khó khăn/Trải nghiệm chưa thoải mái','Mối quan tâm','Góp ý'
      ]);
    }
    respSheet.appendRow([
      new Date(), p.email||'', p.year||'', p.program||'',
      p.gender||'', p.cohort||'', p.faculty||'',
      num(p.DVTT1),num(p.DVTT2),num(p.DVTT3),num(p.DVTT4),
      num(p.CLCT1),num(p.CLCT2),num(p.CLCT3),num(p.CLCT4),num(p.CLCT5),
      num(p.CSVC1),num(p.CSVC2),num(p.CSVC3),
      num(p.GTCT1),num(p.GTCT2),
      num(p.SHL1),num(p.SHL2),num(p.SHL3),
      num(p.LTT1),num(p.LTT2),num(p.LTT3),num(p.LTT4),
      num(p.overall), p.learn||'', p.trouble||'', p.interest||'', p.feedback||'',
    ]);
    return jsonOut({ success: true });
  } catch (err) {
    Logger.log('handleSubmitSurvey error: ' + err.message);
    return jsonOut({ success: false, error: err.message });
  }
}


// ── Trả toàn bộ dữ liệu phản hồi cho admin dashboard ───────────
function handleGetResponses() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!sheet) return jsonOut({ success: true, responses: [] });

  const rows      = sheet.getDataRange().getValues();
  const responses = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!String(r[1]||'').includes('@')) continue;
    responses.push({
      id: 'R'+String(i).padStart(3,'0'), ts: fmtDate(r[0]),
      email: String(r[1]||''), year: String(r[2]||''),
      program: String(r[3]||''), gender: String(r[4]||''),
      cohort: String(r[5]||''), faculty: String(r[6]||''),
      DVTT1:num(r[7]),DVTT2:num(r[8]),DVTT3:num(r[9]),DVTT4:num(r[10]),
      CLCT1:num(r[11]),CLCT2:num(r[12]),CLCT3:num(r[13]),CLCT4:num(r[14]),CLCT5:num(r[15]),
      CSVC1:num(r[16]),CSVC2:num(r[17]),CSVC3:num(r[18]),
      GTCT1:num(r[19]),GTCT2:num(r[20]),
      SHL1:num(r[21]),SHL2:num(r[22]),SHL3:num(r[23]),
      LTT1:num(r[24]),LTT2:num(r[25]),LTT3:num(r[26]),LTT4:num(r[27]),
      overall:num(r[28]), learn:String(r[29]||''), trouble:String(r[30]||''),
      interest:String(r[31]||''), feedback:String(r[32]||''),
    });
  }

  // Đọc Assignments: A=courseName, B=participants, C=locked,
  // D=loai, E=quyMo, F=donViTC, G=donViPH, H=ngayBD, I=ngayKT, J=bdKS, K=ktKS
  const assignSheet    = ss.getSheetByName(SHEET_ASSIGNMENTS);
  const programs       = [];
  const participantMap = {};
  const programYears   = {};
  const programInfo    = {};

  if (assignSheet) {
    const aRows = assignSheet.getDataRange().getValues();
    for (let i = 1; i < aRows.length; i++) {
      if (!aRows[i][0]) continue;
      const name = String(aRows[i][0]).trim();
      programs.push(name);

      const n = parseInt(aRows[i][1]);
      if (!isNaN(n)) participantMap[name] = n;

      // Lấy năm từ ngayBatDau (cột H, index 7)
      const y = aRows[i][7] ? new Date(aRows[i][7]).getFullYear() : new Date().getFullYear();
      programYears[name] = isNaN(y) ? new Date().getFullYear() : y;

      programInfo[name] = {
        loaiHoatDong:   String(aRows[i][3] || '').trim(),
        quyMo:          String(aRows[i][4] || '').trim(),
        donViToChuc:    String(aRows[i][5] || '').trim(),
        donViPhoiHop:   String(aRows[i][6] || '').trim(),
        ngayBatDau:     fmtDateOnly(aRows[i][7]),
        ngayKetThuc:    fmtDateOnly(aRows[i][8]),
        batDauKhaoSat:  fmtDateOnly(aRows[i][9]),
        ketThucKhaoSat: fmtDateOnly(aRows[i][10]),
      };
    }
  }

  return jsonOut({ success: true, responses, programs, participantMap, programYears, programInfo });
}


// ── Hòm thư lắng nghe thanh niên ────────────────────────────────
function handleSubmitMailbox(p) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_MAILBOX);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MAILBOX);
      sheet.appendRow(['Dấu thời gian', 'Email', 'Nội dung']);
    }
    sheet.appendRow([new Date(), String(p.email || '(ẩn danh)'), String(p.content || '')]);
    return jsonOut({ success: true });
  } catch (err) {
    return jsonOut({ success: false, error: err.message });
  }
}

function handleGetMailbox() {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_MAILBOX);
  if (!sheet) return jsonOut({ success: true, entries: [] });

  const rows    = sheet.getDataRange().getValues();
  const entries = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!String(r[2] || '').trim()) continue;
    entries.push({
      ts:      fmtDate(r[0]),
      email:   String(r[1] || ''),
      content: String(r[2] || ''),
    });
  }
  entries.reverse(); // mới nhất lên đầu
  return jsonOut({ success: true, entries });
}


// ── Thống kê tổng hợp công khai ─────────────────────────────────
function handleGetStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Từ sheet Responses
  const respSheet = ss.getSheetByName(SHEET_RESPONSES);
  let totalResponses = 0;
  let totalScore = 0;
  let scoreCount = 0;
  const programsWithResp = new Set();
  const faculties = new Set();

  if (respSheet) {
    const rows = respSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (!String(rows[i][1] || '').includes('@')) continue;
      totalResponses++;
      if (rows[i][3]) programsWithResp.add(String(rows[i][3]).trim());
      if (rows[i][6]) faculties.add(String(rows[i][6]).trim());
      const overall = parseFloat(rows[i][28]);
      if (!isNaN(overall) && overall >= 1) { totalScore += overall; scoreCount++; }
    }
  }

  // Từ sheet Assignments — đếm tổng participants và tổng sự kiện
  const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
  let totalParticipants = 0;
  let totalPrograms = 0;
  if (assignSheet) {
    const aRows = assignSheet.getDataRange().getValues();
    for (let i = 1; i < aRows.length; i++) {
      if (!aRows[i][0]) continue;
      totalPrograms++;
      const n = parseInt(aRows[i][1]);
      if (!isNaN(n)) totalParticipants += n;
    }
  }

  const avgScore   = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '—';
  const completion = totalParticipants > 0 ? Math.round(totalResponses / totalParticipants * 100) : 0;

  return jsonOut({
    success: true,
    totalResponses,
    totalPrograms,
    programsCount:   programsWithResp.size,
    completionRate:  completion,
    avgScore,
    facultiesCount:  faculties.size,
  });
}

// ── Thêm hoạt động mới vào sheet Assignments ───────────────────────
function handleAddActivity(p) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
    if (!assignSheet) {
      return jsonOut({ success: false, error: 'Không tìm thấy sheet Assignments.' });
    }
    
    // Kiểm tra xem tên chương trình đã tồn tại chưa để tránh trùng lặp
    const aRows = assignSheet.getDataRange().getValues();
    const newName = String(p.courseName || '').trim();
    if (!newName) {
      return jsonOut({ success: false, error: 'Tên hoạt động không được để trống.' });
    }
    for (let i = 1; i < aRows.length; i++) {
      if (String(aRows[i][0]).trim().toLowerCase() === newName.toLowerCase()) {
        return jsonOut({ success: false, error: 'Tên hoạt động đã tồn tại.' });
      }
    }
    
    const parseDate = (val) => {
      if (!val) return '';
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d;
    };
    
    // Thêm hàng mới vào Assignments
    // A: courseName, B: participants, C: (không dùng), D: loaiHoatDong, E: quyMo, F: donViToChuc, G: donViPhoiHop, H: ngayBatDau, I: ngayKetThuc, J: batDauKhaoSat, K: ketThucKhaoSat
    assignSheet.appendRow([
      newName,
      parseInt(p.participants || 0),
      '', // C: (không dùng)
      num(p.loaiHoatDong),
      num(p.quyMo),
      p.donViToChuc || '',
      p.donViPhoiHop || '',
      parseDate(p.ngayBatDau),
      parseDate(p.ngayKetThuc),
      parseDate(p.batDauKhaoSat),
      parseDate(p.ketThucKhaoSat)
    ]);
    
    return jsonOut({ success: true });
  } catch (err) {
    return jsonOut({ success: false, error: err.message });
  }
}


// ── Helpers ──────────────────────────────────────────────────────
function num(v) { const n = parseInt(v); return isNaN(n) ? '' : n; }

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const pad = n => String(n).padStart(2,'0');
  return `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function fmtDateOnly(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v).trim();
  const pad = n => String(n).padStart(2,'0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
