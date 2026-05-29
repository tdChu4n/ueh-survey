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
// A: semester | B: courseName
// (Thêm hàng mới = thêm chương trình, mọi user đều thấy)

// Cấu trúc sheet "Responses" (tự động tạo nếu chưa có):
// timestamp | email | semester | program |
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
    for (let i = 1; i < respRows.length; i++) {
      if (String(respRows[i][1]).trim().toLowerCase() === norm) {
        completed.add(String(respRows[i][3]).trim()); // cột D = program
      }
    }
  }

  // 3. Ghép danh sách chương trình + trạng thái
  const courses = [];
  for (let i = 1; i < assignRows.length; i++) {
    const [semester, courseName] = assignRows[i];
    if (!courseName) continue;
    const name = String(courseName).trim();
    courses.push({
      rowIndex:   i + 1,
      semester:   String(semester || '').trim(),
      courseName: name,
      status:     completed.has(name) ? 'Đã thực hiện' : 'Chưa thực hiện',
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
        'Dấu thời gian','Email','Học kỳ','Chương trình',
        'DVTT1','DVTT2','DVTT3','DVTT4',
        'CLCT1','CLCT2','CLCT3','CLCT4','CLCT5',
        'CSVC1','CSVC2','CSVC3',
        'GTCT1','GTCT2',
        'SHL1','SHL2','SHL3',
        'LTT1','LTT2','LTT3','LTT4',
        'Tổng quan',
        'Bài học/Giá trị áp dụng',
        'Khó khăn/Trải nghiệm chưa thoải mái',
        'Mối quan tâm học kỳ này',
        'Góp ý'
      ]);
    }

    respSheet.appendRow([
      new Date(),
      p.email      || '',
      p.semester   || '',
      p.program    || '',
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

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue; // bỏ hàng trống

    responses.push({
      id:       'R' + String(i).padStart(3, '0'),
      ts:       fmtDate(r[0]),
      email:    String(r[1]  || ''),
      semester: String(r[2]  || ''),
      program:  String(r[3]  || ''),
      DVTT1: num(r[4]),  DVTT2: num(r[5]),  DVTT3: num(r[6]),  DVTT4: num(r[7]),
      CLCT1: num(r[8]),  CLCT2: num(r[9]),  CLCT3: num(r[10]), CLCT4: num(r[11]), CLCT5: num(r[12]),
      CSVC1: num(r[13]), CSVC2: num(r[14]), CSVC3: num(r[15]),
      GTCT1: num(r[16]), GTCT2: num(r[17]),
      SHL1:  num(r[18]), SHL2:  num(r[19]), SHL3:  num(r[20]),
      LTT1:  num(r[21]), LTT2:  num(r[22]), LTT3:  num(r[23]), LTT4:  num(r[24]),
      overall:  num(r[25]),
      learn:    String(r[26] || ''),
      trouble:  String(r[27] || ''),
      interest: String(r[28] || ''),
      feedback: String(r[29] || ''),
    });
  }

  return jsonOut({ success: true, responses });
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
