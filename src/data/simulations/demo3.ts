export const demo3 = {
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
      };
