// Survey data + aggregation helpers
// Loaded as a plain script so all globals attach to window.

window.SURVEY_RESPONSES = [];

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

window.PROGRAMS      = [];
window.PROGRAM_YEARS = {};
window.PROGRAM_INFO  = {};
window.PARTICIPANT_MAP = {};

// ----------------- Aggregation helpers -----------------

const mean = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;

window.filterByProgram = function(program) {
  if (!program || program === "__ALL__") return window.SURVEY_RESPONSES;
  return window.SURVEY_RESPONSES.filter(r => r.program === program);
};

// Lọc theo tập hợp nhiều chương trình (Set hoặc Array)
window.filterByPrograms = function(programs) {
  const set = programs instanceof Set ? programs : new Set(programs);
  if (!set || set.size === 0) return [];
  return window.SURVEY_RESPONSES.filter(r => set.has(r.program));
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
