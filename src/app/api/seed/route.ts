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
      // Demo 2: Đường tròn lượng giác (Toán 11)
      {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Đường tròn lượng giác',
        description: 'Khám phá mối liên hệ giữa góc và giá trị sin, cos trên đường tròn đơn vị.',
        order: 1,
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
        explanation: 'Trên đường tròn đơn vị (bán kính = 1), điểm P ứng với góc α có tọa độ (cos α, sin α). Hình chiếu lên trục Ox cho cos, lên trục Oy cho sin.',
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
