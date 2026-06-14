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

  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : 0;

  // Create sliders inside JSXGraph
  board.sliderA = createCustomSlider(board, [-5.0, -3.2], [-2.2, -3.2], -3, board.a, 3, 'a', 0.1, '#6366f1');
  board.sliderB = createCustomSlider(board, [-1.4, -3.2], [1.4, -3.2], -5, board.b, 5, 'b', 0.5, '#fb923c');
  board.sliderC = createCustomSlider(board, [2.2, -3.2], [5.0, -3.2], -5, board.c, 5, 'c', 0.5, '#c084fc');

  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  board.sliderC.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'c', value: board.sliderC.Value() }, '*'); });

  // Draw parabola
  board.create('functiongraph', [
    function(x) { return board.a * x * x + board.b * x + board.c; }
  ], {
    strokeColor: '#6366f1',
    strokeWidth: 3,
    highlight: false
  });

  // Vertex
  board.vertex = board.create('point', [
    function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; },
    function() {
      if (board.a === 0) return 0;
      var xV = -board.b / (2 * board.a);
      return board.a * xV * xV + board.b * xV + board.c;
    }
  ], {
    name: 'Đỉnh',
    size: 5,
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    visible: function() { return board.a !== 0; },
    label: { fontSize: 14, offset: [10, 10] }
  });

  // Axis of symmetry
  board.axis = board.create('line', [
    [function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; }, 0],
    [function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; }, 1]
  ], {
    dash: 3,
    strokeColor: '#9ca3af',
    strokeWidth: 1,
    straightFirst: true,
    straightLast: true,
    visible: function() { return board.a !== 0; },
    highlight: false
  });

  // Y-intercept
  board.yIntercept = board.create('point', [
    0,
    function() { return board.c; }
  ], {
    name: 'y-intercept',
    size: 4,
    fillColor: '#22c55e',
    strokeColor: '#16a34a',
    label: { fontSize: 12, offset: [10, -10] }
  });

  // Title text
  board.create('text', [-5.5, 5.5,
    function() {
      var a = board.a, b = board.b, c = board.c;
      return 'y = ' + (a >= 0 ? '' : '-') + (Math.abs(a) === 1 ? '' : Math.abs(a).toFixed(1))
        + 'x² ' + (b >= 0 ? '+ ' : '- ') + Math.abs(b).toFixed(1)
        + 'x ' + (c >= 0 ? '+ ' : '- ') + Math.abs(c).toFixed(1);
    }
  ], { fontSize: 16, cssClass: 'sim-formula' });

  board.unsuspendUpdate();
}

