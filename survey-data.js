// Survey data + aggregation helpers
// Loaded as a plain script so all globals attach to window.

window.SURVEY_RESPONSES = [
  {"id":"R001","ts":"31/05/2026 04:54","email":"sinhvien001@mymy.edu","program":"Hoạt động học thuật - kỹ năng","DVTT1":5,"DVTT2":5,"DVTT3":5,"DVTT4":4,"CLCT1":4,"CLCT2":4,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":7,"CSVC2":5,"CSVC3":5,"GTCT1":5,"GTCT2":5,"SHL1":6,"SHL2":6,"SHL3":5,"LTT1":6,"LTT2":4,"LTT3":5,"LTT4":5,"overall":5,"learn":"Biết cách lựa chọn hoạt động phù hợp với mục tiêu phát triển cá nhân.","trouble":"Một vài thời điểm thông tin cập nhật hơi sát giờ, nhưng không ảnh hưởng nhiều.","interest":"Kỹ năng nghiên cứu khoa học và viết báo cáo.","feedback":"Nên gửi lịch trình chi tiết sớm hơn trước chương trình."},
  {"id":"R002","ts":"31/05/2026 12:09","email":"sinhvien002@mymy.edu","program":"Competitive Edge","DVTT1":4,"DVTT2":5,"DVTT3":5,"DVTT4":5,"CLCT1":6,"CLCT2":5,"CLCT3":6,"CLCT4":5,"CLCT5":4,"CSVC1":5,"CSVC2":6,"CSVC3":7,"GTCT1":5,"GTCT2":5,"SHL1":6,"SHL2":6,"SHL3":6,"LTT1":6,"LTT2":5,"LTT3":4,"LTT4":6,"overall":6,"learn":"Biết thêm các kỹ năng cần cải thiện để tham gia hoạt động học thuật hoặc nghề nghiệp.","trouble":"Không gian hơi đông ở một số phần, tuy nhiên vẫn tham gia được đầy đủ.","interest":"Kỹ năng nghiên cứu khoa học và viết báo cáo.","feedback":"Có thể tăng thêm thời lượng hỏi đáp và tương tác với người tham gia."},
  {"id":"R003","ts":"01/06/2026 03:41","email":"sinhvien003@mymy.edu","program":"Research Maze 2026","DVTT1":6,"DVTT2":5,"DVTT3":6,"DVTT4":5,"CLCT1":6,"CLCT2":5,"CLCT3":6,"CLCT4":4,"CLCT5":5,"CSVC1":5,"CSVC2":5,"CSVC3":4,"GTCT1":7,"GTCT2":6,"SHL1":6,"SHL2":3,"SHL3":4,"LTT1":5,"LTT2":5,"LTT3":5,"LTT4":5,"overall":5,"learn":"Hiểu rõ hơn quy trình bắt đầu một đề tài nghiên cứu sinh viên.","trouble":"Thời lượng một vài nội dung hơi nhanh, mong có thêm phần hỏi đáp.","interest":"Kỹ năng nghiên cứu khoa học và viết báo cáo.","feedback":"Nên bổ sung tài liệu tóm tắt hoặc QR tài nguyên sau chương trình."},
  {"id":"R004","ts":"29/05/2026 08:16","email":"sinhvien004@mymy.edu","program":"Research Maze 2026","DVTT1":5,"DVTT2":6,"DVTT3":3,"DVTT4":5,"CLCT1":5,"CLCT2":5,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":5,"CSVC2":5,"CSVC3":6,"GTCT1":5,"GTCT2":6,"SHL1":6,"SHL2":6,"SHL3":5,"LTT1":6,"LTT2":5,"LTT3":5,"LTT4":5,"overall":5,"learn":"Biết cách xác định vấn đề nghiên cứu và tìm tài liệu tham khảo phù hợp.","trouble":"Thời lượng một vài nội dung hơi nhanh, mong có thêm phần hỏi đáp.","interest":"Định hướng nghề nghiệp, CV và phỏng vấn.","feedback":"Nên gửi lịch trình chi tiết sớm hơn trước chương trình."},
  {"id":"R005","ts":"31/05/2026 19:53","email":"sinhvien005@mymy.edu","program":"Toán - Thống kê 2026","DVTT1":5,"DVTT2":7,"DVTT3":7,"DVTT4":5,"CLCT1":5,"CLCT2":5,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":7,"CSVC2":6,"CSVC3":5,"GTCT1":5,"GTCT2":6,"SHL1":7,"SHL2":6,"SHL3":7,"LTT1":5,"LTT2":6,"LTT3":6,"LTT4":6,"overall":6,"learn":"Có thêm định hướng để chủ động tham gia hoạt động trong học kỳ tới.","trouble":"Một vài thời điểm thông tin cập nhật hơi sát giờ, nhưng không ảnh hưởng nhiều.","interest":"Định hướng nghề nghiệp, CV và phỏng vấn.","feedback":"Có thể chia nhóm nhỏ để sinh viên trao đổi sâu hơn."},
  {"id":"R006","ts":"01/06/2026 11:48","email":"sinhvien006@mymy.edu","program":"Mymy Career Ready","DVTT1":6,"DVTT2":4,"DVTT3":5,"DVTT4":6,"CLCT1":4,"CLCT2":5,"CLCT3":7,"CLCT4":5,"CLCT5":6,"CSVC1":5,"CSVC2":6,"CSVC3":6,"GTCT1":7,"GTCT2":7,"SHL1":5,"SHL2":5,"SHL3":5,"LTT1":7,"LTT2":6,"LTT3":6,"LTT4":7,"overall":5,"learn":"Có thêm thông tin thực tế về các vị trí nghề nghiệp liên quan đến ngành học.","trouble":"Một vài thời điểm thông tin cập nhật hơi sát giờ, nhưng không ảnh hưởng nhiều.","interest":"Định hướng nghề nghiệp, CV và phỏng vấn.","feedback":"Nên gửi lịch trình chi tiết sớm hơn trước chương trình."},
  {"id":"R007","ts":"01/06/2026 12:05","email":"sinhvien007@mymy.edu","program":"Tần Số 304","DVTT1":4,"DVTT2":6,"DVTT3":6,"DVTT4":6,"CLCT1":5,"CLCT2":5,"CLCT3":6,"CLCT4":5,"CLCT5":7,"CSVC1":6,"CSVC2":6,"CSVC3":5,"GTCT1":6,"GTCT2":5,"SHL1":5,"SHL2":5,"SHL3":6,"LTT1":6,"LTT2":6,"LTT3":3,"LTT4":7,"overall":6,"learn":"Cảm thấy chương trình tạo được không khí gần gũi và năng động.","trouble":"Không có khó khăn đáng kể.","interest":"Kỹ năng giao tiếp, làm việc nhóm và quản lý thời gian.","feedback":"Nên bổ sung tài liệu tóm tắt hoặc QR tài nguyên sau chương trình."},
  {"id":"R008","ts":"01/06/2026 09:47","email":"sinhvien008@mymy.edu","program":"Toán - Thống kê 2026","DVTT1":6,"DVTT2":5,"DVTT3":4,"DVTT4":6,"CLCT1":5,"CLCT2":7,"CLCT3":6,"CLCT4":4,"CLCT5":6,"CSVC1":5,"CSVC2":6,"CSVC3":6,"GTCT1":6,"GTCT2":6,"SHL1":5,"SHL2":6,"SHL3":6,"LTT1":5,"LTT2":4,"LTT3":5,"LTT4":4,"overall":6,"learn":"Biết thêm thông tin tổng quan về các hoạt động học thuật và phong trào của Khoa.","trouble":"Không có khó khăn đáng kể.","interest":"Kỹ năng giao tiếp, làm việc nhóm và quản lý thời gian.","feedback":"Có thể tăng thêm thời lượng hỏi đáp và tương tác với người tham gia."},
  {"id":"R009","ts":"31/05/2026 21:12","email":"sinhvien009@mymy.edu","program":"Tần Số 304","DVTT1":5,"DVTT2":5,"DVTT3":6,"DVTT4":4,"CLCT1":6,"CLCT2":6,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":5,"CSVC2":5,"CSVC3":6,"GTCT1":5,"GTCT2":6,"SHL1":5,"SHL2":5,"SHL3":4,"LTT1":5,"LTT2":5,"LTT3":5,"LTT4":5,"overall":5,"learn":"Cảm thấy có thêm động lực tham gia các hoạt động phong trào sinh viên.","trouble":"Không có khó khăn đáng kể.","interest":"Kỹ năng giao tiếp, làm việc nhóm và quản lý thời gian.","feedback":"Chương trình ổn, mong tiếp tục duy trì trong các học kỳ sau."},
  {"id":"R010","ts":"31/05/2026 11:32","email":"sinhvien010@mymy.edu","program":"Competitive Edge","DVTT1":6,"DVTT2":5,"DVTT3":5,"DVTT4":5,"CLCT1":6,"CLCT2":3,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":5,"CSVC2":6,"CSVC3":6,"GTCT1":5,"GTCT2":4,"SHL1":4,"SHL2":6,"SHL3":5,"LTT1":5,"LTT2":4,"LTT3":5,"LTT4":5,"overall":5,"learn":"Rút ra được cách chuẩn bị hồ sơ và định hướng kỹ năng cạnh tranh tốt hơn.","trouble":"Một vài thời điểm thông tin cập nhật hơi sát giờ, nhưng không ảnh hưởng nhiều.","interest":"Kỹ năng phân tích dữ liệu và ứng dụng thống kê.","feedback":"Có thể chia nhóm nhỏ để sinh viên trao đổi sâu hơn."},
  {"id":"R011","ts":"30/05/2026 16:20","email":"sinhvien011@mymy.edu","program":"Competitive Edge","DVTT1":5,"DVTT2":5,"DVTT3":4,"DVTT4":4,"CLCT1":5,"CLCT2":5,"CLCT3":5,"CLCT4":6,"CLCT5":5,"CSVC1":6,"CSVC2":6,"CSVC3":5,"GTCT1":5,"GTCT2":5,"SHL1":5,"SHL2":5,"SHL3":6,"LTT1":5,"LTT2":5,"LTT3":5,"LTT4":5,"overall":6,"learn":"Hiểu được mình cần rèn luyện thêm điều gì để cạnh tranh trong môi trường thực tế.","trouble":"Không có khó khăn đáng kể.","interest":"Kỹ năng phân tích dữ liệu và ứng dụng thống kê.","feedback":"Chương trình ổn, mong tiếp tục duy trì trong các học kỳ sau."},
  {"id":"R012","ts":"31/05/2026 11:50","email":"sinhvien012@mymy.edu","program":"Hoạt động học thuật - kỹ năng","DVTT1":5,"DVTT2":6,"DVTT3":4,"DVTT4":4,"CLCT1":5,"CLCT2":5,"CLCT3":5,"CLCT4":6,"CLCT5":5,"CSVC1":5,"CSVC2":6,"CSVC3":6,"GTCT1":6,"GTCT2":6,"SHL1":5,"SHL2":6,"SHL3":6,"LTT1":5,"LTT2":5,"LTT3":5,"LTT4":5,"overall":5,"learn":"Biết cách lựa chọn hoạt động phù hợp với mục tiêu phát triển cá nhân.","trouble":"Không có khó khăn đáng kể.","interest":"Kỹ năng giao tiếp, làm việc nhóm và quản lý thời gian.","feedback":"Chương trình ổn, mong tiếp tục duy trì trong các học kỳ sau."},
  {"id":"R013","ts":"30/05/2026 13:37","email":"sinhvien013@mymy.edu","program":"Toán - Thống kê 2026","DVTT1":5,"DVTT2":5,"DVTT3":5,"DVTT4":5,"CLCT1":5,"CLCT2":7,"CLCT3":7,"CLCT4":6,"CLCT5":5,"CSVC1":6,"CSVC2":5,"CSVC3":5,"GTCT1":6,"GTCT2":5,"SHL1":5,"SHL2":5,"SHL3":6,"LTT1":6,"LTT2":6,"LTT3":6,"LTT4":5,"overall":5,"learn":"Nắm được cách theo dõi lịch hoạt động và các kênh truyền thông chính thức.","trouble":"Không có khó khăn đáng kể.","interest":"Định hướng nghề nghiệp, CV và phỏng vấn.","feedback":"Chương trình ổn, mong tiếp tục duy trì trong các học kỳ sau."},
  {"id":"R014","ts":"31/05/2026 09:34","email":"sinhvien014@mymy.edu","program":"Mymy Career Ready","DVTT1":7,"DVTT2":4,"DVTT3":5,"DVTT4":7,"CLCT1":7,"CLCT2":6,"CLCT3":5,"CLCT4":5,"CLCT5":6,"CSVC1":6,"CSVC2":7,"CSVC3":4,"GTCT1":6,"GTCT2":5,"SHL1":5,"SHL2":6,"SHL3":7,"LTT1":7,"LTT2":6,"LTT3":6,"LTT4":6,"overall":6,"learn":"Biết thêm cách chuẩn bị CV, phỏng vấn và định hướng nghề nghiệp.","trouble":"Âm thanh ở một số đoạn chưa thật sự rõ, nhưng tổng thể vẫn ổn.","interest":"Các buổi chia sẻ kinh nghiệm học tập và thực tập.","feedback":"Nên gửi lịch trình chi tiết sớm hơn trước chương trình."},
  {"id":"R015","ts":"30/05/2026 20:02","email":"sinhvien015@mymy.edu","program":"Mymy Career Ready","DVTT1":5,"DVTT2":6,"DVTT3":6,"DVTT4":5,"CLCT1":6,"CLCT2":5,"CLCT3":6,"CLCT4":6,"CLCT5":5,"CSVC1":6,"CSVC2":5,"CSVC3":6,"GTCT1":6,"GTCT2":7,"SHL1":6,"SHL2":6,"SHL3":6,"LTT1":6,"LTT2":7,"LTT3":6,"LTT4":6,"overall":6,"learn":"Có hình dung rõ hơn về lộ trình phát triển sự nghiệp sau khi tốt nghiệp.","trouble":"Không có khó khăn đáng kể.","interest":"Các buổi chia sẻ kinh nghiệm học tập và thực tập.","feedback":"Có thể chia nhóm nhỏ để sinh viên trao đổi sâu hơn."}
];

// Factor metadata — full Vietnamese names + sub-item descriptions
window.FACTORS = [
  {
    code: "DVTT",
    name: "Dịch vụ thông tin",
    desc: "Chất lượng truyền thông & hỗ trợ thông tin trước/trong chương trình.",
    items: [
      { code: "DVTT1", label: "Thông tin được cung cấp đầy đủ, kịp thời" },
      { code: "DVTT2", label: "Dễ tìm khu vực diễn ra hoạt động" },
      { code: "DVTT3", label: "Truyền thông đủ rõ để hiểu & đăng ký" },
      { code: "DVTT4", label: "Ấn phẩm thu hút sự chú ý" }
    ]
  },
  {
    code: "CLCT",
    name: "Chất lượng chương trình",
    desc: "Nội dung, hình thức & sự dẫn dắt của chương trình.",
    items: [
      { code: "CLCT1", label: "Nhân sự giải đáp kịp thời, rõ ràng" },
      { code: "CLCT2", label: "Hình thức hoạt động đa dạng" },
      { code: "CLCT3", label: "Nội dung kích thích tìm hiểu sâu hơn" },
      { code: "CLCT4", label: "Nội dung phù hợp mục tiêu, chủ đề" },
      { code: "CLCT5", label: "Bố cục rõ ràng, đúng thời gian" }
    ]
  },
  {
    code: "CSVC",
    name: "Cơ sở vật chất",
    desc: "Không gian, thiết bị, âm thanh & ánh sáng.",
    items: [
      { code: "CSVC1", label: "Không gian phù hợp quy mô" },
      { code: "CSVC2", label: "Âm thanh, ánh sáng, thiết bị tốt" },
      { code: "CSVC3", label: "Chỗ ngồi, không gian thoải mái" }
    ]
  },
  {
    code: "GTCT",
    name: "Giá trị chương trình",
    desc: "Giá trị nhận được so với thời gian, kỳ vọng.",
    items: [
      { code: "GTCT1", label: "Giá trị xứng đáng với thời gian bỏ ra" },
      { code: "GTCT2", label: "Vượt kỳ vọng ban đầu" }
    ]
  },
  {
    code: "SHL",
    name: "Sự hài lòng",
    desc: "Mức độ hài lòng tổng thể với chương trình.",
    items: [
      { code: "SHL1", label: "Nhìn chung, hài lòng với chương trình" },
      { code: "SHL2", label: "Có cảm xúc tích cực khi tham gia" },
      { code: "SHL3", label: "Việc tham gia là lựa chọn đúng đắn" }
    ]
  },
  {
    code: "LTT",
    name: "Lòng trung thành",
    desc: "Khả năng quay lại & giới thiệu chương trình.",
    items: [
      { code: "LTT1", label: "Sẽ chia sẻ điều tích cực về chương trình" },
      { code: "LTT2", label: "Sẽ tiếp tục đăng ký lần tới" },
      { code: "LTT3", label: "Sẽ giới thiệu cho bạn bè, người quen" },
      { code: "LTT4", label: "Sẵn sàng phản hồi để Ban Tổ chức cải thiện" }
    ]
  }
];

window.PROGRAMS = [
  "Toán - Thống kê 2026",
  "Research Maze 2026",
  "Competitive Edge",
  "Tần Số 304",
  "Mymy Career Ready",
  "Hoạt động học thuật - kỹ năng"
];

// ----------------- Aggregation helpers -----------------

const mean = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;

window.filterByProgram = function(program) {
  if (!program || program === "__ALL__") return window.SURVEY_RESPONSES;
  return window.SURVEY_RESPONSES.filter(r => r.program === program);
};

// Mean per item code (e.g. CLCT1) for a set of responses.
window.itemMean = function(rs, code) {
  return mean(rs.map(r => r[code]).filter(v => typeof v === "number"));
};

// Mean of an entire factor (all its sub-items, all responses pooled).
window.factorMean = function(rs, factor) {
  const vals = [];
  for (const r of rs) for (const it of factor.items) {
    if (typeof r[it.code] === "number") vals.push(r[it.code]);
  }
  return mean(vals);
};

// Distribution of responses (count per Likert 1-7) for a code, across rs.
window.itemDistribution = function(rs, code) {
  const dist = [0,0,0,0,0,0,0]; // index 0 => score 1
  for (const r of rs) {
    const v = r[code];
    if (typeof v === "number" && v>=1 && v<=7) dist[v-1]++;
  }
  return dist;
};

// Rating label for a 1-7 score
window.ratingLabel = function(score) {
  if (score >= 6) return { text: "Tốt", tone: "good" };
  if (score >= 5) return { text: "Khá", tone: "ok" };
  if (score >= 4) return { text: "Trung bình", tone: "mid" };
  if (score >= 3) return { text: "Yếu", tone: "low" };
  return { text: "Kém", tone: "bad" };
};

// Tone -> color
window.toneColor = function(tone) {
  return {
    good: "var(--c-good)",
    ok: "var(--c-ok)",
    mid: "var(--c-mid)",
    low: "var(--c-low)",
    bad: "var(--c-bad)",
  }[tone] || "var(--c-mid)";
};

// Highest / lowest item for a factor across rs
window.factorExtremes = function(rs, factor) {
  let hi = { code: null, mean: -Infinity };
  let lo = { code: null, mean: Infinity };
  for (const it of factor.items) {
    const m = window.itemMean(rs, it.code);
    if (m > hi.mean) hi = { code: it.code, mean: m, label: it.label };
    if (m < lo.mean) lo = { code: it.code, mean: m, label: it.label };
  }
  return { hi, lo };
};

// Program-level summary for a given factor across all programs
window.programsByFactor = function(factor) {
  return window.PROGRAMS.map(p => {
    const rs = window.filterByProgram(p);
    return { program: p, mean: window.factorMean(rs, factor), n: rs.length };
  });
};
