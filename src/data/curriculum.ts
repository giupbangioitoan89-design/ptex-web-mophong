/**
 * Cấu trúc chương trình Toán 10-11-12 — Kết Nối Tri Thức
 * Dùng cho seed API để tạo chapters trong MongoDB.
 */

export interface CurriculumChapter {
  grade: 10 | 11 | 12;
  chapterNumber: number;
  chapterTitle: string;
  volume: 1 | 2;
  slug: string;
  icon: string;
  color: string;
  order: number;
  lessons: {
    lessonNumber: number;
    lessonTitle: string;
    slug: string;
    simulationCount: number;
  }[];
}

export const CURRICULUM: CurriculumChapter[] = [
  // ==================== TOÁN 10 ====================
  {
    grade: 10, chapterNumber: 1, volume: 1, order: 1,
    chapterTitle: 'Mệnh đề và tập hợp',
    slug: 'menh-de-va-tap-hop',
    icon: '🔵', color: '#3b82f6',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Mệnh đề', slug: 'menh-de', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Tập hợp và các phép toán trên tập hợp', slug: 'tap-hop-phep-toan', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 2, volume: 1, order: 2,
    chapterTitle: 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    slug: 'bat-phuong-trinh-he-bpt-bac-nhat',
    icon: '📐', color: '#8b5cf6',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Bất phương trình bậc nhất hai ẩn', slug: 'bpt-bac-nhat-hai-an', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Hệ bất phương trình bậc nhất hai ẩn', slug: 'he-bpt-bac-nhat-hai-an', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 3, volume: 1, order: 3,
    chapterTitle: 'Hệ thức lượng trong tam giác',
    slug: 'he-thuc-luong-tam-giac',
    icon: '📏', color: '#06b6d4',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Giá trị lượng giác của một góc từ 0° đến 180°', slug: 'gia-tri-luong-giac', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Định lý côsin và định lý sin', slug: 'dinh-ly-cosin-sin', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Giải tam giác và ứng dụng thực tế', slug: 'giai-tam-giac-ung-dung', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 4, volume: 1, order: 4,
    chapterTitle: 'Vectơ',
    slug: 'vecto',
    icon: '➡️', color: '#f59e0b',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Khái niệm vectơ', slug: 'khai-niem-vecto', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Phép cộng và phép trừ hai vectơ', slug: 'phep-cong-tru-vecto', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Tích của một số với một vectơ', slug: 'tich-so-vecto', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 5, volume: 1, order: 5,
    chapterTitle: 'Các số đặc trưng của mẫu số liệu không ghép nhóm',
    slug: 'so-dac-trung-khong-ghep-nhom',
    icon: '📊', color: '#10b981',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Số trung bình và trung vị', slug: 'trung-binh-trung-vi', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Mốt, phương sai và độ lệch chuẩn', slug: 'mot-phuong-sai-do-lech', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 6, volume: 2, order: 6,
    chapterTitle: 'Hàm số, đồ thị và ứng dụng',
    slug: 'ham-so-do-thi-ung-dung',
    icon: '📈', color: '#ef4444',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Hàm số', slug: 'ham-so', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Hàm số bậc hai, đồ thị và ứng dụng', slug: 'ham-bac-hai-do-thi', simulationCount: 0 },
    ],
  },
  {
    grade: 10, chapterNumber: 7, volume: 2, order: 7,
    chapterTitle: 'Phương pháp tọa độ trong mặt phẳng',
    slug: 'toa-do-mat-phang',
    icon: '🎯', color: '#ec4899',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Tọa độ của vectơ', slug: 'toa-do-vecto', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Phương trình đường thẳng', slug: 'phuong-trinh-duong-thang', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Phương trình đường tròn', slug: 'phuong-trinh-duong-tron', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Ba đường cônic', slug: 'ba-duong-conic', simulationCount: 0 },
    ],
  },

  // ==================== TOÁN 11 ====================
  {
    grade: 11, chapterNumber: 1, volume: 1, order: 1,
    chapterTitle: 'Hàm số lượng giác và phương trình lượng giác',
    slug: 'ham-so-luong-giac-pt-luong-giac',
    icon: '🌊', color: '#6366f1',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Góc lượng giác và đường tròn lượng giác', slug: 'goc-luong-giac-duong-tron', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Giá trị lượng giác', slug: 'gia-tri-luong-giac', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Công thức lượng giác', slug: 'cong-thuc-luong-giac', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Hàm số lượng giác', slug: 'ham-so-luong-giac', simulationCount: 0 },
      { lessonNumber: 5, lessonTitle: 'Phương trình lượng giác', slug: 'phuong-trinh-luong-giac', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 2, volume: 1, order: 2,
    chapterTitle: 'Dãy số. Cấp số cộng và cấp số nhân',
    slug: 'day-so-csc-csn',
    icon: '🔢', color: '#f97316',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Dãy số', slug: 'day-so', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Cấp số cộng', slug: 'cap-so-cong', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Cấp số nhân', slug: 'cap-so-nhan', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 3, volume: 1, order: 3,
    chapterTitle: 'Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm',
    slug: 'so-dac-trung-ghep-nhom',
    icon: '📊', color: '#14b8a6',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Bảng tần số ghép nhóm và biểu đồ', slug: 'bang-tan-so-ghep-nhom', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Các số đặc trưng đo xu thế trung tâm', slug: 'so-dac-trung-xu-the', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 4, volume: 1, order: 4,
    chapterTitle: 'Quan hệ song song trong không gian',
    slug: 'quan-he-song-song-kg',
    icon: '🧊', color: '#0ea5e9',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Đường thẳng và mặt phẳng trong không gian', slug: 'duong-thang-mat-phang', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Hai đường thẳng song song', slug: 'hai-dt-song-song', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Đường thẳng song song với mặt phẳng', slug: 'dt-song-song-mp', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Hai mặt phẳng song song', slug: 'hai-mp-song-song', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 5, volume: 1, order: 5,
    chapterTitle: 'Giới hạn. Hàm số liên tục',
    slug: 'gioi-han-ham-so-lien-tuc',
    icon: '∞', color: '#a855f7',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Giới hạn của dãy số', slug: 'gioi-han-day-so', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Giới hạn của hàm số', slug: 'gioi-han-ham-so', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Hàm số liên tục', slug: 'ham-so-lien-tuc', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 6, volume: 2, order: 6,
    chapterTitle: 'Hàm số mũ và hàm số lôgarit',
    slug: 'ham-so-mu-logarit',
    icon: '📈', color: '#e11d48',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Phép tính lũy thừa với số mũ thực', slug: 'phep-tinh-luy-thua', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Phép tính lôgarit', slug: 'phep-tinh-logarit', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Hàm số mũ. Hàm số lôgarit', slug: 'ham-mu-ham-logarit', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Phương trình, bất phương trình mũ và lôgarit', slug: 'pt-bpt-mu-logarit', simulationCount: 0 },
    ],
  },
  {
    grade: 11, chapterNumber: 7, volume: 2, order: 7,
    chapterTitle: 'Quan hệ vuông góc trong không gian',
    slug: 'quan-he-vuong-goc-kg',
    icon: '📐', color: '#0891b2',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Hai đường thẳng vuông góc', slug: 'hai-dt-vuong-goc', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Đường thẳng vuông góc với mặt phẳng', slug: 'dt-vuong-goc-mp', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng', slug: 'phep-chieu-goc', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Hai mặt phẳng vuông góc', slug: 'hai-mp-vuong-goc', simulationCount: 0 },
      { lessonNumber: 5, lessonTitle: 'Khoảng cách', slug: 'khoang-cach', simulationCount: 0 },
    ],
  },

  // ==================== TOÁN 12 ====================
  {
    grade: 12, chapterNumber: 1, volume: 1, order: 1,
    chapterTitle: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    slug: 'ung-dung-dao-ham-ksdt',
    icon: '📉', color: '#dc2626',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Sự đồng biến, nghịch biến của hàm số', slug: 'dong-bien-nghich-bien', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Cực trị của hàm số', slug: 'cuc-tri-ham-so', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Giá trị lớn nhất và giá trị nhỏ nhất', slug: 'gtln-gtnn', simulationCount: 0 },
      { lessonNumber: 4, lessonTitle: 'Đường tiệm cận', slug: 'duong-tiem-can', simulationCount: 0 },
      { lessonNumber: 5, lessonTitle: 'Khảo sát sự biến thiên và vẽ đồ thị', slug: 'khao-sat-bien-thien', simulationCount: 0 },
    ],
  },
  {
    grade: 12, chapterNumber: 2, volume: 1, order: 2,
    chapterTitle: 'Vectơ và hệ trục tọa độ trong không gian',
    slug: 'vecto-toa-do-kg',
    icon: '🧭', color: '#7c3aed',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Tọa độ của vectơ trong không gian', slug: 'toa-do-vecto-kg', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Biểu thức tọa độ của các phép toán vectơ', slug: 'bieu-thuc-toa-do', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Tích vô hướng của hai vectơ trong không gian', slug: 'tich-vo-huong-kg', simulationCount: 0 },
    ],
  },
  {
    grade: 12, chapterNumber: 3, volume: 1, order: 3,
    chapterTitle: 'Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm',
    slug: 'so-dac-trung-phan-tan',
    icon: '📊', color: '#059669',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Khoảng biến thiên và khoảng tứ phân vị', slug: 'khoang-bien-thien', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Phương sai và độ lệch chuẩn', slug: 'phuong-sai-do-lech-chuan', simulationCount: 0 },
    ],
  },
  {
    grade: 12, chapterNumber: 4, volume: 2, order: 4,
    chapterTitle: 'Nguyên hàm và tích phân',
    slug: 'nguyen-ham-tich-phan',
    icon: '∫', color: '#4f46e5',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Nguyên hàm', slug: 'nguyen-ham', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Tích phân', slug: 'tich-phan', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Ứng dụng tích phân tính diện tích', slug: 'ung-dung-tich-phan', simulationCount: 0 },
    ],
  },
  {
    grade: 12, chapterNumber: 5, volume: 2, order: 5,
    chapterTitle: 'Phương pháp tọa độ trong không gian',
    slug: 'toa-do-khong-gian',
    icon: '🎯', color: '#be185d',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Phương trình mặt phẳng', slug: 'pt-mat-phang', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Phương trình đường thẳng trong không gian', slug: 'pt-duong-thang-kg', simulationCount: 0 },
      { lessonNumber: 3, lessonTitle: 'Phương trình mặt cầu', slug: 'pt-mat-cau', simulationCount: 0 },
    ],
  },
  {
    grade: 12, chapterNumber: 6, volume: 2, order: 6,
    chapterTitle: 'Xác suất có điều kiện',
    slug: 'xac-suat-dieu-kien',
    icon: '🎲', color: '#ea580c',
    lessons: [
      { lessonNumber: 1, lessonTitle: 'Xác suất có điều kiện', slug: 'xs-co-dieu-kien', simulationCount: 0 },
      { lessonNumber: 2, lessonTitle: 'Công thức Bayes', slug: 'cong-thuc-bayes', simulationCount: 0 },
    ],
  },
];