function updateSimulation(board, params) {
  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : 0;

  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - board.a) > 1e-4) board.sliderA.setValue(board.a);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - board.b) > 1e-4) board.sliderB.setValue(board.b);
  if (board.sliderC && !board.sliderC.isDragging && Math.abs(board.sliderC.Value() - board.c) > 1e-4) board.sliderC.setValue(board.c);
}
`,
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

  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : 0;
  board.x0 = params.x0 !== undefined ? params.x0 : -2;

  // Create sliders inside JSXGraph
  board.sliderA = createCustomSlider(board, [-5.0, -2.6], [-2.2, -2.6], -3, board.a, 3, 'a', 0.1, '#6366f1');
  board.sliderB = createCustomSlider(board, [-1.4, -2.6], [1.4, -2.6], -5, board.b, 5, 'b', 0.5, '#fb923c');
  board.sliderC = createCustomSlider(board, [2.2, -2.6], [5.0, -2.6], -5, board.c, 5, 'c', 0.5, '#c084fc');
  board.sliderX0 = createCustomSlider(board, [-2.5, -3.4], [2.5, -3.4], -5, board.x0, 5, 'x0', 0.1, '#10b981');

  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  board.sliderC.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'c', value: board.sliderC.Value() }, '*'); });
  board.sliderX0.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'x0', value: board.sliderX0.Value() }, '*'); });

  // Draw parabola
  board.create('functiongraph', [
    function(x) { return board.a * x * x + board.b * x + board.c; }
  ], {
    strokeColor: '#3b82f6',
    strokeWidth: 3,
    highlight: false
  });

  // Vertex
  board.vertex = board.create('point', [
    function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; },
    function() {
      if (board.a === 0) return 0;
      var xV = -board.b / (2 * board.a);
      return board.a * xV * xV + board.b * xV + board.c;
    }
  ], {
    name: 'Đỉnh V',
    size: 4,
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    visible: function() { return board.a !== 0; },
    label: { fontSize: 13, offset: [10, 10] }
  });

  // Axis of symmetry
  board.axis = board.create('line', [
    [function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; }, 0],
    [function() { return board.a !== 0 ? -board.b / (2 * board.a) : 0; }, 1]
  ], {
    dash: 2,
    strokeColor: 'rgba(255,255,255,0.4)',
    strokeWidth: 1,
    straightFirst: true,
    straightLast: true,
    visible: function() { return board.a !== 0; },
    highlight: false
  });

  // Interval text
  board.create('text', [-5.5, 5.0,
    function() {
      var a = board.a, b = board.b, x0 = board.x0;
      if (a === 0) return "Hàm số bậc nhất";
      var xV = -b / (2 * a);
      if (a > 0) {
        if (x0 < xV) {
          return "x = " + x0.toFixed(2) + " < -b/2a: Nghịch biến (đi xuống)";
        } else {
          return "x = " + x0.toFixed(2) + " > -b/2a: Đồng biến (đi lên)";
        }
      } else {
        if (x0 < xV) {
          return "x = " + x0.toFixed(2) + " < -b/2a: Đồng biến (đi lên)";
        } else {
          return "x = " + x0.toFixed(2) + " > -b/2a: Nghịch biến (đi xuống)";
        }
      }
    }
  ], { fontSize: 14, cssClass: 'sim-formula', color: '#f59e0b' });

  // Active point
  board.M = board.create('point', [
    function() { return board.x0; },
    function() { return board.a * board.x0 * board.x0 + board.b * board.x0 + board.c; }
  ], {
    name: 'M',
    size: 5,
    fillColor: '#a855f7',
    strokeColor: '#9333ea',
    label: { fontSize: 12, offset: [10, 10] }
  });

  // Tangent arrow representing slope direction
  board.arrowStart = board.create('point', [0, 0], { visible: false });
  board.arrowEnd = board.create('point', [0, 0], { visible: false });
  board.arrow = board.create('arrow', [board.arrowStart, board.arrowEnd], {
    strokeColor: '#a855f7',
    strokeWidth: 2.5
  });

  board.on('update', function() {
    var a = board.a, b = board.b, c = board.c, x0 = board.x0;
    var y0 = a * x0 * x0 + b * x0 + c;
    var slope = 2 * a * x0 + b;
    var angle = Math.atan(slope);
    var dx = 0.5 * Math.cos(angle);
    var dy = 0.5 * Math.sin(angle);
    board.arrowStart.setPosition(JXG.COORDS_BY_USER, [x0 - dx, y0 - dy]);
    board.arrowEnd.setPosition(JXG.COORDS_BY_USER, [x0 + dx, y0 + dy]);
  });

  board.unsuspendUpdate();
}

function updateSimulation(board, params) {
  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : 0;
  board.x0 = params.x0 !== undefined ? params.x0 : -2;

  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - board.a) > 1e-4) board.sliderA.setValue(board.a);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - board.b) > 1e-4) board.sliderB.setValue(board.b);
  if (board.sliderC && !board.sliderC.isDragging && Math.abs(board.sliderC.Value() - board.c) > 1e-4) board.sliderC.setValue(board.c);
  if (board.sliderX0 && !board.sliderX0.isDragging && Math.abs(board.sliderX0.Value() - board.x0) > 1e-4) board.sliderX0.setValue(board.x0);
}
`,
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
      // Demo 2.1: Đường tròn định hướng & Chiều quay (Toán 11)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Đường tròn định hướng & Góc lượng giác',
        description: 'Khám phá khái niệm đường tròn định hướng, chiều quay lượng giác dương/âm và số đo của góc lượng giác dưới dạng tổng quát α = θ + k * 2π.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
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

  // Create native sliders inside SVG
  board.sliderDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], -720, params.deg !== undefined ? params.deg : 120, 720, 'Góc', 10, '#6366f1');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecialDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialDeg !== undefined ? params.specialDeg : 4, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecialRad = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialRad !== undefined ? params.specialRad : 4, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'deg', value: board.sliderDeg.Value() }, '*'); });
  board.sliderSpecialDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecialDeg.Value() }, '*'); });
  board.sliderSpecialRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecialRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var deg = 120;
  var idx = 4;
  
  board.sliderDeg.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecialDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecialRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });

  if (mode === 'Kéo tự do') {
    deg = params.deg !== undefined ? params.deg : 120;
    if (board.sliderDeg && !board.sliderDeg.isDragging && Math.abs(board.sliderDeg.Value() - deg) > 1e-4) board.sliderDeg.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecialDeg && !board.sliderSpecialDeg.isDragging && Math.abs(board.sliderSpecialDeg.Value() - idx) > 1e-4) board.sliderSpecialDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecialRad && !board.sliderSpecialRad.isDragging && Math.abs(board.sliderSpecialRad.Value() - idx) > 1e-4) board.sliderSpecialRad.setValue(idx);
  }

  var rad = deg * Math.PI / 180;
  board.radVal = rad;

  var px = Math.cos(rad);
  var py = Math.sin(rad);
  if (board.M && !board.M.isDragging) {
    board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
  }

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
    { label: 'Góc tổng quát α:', value: parseFloat(deg.toFixed(2)) + '°', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-size: 0.85rem;' },
    { label: 'Số đo radian:', value: radText + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #c084fc;' },
    { label: 'Góc hình học:', value: parseFloat(remainderDeg.toFixed(2)) + '° (' + remainderRadStr + ')', labelStyle: 'color: #38bdf8;', valueStyle: 'color: #7dd3fc;' },
    { label: 'Chiều quay:', value: dirText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: ' + dirColor + '; background: ' + (deg > 0 ? 'rgba(52, 211, 153, 0.15)' : (deg < 0 ? 'rgba(248, 113, 113, 0.15)' : 'rgba(203, 213, 225, 0.15)')) + '; padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Số vòng k:', value: turns.toString(), labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; background: rgba(249, 115, 22, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Vị trí:', value: quadText, labelStyle: 'color: #c084fc;', valueStyle: 'color: #e879f9; font-weight: bold;' }
  ]);
  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.9, 1.8, -1.1],
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
      // Demo 2.2: Hệ thức Chasles cho các góc lượng giác (Toán 11)
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

  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8', strokeWidth: 2, highlight: false, fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'), size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Points U, V, W
  board.U = board.create('point', [1, 0], {
    name: math('U'), size: 5, fillColor: '#10b981', strokeColor: '#059669',
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  board.V = board.create('point', [0, 1], {
    name: math('V'), size: 5, fillColor: '#f59e0b', strokeColor: '#d97706',
    label: { display: 'html', fontSize: 14, offset: [-15, 15] }
  });
  board.W = board.create('point', [0, -1], {
    name: math('W'), size: 5, fillColor: '#6366f1', strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });

  // Rays
  board.OU = board.create('segment', [board.O, board.U], { strokeColor: '#10b981', strokeWidth: 1.5 });
  board.OV = board.create('segment', [board.O, board.V], { strokeColor: '#f59e0b', strokeWidth: 1.5 });
  board.OW = board.create('segment', [board.O, board.W], { strokeColor: '#6366f1', strokeWidth: 1.5 });

  // Custom directed angle arcs (sectors) — drawn correctly for +/- direction
  // Convention: + = counterclockwise, - = clockwise
  board.sectorAlpha = board.create('curve', [[], []], {
    strokeColor: '#10b981', strokeWidth: 2, fillColor: 'rgba(16,185,129,0.18)', fillOpacity: 1, highlight: false
  });
  board.sectorBeta = board.create('curve', [[], []], {
    strokeColor: '#f59e0b', strokeWidth: 2, fillColor: 'rgba(245,158,11,0.15)', fillOpacity: 1, highlight: false
  });
  board.sectorGamma = board.create('curve', [[], []], {
    strokeColor: '#6366f1', strokeWidth: 2, dash: 2, fillColor: 'rgba(99,102,241,0.1)', fillOpacity: 1, highlight: false
  });

  // Angle labels
  board.lblAlpha = board.create('text', [0.2, 0.2, '\\u03b1'], { fontSize: 13, color: '#10b981', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });
  board.lblBeta = board.create('text', [0.2, 0.2, '\\u03b2'], { fontSize: 13, color: '#f59e0b', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });
  board.lblGamma = board.create('text', [0.2, 0.2, '\\u03b3'], { fontSize: 13, color: '#6366f1', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });

  // Direction arrow indicators on outer circle
  board.arcUV = board.create('curve', [[], []], { strokeColor: '#10b981', strokeWidth: 3, highlight: false });
  board.arcVW = board.create('curve', [[], []], { strokeColor: '#f59e0b', strokeWidth: 3, highlight: false });
  board.arcUW = board.create('curve', [[], []], { strokeColor: '#6366f1', strokeWidth: 2, dash: 1, highlight: false });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

// Helper: draw a filled sector arc from startDeg sweeping angleDeg at radius r
// + angleDeg = counterclockwise, - angleDeg = clockwise
function drawSector(curve, r, startDeg, angleDeg, N) {
  var xArr = [0], yArr = [0]; // start at center
  var s = startDeg * Math.PI / 180;
  var step = (angleDeg * Math.PI / 180) / N;
  for (var i = 0; i <= N; i++) {
    var t = s + i * step;
    xArr.push(r * Math.cos(t));
    yArr.push(r * Math.sin(t));
  }
  xArr.push(0); yArr.push(0); // close to center
  curve.dataX = xArr;
  curve.dataY = yArr;
}

// Helper: draw an arc on the unit circle from startDeg sweeping angleDeg
function drawCircleArc(curve, startDeg, angleDeg, N) {
  var xArr = [], yArr = [];
  var s = startDeg * Math.PI / 180;
  var step = (angleDeg * Math.PI / 180) / N;
  for (var i = 0; i <= N; i++) {
    var t = s + i * step;
    xArr.push(Math.cos(t));
    yArr.push(Math.sin(t));
  }
  curve.dataX = xArr;
  curve.dataY = yArr;
}

function updateSimulation(board, params) {
  board.suspendUpdate();

  // Params
  var degU = params.degU !== undefined ? params.degU : 0;
  var alpha = params.alpha !== undefined ? params.alpha : 90;  // sd(Ou,Ov)
  var beta = params.beta !== undefined ? params.beta : 60;     // sd(Ov,Ow)

  // Convention: + = counterclockwise, - = clockwise
  // Positions on unit circle
  var degV = degU + alpha;
  var degW = degU + alpha + beta;

  board.U.setPosition(JXG.COORDS_BY_USER, [Math.cos(degU * Math.PI / 180), Math.sin(degU * Math.PI / 180)]);
  board.V.setPosition(JXG.COORDS_BY_USER, [Math.cos(degV * Math.PI / 180), Math.sin(degV * Math.PI / 180)]);
  board.W.setPosition(JXG.COORDS_BY_USER, [Math.cos(degW * Math.PI / 180), Math.sin(degW * Math.PI / 180)]);

  // Draw directed sector arcs (correct direction for + and -)
  drawSector(board.sectorAlpha, 0.28, degU, alpha, 40);
  drawSector(board.sectorBeta, 0.38, degV, beta, 40);
  drawSector(board.sectorGamma, 0.48, degU, alpha + beta, 40);

  // Draw outer circle arcs
  drawCircleArc(board.arcUV, degU, alpha, 40);
  drawCircleArc(board.arcVW, degV, beta, 40);
  drawCircleArc(board.arcUW, degU, alpha + beta, 40);

  // Position labels at midpoint of each arc
  var midA = (degU + alpha / 2) * Math.PI / 180;
  var midB = (degV + beta / 2) * Math.PI / 180;
  var midG = (degU + (alpha + beta) / 2) * Math.PI / 180;
  board.lblAlpha.setPosition(JXG.COORDS_BY_USER, [0.38 * Math.cos(midA), 0.38 * Math.sin(midA)]);
  board.lblBeta.setPosition(JXG.COORDS_BY_USER, [0.50 * Math.cos(midB), 0.50 * Math.sin(midB)]);
  board.lblGamma.setPosition(JXG.COORDS_BY_USER, [0.62 * Math.cos(midG), 0.62 * Math.sin(midG)]);

  var gamma = alpha + beta;
  var k = 0;

  function fmtDeg(d) { return (d >= 0 ? '+' : '') + parseFloat(d.toFixed(2)) + '\\u00b0'; }
  function fmtRad(d) { return (d >= 0 ? '+' : '') + (d / 180).toFixed(2) + '\\u03c0'; }

  var chaslesLeft = '(' + fmtDeg(alpha) + ') + (' + fmtDeg(beta) + ')';
  var chaslesRight = '(' + fmtDeg(gamma) + ')' + (k !== 0 ? ' + ' + k + '\\u00d7360\\u00b0' : '');

  showReadouts([
    { label: '\\u03b1 = s\\u0111(Ou, Ov):', value: fmtDeg(alpha) + '  (' + fmtRad(alpha) + ')', labelStyle: 'color: #34d399;', valueStyle: 'color: #6ee7b7; font-weight: bold;' },
    { label: '\\u03b2 = s\\u0111(Ov, Ow):', value: fmtDeg(beta) + '  (' + fmtRad(beta) + ')', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
    { label: '\\u03b3 = s\\u0111(Ou, Ow):', value: fmtDeg(gamma) + '  (' + fmtRad(gamma) + ')', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
    { label: '\\u03b1 + \\u03b2 = \\u03b3 + k\\u00b7360\\u00b0:', value: chaslesLeft + ' = ' + chaslesRight, labelStyle: 'color: #a5b4fc; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #c084fc; font-weight: bold; background: rgba(99, 102, 241, 0.18); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
  ]);
  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 560 },
          boundingBox: [-1.8, 2.3, 1.8, -1.7],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'degU', label: 'Tia Ou (°)', min: 0, max: 360, step: 5, defaultValue: 0 },
          { type: 'slider', name: 'alpha', label: 'sđ(Ou, Ov) = α', min: -180, max: 180, step: 5, defaultValue: 90 },
          { type: 'slider', name: 'beta', label: 'sđ(Ov, Ow) = β', min: -180, max: 180, step: 5, defaultValue: 60 },
        ],
        mathContent: '(Ou, Ov) + (Ov, Ow) \\equiv (Ou, Ow) \\pmod{2\\pi}',
        explanation: 'Hệ thức Chasles khẳng định rằng với ba tia Ou, Ov, Ow bất kỳ trên mặt phẳng định hướng, tổng số đo của hai góc lượng giác (Ou, Ov) và (Ov, Ow) luôn bằng số đo của góc lượng giác (Ou, Ow) cộng với một bội nguyên của 360 độ (hoặc 2π radian).',
        keyInsights: [
          'Kéo thanh α để thay đổi góc (Ou, Ov) — điểm V di chuyển',
          'Kéo thanh β để thay đổi góc (Ov, Ow) — điểm W tự nhảy theo',
          'Góc γ = sđ(Ou, Ow) tự động tính, hệ thức Chasles luôn đúng',
        ],
        tags: ['lượng giác', 'hệ thức chasles', 'góc lượng giác'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 2.3: Tính độ dài cung tròn (Toán 11)
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

  // Cache variables to prevent setBoundingBox looping & label flickering
  board.lastMode = '';
  board.lastWidth = 0;
  board.lastHeight = 0;

  // Origin O
  board.O = board.create('point', [
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
        var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
        var theta = deg * Math.PI / 180;
        return -1.0 + (R * theta) / 1.2;
      }
      return 0;
    },
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
        return -1.3 + R / 1.2;
      }
      return 0;
    }
  ], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Point A
  board.A = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return board.O.X() + R / 1.2;
      }
      return R;
    },
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return board.O.Y();
      }
      return 0;
    }
  ], {
    name: math('A'),
    size: 3,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    fixed: true,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });

  // Circle
  board.circle = board.create('circle', [board.O, board.A], {
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#000000' : '#cbd5e1';
    },
    strokeWidth: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? 3.5 : 2;
    },
    highlight: false,
    fixed: true
  });

  // Point M
  board.M = board.create('glider', [0, 1.0, board.circle], {
    name: math('M'),
    size: 5,
    fillColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#ef4444' : '#6366f1';
    },
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#dc2626' : '#4f46e5';
    },
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');

  // Segments representing Radius R
  board.radSeg = board.create('segment', [board.O, board.M], {
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#ef4444' : '#6366f1';
    },
    strokeWidth: 2.5
  });
  board.aSeg = board.create('segment', [board.O, board.A], {
    strokeColor: '#6366f1',
    strokeWidth: 2.5,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Central angle arc
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
    withLabel: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Arc curve
  board.arcCurve = board.create('curve', [
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return R * Math.cos(t);
    },
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
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
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Ruler Axis
  board.rulerLine = board.create('segment', [
    [-1.0, -1.3],
    [
      function() {
        var mode = window.currentParams?.mode || 'Kéo tự do';
        if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
          return 11.5;
        }
        return 4.0;
      },
      -1.3
    ]
  ], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });

  // Free mode ticks
  for (var tickX = -1.0; tickX <= 4.01; tickX += 0.5) {
    (function(tx) {
      var val = Math.round(tx + 1.0);
      var isInt = Math.abs(tx + 1.0 - val) < 0.01;
      board.create('segment', [[tx, -1.3], [tx, -1.38]], {
        strokeColor: '#64748b',
        strokeWidth: 1,
        fixed: true,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
        }
      });
      if (isInt) {
        board.create('text', [tx - 0.08, -1.6, math(val.toString())], {
          display: 'html',
          fontSize: 10,
          color: '#64748b',
          visible: function() {
            var mode = window.currentParams?.mode || 'Kéo tự do';
            return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
          }
        });
      }
    })(tickX);
  }

  // Rolling mode ticks (from 0 to 15 meters)
  for (var d = 0; d <= 15; d += 0.5) {
    (function(dist) {
      var tx = -1.0 + dist / 1.2;
      var isInt = Math.abs(dist - Math.round(dist)) < 0.01;
      var showLabel = isInt && (Math.round(dist) % 2 === 0);
      board.create('segment', [[tx, -1.3], [tx, -1.38]], {
        strokeColor: '#64748b',
        strokeWidth: 1,
        fixed: true,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
        }
      });
      if (showLabel) {
        board.create('text', [tx - 0.1, -1.6, math(Math.round(dist).toString())], {
          display: 'html',
          fontSize: 10,
          color: '#64748b',
          visible: function() {
            var mode = window.currentParams?.mode || 'Kéo tự do';
            return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
          }
        });
      }
    })(d);
  }

  // Label for ruler
  board.rulerLabel = board.create('text', [
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return 11.5;
      }
      return 4.0;
    },
    -2.1,
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return 'Thước đo quãng đường s (m)';
      }
      return 'Thước đo duỗi thẳng cung tròn l (m)';
    }
  ], {
    display: 'html',
    anchorX: 'right',
    cssStyle: 'font-weight: 700; color: #0f172a; font-size: 13px; font-family: Inter, sans-serif;',
    highlight: false
  });

  // Unwrapped segment
  board.unwrappedStart = board.create('point', [-1.0, -1.3], { visible: false });
  board.unwrappedEnd = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
        var rad = deg * Math.PI / 180;
        var l = R * rad;
        return -1.0 + l / 1.2;
      } else {
        var x = board.M.X();
        var y = board.M.Y();
        var rad = Math.atan2(y, x);
        if (rad < 0) rad += 2 * Math.PI;
        var l = R * rad;
        return -1.0 + l;
      }
    },
    -1.3
  ], {
    name: math("M'"),
    size: 5,
    fillColor: '#10b981',
    strokeColor: '#059669',
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 13, offset: [0, 10] }
  });

  board.unwrappedSeg = board.create('segment', [board.unwrappedStart, board.unwrappedEnd], {
    strokeColor: '#10b981',
    strokeWidth: 5,
    highlight: false
  });

  // Cycloid curve
  board.cycloidCurve = board.create('curve', [
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var xO = -1.0 + (R * t) / 1.2;
      return xO - (R / 1.2) * Math.sin(t);
    },
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var yO = -1.3 + R / 1.2;
      return yO - (R / 1.2) * Math.cos(t);
    },
    0,
    function() {
      var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
      return deg * Math.PI / 180;
    }
  ], {
    strokeColor: '#ef4444',
    strokeWidth: 3,
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
    }
  });

  // Back wheel spokes
  for (var i = 1; i < 8; i++) {
    (function(idx) {
      board.create('segment', [
        board.O,
        board.create('point', [
          function() {
            var x = board.M.X() - board.O.X();
            var y = board.M.Y() - board.O.Y();
            var r = Math.sqrt(x*x + y*y);
            var phi = Math.atan2(y, x) + idx * Math.PI / 4;
            return board.O.X() + 0.85 * r * Math.cos(phi);
          },
          function() {
            var x = board.M.X() - board.O.X();
            var y = board.M.Y() - board.O.Y();
            var r = Math.sqrt(x*x + y*y);
            var phi = Math.atan2(y, x) + idx * Math.PI / 4;
            return board.O.Y() + 0.85 * r * Math.sin(phi);
          }
        ], { visible: false, withLabel: false })
      ], {
        strokeColor: '#94a3b8',
        strokeWidth: 1.2,
        dash: 1,
        highlight: false,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
        }
      });
    })(i);
  }

  // Back Inner Rim
  board.backInnerRim = board.create('circle', [
    board.O,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      var scale = (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? 1.2 : 1.0;
      return 0.85 * (R / scale);
    }
  ], {
    strokeColor: '#64748b',
    strokeWidth: 1.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
    }
  });

  // Front wheel center
  board.Of = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return board.O.X() + 3.2 * (R / 1.2);
    },
    function() {
      return board.O.Y();
    }
  ], { visible: false, withLabel: false });

  // Front tire
  board.frontCircle = board.create('circle', [
    board.Of,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return R / 1.2;
    }
  ], {
    strokeColor: '#000000',
    strokeWidth: 3.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front Inner Rim
  board.frontInnerRim = board.create('circle', [
    board.Of,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return 0.85 * (R / 1.2);
    }
  ], {
    strokeColor: '#64748b',
    strokeWidth: 1.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front hub
  board.frontHub = board.create('point', [
    function() { return board.Of.X(); },
    function() { return board.Of.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#475569',
    strokeColor: '#334155',
    fixed: true,
    withLabel: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front spokes
  for (var j = 0; j < 8; j++) {
    (function(idx) {
      board.create('segment', [
        board.Of,
        board.create('point', [
          function() {
            var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
            var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
            var theta = deg * Math.PI / 180;
            var phi = idx * Math.PI / 4 - theta;
            return board.Of.X() + 0.85 * (R / 1.2) * Math.cos(phi);
          },
          function() {
            var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
            var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
            var theta = deg * Math.PI / 180;
            var phi = idx * Math.PI / 4 - theta;
            return board.Of.Y() + 0.85 * (R / 1.2) * Math.sin(phi);
          }
        ], { visible: false, withLabel: false })
      ], {
        strokeColor: '#94a3b8',
        strokeWidth: 1.2,
        dash: 1,
        highlight: false,
        visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
      });
    })(j);
  }

  // Bicycle Frame Elements
  var frameVisible = function() {
    var mode = window.currentParams?.mode || 'Kéo tự do';
    return mode === 'Xe đạp chạy trên đường';
  };

  board.bikeP = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 1.1 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() - 0.2 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeS = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 0.8 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() + 1.2 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeH = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 2.4 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() + 1.4 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeStem = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeH.X() + 0.05 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeH.Y() + 0.25 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeBar = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeStem.X() - 0.2 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeStem.Y() + 0.05 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeSeatL = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.X() - 0.18 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.Y() + 0.1 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeSeatR = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.X() + 0.12 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.Y() + 0.08 * r;
    }
  ], { visible: false, withLabel: false });

  board.create('segment', [board.O, board.bikeP], { strokeColor: '#64748b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.O, board.bikeS], { strokeColor: '#64748b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeP, board.bikeS], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeP, board.bikeH], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeS, board.bikeH], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeH, board.Of], { strokeColor: '#64748b', strokeWidth: 4.5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeSeatL, board.bikeSeatR], { strokeColor: '#1e293b', strokeWidth: 6, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeH, board.bikeStem], { strokeColor: '#1e293b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeStem, board.bikeBar], { strokeColor: '#1e293b', strokeWidth: 5, highlight: false, visible: frameVisible });

  // Create native sliders inside SVG
  board.sliderR = createCustomSlider(board, [-1.2, -1.45], [0.3, -1.45], 0.8, params.R !== undefined ? params.R : 1.0, 1.2, 'Bán kính R', 0.01, '#6366f1');
  board.sliderAngle = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.angle !== undefined ? params.angle : 90, 360, 'Góc', 5, '#fb923c');
  board.sliderRollAngle = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.rollAngle !== undefined ? params.rollAngle : 90, 720, 'Góc quay', 5, '#fb923c');

  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.specialDeg !== undefined ? params.specialDeg : 4, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.specialRad !== undefined ? params.specialRad : 4, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderR.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'R', value: board.sliderR.Value() }, '*'); });
  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderRollAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'rollAngle', value: board.sliderRollAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var R = params.R !== undefined ? params.R : 1.0;
  var deg = 90;
  var idx = 4;
  
  board.sliderAngle.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });
  board.sliderRollAngle.setAttribute({ visible: (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') });

  if (board.sliderR && !board.sliderR.isDragging && Math.abs(board.sliderR.Value() - R) > 1e-4) board.sliderR.setValue(R);

  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 90;
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) board.sliderAngle.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecDeg && !board.sliderSpecDeg.isDragging && Math.abs(board.sliderSpecDeg.Value() - idx) > 1e-4) board.sliderSpecDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecRad && !board.sliderSpecRad.isDragging && Math.abs(board.sliderSpecRad.Value() - idx) > 1e-4) board.sliderSpecRad.setValue(idx);
  } else {
    deg = params.rollAngle !== undefined ? params.rollAngle : 90;
    if (board.sliderRollAngle && !board.sliderRollAngle.isDragging && Math.abs(board.sliderRollAngle.Value() - deg) > 1e-4) board.sliderRollAngle.setValue(deg);
  }

  var rad = deg * Math.PI / 180;
  var l = R * rad;

  // Update dynamic bounding box with strict aspect-ratio enforcement, avoiding redundant setBoundingBox calls
  var w = board.canvasWidth;
  var h = board.canvasHeight;
  var ratio = w / h;

  var modeChanged = (board.lastMode !== mode);
  var sizeChanged = (board.lastWidth !== w || board.lastHeight !== h);

  if (modeChanged || sizeChanged) {
    board.lastMode = mode;
    board.lastWidth = w;
    board.lastHeight = h;

    if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
      var targetW = 14.0;
      var targetH = 3.9;
      if (targetW / targetH > ratio) {
        targetH = targetW / ratio;
      } else {
        targetW = targetH * ratio;
      }
      var xMin = 5.2 - targetW / 2;
      var xMax = 5.2 + targetW / 2;
      var yMin = -0.45 - targetH / 2;
      var yMax = -0.45 + targetH / 2;
      board.setBoundingBox([xMin, yMax, xMax, yMin], true);
    } else {
      var targetW = 6.0;
      var targetH = 3.9;
      if (targetW / targetH > ratio) {
        targetH = targetW / ratio;
      } else {
        targetW = targetH * ratio;
      }
      var xMin = 1.2 - targetW / 2;
      var xMax = 1.2 + targetW / 2;
      var yMin = -0.45 - targetH / 2;
      var yMax = -0.45 + targetH / 2;
      board.setBoundingBox([xMin, yMax, xMax, yMin], true);
    }
  }

  if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
    var xO = -1.0 + (R * rad) / 1.2;
    var yO = -1.3 + R / 1.2;
    var px = xO - (R / 1.2) * Math.sin(rad);
    var py = yO - (R / 1.2) * Math.cos(rad);
    if (board.M) {
      board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
    }
  } else {
    var px = R * Math.cos(rad);
    var py = R * Math.sin(rad);
    if (board.M && !board.M.isDragging) {
      board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
    }
  }

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

  if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
    var turnsVal = deg / 360;
    var turnsStr = turnsVal.toFixed(1);
    if (Math.abs(turnsVal - Math.round(turnsVal)) < 0.01) {
      turnsStr = Math.round(turnsVal).toString();
    }
    
    // Check if exactly 1 or 2 turns to adapt formula names
    var calcLabel = 'Quãng đường s:';
    var formulaVal = 's = R × α';
    var calculationVal = R.toFixed(2) + ' × ' + rad.toFixed(2) + ' rad';
    if (deg === 360) {
      calcLabel = 'Chu vi bánh xe C:';
      formulaVal = 'C = 2πR';
      calculationVal = '2 × π × ' + R.toFixed(2);
    } else if (deg === 720) {
      calcLabel = 'Quãng đường (2 vòng):';
      formulaVal = 's = 2 × 2πR';
      calculationVal = '2 × 2 × π × ' + R.toFixed(2);
    }

    showReadouts([
      { label: 'Bán kính bánh xe R:', value: R.toFixed(2) + ' m', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
      { label: 'Góc quay α:', value: parseFloat(deg.toFixed(2)) + '° (' + radText + ' rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
      { label: 'Số vòng quay:', value: turnsStr + ' vòng', labelStyle: 'color: #c084fc;', valueStyle: 'color: #e9d5ff; font-weight: bold;' },
      { label: 'Công thức:', value: formulaVal, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
      { label: 'Tính toán:', value: calculationVal, labelStyle: 'color: #cbd5e1;', valueStyle: 'font-family: monospace; color: #cbd5e1;' },
      { label: calcLabel, value: l.toFixed(2) + ' m', labelStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; font-size: 0.95rem; background: rgba(52, 211, 153, 0.15); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
    ]);
  } else {
    showReadouts([
      { label: 'Bán kính R:', value: R.toFixed(2) + ' m', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
      { label: 'Số đo góc α:', value: parseFloat(deg.toFixed(2)) + '° (' + radText + ' rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
      { label: 'Công thức l:', value: 'l = R × α', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
      { label: 'Tính toán:', value: R.toFixed(2) + ' × ' + rad.toFixed(2) + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'font-family: monospace; color: #cbd5e1;' },
      { label: 'Độ dài cung l:', value: l.toFixed(2) + ' m', labelStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; font-size: 0.85rem; background: rgba(52, 211, 153, 0.15); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
    ]);
  }

  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.6, 4.4, -2.4],
          showAxis: false,
          showGrid: false,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'R', label: 'Bán kính R', min: 0.8, max: 1.2, step: 0.01, defaultValue: 1.0 },
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt', 'Bánh xe lăn trên đường', 'Xe đạp chạy trên đường'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 90, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'rollAngle', label: 'Góc quay (độ)', min: 0, max: 720, step: 5, defaultValue: 90, showIf: { control: 'mode', value: ['Bánh xe lăn trên đường', 'Xe đạp chạy trên đường'] } },
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
      },// Demo 2.4: Bảng dấu & Giá trị Lượng giác (Toán 11)
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

  // Special axis boundary points with wider offsets to prevent overlapping with axes
  board.create('point', [1, 0], {
    name: math("A(1;0)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [15, -15] }
  });
  board.create('point', [-1, 0], {
    name: math("A'(-1;0)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [-75, -15] }
  });
  board.create('point', [0, 1], {
    name: math('B(0;1)'),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [12, 18] }
  });
  board.create('point', [0, -1], {
    name: math("B'(0;-1)"),
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [12, -20] }
  });

  // Dynamic label for current Quadrant - positioned at the bottom-left to prevent overlap with top controls panel
  board.quadText = board.create('text', [-1.9, -1.5, function() {
    var mode = window.currentParams?.mode || 'Kéo tự do';
    var deg = 45;
    if (mode === 'Kéo tự do') {
      deg = window.currentParams?.angle !== undefined ? window.currentParams.angle : 45;
    } else if (mode === 'Góc độ đặc biệt') {
      var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
      var idx = window.currentParams?.specialDeg !== undefined ? Math.round(window.currentParams.specialDeg) : 2;
      deg = specialDegVals[idx] || 0;
    } else if (mode === 'Góc radian đặc biệt') {
      var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
      var idx = window.currentParams?.specialRad !== undefined ? Math.round(window.currentParams.specialRad) : 2;
      deg = specialDegVals[idx] || 0;
    }
    var normDeg = ((deg % 360) + 360) % 360;
    if (normDeg > 0 && normDeg < 90) return 'Góc phần tư I';
    if (normDeg > 90 && normDeg < 180) return 'Góc phần tư II';
    if (normDeg > 180 && normDeg < 270) return 'Góc phần tư III';
    if (normDeg > 270 && normDeg < 360) return 'Góc phần tư IV';
    return 'Nằm trên trục';
  }], {
    display: 'html',
    cssStyle: 'font-weight: 800; font-size: 13px; color: #4f46e5; background: rgba(255, 255, 255, 0.9); border: 1.5px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: Inter, sans-serif;'
  });

  // Label Axis names
  board.create('text', [1.8, 0.1, math('\\text{trục cos}')], { display: 'html', fontSize: 13, color: '#059669' });
  board.create('text', [0.08, 1.8, math('\\text{trục sin}')], { display: 'html', fontSize: 13, color: '#e11d48' });

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

  // Create native sliders inside SVG
  board.sliderAngle = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.angle !== undefined ? params.angle : 45, 360, 'Góc', 5, '#fb923c');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.specialDeg !== undefined ? params.specialDeg : 2, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.specialRad !== undefined ? params.specialRad : 2, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;
  var idx = 2;

  board.sliderAngle.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });
  
  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) board.sliderAngle.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecDeg && !board.sliderSpecDeg.isDragging && Math.abs(board.sliderSpecDeg.Value() - idx) > 1e-4) board.sliderSpecDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecRad && !board.sliderSpecRad.isDragging && Math.abs(board.sliderSpecRad.Value() - idx) > 1e-4) board.sliderSpecRad.setValue(idx);
  }
  var angle = deg * Math.PI / 180;

  var px = Math.cos(angle);
  var py = Math.sin(angle);

  if (board.P && !board.P.isDragging) {
    board.P.setPosition(JXG.COORDS_BY_USER, [px, py]);
  }
  board.H.setPosition(JXG.COORDS_BY_USER, [board.P.X(), 0]);
  board.K.setPosition(JXG.COORDS_BY_USER, [0, board.P.Y()]);

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

  var sinValStr = py.toFixed(2) + ' &nbsp; ' + getSignHtml(py);
  var cosValStr = px.toFixed(2) + ' &nbsp; ' + getSignHtml(px);
  var tanValStr = showTan ? tanVal.toFixed(2) + ' &nbsp; ' + getSignHtml(tanVal) : getSignHtml(null);
  var cotValStr = showCot ? cotVal.toFixed(2) + ' &nbsp; ' + getSignHtml(cotVal) : getSignHtml(null);

  showReadouts([
    { label: 'Góc α:', value: parseFloat(deg.toFixed(2)) + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
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
      },// Demo 2.5: Góc liên quan đặc biệt (Toán 11)
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

  // Create native sliders inside SVG
  board.sliderAngle = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.angle !== undefined ? params.angle : 45, 360, 'Góc', 5, '#fb923c');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialDeg !== undefined ? params.specialDeg : 2, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialRad !== undefined ? params.specialRad : 2, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var relation = params.relation || 'Góc đối nhau (α và -α)';
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;
  var idx = 2;
  
  board.sliderAngle.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });

  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) board.sliderAngle.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecDeg && !board.sliderSpecDeg.isDragging && Math.abs(board.sliderSpecDeg.Value() - idx) > 1e-4) board.sliderSpecDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecRad && !board.sliderSpecRad.isDragging && Math.abs(board.sliderSpecRad.Value() - idx) > 1e-4) board.sliderSpecRad.setValue(idx);
  }

  var angle = deg * Math.PI / 180;
  var mx = Math.cos(angle);
  var my = Math.sin(angle);
  if (board.M && !board.M.isDragging) {
    board.M.setPosition(JXG.COORDS_BY_USER, [mx, my]);
  }

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
    var num = Math.round(symFrac * 6);
    var den = 6;
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
    { label: 'Góc ban đầu α:', value: parseFloat(deg.toFixed(2)) + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
    { label: 'Mối liên hệ:', value: relationLabel, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-weight: bold; background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px;' },
    { label: 'Góc liên kết β:', value: parseFloat(symDeg.toFixed(2)) + '° (' + symRadText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
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
      },
      // Demo 2.6: Công thức cộng lượng giác (Toán 11 - Bài 2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Công thức cộng lượng giác',
        description: 'Trực quan hóa công thức cộng lượng giác cho sin(a±b), cos(a±b), tan(a±b). Kéo thanh trượt thay đổi góc a, b để so sánh hai vế của công thức.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
  
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8', strokeWidth: 2, highlight: false, fixed: true
  });
  
  board.O = board.create('point', [0, 0], {
    name: math('O'), size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });
  
  board.sliderA = createCustomSlider(board, [-1.5, -1.3], [1.5, -1.3], 0, params.a !== undefined ? params.a : 60, 360, 'Góc a', 5, '#fb923c');
  board.sliderB = createCustomSlider(board, [-1.5, -1.6], [1.5, -1.6], 0, params.b !== undefined ? params.b : 45, 360, 'Góc b', 5, '#10b981');
  
  board.U = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(a); }
  ], {
    name: math('U(a)'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.V = board.create('point', [
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.cos(b); },
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.sin(b); }
  ], {
    name: math('V(b)'), size: 4, fillColor: '#10b981', strokeColor: '#059669', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.W = board.create('point', [
    function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      var target = mode.includes('+') ? (a + b) : (a - b);
      return Math.cos(target);
    },
    function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      var target = mode.includes('+') ? (a + b) : (a - b);
      return Math.sin(target);
    }
  ], {
    name: function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      return math(mode.includes('+') ? 'W(a+b)' : 'W(a-b)');
    }, size: 5, fillColor: '#c084fc', strokeColor: '#a855f7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.create('segment', [board.O, board.U], { strokeColor: '#fb923c', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.V], { strokeColor: '#10b981', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.W], { strokeColor: '#c084fc', strokeWidth: 2, dash: 2 });
  
  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos(a-b)';
  var aDeg = params.a !== undefined ? params.a : 60;
  var bDeg = params.b !== undefined ? params.b : 45;
  
  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - aDeg) > 1e-4) board.sliderA.setValue(aDeg);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - bDeg) > 1e-4) board.sliderB.setValue(bDeg);
  
  var a = aDeg * Math.PI / 180;
  var b = bDeg * Math.PI / 180;
  
  var valLHS = 0;
  var valRHS = 0;
  var formulaLHS = '';
  var formulaRHS = '';
  
  if (mode === 'cos(a-b)') {
    valLHS = Math.cos(a - b);
    valRHS = Math.cos(a)*Math.cos(b) + Math.sin(a)*Math.sin(b);
    formulaLHS = 'cos(a - b)';
    formulaRHS = 'cos a cos b + sin a sin b';
  } else if (mode === 'cos(a+b)') {
    valLHS = Math.cos(a + b);
    valRHS = Math.cos(a)*Math.cos(b) - Math.sin(a)*Math.sin(b);
    formulaLHS = 'cos(a + b)';
    formulaRHS = 'cos a cos b - sin a sin b';
  } else if (mode === 'sin(a-b)') {
    valLHS = Math.sin(a - b);
    valRHS = Math.sin(a)*Math.cos(b) - Math.cos(a)*Math.sin(b);
    formulaLHS = 'sin(a - b)';
    formulaRHS = 'sin a cos b - cos a sin b';
  } else if (mode === 'sin(a+b)') {
    valLHS = Math.sin(a + b);
    valRHS = Math.sin(a)*Math.cos(b) + Math.cos(a)*Math.sin(b);
    formulaLHS = 'sin(a + b)';
    formulaRHS = 'sin a cos b + cos a sin b';
  }
  
  showReadouts([
    { label: 'Góc a:', value: parseFloat(aDeg.toFixed(2)) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc b:', value: parseFloat(bDeg.toFixed(2)) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
    { label: 'Công thức:', value: formulaLHS + ' = ' + formulaRHS, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-style: italic;' },
    { label: 'Vế trái (LHS):', value: valLHS.toFixed(2), labelStyle: 'color: #c084fc;', valueStyle: 'color: #a855f7; font-weight: bold;' },
    { label: 'Vế phải (RHS):', value: valRHS.toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 2.2, 1.8, -1.3],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Công thức cộng', defaultValue: 'cos(a-b)', options: ['cos(a-b)', 'cos(a+b)', 'sin(a-b)', 'sin(a+b)'] },
          { type: 'slider', name: 'a', label: 'Góc a (độ)', min: 0, max: 360, step: 5, defaultValue: 60 },
          { type: 'slider', name: 'b', label: 'Góc b (độ)', min: 0, max: 360, step: 5, defaultValue: 45 },
        ],
        mathContent: '\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b \\quad \\text{và} \\quad \\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b',
        explanation: 'Công thức cộng lượng giác cho phép biến đổi các hàm lượng giác của tổng/hiệu thành tích và tổng của các góc thành phần. Đây là nền tảng để suy ra tất cả các nhóm công thức lượng giác khác.',
        keyInsights: [
          '📖 Thơ học công thức cộng dễ thuộc:',
          'Cos thì cos cos sin sin, coi chừng trái dấu: \\\\cos(a \\\\pm b) = \\\\cos a \\\\cos b \\\\mp \\\\sin a \\\\sin b',
          'Sin thì sin cos cos sin, cùng dấu vững tin: \\\\sin(a \\\\pm b) = \\\\sin a \\\\cos b \\\\pm \\\\cos a \\\\sin b',
          'Tan thì tan nọ tan kia, thương sầu cộng lại chia một trừ tích tan: \\\\tan(a \\\\pm b) = \\\\frac{\\\\tan a \\\\pm \\\\tan b}{1 \\\\mp \\\\tan a \\\\tan b}'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'công thức cộng', 'toán 11'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 2.7: Công thức nhân đôi và hạ bậc (Toán 11 - Bài 2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Công thức nhân đôi và hạ bậc',
        description: 'Khám phá mối quan hệ hình học giữa giá trị lượng giác của góc a và góc nhân đôi 2a. Thực hành tính toán và quan sát công thức hạ bậc tương ứng.',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
  
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8', strokeWidth: 2, highlight: false, fixed: true
  });
  
  board.O = board.create('point', [0, 0], {
    name: math('O'), size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });
  
  board.sliderA = createCustomSlider(board, [-1.5, -1.45], [1.5, -1.45], 0, params.a !== undefined ? params.a : 30, 360, 'Góc a', 5, '#fb923c');
  
  board.M = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(a); }
  ], {
    name: math('M(a)'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.N = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(2 * a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(2 * a); }
  ], {
    name: math('N(2a)'), size: 5, fillColor: '#c084fc', strokeColor: '#a855f7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.create('segment', [board.O, board.M], { strokeColor: '#fb923c', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.N], { strokeColor: '#c084fc', strokeWidth: 2 });
  
  board.arcStart = board.create('point', [0.25, 0], { visible: false });
  board.arcEndM = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.25 * Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.25 * Math.sin(a); }
  ], { visible: false });
  board.arcEndN = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.cos(2 * a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.sin(2 * a); }
  ], { visible: false });
  
  board.create('arc', [board.O, board.arcStart, board.arcEndM], { strokeColor: '#fb923c', strokeWidth: 1.5, withLabel: false });
  board.create('arc', [board.O, board.arcStart, board.arcEndN], { strokeColor: '#c084fc', strokeWidth: 2, withLabel: false });
  
  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var aDeg = params.a !== undefined ? params.a : 30;
  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - aDeg) > 1e-4) board.sliderA.setValue(aDeg);
  
  var a = aDeg * Math.PI / 180;
  var sinA = Math.sin(a);
  var cosA = Math.cos(a);
  var sin2A = Math.sin(2 * a);
  var cos2A = Math.cos(2 * a);
  
  showReadouts([
    { label: 'Góc a:', value: parseFloat(aDeg.toFixed(2)) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc nhân đôi 2a:', value: parseFloat((2 * aDeg).toFixed(2)) + '°', labelStyle: 'color: #e9d5ff;', valueStyle: 'color: #c084fc; font-weight: bold;' },
    { label: 'sin 2a = 2 sin a cos a:', value: sin2A.toFixed(2) + ' &nbsp;|&nbsp; 2 × ' + sinA.toFixed(2) + ' × ' + cosA.toFixed(2) + ' = ' + (2 * sinA * cosA).toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' },
    { label: 'cos 2a = cos²a - sin²a:', value: cos2A.toFixed(2) + ' &nbsp;|&nbsp; ' + (cosA*cosA).toFixed(2) + ' - ' + (sinA*sinA).toFixed(2) + ' = ' + (cosA*cosA - sinA*sinA).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold;' },
    { label: 'Hạ bậc sin²a = (1-cos 2a)/2:', value: (sinA*sinA).toFixed(2) + ' &nbsp;|&nbsp; (1 - ' + cos2A.toFixed(2) + ')/2 = ' + ((1 - cos2A)/2).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' },
    { label: 'Hạ bậc cos²a = (1+cos 2a)/2:', value: (cosA*cosA).toFixed(2) + ' &nbsp;|&nbsp; (1 + ' + cos2A.toFixed(2) + ')/2 = ' + ((1 + cos2A)/2).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 2.2, 1.8, -1.3],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'a', label: 'Góc a (độ)', min: 0, max: 360, step: 5, defaultValue: 30 },
        ],
        mathContent: '\\sin 2a = 2\\sin a\\cos a \\quad \\text{và} \\quad \\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a',
        explanation: 'Công thức nhân đôi là trường hợp đặc biệt của công thức cộng khi hai góc bằng nhau (a = b). Từ công thức nhân đôi, ta cũng có thể suy ngược ra công thức hạ bậc để giảm lũy thừa của sin và cos.',
        keyInsights: [
          '📖 Thơ học công thức nhân đôi dễ thuộc:',
          'Sin gấp đôi bằng hai lần sin cos: \\\\sin 2a = 2\\\\sin a\\\\cos a',
          'Cos gấp đôi bằng cos bình trừ sin bình: \\\\cos 2a = \\\\cos^2 a - \\\\sin^2 a = 2\\\\cos^2 a - 1 = 1 - 2\\\\sin^2 a',
          'Từ cos 2a suy ra công thức hạ bậc rất quan trọng khi giải toán tích phân và lượng giác.'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'nhân đôi', 'hạ bậc', 'toán 11'],
        difficulty: 'basic',
        isPublished: true,
      },
      // Demo 2.8: Biến đổi tích thành tổng (Toán 11 - Bài 2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Biến đổi tích thành tổng',
        description: 'Trực quan hóa công thức biến đổi tích thành tổng của các cặp giá trị lượng giác. Kéo thanh trượt để thay đổi hai góc a, b và kiểm chứng kết quả.',
        order: 3,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
  
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8', strokeWidth: 2, highlight: false, fixed: true
  });
  
  board.O = board.create('point', [0, 0], {
    name: math('O'), size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });
  
  board.sliderA = createCustomSlider(board, [-1.5, -1.3], [1.5, -1.3], 0, params.a !== undefined ? params.a : 50, 360, 'Góc a', 5, '#fb923c');
  board.sliderB = createCustomSlider(board, [-1.5, -1.6], [1.5, -1.6], 0, params.b !== undefined ? params.b : 20, 360, 'Góc b', 5, '#10b981');
  
  board.U = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(a); }
  ], {
    name: math('U(a)'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.V = board.create('point', [
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.cos(b); },
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.sin(b); }
  ], {
    name: math('V(b)'), size: 4, fillColor: '#10b981', strokeColor: '#059669', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.create('segment', [board.O, board.U], { strokeColor: '#fb923c', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.V], { strokeColor: '#10b981', strokeWidth: 1.5 });
  
  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos a cos b';
  var aDeg = params.a !== undefined ? params.a : 50;
  var bDeg = params.b !== undefined ? params.b : 20;
  
  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - aDeg) > 1e-4) board.sliderA.setValue(aDeg);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - bDeg) > 1e-4) board.sliderB.setValue(bDeg);
  
  var a = aDeg * Math.PI / 180;
  var b = bDeg * Math.PI / 180;
  
  var valLHS = 0;
  var valRHS = 0;
  var formulaLHS = '';
  var formulaRHS = '';
  
  if (mode === 'cos a cos b') {
    valLHS = Math.cos(a) * Math.cos(b);
    valRHS = 0.5 * (Math.cos(a - b) + Math.cos(a + b));
    formulaLHS = 'cos a × cos b';
    formulaRHS = '0.5 × [cos(a - b) + cos(a + b)]';
  } else if (mode === 'sin a sin b') {
    valLHS = Math.sin(a) * Math.sin(b);
    valRHS = 0.5 * (Math.cos(a - b) - Math.cos(a + b));
    formulaLHS = 'sin a × sin b';
    formulaRHS = '0.5 × [cos(a - b) - cos(a + b)]';
  } else if (mode === 'sin a cos b') {
    valLHS = Math.sin(a) * Math.cos(b);
    valRHS = 0.5 * (Math.sin(a + b) + Math.sin(a - b));
    formulaLHS = 'sin a × cos b';
    formulaRHS = '0.5 × [sin(a + b) + sin(a - b)]';
  }
  
  showReadouts([
    { label: 'Góc a:', value: parseFloat(aDeg.toFixed(2)) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc b:', value: parseFloat(bDeg.toFixed(2)) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
    { label: 'Nhóm công thức:', value: formulaLHS + ' = ' + formulaRHS, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
    { label: 'Vế tích (LHS):', value: valLHS.toFixed(2), labelStyle: 'color: #fb923c;', valueStyle: 'color: #f97316; font-weight: bold;' },
    { label: 'Vế tổng (RHS):', value: valRHS.toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 2.2, 1.8, -1.3],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Tích thành tổng', defaultValue: 'cos a cos b', options: ['cos a cos b', 'sin a sin b', 'sin a cos b'] },
          { type: 'slider', name: 'a', label: 'Góc a (độ)', min: 0, max: 360, step: 5, defaultValue: 50 },
          { type: 'slider', name: 'b', label: 'Góc b (độ)', min: 0, max: 360, step: 5, defaultValue: 20 },
        ],
        mathContent: '\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b) + \\cos(a+b)] \\quad \\text{và} \\quad \\sin a\\sin b = \\frac{1}{2}[\\cos(a-b) - \\cos(a+b)]',
        explanation: 'Công thức biến đổi tích thành tổng giúp phân tách tích của hai hàm số lượng giác thành tổng/hiệu. Điều này đặc biệt có ích trong tích phân và các bài toán biến đổi dao động.',
        keyInsights: [
          '📖 Thơ học tích thành tổng dễ thuộc:',
          'Cos cos bằng nửa cos tổng cộng cos hiệu: \\\\cos a\\\\cos b = \\\\frac{1}{2}[\\\\cos(a+b) + \\\\cos(a-b)]',
          'Sin sin bằng nửa cos hiệu trừ cos tổng: \\\\sin a\\\\sin b = \\\\frac{1}{2}[\\\\cos(a-b) - \\\\cos(a+b)]',
          'Sin cos bằng nửa sin tổng cộng sin hiệu: \\\\sin a\\\\cos b = \\\\frac{1}{2}[\\\\sin(a+b) + \\\\sin(a-b)]'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'tích thành tổng', 'toán 11'],
        difficulty: 'intermediate',
        isPublished: true,
      },
      // Demo 2.9: Biến đổi tổng thành tích (Toán 11 - Bài 2)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Biến đổi tổng thành tích',
        description: 'Trực quan hình học chứng minh công thức biến đổi tổng/hiệu lượng giác thành tích thông qua phép cộng vectơ và trung điểm dây cung.',
        order: 4,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Axis labels
  board.create('text', [1.75, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.75, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
  
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#cbd5e1', strokeWidth: 1.5, highlight: false, fixed: true
  });
  
  board.O = board.create('point', [0, 0], {
    name: math('O'), size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });
  
  board.sliderU = createCustomSlider(board, [-1.8, -1.3], [1.8, -1.3], 0, params.u !== undefined ? params.u : 70, 360, 'Góc u', 5, '#fb923c');
  board.sliderV = createCustomSlider(board, [-1.8, -1.6], [1.8, -1.6], 0, params.v !== undefined ? params.v : 10, 360, 'Góc v', 5, '#10b981');
  
  board.U = board.create('point', [
    function() { var u = board.sliderU.Value() * Math.PI / 180; return Math.cos(u); },
    function() { var u = board.sliderU.Value() * Math.PI / 180; return Math.sin(u); }
  ], {
    name: math('U(u)'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.V = board.create('point', [
    function() { var v = board.sliderV.Value() * Math.PI / 180; return Math.cos(v); },
    function() { var v = board.sliderV.Value() * Math.PI / 180; return Math.sin(v); }
  ], {
    name: math('V(v)'), size: 4, fillColor: '#10b981', strokeColor: '#059669', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.chord = board.create('segment', [board.U, board.V], { strokeColor: '#94a3b8', strokeWidth: 1.5, dash: 2 });
  
  board.M = board.create('midpoint', [board.chord], {
    name: math('M'), size: 4, fillColor: '#38bdf8', strokeColor: '#0284c7',
    label: { display: 'html', fontSize: 13, offset: [10, -10] }
  });
  
  board.S = board.create('point', [
    function() { return board.U.X() + board.V.X(); },
    function() { return board.U.Y() + board.V.Y(); }
  ], {
    name: math('S(u+v)'), size: 5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [12, 12] }
  });
  
  board.create('segment', [board.U, board.S], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 1 });
  board.create('segment', [board.V, board.S], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 1 });
  board.create('segment', [board.O, board.S], { strokeColor: '#ef4444', strokeWidth: 2.5 });
  board.create('segment', [board.O, board.M], { strokeColor: '#0ea5e9', strokeWidth: 2, dash: 2 });
  
  board.sliderU.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'u', value: board.sliderU.Value() }, '*'); });
  board.sliderV.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'v', value: board.sliderV.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos u + cos v';
  var uDeg = params.u !== undefined ? params.u : 70;
  var vDeg = params.v !== undefined ? params.v : 10;
  
  if (board.sliderU && !board.sliderU.isDragging && Math.abs(board.sliderU.Value() - uDeg) > 1e-4) board.sliderU.setValue(uDeg);
  if (board.sliderV && !board.sliderV.isDragging && Math.abs(board.sliderV.Value() - vDeg) > 1e-4) board.sliderV.setValue(vDeg);
  
  var u = uDeg * Math.PI / 180;
  var v = vDeg * Math.PI / 180;
  
  var valLHS = 0;
  var valRHS = 0;
  var formulaLHS = '';
  var formulaRHS = '';
  
  if (mode === 'cos u + cos v') {
    valLHS = Math.cos(u) + Math.cos(v);
    valRHS = 2 * Math.cos((u + v)/2) * Math.cos((u - v)/2);
    formulaLHS = 'cos u + cos v';
    formulaRHS = '2 cos((u+v)/2) cos((u-v)/2)';
  } else if (mode === 'cos u - cos v') {
    valLHS = Math.cos(u) - Math.cos(v);
    valRHS = -2 * Math.sin((u + v)/2) * Math.sin((u - v)/2);
    formulaLHS = 'cos u - cos v';
    formulaRHS = '-2 sin((u+v)/2) sin((u-v)/2)';
  } else if (mode === 'sin u + sin v') {
    valLHS = Math.sin(u) + Math.sin(v);
    valRHS = 2 * Math.sin((u + v)/2) * Math.cos((u - v)/2);
    formulaLHS = 'sin u + sin v';
    formulaRHS = '2 sin((u+v)/2) cos((u-v)/2)';
  } else if (mode === 'sin u - sin v') {
    valLHS = Math.sin(u) - Math.sin(v);
    valRHS = 2 * Math.cos((u + v)/2) * Math.sin((u - v)/2);
    formulaLHS = 'sin u - sin v';
    formulaRHS = '2 cos((u+v)/2) sin((u-v)/2)';
  }
  
  var avgDeg = (uDeg + vDeg) / 2;
  var diffDeg = (uDeg - vDeg) / 2;
  
  showReadouts([
    { label: 'Góc u:', value: parseFloat(uDeg.toFixed(2)) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc v:', value: parseFloat(vDeg.toFixed(2)) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
    { label: 'Góc trung bình (u+v)/2:', value: parseFloat(avgDeg.toFixed(2)) + '°', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
    { label: 'Góc bán hiệu (u-v)/2:', value: parseFloat(diffDeg.toFixed(2)) + '°', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
    { label: 'Công thức:', value: formulaLHS + ' = ' + formulaRHS, labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #f8fafc; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px; font-style: italic;' },
    { label: 'Vế tổng (LHS):', value: valLHS.toFixed(2), labelStyle: 'color: #ef4444;', valueStyle: 'color: #f87171; font-weight: bold;' },
    { label: 'Vế tích (RHS):', value: valRHS.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px;' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-2.1, 2.3, 2.1, -1.4],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Tổng thành tích', defaultValue: 'cos u + cos v', options: ['cos u + cos v', 'cos u - cos v', 'sin u + sin v', 'sin u - sin v'] },
          { type: 'slider', name: 'u', label: 'Góc u (độ)', min: 0, max: 360, step: 5, defaultValue: 70 },
          { type: 'slider', name: 'v', label: 'Góc v (độ)', min: 0, max: 360, step: 5, defaultValue: 10 },
        ],
        mathContent: '\\cos u + \\cos v = 2\\cos\\frac{u+v}{2}\\cos\\frac{u-v}{2} \\quad \\text{và} \\quad \\sin u + \\sin v = 2\\sin\\frac{u+v}{2}\\cos\\frac{u-v}{2}',
        explanation: 'Phép cộng lượng giác tương đương với phép tổng hợp dao động hoặc tổng vectơ. Bằng hình học, ta thấy vectơ tổng O->S luôn có cùng hướng với góc trung bình (u+v)/2 và có chiều dài gấp 2*cos((u-v)/2) lần bán kính.',
        keyInsights: [
          '📖 Thơ học tổng thành tích dễ thuộc:',
          'Cos cộng cos bằng hai cos cos: \\\\cos u + \\\\cos v = 2\\\\cos\\\\frac{u+v}{2}\\\\cos\\\\frac{u-v}{2}',
          'Cos trừ cos bằng trừ hai sin sin: \\\\cos u - \\\\cos v = -2\\\\sin\\\\frac{u+v}{2}\\\\sin\\\\frac{u-v}{2}',
          'Sin cộng sin bằng hai sin cos: \\\\sin u + \\\\sin v = 2\\\\sin\\\\frac{u+v}{2}\\\\cos\\\\frac{u-v}{2}',
          'Sin trừ sin bằng hai cos sin: \\\\sin u - \\\\sin v = 2\\\\cos\\\\frac{u+v}{2}\\\\sin\\\\frac{u-v}{2}'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'tổng thành tích', 'toán 11'],
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
  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : -3;
  board.d = params.d !== undefined ? params.d : 0;

  // Create native sliders inside SVG
  board.sliderA = createCustomSlider(board, [-5.0, -5.0], [-2.8, -5.0], -2, board.a, 2, 'a', 0.1, '#6366f1');
  board.sliderB = createCustomSlider(board, [-2.2, -5.0], [0.0, -5.0], -5, board.b, 5, 'b', 0.5, '#fb923c');
  board.sliderC = createCustomSlider(board, [0.6, -5.0], [2.8, -5.0], -5, board.c, 5, 'c', 0.5, '#c084fc');
  board.sliderD = createCustomSlider(board, [3.4, -5.0], [5.6, -5.0], -5, board.d, 5, 'd', 0.5, '#10b981');

  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  board.sliderC.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'c', value: board.sliderC.Value() }, '*'); });
  board.sliderD.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'd', value: board.sliderD.Value() }, '*'); });

  // f(x) = ax³ + bx² + cx + d
  var f = function(x) { return board.a*x*x*x + board.b*x*x + board.c*x + board.d; };
  // f'(x) = 3ax² + 2bx + c
  var df = function(x) { return 3*board.a*x*x + 2*board.b*x + board.c; };

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

  // Critical points
  board.cp1 = board.create('point', [0, 0], {
    name: 'CĐ/CT',
    size: 5,
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    visible: false,
    label: { fontSize: 12, offset: [10, 10] }
  });

  board.cp2 = board.create('point', [0, 0], {
    name: 'CĐ/CT',
    size: 5,
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    visible: false,
    label: { fontSize: 12, offset: [10, -15] }
  });

  // Inflection point
  board.inflection = board.create('point', [0, 0], {
    name: 'Uốn',
    size: 4,
    fillColor: '#22c55e',
    strokeColor: '#16a34a',
    visible: false,
    label: { fontSize: 12, offset: [-30, 10] }
  });

  board.on('update', function() {
    var a = board.a, b = board.b, c = board.c, d = board.d;
    if (a !== 0) {
      var disc = 4*b*b - 12*a*c;
      if (disc > 0) {
        var x1 = (-2*b - Math.sqrt(disc)) / (6*a);
        var x2 = (-2*b + Math.sqrt(disc)) / (6*a);
        board.cp1.setPosition(JXG.COORDS_BY_USER, [x1, f(x1)]);
        board.cp1.setAttribute({ visible: true });
        board.cp2.setPosition(JXG.COORDS_BY_USER, [x2, f(x2)]);
        board.cp2.setAttribute({ visible: true });
      } else {
        board.cp1.setAttribute({ visible: false });
        board.cp2.setAttribute({ visible: false });
      }
      var xI = -b / (3*a);
      board.inflection.setPosition(JXG.COORDS_BY_USER, [xI, f(xI)]);
      board.inflection.setAttribute({ visible: true });
    } else {
      board.cp1.setAttribute({ visible: false });
      board.cp2.setAttribute({ visible: false });
      board.inflection.setAttribute({ visible: false });
    }
  });

  // Legend
  board.create('text', [-5.5, 5.5, 'f(x) — nét liền'], { fontSize: 12, color: '#6366f1' });
  board.create('text', [-5.5, 5.0, "f'(x) — nét đứt"], { fontSize: 12, color: '#f59e0b' });

  board.unsuspendUpdate();
}

function updateSimulation(board, params) {
  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : -3;
  board.d = params.d !== undefined ? params.d : 0;

  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - board.a) > 1e-4) board.sliderA.setValue(board.a);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - board.b) > 1e-4) board.sliderB.setValue(board.b);
  if (board.sliderC && !board.sliderC.isDragging && Math.abs(board.sliderC.Value() - board.c) > 1e-4) board.sliderC.setValue(board.c);
  if (board.sliderD && !board.sliderD.isDragging && Math.abs(board.sliderD.Value() - board.d) > 1e-4) board.sliderD.setValue(board.d);
}
`,
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
