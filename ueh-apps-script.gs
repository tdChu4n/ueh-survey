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

const SPREADSHEET_ID    = 'YOUR_SPREADSHEET_ID';
const SHEET_ASSIGNMENTS = 'Assignments';   // Admin quản lý danh sách khảo sát
const SHEET_RESPONSES   = 'Responses';     // Dữ liệu do sinh viên gửi về

// Cấu trúc sheet "Assignments":
// A: email | B: semester | C: courseName | D: status | E: completedAt
// (Không cần cột formLink nữa vì form được nhúng thẳng vào web)

// Cấu trúc sheet "Responses" (tự động tạo nếu chưa có):
// timestamp | email | semester | program |
// DVTT1-4 | CLCT1-5 | CSVC1-3 | GTCT1-2 | SHL1-3 | LTT1-4 |
// overall | learn | trouble | interest | feedback


// ── Web App entry point ──────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getCourses')   return handleGetCourses(e.parameter.email);
  if (action === 'submitSurvey') return handleSubmitSurvey(e.parameter);

  return jsonOut({ error: 'Unknown action' });
}


// ── Lấy danh sách môn học của sinh viên ─────────────────────────
function handleGetCourses(email) {
  if (!email) return jsonOut({ success: false, courses: [] });

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ASSIGNMENTS);
  const rows  = sheet.getDataRange().getValues();
  const norm  = email.trim().toLowerCase();
  const courses = [];

  for (let i = 1; i < rows.length; i++) {
    const [rowEmail, semester, courseName, status] = rows[i];
    if (!rowEmail) continue;
    if (rowEmail.trim().toLowerCase() !== norm) continue;
    courses.push({
      rowIndex:   i + 1,
      semester:   semester   || '',
      courseName: courseName || '',
      status:     status     || 'Chưa thực hiện',
    });
  }

  return jsonOut({ success: true, courses });
}


// ── Lưu phản hồi khảo sát và cập nhật trạng thái ───────────────
function handleSubmitSurvey(p) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 1. Cập nhật trạng thái trong Assignments
    const assignSheet = ss.getSheetByName(SHEET_ASSIGNMENTS);
    const rowIndex    = parseInt(p.rowIndex);
    if (rowIndex > 1) {
      assignSheet.getRange(rowIndex, 4).setValue('Đã thực hiện');
      assignSheet.getRange(rowIndex, 5).setValue(new Date());
    }

    // 2. Ghi dữ liệu vào sheet Responses
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


// ── Helpers ──────────────────────────────────────────────────────
function num(v)  { const n = parseInt(v); return isNaN(n) ? '' : n; }

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
