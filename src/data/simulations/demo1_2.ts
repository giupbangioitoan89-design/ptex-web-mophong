export const demo1_2 = {
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
  board.intervalText = board.create('text', [-5.5, 5.0, ''], { fontSize: 14, cssClass: 'sim-formula', color: '#f59e0b' });

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
  updateSimulation(board, params);
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

  var a = board.a, b = board.b, x0 = board.x0;
  var targetText = '';
  if (a === 0) {
    targetText = "Hàm số bậc nhất";
  } else {
    var xV = -b / (2 * a);
    if (a > 0) {
      if (x0 < xV) {
        targetText = "x = " + x0.toFixed(2) + " < -b/2a: Nghịch biến (đi xuống)";
      } else {
        targetText = "x = " + x0.toFixed(2) + " > -b/2a: Đồng biến (đi lên)";
      }
    } else {
      if (x0 < xV) {
        targetText = "x = " + x0.toFixed(2) + " < -b/2a: Đồng biến (đi lên)";
      } else {
        targetText = "x = " + x0.toFixed(2) + " > -b/2a: Nghịch biến (đi xuống)";
      }
    }
  }
  if (board.intervalText && board.intervalText.text !== targetText) {
    board.intervalText.setText(targetText);
  }
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
      };
