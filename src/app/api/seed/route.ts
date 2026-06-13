import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chapter from '@/models/Chapter';
import Simulation from '@/models/Simulation';
import { CURRICULUM } from '@/data/curriculum';

// POST /api/seed — Seed chapters + demo simulations
export async function POST() {
  try {
    await connectDB();

    // 1. Seed chapters
    let chaptersCreated = 0;
    for (const ch of CURRICULUM) {
      await Chapter.findOneAndUpdate(
        { grade: ch.grade, slug: ch.slug },
        ch,
        { upsert: true, new: true }
      );
      chaptersCreated++;
    }

    // 2. Seed demo simulations
    const demoSimulations = [
      // Demo 1: Đồ thị hàm số bậc 2 (Toán 10)
      {
        grade: 10,
        chapterSlug: 'ham-so-do-thi-ung-dung',
        lessonSlug: 'ham-bac-hai-do-thi',
        title: 'Đồ thị hàm số y = ax² + bx + c',
        description: 'Khám phá cách hệ số a, b, c ảnh hưởng đến hình dạng parabol. Kéo thanh trượt để thay đổi và quan sát!',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var a = params.a, b = params.b, c = params.c;

  // Draw parabola
  var graph = board.create('functiongraph', [
    function(x) { return a * x * x + b * x + c; }
  ], {
    strokeColor: '#6366f1',
    strokeWidth: 3,
    highlight: false
  });

  // Vertex
  if (a !== 0) {
    var xV = -b / (2 * a);
    var yV = a * xV * xV + b * xV + c;
    board.create('point', [xV, yV], {
      name: 'Đỉnh',
      size: 5,
      fillColor: '#ef4444',
      strokeColor: '#dc2626',
      label: { fontSize: 14, offset: [10, 10] }
    });

    // Axis of symmetry
    board.create('line', [[xV, 0], [xV, 1]], {
      dash: 3,
      strokeColor: '#9ca3af',
      strokeWidth: 1,
      straightFirst: true,
      straightLast: true,
      highlight: false
    });
  }

  // Y-intercept
  board.create('point', [0, c], {
    name: 'y-intercept',
    size: 4,
    fillColor: '#22c55e',
    strokeColor: '#16a34a',
    label: { fontSize: 12, offset: [10, -10] }
  });

  // Title text
  board.create('text', [-5.5, 5.5,
    function() {
      return 'y = ' + (a >= 0 ? '' : '-') + (Math.abs(a) === 1 ? '' : Math.abs(a).toFixed(1))
        + 'x² ' + (b >= 0 ? '+ ' : '- ') + Math.abs(b).toFixed(1)
        + 'x ' + (c >= 0 ? '+ ' : '- ') + Math.abs(c).toFixed(1);
    }
  ], { fontSize: 16, cssClass: 'sim-formula' });

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-6, 6, 6, -4],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'a', label: 'Hệ số a', min: -3, max: 3, step: 0.1, defaultValue: 1 },
          { type: 'slider', name: 'b', label: 'Hệ số b', min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { type: 'slider', name: 'c', label: 'Hệ số c', min: -5, max: 5, step: 0.5, defaultValue: 0 },
        ],
        mathContent: 'y = ax^2 + bx + c',
        explanation: 'Parabol là đồ thị của hàm số bậc hai. Hệ số **a** quyết định độ mở và hướng (a > 0: mở lên, a < 0: mở xuống). Đỉnh parabol có tọa độ (-b/2a, -Δ/4a).',
        keyInsights: [
          'a > 0: parabol mở lên — hàm số có giá trị nhỏ nhất',
          'a < 0: parabol mở xuống — hàm số có giá trị lớn nhất',
          'Đỉnh parabol tại x = -b/(2a)',
          'Trục đối xứng: x = -b/(2a)',
          '|a| càng lớn → parabol càng hẹp',
        ],
        tags: ['hàm số', 'parabol', 'đồ thị', 'bậc hai'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 1.2: Chiều biến thiên hàm số bậc hai (Toán 10)
      {
        grade: 10,
        chapterSlug: 'ham-so-do-thi-ung-dung',
        lessonSlug: 'ham-bac-hai-do-thi',
        title: 'Chiều biến thiên hàm số bậc hai',
        description: 'Khảo sát chiều biến thiên (đồng biến, nghịch biến) của hàm số bậc hai trên các khoảng. Di chuyển x0 để quan sát chiều mũi tên đồ thị!',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var a = params.a, b = params.b, c = params.c, x0 = params.x0;

  // Draw parabola
  var graph = board.create('functiongraph', [
    function(x) { return a * x * x + b * x + c; }
  ], {
    strokeColor: '#3b82f6',
    strokeWidth: 3,
    highlight: false
  });

  // Vertex
  if (a !== 0) {
    var xV = -b / (2 * a);
    var yV = a * xV * xV + b * xV + c;
    board.create('point', [xV, yV], {
      name: 'Đỉnh V',
      size: 4,
      fillColor: '#ef4444',
      strokeColor: '#dc2626',
      label: { fontSize: 13, offset: [10, 10] }
    });

    // Axis of symmetry
    board.create('line', [[xV, 0], [xV, 1]], {
      dash: 2,
      strokeColor: 'rgba(255,255,255,0.4)',
      strokeWidth: 1,
      straightFirst: true,
      straightLast: true,
      highlight: false
    });

    var intervalText = "";
    if (a > 0) {
      if (x0 < xV) {
        intervalText = "x = " + x0.toFixed(2) + " < -b/2a: Nghịch biến (đi xuống)";
      } else {
        intervalText = "x = " + x0.toFixed(2) + " > -b/2a: Đồng biến (đi lên)";
      }
    } else if (a < 0) {
      if (x0 < xV) {
        intervalText = "x = " + x0.toFixed(2) + " < -b/2a: Đồng biến (đi lên)";
      } else {
        intervalText = "x = " + x0.toFixed(2) + " > -b/2a: Nghịch biến (đi xuống)";
      }
    }

    board.create('text', [-5.5, 5.0, intervalText], { fontSize: 14, cssClass: 'sim-formula', color: '#f59e0b' });

    // Active point
    var y0 = a * x0 * x0 + b * x0 + c;
    board.create('point', [x0, y0], {
      name: 'M',
      size: 5,
      fillColor: '#a855f7',
      strokeColor: '#9333ea',
      label: { fontSize: 12, offset: [10, 10] }
    });

    // Tangent arrow representing slope direction
    var slope = 2 * a * x0 + b;
    var angle = Math.atan(slope);
    var dx = 0.5 * Math.cos(angle);
    var dy = 0.5 * Math.sin(angle);
    board.create('arrow', [[x0 - dx, y0 - dy], [x0 + dx, y0 + dy]], {
      strokeColor: '#a855f7',
      strokeWidth: 2.5
    });
  }

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-6, 6, 6, -4],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'a', label: 'Hệ số a', min: -3, max: 3, step: 0.1, defaultValue: 1 },
          { type: 'slider', name: 'b', label: 'Hệ số b', min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { type: 'slider', name: 'c', label: 'Hệ số c', min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { type: 'slider', name: 'x0', label: 'Điểm x0', min: -5, max: 5, step: 0.1, defaultValue: -2 },
        ],
        mathContent: 'y = ax^2 + bx + c \\quad \\text{và} \\quad x_V = -\\frac{b}{2a}',
        explanation: 'Hàm số bậc hai đồng biến và nghịch biến trên các khoảng được chia bởi hoành độ đỉnh $x_V = -b/2a$. Hướng của mũi tên chỉ chiều biến thiên tại điểm $x_0$.',
        keyInsights: [
          'Hàm số đạt giá trị cực tiểu hoặc cực đại tại đỉnh V',
          'a > 0: nghịch biến trên (-∞; -b/2a), đồng biến trên (-b/2a; +∞)',
          'a < 0: đồng biến trên (-∞; -b/2a), nghịch biến trên (-b/2a; +∞)',
          'Mũi tên chỉ hướng tiếp tuyến: hướng lên thể hiện đồng biến, hướng xuống thể hiện nghịch biến',
        ],
        tags: ['hàm số', 'chiều biến thiên', 'đồng biến', 'nghịch biến'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 2.1: Góc lượng giác và Chiều quay (Toán 11 - Bài 1.1)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Góc lượng giác và Chiều quay',
        description: 'Khám phá khái niệm số đo góc lượng giác (Độ và Radian), chiều quay dương (ngược chiều kim đồng hồ) và âm (cùng chiều kim đồng hồ). Thử kéo slider vượt quá 360° để xem số vòng quay!',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var deg = params.deg;
  var rad = deg * Math.PI / 180;

  // Unit circle
  board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Target point M
  var px = Math.cos(rad);
  var py = Math.sin(rad);
  var P = board.create('point', [px, py], {
    name: 'M',
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { fontSize: 13, offset: [10, 10] }
  });

  // Radius line
  board.create('segment', [[0,0], P], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // Spiral arc to represent multiple turns
  var absRad = Math.abs(rad);
  if (absRad > 0.05) {
    board.create('curve', [
      function(t) {
        var r = 0.25 + 0.08 * (t / (2 * Math.PI));
        var angle = t * Math.sign(rad);
        return r * Math.cos(angle);
      },
      function(t) {
        var r = 0.25 + 0.08 * (t / (2 * Math.PI));
        var angle = t * Math.sign(rad);
        return r * Math.sin(angle);
      },
      0, absRad
    ], {
      strokeColor: rad >= 0 ? '#22c55e' : '#ef4444',
      strokeWidth: 2.5
    });

    // Arrow head at the end of spiral
    var endR = 0.25 + 0.08 * (absRad / (2 * Math.PI));
    var arrowDx = 0.05 * Math.sin(rad);
    var arrowDy = -0.05 * Math.cos(rad);
    if (rad < 0) {
      arrowDx = -arrowDx;
      arrowDy = -arrowDy;
    }
    board.create('arrow', [
      [endR * Math.cos(rad) - arrowDx * 0.5, endR * Math.sin(rad) - arrowDy * 0.5],
      [endR * Math.cos(rad) + arrowDx * 0.5, endR * Math.sin(rad) + arrowDy * 0.5]
    ], {
      strokeColor: rad >= 0 ? '#22c55e' : '#ef4444',
      strokeWidth: 2
    });
  }

  // Display texts
  var turns = (deg / 360).toFixed(1);
  var radFraction = (deg / 180).toFixed(2);
  var dirText = deg > 0 ? "Chiều Dương (+)" : (deg < 0 ? "Chiều Âm (-)" : "Không quay");

  board.create('text', [-1.6, 1.5, 'Số đo Độ: ' + deg + '°'], { fontSize: 13, color: '#fff' });
  board.create('text', [-1.6, 1.3, 'Số đo Radian: ' + radFraction + 'π rad'], { fontSize: 13, color: '#60a5fa' });
  board.create('text', [-1.6, 1.1, 'Số vòng quay: ' + turns + ' vòng'], { fontSize: 13, color: '#a855f7' });
  board.create('text', [-1.6, 0.9, 'Hướng quay: ' + dirText], { fontSize: 13, color: deg >= 0 ? '#22c55e' : '#ef4444' });

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.8, 1.8, -1.8],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'deg', label: 'Góc quay (độ)', min: -720, max: 720, step: 10, defaultValue: 120 },
        ],
        mathContent: '1 \\text{ rad} = \\left(\\frac{180}{\\pi}\\right)^\\circ \\quad \\text{và} \\quad 1^\circ = \\frac{\\pi}{180} \\text{ rad}',
        explanation: 'Khác với góc hình học thông thường (chỉ từ 0° đến 180°), góc lượng giác có hướng quay (ngược chiều kim đồng hồ là chiều dương, cùng chiều là chiều âm) và số đo có thể lớn hơn 360° (tương ứng nhiều vòng quay).',
        keyInsights: [
          'Góc lượng giác biểu diễn chuyển động quay tròn định hướng',
          'Chiều dương (+): ngược chiều kim đồng hồ (màu xanh lá)',
          'Chiều âm (-): cùng chiều kim đồng hồ (màu đỏ)',
          'Công thức đổi: rad = deg × π / 180',
        ],
        tags: ['lượng giác', 'góc lượng giác', 'độ', 'radian'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.2: Đường tròn lượng giác (Toán 11 - Bài 1.2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Đường tròn lượng giác (Sin và Cos)',
        description: 'Khám phá mối liên hệ giữa góc và giá trị sin, cos trên đường tròn đơn vị.',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var angle = params.angle * Math.PI / 180;

  // Unit circle
  board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Point on circle
  var px = Math.cos(angle), py = Math.sin(angle);
  var P = board.create('point', [px, py], {
    name: 'P',
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { fontSize: 14, offset: [10, 10] }
  });

  // Radius line
  board.create('segment', [[0,0], P], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // cos projection (horizontal)
  board.create('segment', [[0,0], [px, 0]], {
    strokeColor: '#22c55e',
    strokeWidth: 3,
    highlight: false
  });
  board.create('point', [px, 0], {
    name: 'cos α',
    size: 3,
    fillColor: '#22c55e',
    strokeColor: '#16a34a',
    label: { fontSize: 12, offset: [0, -15] }
  });

  // sin projection (vertical)
  board.create('segment', [[px, 0], P], {
    strokeColor: '#ef4444',
    strokeWidth: 3,
    highlight: false
  });
  board.create('segment', [[0, 0], [0, py]], {
    strokeColor: '#ef4444',
    strokeWidth: 3,
    highlight: false
  });
  board.create('point', [0, py], {
    name: 'sin α',
    size: 3,
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    label: { fontSize: 12, offset: [-40, 0] }
  });

  // Dashed projections
  board.create('segment', [P, [px, 0]], {
    dash: 2, strokeColor: '#d1d5db', strokeWidth: 1
  });
  board.create('segment', [P, [0, py]], {
    dash: 2, strokeColor: '#d1d5db', strokeWidth: 1
  });

  // Angle arc
  if (Math.abs(angle) > 0.01) {
    board.create('arc', [[0,0], [0.3, 0], [0.3 * Math.cos(angle), 0.3 * Math.sin(angle)]], {
      strokeColor: '#f59e0b',
      strokeWidth: 2
    });
  }

  // Values text
  board.create('text', [-1.8, -1.5,
    'α = ' + params.angle + '°'
  ], { fontSize: 14, color: '#6366f1' });

  board.create('text', [-1.8, -1.8,
    'sin α = ' + py.toFixed(3)
  ], { fontSize: 14, color: '#ef4444' });

  board.create('text', [-1.8, -2.1,
    'cos α = ' + px.toFixed(3)
  ], { fontSize: 14, color: '#22c55e' });

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-2, 2.2, 2, -2.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'angle', label: 'Góc α (độ)', min: 0, max: 360, step: 5, defaultValue: 45 },
        ],
        mathContent: '\\sin^2\\alpha + \\cos^2\\alpha = 1',
        explanation: 'Trên đường tròn đơn vị (bán kính = 1), điểm P ứng với góc lượng giác α có tọa độ (cos α, sin α). Hình chiếu lên trục Ox cho giá trị cos, lên Oy cho giá trị sin.',
        keyInsights: [
          'cos α = hoành độ điểm P trên đường tròn đơn vị',
          'sin α = tung độ điểm P trên đường tròn đơn vị',
          'sin²α + cos²α = 1 (hệ thức lượng giác cơ bản)',
          'Góc ở phần tư I: sin > 0, cos > 0',
        ],
        tags: ['lượng giác', 'đường tròn đơn vị', 'sin', 'cos'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.3: Giá trị Tan và Cot (Toán 11 - Bài 1.3)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Giá trị Tan và Cot',
        description: 'Khảo sát các trục số biểu diễn Tan (đường thẳng x = 1) và Cot (đường thẳng y = 1). Kéo slider để thay đổi góc α và xem giao điểm cắt của tia OM!',
        order: 3,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var angle = params.angle * Math.PI / 180;
  var deg = params.angle;

  // Unit circle
  board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 1.5,
    highlight: false,
    fixed: true
  });

  // OM line
  var mx = Math.cos(angle);
  var my = Math.sin(angle);
  var M = board.create('point', [mx, my], {
    name: 'M',
    size: 4,
    fillColor: '#fff',
    strokeColor: '#6366f1'
  });

  // Radial line extending beyond circle
  var OM = board.create('line', [[0,0], M], {
    strokeColor: '#6366f1',
    strokeWidth: 1.5,
    dash: 1,
    straightFirst: true,
    straightLast: true
  });

  // Tan axis (x = 1)
  board.create('line', [[1, -10], [1, 10]], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    highlight: false,
    name: 'Trục Tan'
  });
  // Cot axis (y = 1)
  board.create('line', [[-10, 1], [10, 1]], {
    strokeColor: '#ec4899',
    strokeWidth: 2,
    highlight: false,
    name: 'Trục Cot'
  });

  // Tan projection point: x = 1, y = tan(angle)
  var showTan = (deg !== 90 && deg !== 270);
  if (showTan) {
    var tanValue = Math.tan(angle);
    var T = board.create('point', [1, tanValue], {
      name: 'T(1, tan α)',
      size: 5,
      fillColor: '#f59e0b',
      strokeColor: '#d97706',
      label: { fontSize: 12, offset: [10, 0] }
    });
    // Segment from origin to T
    board.create('segment', [[1, 0], T], {
      strokeColor: '#f59e0b',
      strokeWidth: 3
    });
  }

  // Cot projection point: x = cot(angle), y = 1
  var showCot = (deg !== 0 && deg !== 180 && deg !== 360);
  if (showCot) {
    var cotValue = 1 / Math.tan(angle);
    var C = board.create('point', [cotValue, 1], {
      name: 'C(cot α, 1)',
      size: 5,
      fillColor: '#ec4899',
      strokeColor: '#db2777',
      label: { fontSize: 12, offset: [0, 10] }
    });
    // Segment from origin to C
    board.create('segment', [[0, 1], C], {
      strokeColor: '#ec4899',
      strokeWidth: 3
    });
  }

  // Value readouts
  board.create('text', [-2.3, -1.8, 'α = ' + deg + '°'], { fontSize: 13, color: '#fff' });
  if (showTan) {
    board.create('text', [-2.3, -2.0, 'tan α = ' + Math.tan(angle).toFixed(3)], { fontSize: 13, color: '#f59e0b' });
  } else {
    board.create('text', [-2.3, -2.0, 'tan α = Không xác định'], { fontSize: 13, color: '#ef4444' });
  }
  if (showCot) {
    board.create('text', [-2.3, -2.2, 'cot α = ' + (1/Math.tan(angle)).toFixed(3)], { fontSize: 13, color: '#ec4899' });
  } else {
    board.create('text', [-2.3, -2.2, 'cot α = Không xác định'], { fontSize: 13, color: '#ef4444' });
  }

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-2.5, 2.5, 2.5, -2.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'angle', label: 'Góc α (độ)', min: 0, max: 360, step: 5, defaultValue: 45 },
        ],
        mathContent: '\\tan\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} \\quad \\text{và} \\quad \\cot\\alpha = \\frac{\\cos\\alpha}{\\sin\\alpha}',
        explanation: 'Trục tan là trục thẳng đứng đi qua điểm (1,0) song song với Oy. Trục cot là trục nằm ngang đi qua điểm (0,1) song song với Ox. Giao điểm của tia OM kéo dài với các trục này xác định giá trị tan α và cot α.',
        keyInsights: [
          'tan α biểu diễn trên trục tiếp tuyến x = 1. Không xác định khi α = 90° hoặc 270°',
          'cot α biểu diễn trên trục tiếp tuyến y = 1. Không xác định khi α = 0° hoặc 180°',
          'Tia OM kéo dài về hai phía khi tìm giao điểm với trục',
          'Khi góc α quay sát các giá trị không xác định, giao điểm chạy ra vô cực',
        ],
        tags: ['lượng giác', 'tan', 'cot', 'đường tròn đơn vị'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 3: Khảo sát hàm số bậc 3 (Toán 12)
      {
        grade: 12,
        chapterSlug: 'ung-dung-dao-ham-ksdt',
        lessonSlug: 'khao-sat-bien-thien',
        title: 'Khảo sát hàm số y = ax³ + bx² + cx + d',
        description: 'Quan sát đồ thị hàm bậc 3, điểm cực trị, và bảng biến thiên thay đổi khi các hệ số thay đổi.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  var a = params.a, b = params.b, c = params.c, d = params.d;

  // f(x) = ax³ + bx² + cx + d
  var f = function(x) { return a*x*x*x + b*x*x + c*x + d; };
  // f'(x) = 3ax² + 2bx + c
  var df = function(x) { return 3*a*x*x + 2*b*x + c; };

  // Main function graph
  board.create('functiongraph', [f], {
    strokeColor: '#6366f1',
    strokeWidth: 3,
    highlight: false
  });

  // Derivative graph (dashed)
  board.create('functiongraph', [df], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    dash: 3,
    highlight: false
  });

  // Find critical points: 3ax² + 2bx + c = 0
  if (a !== 0) {
    var disc = 4*b*b - 12*a*c;
    if (disc > 0) {
      var x1 = (-2*b - Math.sqrt(disc)) / (6*a);
      var x2 = (-2*b + Math.sqrt(disc)) / (6*a);

      board.create('point', [x1, f(x1)], {
        name: 'CĐ/CT',
        size: 5,
        fillColor: '#ef4444',
        strokeColor: '#dc2626',
        label: { fontSize: 12, offset: [10, 10] }
      });

      board.create('point', [x2, f(x2)], {
        name: 'CĐ/CT',
        size: 5,
        fillColor: '#ef4444',
        strokeColor: '#dc2626',
        label: { fontSize: 12, offset: [10, -15] }
      });
    }
  }

  // Inflection point: f''(x) = 6ax + 2b = 0 => x = -b/(3a)
  if (a !== 0) {
    var xI = -b / (3*a);
    board.create('point', [xI, f(xI)], {
      name: 'Uốn',
      size: 4,
      fillColor: '#22c55e',
      strokeColor: '#16a34a',
      label: { fontSize: 12, offset: [-30, 10] }
    });
  }

  // Legend
  board.create('text', [-5.5, 5.5, 'f(x) — nét liền'], { fontSize: 12, color: '#6366f1' });
  board.create('text', [-5.5, 5.0, "f'(x) — nét đứt"], { fontSize: 12, color: '#f59e0b' });

  board.unsuspendUpdate();
}`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-6, 6, 6, -6],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'a', label: 'Hệ số a', min: -2, max: 2, step: 0.1, defaultValue: 1 },
          { type: 'slider', name: 'b', label: 'Hệ số b', min: -5, max: 5, step: 0.5, defaultValue: 0 },
          { type: 'slider', name: 'c', label: 'Hệ số c', min: -5, max: 5, step: 0.5, defaultValue: -3 },
          { type: 'slider', name: 'd', label: 'Hệ số d', min: -5, max: 5, step: 0.5, defaultValue: 0 },
        ],
        mathContent: 'y = ax^3 + bx^2 + cx + d',
        explanation: 'Hàm bậc 3 có thể có 0 hoặc 2 điểm cực trị. Đạo hàm f\'(x) = 3ax² + 2bx + c. Cực trị tại nghiệm f\'(x) = 0.',
        keyInsights: [
          'Δ\' = b² - 3ac > 0: có 2 cực trị',
          'Δ\' = b² - 3ac ≤ 0: không có cực trị',
          'Điểm uốn tại x = -b/(3a)',
          'a > 0: đồ thị đi lên ở 2 đầu; a < 0: đi xuống',
        ],
        tags: ['đạo hàm', 'khảo sát', 'bậc 3', 'cực trị'],
        difficulty: 'intermediate',
        isPublished: true,
      },
    ];

    // Clean up incorrect slug simulation if exists
    await Simulation.deleteMany({ chapterSlug: 'ham-so-do-thi-va-ung-dung' });

    let simsCreated = 0;
    for (const sim of demoSimulations) {
      await Simulation.findOneAndUpdate(
        { grade: sim.grade, chapterSlug: sim.chapterSlug, lessonSlug: sim.lessonSlug, title: sim.title },
        sim,
        { upsert: true, new: true }
      );
      simsCreated++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${chaptersCreated} chapters and ${simsCreated} demo simulations`,
    });
  } catch (error) {
    console.error('[API] seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
