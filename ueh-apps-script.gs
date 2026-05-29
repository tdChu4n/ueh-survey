// ═══════════════════════════════════════════════════════════════════
//  UEH Survey System — Google Apps Script
//
//  HƯỚNG DẪN CÀI ĐẶT:
//  1. Mở Google Sheets của bạn
//  2. Extensions > Apps Script
//  3. Dán toàn bộ code này vào, thay SPREADSHEET_ID bên dưới
//  4. Deploy > New deployment > Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Copy URL vào CONFIG.APPS_SCRIPT_URL trong ueh-survey.html
//  6. Chạy hàm setupFormTriggers() một lần để đăng ký auto-update
// ═══════════════════════════════════════════════════════════════════

// ── CẤU HÌNH ────────────────────────────────────────────────────
const SPREADSHEET_ID    = 'YOUR_SPREADSHEET_ID';  // ← ID trong URL Google Sheets
const SHEET_ASSIGNMENTS = 'Assignments';           // ← Tên sheet chứa dữ liệu
// ────────────────────────────────────────────────────────────────

// Cấu trúc sheet "Assignments":
// Cột A: email          — Gmail sinh viên
// Cột B: semester       — Học kỳ (vd: "Năm học 2026 Học kỳ đầu")
// Cột C: courseName     — Tên học phần / tên phiếu
// Cột D: formLink       — Link Google Form
// Cột E: status         — "Chưa thực hiện" hoặc "Đã thực hiện"
// Cột F: completedAt    — Thời điểm hoàn thành (tự động ghi)


// ── Web App: xử lý request từ ueh-survey.html ───────────────────
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getCourses') {
    return handleGetCourses(e.parameter.email);
  }

  return jsonOut({ error: 'Unknown action' });
}


// ── Trả về danh sách môn học của sinh viên ───────────────────────
function handleGetCourses(email) {
  if (!email) return jsonOut({ success: false, courses: [] });

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                              .getSheetByName(SHEET_ASSIGNMENTS);
  const rows  = sheet.getDataRange().getValues();
  const norm  = email.trim().toLowerCase();

  const courses = [];
  for (let i = 1; i < rows.length; i++) {  // bỏ qua hàng tiêu đề
    const [rowEmail, semester, courseName, formLink, status] = rows[i];
    if (!rowEmail) continue;
    if (rowEmail.trim().toLowerCase() !== norm) continue;

    courses.push({
      rowIndex:   i + 1,
      semester:   semester   || '',
      courseName: courseName || '',
      formLink:   formLink   || '',
      status:     status     || 'Chưa thực hiện',
    });
  }

  return jsonOut({ success: true, courses });
}


// ── Trigger: tự động cập nhật khi sinh viên submit form ─────────
//  Được gọi tự động bởi Google Forms sau khi setupFormTriggers()
function onSurveySubmit(e) {
  try {
    const email  = e.response.getRespondentEmail();
    const formId = e.source.getId();
    if (!email) return;

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                                .getSheetByName(SHEET_ASSIGNMENTS);
    const rows  = sheet.getDataRange().getValues();
    const norm  = email.trim().toLowerCase();

    for (let i = 1; i < rows.length; i++) {
      const rowEmail    = String(rows[i][0]).trim().toLowerCase();
      const rowFormLink = String(rows[i][3]);
      const rowStatus   = String(rows[i][4]);

      if (rowEmail === norm
          && rowFormLink.includes(formId)
          && rowStatus !== 'Đã thực hiện') {
        sheet.getRange(i + 1, 5).setValue('Đã thực hiện');
        sheet.getRange(i + 1, 6).setValue(new Date());
      }
    }
  } catch (err) {
    Logger.log('onSurveySubmit error: ' + err.message);
  }
}


// ── Setup triggers (chạy 1 lần, hoặc mỗi khi thêm form mới) ─────
//  Vào Apps Script > chọn hàm này > Run
function setupFormTriggers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                              .getSheetByName(SHEET_ASSIGNMENTS);
  const rows  = sheet.getDataRange().getValues();

  // Tập hợp các form đã có trigger
  const existingTriggers = new Set(
    ScriptApp.getProjectTriggers()
      .filter(t => t.getHandlerFunction() === 'onSurveySubmit')
      .map(t  => t.getTriggerSourceId())
  );

  const seen = new Set();
  for (let i = 1; i < rows.length; i++) {
    const formLink = String(rows[i][3]);
    const formId   = extractFormId(formLink);
    if (!formId || seen.has(formId) || existingTriggers.has(formId)) continue;
    seen.add(formId);

    try {
      const form = FormApp.openById(formId);
      ScriptApp.newTrigger('onSurveySubmit')
               .forForm(form)
               .onFormSubmit()
               .create();
      Logger.log('✅ Trigger created: ' + formId);
    } catch (err) {
      Logger.log('❌ Trigger failed for ' + formId + ': ' + err.message);
    }
  }
  Logger.log('setupFormTriggers done.');
}


// ── Helpers ──────────────────────────────────────────────────────
function extractFormId(url) {
  const m = String(url).match(/\/forms\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
