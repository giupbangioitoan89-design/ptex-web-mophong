export const demo2_10 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'ham-so-luong-giac',
  title: 'Khảo sát Hàm số lượng giác',
  description: 'Trực quan hóa đường tròn lượng giác bên cạnh đồ thị hệ trục tọa độ để giải thích tập xác định, tập giá trị, chu kỳ, tính chẵn lẻ và đồ thị của các hàm lượng giác.',
  order: 1,
  simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.right.suspendUpdate();

  // Left board (board) - Unit Circle
  board.C = board.create('point', [0, 0], { visible: false, fixed: true });
  board.unitCircle = board.create('circle', [board.C, 1.0], {
    strokeColor: '#2563eb', strokeWidth: 2.2, highlight: false, fixed: true
  });
  
  // Ticks/Axes on Left Board — compact for overlay
  board.circleXAxis = board.create('segment', [[-1.15, 0], [1.15, 0]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, vertices: { visible: false } });
  board.circleYAxis = board.create('segment', [[0, -1.15], [0, 1.15]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, vertices: { visible: false } });

  // No angle labels — too small in overlay mode

  // Moving point P
  board.P = board.create('point', [1, 0], {
    name: '', size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true, withLabel: false
  });
  board.P_ray = board.create('segment', [board.C, board.P], { strokeColor: '#fb923c', strokeWidth: 1.5 });

  // Projections and lines on Left Board
  // Cosine segment (green) on X-axis
  board.P_cos_proj = board.create('point', [function() { return board.P.X(); }, 0], { visible: false });
  board.P_cos_seg = board.create('segment', [board.C, board.P_cos_proj], { strokeColor: '#10b981', strokeWidth: 4, strokeOpacity: 0.8, visible: false });

  // Sine segment (pink) on Y-axis
  board.P_sin_proj = board.create('point', [0, function() { return board.P.Y(); }], { visible: false });
  board.P_sin_seg = board.create('segment', [board.C, board.P_sin_proj], { strokeColor: '#ec4899', strokeWidth: 4, strokeOpacity: 0.8, visible: false });

  // Tangent line at x = 1.0 and T point
  board.tanLine = board.create('line', [[1.0, -5], [1.0, 5]], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 1, visible: false, straightFirst: true, straightLast: true });
  board.T = board.create('point', [1.0, 0], {
    name: '', size: 4, fillColor: '#3b82f6', strokeColor: '#1d4ed8', fixed: true, visible: false, withLabel: false
  });
  board.tan_seg = board.create('segment', [[1.0, 0], board.T], { strokeColor: '#3b82f6', strokeWidth: 4, strokeOpacity: 0.8, visible: false, vertices: { visible: false } });

  // Cotangent line at y = 1.0 and K point
  board.cotLine = board.create('line', [[-5, 1.0], [5, 1.0]], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 1, visible: false, straightFirst: true, straightLast: true });
  board.K = board.create('point', [0, 1.0], {
    name: '', size: 4, fillColor: '#ec4899', strokeColor: '#be185d', fixed: true, visible: false, withLabel: false
  });
  board.cot_seg = board.create('segment', [[0, 1.0], board.K], { strokeColor: '#ec4899', strokeWidth: 4, strokeOpacity: 0.8, visible: false, vertices: { visible: false } });


  // Right board (board.right) - Function Graph
  var br = board.right;
  
  // Custom coordinate axes
  br.customXAxis = br.create('axis', [[0, 0], [1, 0]], { ticks: { visible: false } });
  br.customYAxis = br.create('axis', [[0, 0], [0, 1]], { ticks: { visible: false } });

  // Custom ticks on X axis
  br.customXTicks = br.create('ticks', [br.customXAxis, [-2*Math.PI, -3*Math.PI/2, -Math.PI, -Math.PI/2, Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI]], {
    drawLabels: true,
    labels: ['-2π', '-3π/2', '-π', '-π/2', 'π/2', 'π', '3π/2', '2π'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 11, color: '#475569', fontWeight: 'bold' }
  });

  // Custom ticks on Y axis
  br.customYTicks = br.create('ticks', [br.customYAxis, [-1.0, 1.0]], {
    drawLabels: true,
    labels: ['-1', '1'],
    label: { display: 'internal', offset: [-15, 0], fontSize: 11, color: '#475569', fontWeight: 'bold' }
  });

  br.rangeBand = br.create('polygon', [
    [-7.6, -1.0], [7.6, -1.0], [7.6, 1.0], [-7.6, 1.0]
  ], {
    fillColor: '#6366f1', fillOpacity: 0.04, borders: { visible: false }, vertices: { visible: false }
  });

  // Range indicator (Tập giá trị) highlight on Y-axis
  br.yRangeSegment = br.create('segment', [[0, -1.0], [0, 1.0]], {
    strokeColor: '#db2777', strokeWidth: 6, strokeOpacity: 0.5,
    name: '[-1; 1]',
    withLabel: true,
    vertices: { visible: false },
    label: { position: 'left', offset: [-8, 0], color: '#db2777', fontSize: 9, fontWeight: 'bold' }
  });

  // Period segment — placed BELOW the x-axis so it doesn't overlap the curves
  br.periodStart = br.create('point', [0, -1.8], { visible: false, fixed: true });
  br.periodEnd = br.create('point', [2 * Math.PI, -1.8], { visible: false, fixed: true });
  br.periodSegment = br.create('segment', [br.periodStart, br.periodEnd], {
    strokeColor: '#10b981', strokeWidth: 4, strokeOpacity: 0.6,
    withLabel: true,
    label: { display: 'internal', text: 'Chu kỳ T', position: 'bot', offset: [0, -8], color: '#059669', fontSize: 10, fontWeight: 'bold' }
  });
  // Arrow markers at endpoints
  br.create('point', [0, -1.8], { size: 2, face: '>', fillColor: '#10b981', strokeColor: '#10b981', fixed: true, withLabel: false });
  br.create('point', [2 * Math.PI, -1.8], { size: 2, face: '<', fillColor: '#10b981', strokeColor: '#10b981', fixed: true, withLabel: false });

  br.graph = br.create('functiongraph', [
    function(x) {
      var mode = board.currentMode || 'y = sin x';
      if (mode === 'y = sin x') return Math.sin(x);
      if (mode === 'y = cos x') return Math.cos(x);
      if (mode === 'y = tan x') {
        var val = Math.tan(x);
        return Math.abs(val) > 10 ? NaN : val;
      }
      if (mode === 'y = cot x') {
        var val = 1.0 / Math.tan(x);
        return Math.abs(val) > 10 ? NaN : val;
      }
      return 0;
    }
  ], { strokeColor: '#6366f1', strokeWidth: 3, highlight: false });

  // Asymptotes
  br.asympTan1 = br.create('line', [[Math.PI/2, -5], [Math.PI/2, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympTan2 = br.create('line', [[3*Math.PI/2, -5], [3*Math.PI/2, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympTan3 = br.create('line', [[-Math.PI/2, -5], [-Math.PI/2, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympTan4 = br.create('line', [[-3*Math.PI/2, -5], [-3*Math.PI/2, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });

  br.asympCot1 = br.create('line', [[0, -5], [0, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympCot2 = br.create('line', [[Math.PI, -5], [Math.PI, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympCot3 = br.create('line', [[2*Math.PI, -5], [2*Math.PI, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympCot4 = br.create('line', [[-Math.PI, -5], [-Math.PI, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });
  br.asympCot5 = br.create('line', [[-2*Math.PI, -5], [-2*Math.PI, 5]], { strokeColor: '#ef4444', strokeWidth: 1.2, dash: 2, straightFirst: false, straightLast: false, visible: false });

  // Excluded points
  br.asympPtTan1 = br.create('point', [Math.PI/2, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtTan2 = br.create('point', [3*Math.PI/2, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtTan3 = br.create('point', [-Math.PI/2, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtTan4 = br.create('point', [-3*Math.PI/2, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });

  br.asympPtCot1 = br.create('point', [0, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtCot2 = br.create('point', [Math.PI, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtCot3 = br.create('point', [2*Math.PI, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtCot4 = br.create('point', [-Math.PI, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });
  br.asympPtCot5 = br.create('point', [-2*Math.PI, 0], { size: 4, face: 'o', strokeColor: '#ef4444', strokeWidth: 2, fillColor: '#ffffff', visible: false, fixed: true, withLabel: false });

  br.G = br.create('point', [0, 0], {
    name: '', size: 5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true, withLabel: false
  });

  br.G_sym = br.create('point', [0, 0], {
    name: '', size: 4, fillColor: '#8b5cf6', strokeColor: '#6d28d9', fixed: true, withLabel: false
  });

  br.parityLine = br.create('segment', [br.G, br.G_sym], {
    strokeColor: '#8b5cf6', strokeWidth: 1, dash: 2
  });

  br.P_trace_origin = br.create('point', [0, function() { return br.G.Y(); }], { visible: false });
  br.tracerLine = br.create('segment', [br.P_trace_origin, br.G], {
    strokeColor: 'rgba(239, 68, 68, 0.45)', strokeWidth: 1.5, dash: 3
  });

  br.create('text', [7.0, 0.15, 'x (rad)'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });
  br.create('text', [0.2, 1.8, 'y'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });

  board.unsuspendUpdate();
  br.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'y = sin x';
  board.currentMode = mode;
  var aDeg = params.a !== undefined ? params.a : 45;
  var x = aDeg * Math.PI / 180;
  board.x_val = x;

  board.P.setAttribute({ fixed: false });
  board.P.setPosition(JXG.COORDS_BY_USER, [Math.cos(x), Math.sin(x)]);
  board.P.setAttribute({ fixed: true });

  var isSin = (mode === 'y = sin x');
  var isCos = (mode === 'y = cos x');
  var isTan = (mode === 'y = tan x');
  var isCot = (mode === 'y = cot x');

  var showParity = params.showParity !== undefined ? params.showParity : false;

  var br = board.right;

  br.asympTan1.setAttribute({ visible: isTan });
  br.asympTan2.setAttribute({ visible: isTan });
  br.asympTan3.setAttribute({ visible: isTan });
  br.asympTan4.setAttribute({ visible: isTan });
  br.asympPtTan1.setAttribute({ visible: isTan });
  br.asympPtTan2.setAttribute({ visible: isTan });
  br.asympPtTan3.setAttribute({ visible: isTan });
  br.asympPtTan4.setAttribute({ visible: isTan });
  
  br.asympCot1.setAttribute({ visible: isCot });
  br.asympCot2.setAttribute({ visible: isCot });
  br.asympCot3.setAttribute({ visible: isCot });
  br.asympCot4.setAttribute({ visible: isCot });
  br.asympCot5.setAttribute({ visible: isCot });
  br.asympPtCot1.setAttribute({ visible: isCot });
  br.asympPtCot2.setAttribute({ visible: isCot });
  br.asympPtCot3.setAttribute({ visible: isCot });
  br.asympPtCot4.setAttribute({ visible: isCot });
  br.asympPtCot5.setAttribute({ visible: isCot });

  board.P_cos_seg.setAttribute({ visible: isCos });
  board.P_sin_seg.setAttribute({ visible: isSin });

  board.tanLine.setAttribute({ visible: isTan });
  board.tan_seg.setAttribute({ visible: isTan });
  board.T.setAttribute({ visible: isTan });
  if (isTan) {
    var tanVal = Math.tan(x);
    if (Math.abs(tanVal) > 5) {
      board.T.setAttribute({ visible: false });
      board.tan_seg.setAttribute({ visible: false });
    } else {
      board.T.setAttribute({ fixed: false });
      board.T.setPosition(JXG.COORDS_BY_USER, [1.0, tanVal]);
      board.T.setAttribute({ fixed: true });
    }
  }

  board.cotLine.setAttribute({ visible: isCot });
  board.cot_seg.setAttribute({ visible: isCot });
  board.K.setAttribute({ visible: isCot });
  if (isCot) {
    var cotVal = 1.0 / Math.tan(x);
    if (Math.abs(cotVal) > 5) {
      board.K.setAttribute({ visible: false });
      board.cot_seg.setAttribute({ visible: false });
    } else {
      board.K.setAttribute({ fixed: false });
      board.K.setPosition(JXG.COORDS_BY_USER, [cotVal, 1.0]);
      board.K.setAttribute({ fixed: true });
    }
  }

  br.rangeBand.setAttribute({ visible: (isSin || isCos) });
  br.yRangeSegment.setAttribute({ visible: (isSin || isCos) });

  if (isSin || isCos) {
    br.periodEnd.setPosition(JXG.COORDS_BY_USER, [2 * Math.PI, -1.8]);
  } else {
    br.periodEnd.setPosition(JXG.COORDS_BY_USER, [Math.PI, -1.8]);
  }
  var targetPeriodText = (isSin || isCos) ? 'Chu kỳ T = 2π' : 'Chu kỳ T = π';
  if (br.lastPeriodText !== targetPeriodText) {
    br.lastPeriodText = targetPeriodText;
    br.periodSegment.label.setText(targetPeriodText);
  }
  br.periodSegment.setAttribute({ visible: true });

  var isGVisible = true;
  if (isTan && Math.abs(Math.tan(x)) > 5) isGVisible = false;
  if (isCot && Math.abs(1.0 / Math.tan(x)) > 5) isGVisible = false;

  br.G.setAttribute({ visible: isGVisible });

  var isGsymVisible = isGVisible && showParity;
  br.G_sym.setAttribute({ visible: isGsymVisible });
  br.parityLine.setAttribute({ visible: isGsymVisible });
  br.tracerLine.setAttribute({ visible: isGVisible });
  var yVal = 0;
  var domainText = 'D = ℝ';
  var rangeText = '[-1, 1]';
  var parityText = '';
  var periodText = '';

  if (isSin) {
    yVal = Math.sin(x);
    domainText = 'Tập xác định: D = ℝ';
    rangeText = 'Tập giá trị: [-1; 1]';
    parityText = 'Tính lẻ: sin(-x) = -sin(x) (đối xứng qua O)';
    periodText = 'Chu kỳ tuần hoàn: T = 2π';
  } else if (isCos) {
    yVal = Math.cos(x);
    domainText = 'Tập xác định: D = ℝ';
    rangeText = 'Tập giá trị: [-1; 1]';
    parityText = 'Tính chẵn: cos(-x) = cos(x) (đối xứng qua Oy)';
    periodText = 'Chu kỳ tuần hoàn: T = 2π';
  } else if (isTan) {
    yVal = Math.tan(x);
    domainText = 'Tập xác định: D = ℝ \\\\ {π/2 + kπ}';
    rangeText = 'Tập giá trị: ℝ';
    parityText = 'Tính lẻ: tan(-x) = -tan(x) (đối xứng qua O)';
    periodText = 'Chu kỳ tuần hoàn: T = π';
  } else if (isCot) {
    yVal = 1.0 / Math.tan(x);
    domainText = 'Tập xác định: D = ℝ \\\\ {kπ}';
    rangeText = 'Tập giá trị: ℝ';
    parityText = 'Tính lẻ: cot(-x) = -cot(x) (đối xứng qua O)';
    periodText = 'Chu kỳ tuần hoàn: T = π';
  }

  // Explicitly update point positions on the graph board to bypass JSXGraph function evaluation lag
  if (board.right && board.right.G) {
    board.right.G.setAttribute({ fixed: false });
    board.right.G.setPosition(JXG.COORDS_BY_USER, [x, isNaN(yVal) || Math.abs(yVal) > 100 ? 999 : yVal]);
    board.right.G.setAttribute({ fixed: true });
  }
  if (board.right && board.right.G_sym) {
    var yValSym = 0;
    if (isSin) yValSym = Math.sin(-x);
    else if (isCos) yValSym = Math.cos(-x);
    else if (isTan) yValSym = Math.tan(-x);
    else if (isCot) yValSym = 1.0 / Math.tan(-x);
    board.right.G_sym.setAttribute({ fixed: false });
    board.right.G_sym.setPosition(JXG.COORDS_BY_USER, [-x, isNaN(yValSym) || Math.abs(yValSym) > 100 ? 999 : yValSym]);
    board.right.G_sym.setAttribute({ fixed: true });
  }

  showReadouts([
    { label: 'Góc x:', value: aDeg.toFixed(2) + '° (' + (x / Math.PI).toFixed(2) + 'π rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #ea580c; font-weight: bold;' },
    { label: 'Giá trị y:', value: isNaN(yVal) || Math.abs(yVal) > 100 ? 'Không xác định' : yVal.toFixed(2), labelStyle: 'color: #3b82f6;', valueStyle: 'color: #1d4ed8; font-weight: bold;' },
    { label: 'Tập xác định:', value: domainText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f87171; font-weight: bold;' },
    { label: 'Tập giá trị:', value: rangeText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc;' },
    { label: 'Tính chẵn lẻ:', value: parityText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #a78bfa; font-weight: 500;' },
    { label: 'Chu kỳ:', value: periodText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold;' }
  ]);
}
`,
  visualizationType: 'jsxgraph',
  config: {
    boardSize: { width: 600, height: 400 },
    showAxis: false,
    showGrid: true,
    theme: 'light',
    split: {
      enabled: true,
      leftOverlay: true,
      leftBBox: [-1.5, 1.5, 1.5, -1.5],
      leftAxis: false,
      leftGrid: false,
      rightBBox: [-7.6, 2.2, 7.6, -2.5],
      rightAxis: false,
      rightGrid: true,
    }
  },
  controls: [
    { type: 'select', name: 'mode', label: 'Hàm số y =', defaultValue: 'y = sin x', options: ['y = sin x', 'y = cos x', 'y = tan x', 'y = cot x'] },
    { type: 'slider', name: 'a', label: 'Góc x (độ)', min: -360, max: 360, step: 5, defaultValue: 45 },
    { type: 'checkbox', name: 'showParity', label: 'Khảo sát đối xứng (Chẵn/Lẻ)', defaultValue: false },
  ],
  mathContent: '\\begin{aligned} y &= \\sin x \\\\ y &= \\cos x \\\\ y &= \\tan x \\\\ y &= \\cot x \\end{aligned}',
  explanation: 'Khảo sát sự biến thiên và đồ thị của các hàm số lượng giác. Bằng cách quay góc x trên đường tròn lượng giác, ta có được đồ thị hàm số tương ứng trên hệ trục Oxy.',
  keyInsights: [
    '📖 Tính chất cơ bản của các hàm số:',
    'Hàm số y = sin x: tập xác định D = ℝ, tập giá trị [-1; 1], chu kỳ T = 2π, là hàm số lẻ.',
    'Hàm số y = cos x: tập xác định D = ℝ, tập giá trị [-1; 1], chu kỳ T = 2π, là hàm số chẵn.',
    'Hàm số y = tan x: tập xác định D = ℝ \\\\ {π/2 + kπ}, tập giá trị ℝ, chu kỳ T = π, là hàm số lẻ.',
    'Hàm số y = cot x: tập xác định D = ℝ \\\\ {kπ}, tập giá trị ℝ, chu kỳ T = π, là hàm số lẻ.'
  ],
  tags: ['hàm số lượng giác', 'khảo sát', 'đồ thị', 'chu kỳ', 'chẵn lẻ'],
  difficulty: 'intermediate',
  isPublished: true,
};
