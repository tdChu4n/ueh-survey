// ═══════════════════════════════════════════════════════════════════
//  UEH Survey System — Google Apps Script
//
//  HƯỚNG DẪN:
//  1. Mở Google Sheets > Extensions > Apps Script
//  2. Dán code này vào, thay SPREADSHEET_ID bên dưới
//  3. Deploy > New deployment > Web App
//     - Execute as: Me | Who has access: Anyone
//  4. Copy URL vào CONFIG.APPS_SCRIPT_URL trong ueh-survey.html
// ═══════════════════════════════════════════════════════════════════

const SPREADSHEET_ID    = '1aVz5dF1EBr9FOiiDrLKr8dK2awj1ovEtS_euRK8EayA';
const SHEET_ASSIGNMENTS = 'Assignments'; // Admin thêm/xóa chương trình tại đây
const SHEET_RESPONSES   = 'Responses';  // Dữ liệu do sinh viên gửi về

// Cấu trúc sheet "Assignments" (admin quản lý):
// A: year (năm dương lịch, vd: 2026) | B: courseName | C: participants | D: locked (gõ bất kỳ ký tự = khoá)
// (Thêm hàng mới = thêm chương trình, mọi user đều thấy)

// Cấu trúc sheet "Responses" (tự động tạo nếu chưa có):
// timestamp | email | year | program |
// gender | cohort | faculty |
// DVTT1-4 | CLCT1-5 | CSVC1-3 | GTCT1-2 | SHL1-3 | LTT1-4 |
// overall | learn | trouble | interest | feedback


// ── Web App entry point ──────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getCourses')    return handleGetCourses(e.parameter.email);
  if (action === 'submitSurvey')  return handleSubmitSurvey(e.parameter);
  if (action === 'getResponses')  return handleGetResponses();

  return jsonOut({ error: 'Unknown action' });
}


// ── Lấy danh sách chương trình + trạng thái của user ────────────
function handleGetCourses(email) {
  if (!email) return jsonOut({ success: false, courses: [] });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Đọc danh sách chương trình từ Assignments (admin quản lý)
  const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
  if (!assignSheet) return jsonOut({ success: true, courses: [] });
  const assignRows = assignSheet.getDataRange().getValues();

  // 2. Kiểm tra user đã hoàn thành chương trình nào trong Responses
  const respSheet = ss.getSheetByName(SHEET_RESPONSES);
  const completed = new Set();
  if (respSheet) {
    const respRows = respSheet.getDataRange().getValues();
    const norm     = email.trim().toLowerCase();
    for (let i = 0; i < respRows.length; i++) {
      const rowEmail = String(respRows[i][1]).trim();
      if (!rowEmail.includes('@')) continue; // bỏ header hoặc hàng rỗng
      if (rowEmail.toLowerCase() === norm) {
        completed.add(String(respRows[i][3]).trim()); // cột D = program
      }
    }
  }

  // 3. Ghép danh sách chương trình + trạng thái
  const courses = [];
  for (let i = 1; i < assignRows.length; i++) {
    const [year, courseName, , lockedRaw] = assignRows[i];
    if (!courseName) continue;
    const name   = String(courseName).trim();
    const locked = String(lockedRaw || '').trim() !== ''; // có giá trị = khoá
    courses.push({
      rowIndex:   i + 1,
      year:       String(year || '').trim(),
      courseName: name,
      locked,
      status:     completed.has(name) ? 'Đã thực hiện' : (locked ? 'Đã khoá' : 'Chưa thực hiện'),
    });
  }

  return jsonOut({ success: true, courses });
}


