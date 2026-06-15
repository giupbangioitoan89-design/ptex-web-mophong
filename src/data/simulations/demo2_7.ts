export const demo2_7 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Công thức nhân đôi và hạ bậc',
        description: 'Khám phá mối quan hệ hình học giữa giá trị lượng giác của góc a và góc nhân đôi 2a. Thực hành tính toán và quan sát công thức hạ bậc tương ứng.',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.currentMode = params.mode || 'sin 2a, cos 2a';

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
  
  board.create('segment', [board.O, board.M], {
    strokeColor: '#fb923c', strokeWidth: 1.5,
    visible: function() { return board.currentMode !== 'hạ bậc'; }
  });
  board.create('segment', [board.O, board.N], {
    strokeColor: '#c084fc', strokeWidth: 2,
    visible: function() { return board.currentMode !== 'hạ bậc'; }
  });
  
  board.arcStart = board.create('point', [0.25, 0], { visible: false });
  board.arcEndM = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.25 * Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.25 * Math.sin(a); }
  ], { visible: false });
  board.arcEndN = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.cos(2 * a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return 0.35 * Math.sin(2 * a); }
  ], { visible: false });
  
  board.create('arc', [board.O, board.arcStart, board.arcEndM], {
    strokeColor: '#fb923c', strokeWidth: 1.5, withLabel: false,
    visible: function() { return board.currentMode !== 'hạ bậc'; }
  });
  board.create('arc', [board.O, board.arcStart, board.arcEndN], {
    strokeColor: '#c084fc', strokeWidth: 2, withLabel: false,
    visible: function() { return board.currentMode !== 'hạ bậc'; }
  });

  // Mode 1: sin 2a, cos 2a projections
  board.Mx = board.create('point', [function() { return board.M.X(); }, 0], {
    name: math('cos\\\\,a'), size: 3, fillColor: '#fdba74', strokeColor: '#ea580c',
    label: { display: 'html', fontSize: 11, offset: [-15, -14] },
    visible: function() { return board.currentMode === 'sin 2a, cos 2a'; }
  });
  board.My = board.create('point', [0, function() { return board.M.Y(); }], {
    name: math('sin\\\\,a'), size: 3, fillColor: '#fdba74', strokeColor: '#ea580c',
    label: { display: 'html', fontSize: 11, offset: [-35, 5] },
    visible: function() { return board.currentMode === 'sin 2a, cos 2a'; }
  });
  board.Nx = board.create('point', [function() { return board.N.X(); }, 0], {
    name: math('cos\\\\,2a'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [-20, 12] },
    visible: function() { return board.currentMode === 'sin 2a, cos 2a' || board.currentMode === 'hạ bậc'; }
  });
  board.Ny = board.create('point', [0, function() { return board.N.Y(); }], {
    name: math('sin\\\\,2a'), size: 3, fillColor: '#e9d5ff', strokeColor: '#a855f7',
    label: { display: 'html', fontSize: 11, offset: [8, 5] },
    visible: function() { return board.currentMode === 'sin 2a, cos 2a'; }
  });

  // Dashed lines for projections
  board.create('segment', [board.M, board.Mx], { strokeColor: 'rgba(251, 146, 60, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin 2a, cos 2a'; } });
  board.create('segment', [board.M, board.My], { strokeColor: 'rgba(251, 146, 60, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin 2a, cos 2a'; } });
  board.create('segment', [board.N, board.Nx], { strokeColor: 'rgba(192, 132, 252, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin 2a, cos 2a' || board.currentMode === 'hạ bậc'; } });
  board.create('segment', [board.N, board.Ny], { strokeColor: 'rgba(192, 132, 252, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin 2a, cos 2a'; } });

  // Mode 2: tan 2a tangent line and points
  board.tangentLine = board.create('line', [[1, 0], [1, 1]], {
    strokeColor: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1, dash: 2,
    visible: function() { return board.currentMode === 'tan 2a'; }
  });
  
  board.Ta = board.create('point', [
    1,
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.tan(a); }
  ], {
    name: math('tan\\\\,a'), size: 4, fillColor: '#fdba74', strokeColor: '#ea580c',
    label: { display: 'html', fontSize: 11, offset: [8, 0] },
    visible: function() {
      if (board.currentMode !== 'tan 2a') return false;
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.abs(Math.tan(a)) < 2.5 && Math.cos(a) !== 0;
    }
  });
  
  board.T2a = board.create('point', [
    1,
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.tan(2 * a); }
  ], {
    name: math('tan\\\\,2a'), size: 5, fillColor: '#e9d5ff', strokeColor: '#a855f7',
    label: { display: 'html', fontSize: 11, offset: [8, 0] },
    visible: function() {
      if (board.currentMode !== 'tan 2a') return false;
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.abs(Math.tan(2 * a)) < 2.5 && Math.cos(2 * a) !== 0;
    }
  });

  // Rays to tangent points
  board.create('segment', [board.O, board.Ta], {
    strokeColor: 'rgba(251, 146, 60, 0.35)', strokeWidth: 1, dash: 2,
    visible: function() {
      if (board.currentMode !== 'tan 2a') return false;
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.abs(Math.tan(a)) < 2.5;
    }
  });
  board.create('segment', [board.O, board.T2a], {
    strokeColor: 'rgba(192, 132, 252, 0.35)', strokeWidth: 1, dash: 2,
    visible: function() {
      if (board.currentMode !== 'tan 2a') return false;
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.abs(Math.tan(2 * a)) < 2.5;
    }
  });

  // Mode 3: Hạ bậc (Reduction) points
  board.ptOne = board.create('point', [1, 0], {
    name: math('1'), size: 3, fillColor: '#cbd5e1', strokeColor: '#94a3b8',
    label: { display: 'html', fontSize: 11, offset: [5, -12] },
    visible: function() { return board.currentMode === 'hạ bậc'; }
  });

  // cos^2 a point (midpoint of Nx and ptOne)
  board.Csq = board.create('point', [
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.cos(a) * Math.cos(a);
    },
    0
  ], {
    name: math('cos^2\\\\,a'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c',
    label: { display: 'html', fontSize: 11, offset: [-20, -18] },
    visible: function() { return board.currentMode === 'hạ bậc'; }
  });

  // sin^2 a point on Y axis
  board.Ssq = board.create('point', [
    0,
    function() {
      var a = board.sliderA.Value() * Math.PI / 180;
      return Math.sin(a) * Math.sin(a);
    }
  ], {
    name: math('sin^2\\\\,a'), size: 4, fillColor: '#10b981', strokeColor: '#059669',
    label: { display: 'html', fontSize: 11, offset: [-38, -5] },
    visible: function() { return board.currentMode === 'hạ bậc'; }
  });

  // Highlight segment connecting Nx and ptOne to show 1 + cos 2a
  board.segHabaCos = board.create('segment', [board.Nx, board.ptOne], {
    strokeColor: '#3b82f6', strokeWidth: 2,
    visible: function() { return board.currentMode === 'hạ bậc'; }
  });

  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'sin 2a, cos 2a';
  board.currentMode = mode;
  var aDeg = params.a !== undefined ? params.a : 30;
  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - aDeg) > 1e-4) board.sliderA.setValue(aDeg);
  
  var a = aDeg * Math.PI / 180;
  var sinA = Math.sin(a);
  var cosA = Math.cos(a);
  var tanA = Math.tan(a);
  var sin2A = Math.sin(2 * a);
  var cos2A = Math.cos(2 * a);
  var tan2A = Math.tan(2 * a);
  
  if (mode === 'sin 2a, cos 2a') {
    showReadouts([
      { label: 'Góc a:', value: aDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
      { label: 'Góc nhân đôi 2a:', value: (2 * aDeg).toFixed(2) + '°', labelStyle: 'color: #e9d5ff;', valueStyle: 'color: #c084fc; font-weight: bold;' },
      { label: 'sin 2a = 2 sin a cos a:', value: sin2A.toFixed(2) + ' &nbsp;|&nbsp; 2 × ' + sinA.toFixed(2) + ' × ' + cosA.toFixed(2) + ' = ' + (2 * sinA * cosA).toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' },
      { label: 'cos 2a = cos²a - sin²a:', value: cos2A.toFixed(2) + ' &nbsp;|&nbsp; ' + (cosA*cosA).toFixed(2) + ' - ' + (sinA*sinA).toFixed(2) + ' = ' + (cosA*cosA - sinA*sinA).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold;' }
    ]);
  } else if (mode === 'tan 2a') {
    var tan2AVal = Math.cos(2*a) === 0 ? 'Không xác định' : tan2A.toFixed(2);
    var tanFormulaVal = Math.cos(2*a) === 0 ? 'Không xác định' : ((2 * tanA) / (1 - tanA * tanA)).toFixed(2);
    showReadouts([
      { label: 'Góc a:', value: aDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
      { label: 'Góc nhân đôi 2a:', value: (2 * aDeg).toFixed(2) + '°', labelStyle: 'color: #e9d5ff;', valueStyle: 'color: #c084fc; font-weight: bold;' },
      { label: 'tan a = sin a / cos a:', value: Math.cos(a) === 0 ? 'Không xác định' : tanA.toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #fdba74; font-weight: bold; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' },
      { label: 'tan 2a = 2 tan a / (1 - tan²a):', value: tan2AVal + ' &nbsp;|&nbsp; 2 × ' + (Math.cos(a) === 0 ? 'N/A' : tanA.toFixed(2)) + ' / (1 - ' + (Math.cos(a) === 0 ? 'N/A' : (tanA*tanA).toFixed(2)) + ') = ' + tanFormulaVal, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold;' }
    ]);
  } else if (mode === 'hạ bậc') {
    showReadouts([
      { label: 'Góc a:', value: aDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
      { label: 'Góc nhân đôi 2a:', value: (2 * aDeg).toFixed(2) + '°', labelStyle: 'color: #e9d5ff;', valueStyle: 'color: #c084fc; font-weight: bold;' },
      { label: 'sin²a = (1 - cos 2a)/2:', value: (sinA*sinA).toFixed(2) + ' &nbsp;|&nbsp; (1 - ' + cos2A.toFixed(2) + ')/2 = ' + ((1 - cos2A)/2).toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' },
      { label: 'cos²a = (1 + cos 2a)/2:', value: (cosA*cosA).toFixed(2) + ' &nbsp;|&nbsp; (1 + ' + cos2A.toFixed(2) + ')/2 = ' + ((1 + cos2A)/2).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
      { label: 'tan²a = (1 - cos 2a)/(1 + cos 2a):', value: Math.abs(cos2A + 1) < 1e-4 ? 'Không xác định' : (tanA*tanA).toFixed(2) + ' &nbsp;|&nbsp; (1 - ' + cos2A.toFixed(2) + ')/(1 + ' + cos2A.toFixed(2) + ') = ' + ((1 - cos2A)/(1 + cos2A)).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #c084fc; font-weight: bold;' }
    ]);
  }
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
          { type: 'select', name: 'mode', label: 'Công thức', defaultValue: 'sin 2a, cos 2a', options: ['sin 2a, cos 2a', 'tan 2a', 'hạ bậc'] },
          { type: 'slider', name: 'a', label: 'Góc a (độ)', min: 0, max: 360, step: 5, defaultValue: 30 },
        ],
        mathContent: '\\\\begin{aligned} \\\\sin 2a &= 2\\\\sin a\\\\cos a \\\\\\\\ \\\\cos 2a &= \\\\cos^2 a - \\\\sin^2 a = 2\\\\cos^2 a - 1 = 1 - 2\\\\sin^2 a \\\\\\\\ \\\\tan 2a &= \\\\frac{2\\\\tan a}{1-\\\\tan^2 a} \\\\end{aligned}',
        explanation: 'Công thức nhân đôi là trường hợp đặc biệt của công thức cộng khi a = b. Từ công thức nhân đôi, ta cũng suy ra công thức hạ bậc của sin²a, cos²a và tan²a giúp giảm bậc của các biểu thức lượng giác.',
        keyInsights: [
          '📖 Thơ học công thức nhân đôi dễ thuộc:',
          'Sin gấp đôi bằng hai lần sin cos: $$\\\\sin 2a = 2\\\\sin a\\\\cos a$$',
          'Cos gấp đôi bằng cos bình trừ sin bình: $$\\\\begin{aligned} \\\\cos 2a &= \\\\cos^2 a - \\\\sin^2 a \\\\\\\\ &= 2\\\\cos^2 a - 1 \\\\\\\\ &= 1 - 2\\\\sin^2 a \\\\end{aligned}$$',
          'Tan gấp đôi bằng hai tan chia một trừ tan bình: $$\\\\tan 2a = \\\\frac{2\\\\tan a}{1 - \\\\tan^2 a}$$',
          'Công thức hạ bậc (giảm bậc): $$\\\\begin{aligned} \\\\sin^2 a &= \\\\frac{1-\\\\cos 2a}{2} \\\\\\\\ \\\\cos^2 a &= \\\\frac{1+\\\\cos 2a}{2} \\\\\\\\ \\\\tan^2 a &= \\\\frac{1-\\\\cos 2a}{1+\\\\cos 2a} \\\\end{aligned}$$'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'nhân đôi', 'hạ bậc', 'toán 11'],
        difficulty: 'basic',
        isPublished: true,
      };
