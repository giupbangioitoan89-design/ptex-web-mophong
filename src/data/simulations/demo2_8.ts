export const demo2_8 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Biến đổi tích thành tổng',
        description: 'Trực quan hóa công thức biến đổi tích thành tổng của các cặp giá trị lượng giác. Kéo thanh trượt để thay đổi hai góc a, b và kiểm chứng kết quả.',
        order: 3,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.currentMode = params.mode || 'cos a cos b';

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
  
  // ptA: invisible point on the unit circle at angle a (direction of angle a)
  board.ptA = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(a); }
  ], { visible: false });

  // Dashed segment showing the direction of angle a
  board.create('segment', [board.O, board.ptA], { strokeColor: 'rgba(251, 146, 60, 0.4)', strokeWidth: 1.2, dash: 2 });

  // Arc for angle a
  board.arcStartA = board.create('point', [0.2, 0], { visible: false });
  board.arcEndA = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.2 * Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.2 * Math.sin(a); }
  ], { visible: false });
  board.arcA = board.create('arc', [board.O, board.arcStartA, board.arcEndA], {
    strokeColor: '#fb923c', strokeWidth: 1.5, fillOpacity: 0.12, fillColor: '#fb923c', withLabel: false
  });
  
  // Label for angle a
  board.lblAngleA = board.create('text', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.28 * Math.cos(a / 2); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.28 * Math.sin(a / 2); },
    math('a')
  ], { fontSize: 13, color: '#fb923c', fixed: true, anchorX: 'middle', anchorY: 'middle' });

  // Arc for angle b (offset from angle a to angle a+b)
  board.arcStartB = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.sin(a); }
  ], { visible: false });
  board.arcEndB = board.create('point', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return 0.35 * Math.cos(a + b);
    },
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return 0.35 * Math.sin(a + b);
    }
  ], { visible: false });
  board.arcB = board.create('arc', [board.O, board.arcStartB, board.arcEndB], {
    strokeColor: '#10b981', strokeWidth: 1.5, fillOpacity: 0.12, fillColor: '#10b981', withLabel: false
  });

  // Label for angle b
  board.lblAngleB = board.create('text', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return 0.43 * Math.cos(a + b / 2);
    },
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return 0.43 * Math.sin(a + b / 2);
    },
    math('b')
  ], { fontSize: 13, color: '#10b981', fixed: true, anchorX: 'middle', anchorY: 'middle' });

  // P(a+b)
  board.P = board.create('point', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return Math.cos(a + b);
    },
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return Math.sin(a + b);
    }
  ], {
    name: math('a+b'), size: 4, fillColor: '#c084fc', strokeColor: '#a855f7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });

  // Q(a-b)
  board.Q = board.create('point', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return Math.cos(a - b);
    },
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return Math.sin(a - b);
    }
  ], {
    name: math('a-b'), size: 4, fillColor: '#0ea5e9', strokeColor: '#0284c7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  // Segments from origin to P and Q
  board.create('segment', [board.O, board.P], { strokeColor: 'rgba(192, 132, 252, 0.4)', strokeWidth: 1.2 });
  board.create('segment', [board.O, board.Q], { strokeColor: 'rgba(14, 165, 233, 0.4)', strokeWidth: 1.2 });
  
  // Connecting chord PQ
  board.chordPQ = board.create('segment', [board.P, board.Q], {
    strokeColor: '#94a3b8', strokeWidth: 1, dash: 2,
    visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a cos b'; }
  });

  // Midpoint M (no name label for M to keep circle clean)
  board.M = board.create('midpoint', [board.chordPQ], {
    name: '', size: 4, fillColor: '#3b82f6', strokeColor: '#1d4ed8',
    visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a cos b'; }
  });

  // Projections on X-axis (for cos a cos b, sin a sin b)
  board.Px = board.create('point', [function() { return board.P.X(); }, 0], {
    name: math('cos(a+b)'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [-30, -18] },
    visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a sin b'; }
  });
  board.Qx = board.create('point', [function() { return board.Q.X(); }, 0], {
    name: math('cos(a-b)'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [-30, -18] },
    visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a sin b'; }
  });
  board.Mx = board.create('point', [function() { return board.M.X(); }, 0], {
    name: math('cos\\\\,a\\\\,cos\\\\,b'), size: 4, fillColor: '#3b82f6', strokeColor: '#1d4ed8',
    label: { display: 'html', fontSize: 11, offset: [-35, 12] },
    visible: function() { return board.currentMode === 'cos a cos b'; }
  });

  // Projection dashed lines for X-axis (super faint to prevent clutter)
  board.create('segment', [board.P, board.Px], { strokeColor: 'rgba(192, 132, 252, 0.18)', strokeWidth: 0.8, dash: 2, visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a sin b'; } });
  board.create('segment', [board.Q, board.Qx], { strokeColor: 'rgba(14, 165, 233, 0.18)', strokeWidth: 0.8, dash: 2, visible: function() { return board.currentMode === 'cos a cos b' || board.currentMode === 'sin a sin b'; } });
  board.create('segment', [board.M, board.Mx], { strokeColor: 'rgba(59, 130, 246, 0.45)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos a cos b'; } });

  // Projections on Y-axis (for sin a cos b)
  board.Py = board.create('point', [0, function() { return board.P.Y(); }], {
    name: math('sin(a+b)'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [-75, -5] },
    visible: function() { return board.currentMode === 'sin a cos b'; }
  });
  board.Qy = board.create('point', [0, function() { return board.Q.Y(); }], {
    name: math('sin(a-b)'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [-75, -5] },
    visible: function() { return board.currentMode === 'sin a cos b'; }
  });
  board.My = board.create('point', [0, function() { return board.M.Y(); }], {
    name: math('sin\\\\,a\\\\,cos\\\\,b'), size: 4, fillColor: '#3b82f6', strokeColor: '#1d4ed8',
    label: { display: 'html', fontSize: 11, offset: [8, 5] },
    visible: function() { return board.currentMode === 'sin a cos b'; }
  });

  // Projection dashed lines for Y-axis (super faint to prevent clutter)
  board.create('segment', [board.P, board.Py], { strokeColor: 'rgba(192, 132, 252, 0.18)', strokeWidth: 0.8, dash: 2, visible: function() { return board.currentMode === 'sin a cos b'; } });
  board.create('segment', [board.Q, board.Qy], { strokeColor: 'rgba(14, 165, 233, 0.18)', strokeWidth: 0.8, dash: 2, visible: function() { return board.currentMode === 'sin a cos b'; } });
  board.create('segment', [board.M, board.My], { strokeColor: 'rgba(59, 130, 246, 0.45)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin a cos b'; } });

  // Highlight segments on axes
  board.segOMx = board.create('segment', [board.O, board.Mx], {
    strokeColor: '#34d399', strokeWidth: 4,
    visible: function() { return board.currentMode === 'cos a cos b'; }
  });
  board.segOMy = board.create('segment', [board.O, board.My], {
    strokeColor: '#34d399', strokeWidth: 4,
    visible: function() { return board.currentMode === 'sin a cos b'; }
  });

  // For sin a sin b:
  board.segPxQx = board.create('segment', [board.Px, board.Qx], {
    strokeColor: '#ef4444', strokeWidth: 2,
    visible: function() { return board.currentMode === 'sin a sin b'; }
  });
  board.lblRedSeg = board.create('text', [
    function() { return (board.Px.X() + board.Qx.X()) / 2; },
    0.12,
    math('2\\\\sin\\\\,a\\\\,sin\\\\,b')
  ], {
    fontSize: 11, color: '#ef4444', fixed: true, anchorX: 'middle',
    visible: function() { return board.currentMode === 'sin a sin b'; }
  });
  board.S_val = board.create('point', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      return Math.sin(a) * Math.sin(b);
    },
    0
  ], {
    name: math('sin\\\\,a\\\\,sin\\\\,b'), size: 4, fillColor: '#10b981', strokeColor: '#059669',
    label: { display: 'html', fontSize: 11, offset: [-35, 12] },
    visible: function() { return board.currentMode === 'sin a sin b'; }
  });
  board.segOSval = board.create('segment', [board.O, board.S_val], {
    strokeColor: '#34d399', strokeWidth: 4,
    visible: function() { return board.currentMode === 'sin a sin b'; }
  });

  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos a cos b';
  board.currentMode = mode;
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
    { label: 'Góc a:', value: aDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc b:', value: bDeg.toFixed(2) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
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
        mathContent: '\\\\begin{aligned} \\\\cos a\\\\cos b &= \\\\frac{1}{2}[\\\\cos(a-b) + \\\\cos(a+b)] \\\\\\\\ \\\\sin a\\\\sin b &= \\\\frac{1}{2}[\\\\cos(a-b) - \\\\cos(a+b)] \\\\\\\\ \\\\sin a\\\\cos b &= \\\\frac{1}{2}[\\\\sin(a+b) + \\\\sin(a-b)] \\\\end{aligned}',
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
      };