// ── Lưu phản hồi khảo sát và cập nhật trạng thái ───────────────
function handleSubmitSurvey(p) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Ghi dữ liệu vào sheet Responses (trạng thái tự check từ đây)
    let respSheet = ss.getSheetByName(SHEET_RESPONSES);
    if (!respSheet) {
      respSheet = ss.insertSheet(SHEET_RESPONSES);
      // Tạo header
      respSheet.appendRow([
        'Dấu thời gian','Email','Năm','Chương trình',
        'Giới tính','Khóa','Khoa',
        'DVTT1','DVTT2','DVTT3','DVTT4',
        'CLCT1','CLCT2','CLCT3','CLCT4','CLCT5',
        'CSVC1','CSVC2','CSVC3',
        'GTCT1','GTCT2',
        'SHL1','SHL2','SHL3',
        'LTT1','LTT2','LTT3','LTT4',
        'Tổng quan',
        'Bài học/Giá trị áp dụng',
        'Khó khăn/Trải nghiệm chưa thoải mái',
        'Mối quan tâm',
        'Góp ý'
      ]);
    }

    respSheet.appendRow([
      new Date(),
      p.email    || '',
      p.year     || '',
      p.program  || '',
      p.gender   || '',
      p.cohort   || '',
      p.faculty  || '',
      num(p.DVTT1), num(p.DVTT2), num(p.DVTT3), num(p.DVTT4),
      num(p.CLCT1), num(p.CLCT2), num(p.CLCT3), num(p.CLCT4), num(p.CLCT5),
      num(p.CSVC1), num(p.CSVC2), num(p.CSVC3),
      num(p.GTCT1), num(p.GTCT2),
      num(p.SHL1),  num(p.SHL2),  num(p.SHL3),
      num(p.LTT1),  num(p.LTT2),  num(p.LTT3),  num(p.LTT4),
      num(p.overall),
      p.learn    || '',
      p.trouble  || '',
      p.interest || '',
      p.feedback || '',
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
    const emailVal = String(r[1] || '').trim();
    if (!emailVal.includes('@')) continue; // bỏ header hoặc hàng rỗng

    responses.push({
      id:      'R' + String(i).padStart(3, '0'),
      ts:      fmtDate(r[0]),
      email:   String(r[1] || ''),
      year:    String(r[2] || ''),
      program: String(r[3] || ''),
      gender:  String(r[4] || ''),
      cohort:  String(r[5] || ''),
      faculty: String(r[6] || ''),
      DVTT1: num(r[7]),  DVTT2: num(r[8]),  DVTT3: num(r[9]),  DVTT4: num(r[10]),
      CLCT1: num(r[11]), CLCT2: num(r[12]), CLCT3: num(r[13]), CLCT4: num(r[14]), CLCT5: num(r[15]),
      CSVC1: num(r[16]), CSVC2: num(r[17]), CSVC3: num(r[18]),
      GTCT1: num(r[19]), GTCT2: num(r[20]),
      SHL1:  num(r[21]), SHL2:  num(r[22]), SHL3:  num(r[23]),
      LTT1:  num(r[24]), LTT2:  num(r[25]), LTT3:  num(r[26]), LTT4:  num(r[27]),
      overall:  num(r[28]),
      learn:    String(r[29] || ''),
      trouble:  String(r[30] || ''),
      interest: String(r[31] || ''),
      feedback: String(r[32] || ''),
    });
  }

  // Đọc danh sách chương trình từ Assignments
  // Cấu trúc: A=year | B=courseName | C=participants | D=locked
  const assignSheet    = ss.getSheetByName(SHEET_ASSIGNMENTS);
  const programs       = [];
  const participantMap = {};
  const programYears   = {};
  if (assignSheet) {
    const aRows = assignSheet.getDataRange().getValues();
    for (let i = 1; i < aRows.length; i++) {
      if (aRows[i][1]) {
        const name = String(aRows[i][1]).trim();
        programs.push(name);
        const n = parseInt(aRows[i][2]);
        if (!isNaN(n)) participantMap[name] = n;
        // Cột A giờ là năm dương lịch trực tiếp (vd: 2026)
        const y = parseInt(aRows[i][0]);
        programYears[name] = isNaN(y) ? new Date().getFullYear() : y;
      }
    }
  }

  return jsonOut({ success: true, responses, programs, participantMap, programYears });
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}


// ── Helpers ──────────────────────────────────────────────────────
function num(v)  { const n = parseInt(v); return isNaN(n) ? '' : n; }

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
