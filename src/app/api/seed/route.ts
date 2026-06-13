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
        title: 'Đường tròn định hướng & Góc lượng giác',
        description: 'Khám phá khái niệm đường tròn định hướng, chiều quay lượng giác dương/âm và số đo của góc lượng giác dưới dạng tổng quát α = θ + k * 2π.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Start point A
  board.A = board.create('point', [1, 0], {
    name: math('A'),
    size: 3,
    fillColor: '#10b981',
    strokeColor: '#059669',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });

  // Target point M
  board.M = board.create('glider', [1, 0, board.circle], {
    name: math('M'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'deg');

  // Radius line segment
  board.OM = board.create('segment', [board.O, board.M], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // Helper variables for spiral curve
  board.radVal = 0;
  
  // Spiral arc to represent multiple turns
  board.spiral = board.create('curve', [
    function(t) {
      var r = 0.25 + 0.08 * (t / (2 * Math.PI));
      var angle = t * Math.sign(board.radVal);
      return r * Math.cos(angle);
    },
    function(t) {
      var r = 0.25 + 0.08 * (t / (2 * Math.PI));
      var angle = t * Math.sign(board.radVal);
      return r * Math.sin(angle);
    },
    0,
    function() { return Math.abs(board.radVal); }
  ], {
    strokeColor: function() { return board.radVal >= 0 ? '#10b981' : '#ef4444'; },
    strokeWidth: 2.5
  });

  // Spiral arrow head points
  board.arrowStart = board.create('point', [0, 0], { visible: false });
  board.arrowEnd = board.create('point', [0, 0], { visible: false });
  board.arrow = board.create('arrow', [board.arrowStart, board.arrowEnd], {
    strokeColor: function() { return board.radVal >= 0 ? '#10b981' : '#ef4444'; },
    strokeWidth: 2
  });

  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'Kéo tự do';
  var deg = 120;
  if (mode === 'Kéo tự do') {
    deg = params.deg !== undefined ? params.deg : 120;
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
  }
  var rad = deg * Math.PI / 180;
  board.radVal = rad;

  var px = Math.cos(rad);
  var py = Math.sin(rad);
  board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);

  // Update arrow head positions
  var absRad = Math.abs(rad);
  if (absRad > 0.05) {
    var endR = 0.25 + 0.08 * (absRad / (2 * Math.PI));
    var arrowDx = 0.05 * Math.sin(rad);
    var arrowDy = -0.05 * Math.cos(rad);
    if (rad < 0) {
      arrowDx = -arrowDx;
      arrowDy = -arrowDy;
    }
    board.arrowStart.setPosition(JXG.COORDS_BY_USER, [endR * Math.cos(rad) - arrowDx * 0.5, endR * Math.sin(rad) - arrowDy * 0.5]);
    board.arrowEnd.setPosition(JXG.COORDS_BY_USER, [endR * Math.cos(rad) + arrowDx * 0.5, endR * Math.sin(rad) + arrowDy * 0.5]);
    board.arrow.setAttribute({ visible: true });
  } else {
    board.arrow.setAttribute({ visible: false });
  }

  var turns = Math.floor(deg / 360);
  var remainderDeg = ((deg % 360) + 360) % 360;
  var remainderRadStr = (remainderDeg / 180).toFixed(2) + 'π';
  if (remainderDeg === 0) remainderRadStr = '0';
  else if (remainderDeg === 180) remainderRadStr = 'π';
  
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else if (frac === -1) radText = '-π';
    else radText = frac.toFixed(2) + 'π';
  }

  var dirText = deg > 0 ? 'Dương (+)' : (deg < 0 ? 'Âm (-)' : 'Không quay');
  var dirColor = deg > 0 ? '#34d399' : (deg < 0 ? '#f87171' : '#cbd5e1');

  var normDeg = ((deg % 360) + 360) % 360;
  var quadText = '';
  if (normDeg === 0 || normDeg === 90 || normDeg === 180 || normDeg === 270) {
    quadText = 'Trục tọa độ';
  } else if (normDeg > 0 && normDeg < 90) {
    quadText = 'Phần tư I';
  } else if (normDeg > 90 && normDeg < 180) {
    quadText = 'Phần tư II';
  } else if (normDeg > 180 && normDeg < 270) {
    quadText = 'Phần tư III';
  } else if (normDeg > 270 && normDeg < 360) {
    quadText = 'Phần tư IV';
  }

  showReadouts([
    { label: 'Góc tổng quát α:', value: deg + '°', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-size: 0.85rem;' },
    { label: 'Số đo radian:', value: radText + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #c084fc;' },
    { label: 'Góc hình học:', value: remainderDeg + '° (' + remainderRadStr + ')', labelStyle: 'color: #38bdf8;', valueStyle: 'color: #7dd3fc;' },
    { label: 'Chiều quay:', value: dirText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: ' + dirColor + '; background: ' + (deg > 0 ? 'rgba(52, 211, 153, 0.15)' : (deg < 0 ? 'rgba(248, 113, 113, 0.15)' : 'rgba(203, 213, 225, 0.15)')) + '; padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Số vòng k:', value: turns.toString(), labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; background: rgba(249, 115, 22, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Vị trí:', value: quadText, labelStyle: 'color: #c084fc;', valueStyle: 'color: #e879f9; font-weight: bold;' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.5, 1.8, -1.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'deg', label: 'Góc tự do (độ)', min: -720, max: 720, step: 10, defaultValue: 120, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: '\\alpha = \\theta + k \\cdot 2\\pi \\quad (k \\in \\mathbb{Z}, \\ 0 \\le \\theta < 2\\pi)',
        explanation: 'Một góc lượng giác có vô số số đo sai lệch nhau bội nguyên của $2\\pi$ (hoặc $360^\\circ$). Cung xoắn ốc trực quan hóa số vòng quay lượng giác (chiều quay ngược chiều kim đồng hồ là chiều dương, cùng chiều kim đồng hồ là chiều âm).',
        keyInsights: [
          'Chiều dương (+): màu xanh lá, quay ngược chiều kim đồng hồ',
          'Chiều âm (-): màu đỏ, quay cùng chiều kim đồng hồ',
          'Số vòng quay k = phần nguyên số đo chia 360°',
          'Các góc lượng giác có cùng điểm biểu diễn M thì sai khác nhau k * 360°',
        ],
        tags: ['lượng giác', 'đường tròn định hướng', 'góc lượng giác', 'số vòng quay'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.2: Hệ thức Chasles cho các góc lượng giác (Toán 11 - Bài 1.2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Hệ thức Chasles cho các góc lượng giác',
        description: 'Trực quan hóa hệ thức Chasles: số đo góc (Ou, Ov) + số đo góc (Ov, Ow) = số đo góc (Ou, Ow) + k * 360 độ.',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Point U
  board.U = board.create('glider', [1, 0, board.circle], {
    name: math('U'),
    size: 5,
    fillColor: '#10b981',
    strokeColor: '#059669',
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.U, 'angleU');

  // Point V
  board.V = board.create('glider', [0, 1, board.circle], {
    name: math('V'),
    size: 5,
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    label: { display: 'html', fontSize: 14, offset: [-15, 15] }
  });
  registerDragSnapping(board, board.V, 'angleV');

  // Point W
  board.W = board.create('glider', [0, -1, board.circle], {
    name: math('W'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });
  registerDragSnapping(board, board.W, 'angleW');

  // Rays
  board.OU = board.create('segment', [board.O, board.U], { strokeColor: '#10b981', strokeWidth: 1.5 });
  board.OV = board.create('segment', [board.O, board.V], { strokeColor: '#f59e0b', strokeWidth: 1.5 });
  board.OW = board.create('segment', [board.O, board.W], { strokeColor: '#6366f1', strokeWidth: 1.5 });

  // Arcs for directed angles
  board.arcUV = board.create('arc', [board.O, board.U, board.V], {
    strokeColor: '#10b981',
    strokeWidth: 3,
    withLabel: false,
    selection: 'minor'
  });

  board.arcVW = board.create('arc', [board.O, board.V, board.W], {
    strokeColor: '#f59e0b',
    strokeWidth: 3,
    withLabel: false,
    selection: 'minor'
  });

  board.arcUW = board.create('arc', [board.O, board.U, board.W], {
    strokeColor: '#6366f1',
    strokeWidth: 2,
    dash: 1,
    withLabel: false,
    selection: 'minor'
  });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var degU = 30, degV = 120, degW = 270;
  
  if (mode === 'Kéo tự do') {
    degU = params.angleU !== undefined ? params.angleU : 30;
    degV = params.angleV !== undefined ? params.angleV : 120;
    degW = params.angleW !== undefined ? params.angleW : 270;
  } else {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var idxU = params.specialU !== undefined ? Math.round(params.specialU) : 1;
    var idxV = params.specialV !== undefined ? Math.round(params.specialV) : 5;
    var idxW = params.specialW !== undefined ? Math.round(params.specialW) : 12;
    degU = specialDegVals[idxU] || 0;
    degV = specialDegVals[idxV] || 0;
    degW = specialDegVals[idxW] || 0;
  }

  var radU = degU * Math.PI / 180;
  var radV = degV * Math.PI / 180;
  var radW = degW * Math.PI / 180;

  board.U.setPosition(JXG.COORDS_BY_USER, [Math.cos(radU), Math.sin(radU)]);
  board.V.setPosition(JXG.COORDS_BY_USER, [Math.cos(radV), Math.sin(radV)]);
  board.W.setPosition(JXG.COORDS_BY_USER, [Math.cos(radW), Math.sin(radW)]);

  var diffUV = ((degV - degU) % 360 + 360) % 360;
  var diffVW = ((degW - degV) % 360 + 360) % 360;
  var diffUW = ((degW - degU) % 360 + 360) % 360;

  var sum = diffUV + diffVW;
  var k = Math.floor((sum - diffUW) / 360);

  var radUV = (diffUV / 180).toFixed(2) + 'π';
  var radVW = (diffVW / 180).toFixed(2) + 'π';
  var radUW = (diffUW / 180).toFixed(2) + 'π';

  showReadouts([
    { label: 'Tia Ou (U):', value: degU + '°', labelStyle: 'color: #34d399;', valueStyle: 'color: #6ee7b7; font-weight: 700;' },
    { label: 'Tia Ov (V):', value: degV + '°', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: 700;' },
    { label: 'Tia Ow (W):', value: degW + '°', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: 700;' },
    { label: 'Góc (Ou, Ov) [α]:', value: diffUV + '° (' + radUV + ')', labelStyle: 'color: #34d399;', valueStyle: 'color: #6ee7b7; font-weight: bold;' },
    { label: 'Góc (Ov, Ow) [β]:', value: diffVW + '° (' + radVW + ')', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
    { label: 'Góc (Ou, Ow) [γ]:', value: diffUW + '° (' + radUW + ')', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
    { label: 'Hệ thức Chasles:', value: diffUV + '° + ' + diffVW + '° = ' + diffUW + '° + ' + (k * 360) + '°', labelStyle: 'color: #a5b4fc; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #c084fc; font-weight: bold; background: rgba(99, 102, 241, 0.18); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
  ]);
  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.5, 1.8, -1.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt'] },
          { type: 'slider', name: 'angleU', label: 'Góc tia U (độ)', min: 0, max: 360, step: 5, defaultValue: 30, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'angleV', label: 'Góc tia V (độ)', min: 0, max: 360, step: 5, defaultValue: 120, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'angleW', label: 'Góc tia W (độ)', min: 0, max: 360, step: 5, defaultValue: 270, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialU', label: 'Góc đặc biệt U', min: 0, max: 16, step: 1, defaultValue: 1, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialV', label: 'Góc đặc biệt V', min: 0, max: 16, step: 1, defaultValue: 5, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialW', label: 'Góc đặc biệt W', min: 0, max: 16, step: 1, defaultValue: 12, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
        ],
        mathContent: '(Ou, Ov) + (Ov, Ow) \\\\equiv (Ou, Ow) \\\\pmod{2\\\\pi}',
        explanation: 'Hệ thức Chasles khẳng định rằng với ba tia Ou, Ov, Ow bất kỳ trên mặt phẳng định hướng, tổng số đo của hai góc lượng giác (Ou, Ov) và (Ov, Ow) luôn bằng số đo của góc lượng giác (Ou, Ow) cộng với một bội nguyên của 360 độ (hoặc 2π radian).',
        keyInsights: [
          'Hệ thức đúng với mọi góc lượng giác, bất kể thứ tự các tia',
          'Chênh lệch k * 360° thể hiện số vòng quay bù trừ',
          'Kéo các điểm U, V, W để kiểm tra hệ thức tự động thay đổi k',
        ],
        tags: ['lượng giác', 'hệ thức chasles', 'góc lượng giác'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 2.3: Tính độ dài cung tròn (Toán 11 - Bài 1.3)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Tính độ dài cung tròn',
        description: 'Trực quan hóa công thức tính độ dài cung tròn l = R * a. Thay đổi bán kính R và số đo góc để quan sát cung được duỗi thẳng trên thước đo.',
        order: 3,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  var panel = document.getElementById('readout-panel');
  if (panel) {
    panel.style.left = 'auto';
    panel.style.right = '10px';
  }

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Point A
  board.A = board.create('point', [
    function() { var R = params.R !== undefined ? params.R : 1.0; return R; },
    0
  ], {
    name: math('A'),
    size: 3,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });

  // Circle
  board.circle = board.create('circle', [board.O, board.A], {
    strokeColor: '#cbd5e1',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Point M as a glider on the circle (colored Indigo to match radius segment)
  board.M = board.create('glider', [0, 1.0, board.circle], {
    name: math('M'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');

  // Segments representing Radius R (colored Indigo)
  board.create('segment', [board.O, board.M], { strokeColor: '#6366f1', strokeWidth: 2.5 });
  board.create('segment', [board.O, board.A], { strokeColor: '#6366f1', strokeWidth: 2.5 });

  // Central angle arc (colored Amber representing angle alpha)
  board.angleArcStart = board.create('point', [0.2, 0], { visible: false, withLabel: false });
  board.angleArcEnd = board.create('point', [
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return 0.2 * Math.cos(rad);
    },
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return 0.2 * Math.sin(rad);
    }
  ], { visible: false, withLabel: false });
  board.angleArc = board.create('arc', [board.O, board.angleArcStart, board.angleArcEnd], {
    strokeColor: '#f59e0b',
    strokeWidth: 3,
    withLabel: false
  });

  // Arc curve (colored Teal representing arc length l)
  board.arcCurve = board.create('curve', [
    function(t) {
      var R = params.R !== undefined ? params.R : 1.0;
      return R * Math.cos(t);
    },
    function(t) {
      var R = params.R !== undefined ? params.R : 1.0;
      return R * Math.sin(t);
    },
    0,
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return rad;
    }
  ], {
    strokeColor: '#10b981',
    strokeWidth: 4,
    highlight: false
  });

  // Ruler Axis
  board.create('line', [[-1.0, -1.3], [4.0, -1.3]], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });

  // Ruler ticks
  for (var tickX = -1.0; tickX <= 4.01; tickX += 0.5) {
    var val = (tickX + 1.0).toFixed(1);
    board.create('segment', [[tickX, -1.3], [tickX, -1.38]], { strokeColor: '#64748b', strokeWidth: 1, fixed: true });
    if (Math.abs(tickX + 1.0 - Math.round(tickX + 1.0)) < 0.01) {
      board.create('text', [tickX - 0.08, -1.55, math(Math.round(tickX + 1.0).toString())], { display: 'html', fontSize: 10, color: '#64748b' });
    }
  }

  // Label for ruler
  board.create('text', [-1.0, -1.1, 'Thước đo duỗi thẳng cung tròn l (m):'], { display: 'html', fontSize: 11, color: '#475569' });

  // Unwrapped segment (colored Teal representing unwrapped arc length l)
  board.unwrappedStart = board.create('point', [-1.0, -1.3], { visible: false });
  board.unwrappedEnd = board.create('point', [
    function() {
      var R = params.R !== undefined ? params.R : 1.0;
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      var l = R * rad;
      return -1.0 + l;
    },
    -1.3
  ], {
    name: math("M'"),
    size: 5,
    fillColor: '#10b981',
    strokeColor: '#059669',
    label: { display: 'html', fontSize: 13, offset: [0, 10] }
  });

  board.unwrappedSeg = board.create('segment', [board.unwrappedStart, board.unwrappedEnd], {
    strokeColor: '#10b981',
    strokeWidth: 5,
    highlight: false
  });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var R = params.R !== undefined ? params.R : 1.0;
  var deg = 90;
  var idx = 4;
  
  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 90;
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
  }

  var rad = deg * Math.PI / 180;
  var px = R * Math.cos(rad);
  var py = R * Math.sin(rad);
  board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);

  var l = R * rad;

  // Radian Text
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else radText = frac.toFixed(2) + 'π';
  }

  showReadouts([
    { label: 'Bán kính R:', value: R.toFixed(1), labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
    { label: 'Số đo góc α:', value: deg + '° (' + radText + ' rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
    { label: 'Công thức l:', value: 'R × α (rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
    { label: 'Tính toán:', value: R.toFixed(1) + ' × ' + rad.toFixed(3) + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'font-family: monospace; color: #cbd5e1;' },
    { label: 'Độ dài cung l:', value: l.toFixed(3), labelStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; font-size: 0.85rem; background: rgba(52, 211, 153, 0.15); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
  ]);

  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.5, 1.3, 4.0, -1.6],
          showAxis: false,
          showGrid: false,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'R', label: 'Bán kính R', min: 0.8, max: 1.2, step: 0.1, defaultValue: 1.0 },
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 90, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: 'l = R \\cdot \\alpha \\quad (\\alpha \\text{ tính bằng radian})',
        explanation: 'Trên đường tròn bán kính R, cung tròn có số đo α radian sẽ có độ dài l bằng tích của R và α. Tính năng duỗi thẳng trực quan hóa cung tròn cong thành một đoạn thẳng thực tế để đo chính xác bằng thước mét.',
        keyInsights: [
          'Độ dài cung l tỉ lệ thuận với cả bán kính R và góc ở tâm α',
          'Bắt buộc phải đổi góc sang đơn vị Radian trước khi tính độ dài cung',
          'Khi R = 1, độ dài cung l bằng đúng số đo góc lượng giác α (tính bằng radian)',
        ],
        tags: ['lượng giác', 'độ dài cung', 'bán kính', 'radian'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.4: Bảng dấu & Giá trị Lượng giác
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Bảng dấu & Giá trị Lượng giác',
        description: 'Trực quan hóa giá trị Sin (tung độ), Cos (hoành độ), Tan và Cot. Xác định dấu (+/-) của chúng tùy thuộc vào phần tư (I, II, III, IV) trên đường tròn lượng giác.',
        order: 4,
        simulationCode: `
function initSimulation(board, params) {
  // Highlight Quadrants
  // Bounding box: [-2, 2.2, 2, -2.5]
  board.quad1 = board.create('polygon', [[0,0], [2.2, 0], [2.2, 2.2], [0, 2.2]], {
    fillColor: '#6366f1', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad2 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, 2.2], [0, 2.2]], {
    fillColor: '#10b981', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad3 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, -2.5], [0, -2.5]], {
    fillColor: '#f59e0b', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad4 = board.create('polygon', [[0,0], [2.2, 0], [2.2, -2.5], [0, -2.5]], {
    fillColor: '#f43f5e', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // projection points
  board.H = board.create('point', [0, 0], {
    name: math('H'),
    size: 4,
    fillColor: '#10b981',
    strokeColor: '#059669',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [-10, -15] }
  });

  board.K = board.create('point', [0, 0], {
    name: math('K'),
    size: 4,
    fillColor: '#f43f5e',
    strokeColor: '#e11d48',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [-18, 0] }
  });

  // Target point P
  board.P = board.create('glider', [1, 0, board.circle], {
    name: math('P'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.P, 'angle');

  // Special axis boundary points
  board.create('point', [1, 0], {
    name: math("A(1;0)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [8, -12] }
  });
  board.create('point', [-1, 0], {
    name: math("A'(-1;0)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [-65, -12] }
  });
  board.create('point', [0, 1], {
    name: math('B(0;1)'),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [8, 12] }
  });
  board.create('point', [0, -1], {
    name: math("B'(0;-1)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [8, -12] }
  });

  // Label Axis names
  board.create('text', [1.8, 0.1, math('\\\\text{trục cos}')], { display: 'html', fontSize: 13, color: '#059669' });
  board.create('text', [0.08, 1.8, math('\\\\text{trục sin}')], { display: 'html', fontSize: 13, color: '#e11d48' });

  // Radius line
  board.create('segment', [board.O, board.P], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // cos projection segment
  board.create('segment', [board.O, board.H], {
    strokeColor: '#10b981',
    strokeWidth: 3,
    highlight: false
  });

  // sin projection segment
  board.create('segment', [board.O, board.K], {
    strokeColor: '#f43f5e',
    strokeWidth: 3,
    highlight: false
  });

  // Dashed projections lines
  board.create('segment', [board.P, board.H], {
    dash: 2, strokeColor: '#94a3b8', strokeWidth: 1
  });
  board.create('segment', [board.P, board.K], {
    dash: 2, strokeColor: '#94a3b8', strokeWidth: 1
  });

  // Helper points and arc for angle
  board.arcStart = board.create('point', [0.3, 0], { visible: false, withLabel: false });
  board.arcEnd = board.create('point', [0.3, 0], { visible: false, withLabel: false });
  board.angleArc = board.create('arc', [board.O, board.arcStart, board.arcEnd], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    withLabel: false
  });

  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;
  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 2;
    deg = specialDegVals[idx] || 0;
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    var idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 2;
    deg = specialDegVals[idx] || 0;
  }
  var angle = deg * Math.PI / 180;

  var px = Math.cos(angle);
  var py = Math.sin(angle);

  board.P.setPosition(JXG.COORDS_BY_USER, [px, py]);
  board.H.setPosition(JXG.COORDS_BY_USER, [px, 0]);
  board.K.setPosition(JXG.COORDS_BY_USER, [0, py]);

  // Update angle arc
  board.arcEnd.setPosition(JXG.COORDS_BY_USER, [0.3 * px, 0.3 * py]);
  if (Math.abs(angle) > 0.01) {
    board.angleArc.setAttribute({ visible: true });
  } else {
    board.angleArc.setAttribute({ visible: false });
  }

  // Determine active quadrant and update polygon shading
  var normDeg = ((deg % 360) + 360) % 360;
  var activeQuad = 0;
  var quadLabel = 'Trục tọa độ';
  if (normDeg > 0 && normDeg < 90) { activeQuad = 1; quadLabel = 'Phần tư I'; }
  else if (normDeg > 90 && normDeg < 180) { activeQuad = 2; quadLabel = 'Phần tư II'; }
  else if (normDeg > 180 && normDeg < 270) { activeQuad = 3; quadLabel = 'Phần tư III'; }
  else if (normDeg > 270 && normDeg < 360) { activeQuad = 4; quadLabel = 'Phần tư IV'; }

  board.quad1.setAttribute({ fillOpacity: activeQuad === 1 ? 0.15 : 0.01 });
  board.quad2.setAttribute({ fillOpacity: activeQuad === 2 ? 0.15 : 0.01 });
  board.quad3.setAttribute({ fillOpacity: activeQuad === 3 ? 0.15 : 0.01 });
  board.quad4.setAttribute({ fillOpacity: activeQuad === 4 ? 0.15 : 0.01 });

  // Radian Text
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else radText = frac.toFixed(2) + 'π';
  }

  // Calculate Tan and Cot values and signs
  var showTan = (normDeg !== 90 && normDeg !== 270);
  var showCot = (normDeg !== 0 && normDeg !== 180 && normDeg !== 360);
  
  var tanVal = showTan ? Math.tan(angle) : null;
  var cotVal = showCot ? (1 / Math.tan(angle)) : null;

  function getSignHtml(val) {
    if (val === null) return '<span style="color: #cbd5e1; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">K.Xác định</span>';
    if (Math.abs(val) < 1e-4) return '<span style="color: #cbd5e1; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">0 (trục)</span>';
    return val > 0 
      ? '<span style="color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">+ (Dương)</span>' 
      : '<span style="color: #f87171; background: rgba(248, 113, 113, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">- (Âm)</span>';
  }

  var sinValStr = py.toFixed(3) + ' &nbsp; ' + getSignHtml(py);
  var cosValStr = px.toFixed(3) + ' &nbsp; ' + getSignHtml(px);
  var tanValStr = showTan ? tanVal.toFixed(3) + ' &nbsp; ' + getSignHtml(tanVal) : getSignHtml(null);
  var cotValStr = showCot ? cotVal.toFixed(3) + ' &nbsp; ' + getSignHtml(cotVal) : getSignHtml(null);

  showReadouts([
    { label: 'Góc α:', value: deg + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
    { label: 'Vị trí P:', value: quadLabel, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-weight: bold;' },
    { label: 'cos α (hoành độ P):', value: cosValStr, labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 8px; color: #34d399; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(52, 211, 153, 0.2);' },
    { label: 'sin α (tung độ P):', value: sinValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(248, 113, 113, 0.2);' },
    { label: 'tan α (sin/cos):', value: tanValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(249, 115, 22, 0.2);' },
    { label: 'cot α (cos/sin):', value: cotValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #2dd4bf; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(45, 212, 191, 0.2);' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-2.1, 1.75, 2.1, -1.75],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 45, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: 'P(x_P; y_P) = (\\cos \\alpha; \\sin \\alpha) \\quad \\text{và dấu phụ thuộc phần tư}',
        explanation: 'Trục hoành Ox là trục côsin, trục tung Oy là trục sin. Đường tròn lượng giác được chia làm 4 phần tư: Phần tư I (x > 0, y > 0), Phần tư II (x < 0, y > 0), Phần tư III (x < 0, y < 0), và Phần tư IV (x > 0, y < 0). Dấu của các giá trị lượng giác phụ thuộc hoàn toàn vào vị trí của điểm M.',
        keyInsights: [
          'Phần tư I (0° đến 90°): tất cả đều Dương (+)',
          'Phần tư II (90° đến 180°): sin Dương (+), còn lại đều Âm (-)',
          'Phần tư III (180° đến 270°): sin/cos Âm (-), tan/cot Dương (+)',
          'Phần tư IV (270° đến 360°): cos Dương (+), còn lại đều Âm (-)',
        ],
        tags: ['lượng giác', 'bảng dấu', 'sin', 'cos', 'tan', 'cot'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.5: Góc liên quan đặc biệt (Toán 11 - Bài 1.3)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Góc liên quan đặc biệt (Tính đối xứng)',
        description: 'Trực quan hóa sự liên hệ lượng giác của các cặp góc có tính chất đối xứng đặc biệt: Đối nhau, Bù nhau, Phụ nhau, và Hơn kém π.',
        order: 5,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Start point A
  board.create('point', [1, 0], {
    name: math("A(1;0)"),
    size: 2.5,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [8, -12] }
  });

  // Primary Point M
  board.M = board.create('glider', [1, 0, board.circle], {
    name: math('M(\\\\alpha)'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 13, color: '#4f46e5', offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');
  
  // Ray OM
  board.OM = board.create('segment', [board.O, board.M], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // Symmetric Point M'
  board.MPrime = board.create('point', [1, 0], {
    name: math("M'(-\\\\alpha)"),
    size: 5,
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    fixed: true,
    label: { display: 'html', fontSize: 13, color: '#d97706', offset: [10, -15] }
  });
  
  // Ray OM'
  board.OMPrime = board.create('segment', [board.O, board.MPrime], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    dash: 1
  });

  // Symmetry guide lines
  board.guideSeg = board.create('segment', [board.M, board.MPrime], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1.5,
    dash: 2
  });

  // Projections for M on axes
  board.Hx = board.create('point', [
    function() { return board.M.X(); },
    0
  ], {
    name: '',
    size: 4,
    fillColor: '#34d399',
    strokeColor: '#10b981',
    visible: true,
    fixed: true
  });
  
  board.Ky = board.create('point', [
    0,
    function() { return board.M.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#f87171',
    strokeColor: '#f43f5e',
    visible: true,
    fixed: true
  });

  // Projections for M' on axes
  board.HPrimeX = board.create('point', [
    function() { return board.MPrime.X(); },
    0
  ], {
    name: '',
    size: 4,
    fillColor: '#34d399',
    strokeColor: '#10b981',
    visible: true,
    fixed: true
  });

  board.KPrimeY = board.create('point', [
    0,
    function() { return board.MPrime.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#f87171',
    strokeColor: '#f43f5e',
    visible: true,
    fixed: true
  });

  // Dashed lines representing Cos projection (green-teal)
  board.cosSegM = board.create('segment', [board.M, board.Hx], {
    strokeColor: '#34d399', strokeWidth: 1.2, dash: 2, highlight: false
  });
  board.cosSegMPrime = board.create('segment', [board.MPrime, board.HPrimeX], {
    strokeColor: '#34d399', strokeWidth: 1.2, dash: 2, highlight: false
  });

  // Dashed lines representing Sin projection (rose-red)
  board.sinSegM = board.create('segment', [board.M, board.Ky], {
    strokeColor: '#f87171', strokeWidth: 1.2, dash: 2, highlight: false
  });
  board.sinSegMPrime = board.create('segment', [board.MPrime, board.KPrimeY], {
    strokeColor: '#f87171', strokeWidth: 1.2, dash: 2, highlight: false
  });

  // Line y = x for complementary angles (phụ nhau)
  board.lineYX = board.create('line', [[-2, -2], [2, 2]], {
    strokeColor: '#94a3b8',
    strokeWidth: 1.2,
    dash: 3,
    visible: false
  });

  // Line y = -x for reference if needed
  board.lineNegYX = board.create('line', [[-2, 2], [2, -2]], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1,
    dash: 3,
    visible: false
  });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var relation = params.relation || 'Góc đối nhau (α và -α)';
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;
  var idx = 2;
  
  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 2;
    deg = specialDegVals[idx] || 0;
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 2;
    deg = specialDegVals[idx] || 0;
  }

  var angle = deg * Math.PI / 180;
  var mx = Math.cos(angle);
  var my = Math.sin(angle);
  board.M.setPosition(JXG.COORDS_BY_USER, [mx, my]);

  // Determine M' based on relation
  var symAngle = 0;
  var relationLabel = '';
  var latexM = 'M(\\\\alpha)';
  var latexMPrime = "M'(\\\\beta)";

  if (relation === 'Góc đối nhau (α và -α)') {
    symAngle = -angle;
    relationLabel = 'Đối nhau (α và -α)';
    latexMPrime = "M'(-\\\\alpha)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#f43f5e', dash: 2 });
  } else if (relation === 'Góc bù nhau (α và π - α)') {
    symAngle = Math.PI - angle;
    relationLabel = 'Bù nhau (α và π - α)';
    latexMPrime = "M'(\\\\pi - \\\\alpha)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#10b981', dash: 2 });
  } else if (relation === 'Góc phụ nhau (α và π/2 - α)') {
    symAngle = Math.PI / 2 - angle;
    relationLabel = 'Phụ nhau (α và π/2 - α)';
    latexMPrime = "M'(\\\\pi/2 - \\\\alpha)";
    board.lineYX.setAttribute({ visible: true });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#f59e0b', dash: 2 });
  } else if (relation === 'Góc hơn kém π (α và π + α)') {
    symAngle = angle + Math.PI;
    relationLabel = 'Hơn kém π (α và π + α)';
    latexMPrime = "M'(\\\\alpha + \\\\pi)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#8b5cf6', dash: 2 });
  }

  var px = Math.cos(symAngle);
  var py = Math.sin(symAngle);
  board.MPrime.setPosition(JXG.COORDS_BY_USER, [px, py]);

  // Set nice labels (only update if relation changed to prevent DOM reflow flickering)
  if (board.currentRelation !== relation) {
    board.currentRelation = relation;
    var newNameMPrime = math(latexMPrime);
    if (board.MPrime.label) {
      board.MPrime.label.setText(newNameMPrime);
    } else {
      board.MPrime.setName(newNameMPrime);
    }
  }

  // Format radian texts
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else radText = frac.toFixed(2) + 'π';
  }

  var symDeg = Math.round(symAngle * 180 / Math.PI);
  // Normalize symDeg for display range
  while (symDeg <= -180) symDeg += 360;
  while (symDeg > 180) symDeg -= 360;

  var symRadText = '';
  var symFrac = symDeg / 180;
  if (symFrac === 0) symRadText = '0';
  else if (symFrac === 1) symRadText = 'π';
  else if (symFrac === -1) symRadText = '-π';
  else if (Number.isInteger(symFrac * 6)) {
    // try to write as nice fraction
    var num = Math.round(symFrac * 6);
    var den = 6;
    // simplify fraction
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    var g = Math.abs(gcd(num, den));
    num = num / g;
    den = den / g;
    var sign = num < 0 ? '-' : '';
    num = Math.abs(num);
    if (den === 1) {
      symRadText = sign + (num === 1 ? '' : num) + 'π';
    } else {
      symRadText = sign + (num === 1 ? '' : num) + 'π/' + den;
    }
  } else {
    symRadText = symFrac.toFixed(2) + 'π';
  }

  // Set formulas
  var fSin = '', fCos = '', fTan = '', fCot = '';
  if (relation === 'Góc đối nhau (α và -α)') {
    fCos = math('\\\\cos(-\\\\alpha) = \\\\cos\\\\alpha');
    fSin = math('\\\\sin(-\\\\alpha) = -\\\\sin\\\\alpha');
    fTan = math('\\\\tan(-\\\\alpha) = -\\\\tan\\\\alpha');
    fCot = math('\\\\cot(-\\\\alpha) = -\\\\cot\\\\alpha');
  } else if (relation === 'Góc bù nhau (α và π - α)') {
    fCos = math('\\\\cos(\\\\pi - \\\\alpha) = -\\\\cos\\\\alpha');
    fSin = math('\\\\sin(\\\\pi - \\\\alpha) = \\\\sin\\\\alpha');
    fTan = math('\\\\tan(\\\\pi - \\\\alpha) = -\\\\tan\\\\alpha');
    fCot = math('\\\\cot(\\\\pi - \\\\alpha) = -\\\\cot\\\\alpha');
  } else if (relation === 'Góc phụ nhau (α và π/2 - α)') {
    fCos = math('\\\\cos(\\\\pi/2 - \\\\alpha) = \\\\sin\\\\alpha');
    fSin = math('\\\\sin(\\\\pi/2 - \\\\alpha) = \\\\cos\\\\alpha');
    fTan = math('\\\\tan(\\\\pi/2 - \\\\alpha) = \\\\cot\\\\alpha');
    fCot = math('\\\\cot(\\\\pi/2 - \\\\alpha) = \\\\tan\\\\alpha');
  } else if (relation === 'Góc hơn kém π (α và π + α)') {
    fCos = math('\\\\cos(\\\\alpha + \\\\pi) = -\\\\cos\\\\alpha');
    fSin = math('\\\\sin(\\\\alpha + \\\\pi) = -\\\\sin\\\\alpha');
    fTan = math('\\\\tan(\\\\alpha + \\\\pi) = \\\\tan\\\\alpha');
    fCot = math('\\\\cot(\\\\alpha + \\\\pi) = \\\\cot\\\\alpha');
  }

  showReadouts([
    { label: 'Góc ban đầu α:', value: deg + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
    { label: 'Mối liên hệ:', value: relationLabel, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-weight: bold; background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px;' },
    { label: 'Góc liên kết β:', value: symDeg + '° (' + symRadText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Liên hệ Côsin:', value: fCos, labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px; color: #34d399; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(52, 211, 153, 0.3);' },
    { label: 'Liên hệ Sin:', value: fSin, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(248, 113, 113, 0.3);' },
    { label: 'Liên hệ Tang/Cot:', value: fTan + ' &nbsp;|&nbsp; ' + fCot, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(249, 115, 22, 0.3);' }
  ]);

  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.5, 1.8, -1.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'relation', label: 'Liên hệ đối xứng', defaultValue: 'Góc đối nhau (α và -α)', options: ['Góc đối nhau (α và -α)', 'Góc bù nhau (α và π - α)', 'Góc phụ nhau (α và π/2 - α)', 'Góc hơn kém π (α và π + α)'] },
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 45, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: '\\cos(-\\alpha) = \\cos\\alpha, \\ \\sin(\\pi-\\alpha) = \\sin\\alpha, \\ \\cos(\\pi/2-\\alpha) = \\sin\\alpha',
        explanation: 'Các góc liên quan đặc biệt có mối liên hệ hình học đối xứng rất đẹp trên đường tròn lượng giác: đối xứng qua trục Ox (góc đối), qua Oy (góc bù), qua đường phân giác y = x (góc phụ), hoặc qua tâm O (góc hơn kém π).',
        keyInsights: [
          'Góc đối nhau (α và -α): Đối xứng qua trục hoành Ox. Chỉ có Côsin bằng nhau (cos đối).',
          'Góc bù nhau (α và π - α): Đối xứng qua trục tung Oy. Chỉ có Sin bằng nhau (sin bù).',
          'Góc phụ nhau (α và π/2 - α): Đối xứng qua phân giác y = x. Giá trị lượng giác chéo nhau (phụ chéo).',
          'Góc hơn kém π (α và π + α): Đối xứng qua gốc tọa độ O. Chỉ có Tang và Côtang bằng nhau.',
        ],
        tags: ['lượng giác', 'đối xứng', 'góc lượng giác', 'liên hệ đặc biệt'],
        difficulty: 'intermediate',
        isPublished: true,
      },      // Demo 3: Khảo sát hàm số bậc 3 (Toán 12)
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

    // Clean up all old simulations for this grade 11 trig lesson
    await Simulation.deleteMany({
      grade: 11,
      chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
      lessonSlug: 'goc-luong-giac-duong-tron'
    });

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
