export const demo1 = {
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
  board.titleText = board.create('text', [-5.5, 5.5, ''], { fontSize: 16, cssClass: 'sim-formula' });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.a = params.a !== undefined ? params.a : 1;
  board.b = params.b !== undefined ? params.b : 0;
  board.c = params.c !== undefined ? params.c : 0;

  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - board.a) > 1e-4) board.sliderA.setValue(board.a);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - board.b) > 1e-4) board.sliderB.setValue(board.b);
  if (board.sliderC && !board.sliderC.isDragging && Math.abs(board.sliderC.Value() - board.c) > 1e-4) board.sliderC.setValue(board.c);

  var a = board.a, b = board.b, c = board.c;
  var formulaStr = 'y = ' + (a >= 0 ? '' : '-') + (Math.abs(a) === 1 ? '' : Math.abs(a).toFixed(2))
    + 'x² ' + (b >= 0 ? '+ ' : '- ') + Math.abs(b).toFixed(2)
    + 'x ' + (c >= 0 ? '+ ' : '- ') + Math.abs(c).toFixed(2);
  if (board.titleText && board.titleText.text !== formulaStr) {
    board.titleText.setText(formulaStr);
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
      };
