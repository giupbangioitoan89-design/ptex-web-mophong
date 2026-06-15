export const demo2_12 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'phuong-trinh-luong-giac',
  title: 'Nghiệm của Phương trình lượng giác cơ bản',
  description: 'Trực quan hóa tập nghiệm của các phương trình lượng giác cơ bản sin x = m, cos x = m, tan x = m, cot x = m thông qua đường tròn lượng giác và đồ thị hàm số tương ứng.',
  order: 1,
  simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.right.suspendUpdate();

  // LEFT BOARD - Unit Circle
  board.O = board.create('point', [0, 0], { name: 'O', size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true, label: { fontSize: 13, offset: [-15, -15] } });
  board.circle = board.create('circle', [board.O, 1.0], { strokeColor: '#94a3b8', strokeWidth: 1.5, fixed: true, highlight: false });
  
  // Axes for left board
  board.circleXAxis = board.create('segment', [[-1.25, 0], [1.25, 0]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, vertices: { visible: false } });
  board.circleYAxis = board.create('segment', [[0, -1.25], [0, 1.25]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, vertices: { visible: false } });
  board.create('text', [1.2, 0.08, math('cos')], { fontSize: 11, color: '#64748b', fixed: true });
  board.create('text', [0.08, 1.2, math('sin')], { fontSize: 11, color: '#64748b', fixed: true });

  // Grid line representing m constant
  board.mLine = board.create('line', [[-2, 0], [2, 0]], { strokeColor: '#f43f5e', strokeWidth: 1.5, dash: 2, visible: false });
  
  // Tangent/Cotangent line helpers
  board.tanLine = board.create('line', [[1.0, -2], [1.0, 2]], { strokeColor: '#cbd5e1', strokeWidth: 1, dash: 1, visible: false });
  board.cotLine = board.create('line', [[-2, 1.0], [2, 1.0]], { strokeColor: '#cbd5e1', strokeWidth: 1, dash: 1, visible: false });

  // Tangent/Cotangent target points
  board.T = board.create('point', [1.0, 0], { name: 'T', size: 4, fillColor: '#3b82f6', strokeColor: '#1d4ed8', fixed: true, visible: false });
  board.K = board.create('point', [0, 1.0], { name: 'K', size: 4, fillColor: '#ec4899', strokeColor: '#be185d', fixed: true, visible: false });
  
  // Rays from origin to T or K
  board.rayOTK = board.create('segment', [board.O, board.O], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 2, visible: false });

  // Points on unit circle (roots)
  board.P1 = board.create('point', [0, 0], { name: 'x1', size: 5, fillColor: '#10b981', strokeColor: '#059669', fixed: true, visible: false });
  board.P2 = board.create('point', [0, 0], { name: 'x2', size: 5, fillColor: '#3b82f6', strokeColor: '#1d4ed8', fixed: true, visible: false });

  // Rays from O to roots
  board.rayOP1 = board.create('segment', [board.O, board.P1], { strokeColor: '#10b981', strokeWidth: 1.5, visible: false });
  board.rayOP2 = board.create('segment', [board.O, board.P2], { strokeColor: '#3b82f6', strokeWidth: 1.5, visible: false });

  // Directed angle arcs
  board.arc1 = board.create('curve', [[], []], { strokeColor: '#10b981', strokeWidth: 2, visible: false });
  board.arc2 = board.create('curve', [[], []], { strokeColor: '#3b82f6', strokeWidth: 2, visible: false });


  // RIGHT BOARD - Function Graph
  var br = board.right;
  br.customXAxis = br.create('axis', [[0, 0], [1, 0]], { ticks: { visible: false } });
  br.customYAxis = br.create('axis', [[0, 0], [0, 1]], { ticks: { visible: false } });

  br.customXTicks = br.create('ticks', [br.customXAxis, [-2*Math.PI, -3*Math.PI/2, -Math.PI, -Math.PI/2, Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI]], {
    drawLabels: true,
    labels: ['-2π', '-3π/2', '-π', '-π/2', 'π/2', 'π', '3π/2', '2π'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 11, color: '#475569', fontWeight: 'bold' }
  });

  br.customYTicks = br.create('ticks', [br.customYAxis, [-2.0, -1.0, 1.0, 2.0]], {
    drawLabels: true,
    labels: ['-2', '-1', '1', '2'],
    label: { display: 'internal', offset: [-15, 0], fontSize: 11, color: '#475569', fontWeight: 'bold' }
  });

  // Plot line y = m
  br.mLine = br.create('line', [[0, 0], [1, 0]], { strokeColor: '#f43f5e', strokeWidth: 1.8, dash: 2 });
  br.mLabel = br.create('text', [6.5, 0.2, 'y = m'], { fontSize: 11, color: '#e11d48', fixed: true });

  // Function Graph
  br.graph = br.create('functiongraph', [
    function(x) {
      var type = board.currentEqType || 'sin x = m';
      if (type === 'sin x = m') return Math.sin(x);
      if (type === 'cos x = m') return Math.cos(x);
      if (type === 'tan x = m') {
        var val = Math.tan(x);
        return Math.abs(val) > 10 ? NaN : val;
      }
      if (type === 'cot x = m') {
        var val = 1.0 / Math.tan(x);
        return Math.abs(val) > 10 ? NaN : val;
      }
      return 0;
    }
  ], { strokeColor: '#6366f1', strokeWidth: 2.5, highlight: false });

  // Intersection points pool (max 6 points in range [-2pi, 2pi])
  br.pts = [];
  for (var i = 0; i < 6; i++) {
    var p = br.create('point', [0, 0], {
      name: '', size: 5, fillColor: '#f43f5e', strokeColor: '#be185d', fixed: true, visible: false,
      label: { display: 'internal', fontSize: 10, offset: [-10, 12], color: '#be185d' }
    });
    br.pts.push(p);
  }

  board.unsuspendUpdate();
  br.unsuspendUpdate();
  updateSimulation(board, params);
}

function getSpecialAngleStr(val, type) {
  var absVal = Math.abs(val);
  var sign = val < 0 ? '-' : '';
  if (type === 'sin' || type === 'cos') {
    if (Math.abs(absVal - 0) < 0.02) return '0';
    if (Math.abs(absVal - 0.5236) < 0.02) return sign + '\\\\frac{\\\\pi}{6}';
    if (Math.abs(absVal - 0.7854) < 0.02) return sign + '\\\\frac{\\\\pi}{4}';
    if (Math.abs(absVal - 1.0472) < 0.02) return sign + '\\\\frac{\\\\pi}{3}';
    if (Math.abs(absVal - 1.5708) < 0.02) return sign + '\\\\frac{\\\\pi}{2}';
    if (Math.abs(absVal - 2.0944) < 0.02) return sign + '\\\\frac{2\\\\pi}{3}';
    if (Math.abs(absVal - 2.3562) < 0.02) return sign + '\\\\frac{3\\\\pi}{4}';
    if (Math.abs(absVal - 2.618) < 0.02) return sign + '\\\\frac{5\\\\pi}{6}';
    if (Math.abs(absVal - Math.PI) < 0.02) return sign + '\\\\pi';
  } else if (type === 'tan' || type === 'cot') {
    if (Math.abs(absVal - 0) < 0.02) return '0';
    if (Math.abs(absVal - 0.5236) < 0.02) return sign + '\\\\frac{\\\\pi}{6}';
    if (Math.abs(absVal - 0.7854) < 0.02) return sign + '\\\\frac{\\\\pi}{4}';
    if (Math.abs(absVal - 1.0472) < 0.02) return sign + '\\\\frac{\\\\pi}{3}';
    if (Math.abs(absVal - 1.5708) < 0.02) return sign + '\\\\frac{\\\\pi}{2}';
  }
  return null;
}

function drawArcHelper(curve, startRad, endRad, r, N) {
  var xArr = [0], yArr = [0];
  var diff = endRad - startRad;
  // normalize diff to draw shortest path or direct sweep
  var step = diff / N;
  for (var i = 0; i <= N; i++) {
    var t = startRad + i * step;
    xArr.push(r * Math.cos(t));
    yArr.push(r * Math.sin(t));
  }
  xArr.push(0); yArr.push(0);
  curve.dataX = xArr;
  curve.dataY = yArr;
}

function updateSimulation(board, params) {
  var type = params.eqType || 'sin x = m';
  board.currentEqType = type;

  var m = params.mVal !== undefined ? params.mVal : 0.5;

  var br = board.right;

  // Update line y = m on right board
  br.mLine.setPosition(JXG.COORDS_BY_USER, [0, m], [1, m]);
  br.mLabel.setText('y = ' + m.toFixed(2));
  br.mLabel.setPosition(JXG.COORDS_BY_USER, [6.3, m + 0.1]);

  var hasRoots = true;
  var roots = [];
  var latexEq = '';
  var principalAngle1 = 0;
  var principalAngle2 = 0;
  var specialStr1 = '';
  var specialStr2 = '';

  // Reset helper visibilities
  board.mLine.setAttribute({ visible: false });
  board.tanLine.setAttribute({ visible: false });
  board.cotLine.setAttribute({ visible: false });
  board.T.setAttribute({ visible: false });
  board.K.setAttribute({ visible: false });
  board.rayOTK.setAttribute({ visible: false });
  board.P1.setAttribute({ visible: false });
  board.P2.setAttribute({ visible: false });
  board.rayOP1.setAttribute({ visible: false });
  board.rayOP2.setAttribute({ visible: false });
  board.arc1.setAttribute({ visible: false });
  board.arc2.setAttribute({ visible: false });

  if (type === 'sin x = m') {
    latexEq = '\\\\sin x = ' + m.toFixed(2);
    if (Math.abs(m) > 1.0) {
      hasRoots = false;
    } else {
      board.mLine.setPosition(JXG.COORDS_BY_USER, [-2, m], [2, m]);
      board.mLine.setAttribute({ visible: true });

      principalAngle1 = Math.asin(m);
      principalAngle2 = Math.PI - principalAngle1;

      var p1x = Math.cos(principalAngle1);
      var p1y = Math.sin(principalAngle1);
      var p2x = Math.cos(principalAngle2);
      var p2y = Math.sin(principalAngle2);

      board.P1.setAttribute({ fixed: false });
      board.P1.setPosition(JXG.COORDS_BY_USER, [p1x, p1y]);
      board.P1.setAttribute({ fixed: true, visible: true });
      board.rayOP1.setAttribute({ visible: true });

      drawArcHelper(board.arc1, 0, principalAngle1, 0.28, 20);
      board.arc1.setAttribute({ visible: true });

      // If m = 1 or m = -1, P1 and P2 overlap
      if (Math.abs(Math.abs(m) - 1.0) > 1e-3) {
        board.P2.setAttribute({ fixed: false });
        board.P2.setPosition(JXG.COORDS_BY_USER, [p2x, p2y]);
        board.P2.setAttribute({ fixed: true, visible: true });
        board.rayOP2.setAttribute({ visible: true });

        drawArcHelper(board.arc2, 0, principalAngle2, 0.38, 20);
        board.arc2.setAttribute({ visible: true });
      }

      // Find all roots in [-2pi, 2pi]
      for (var k = -2; k <= 2; k++) {
        var r1 = principalAngle1 + k * 2 * Math.PI;
        var r2 = principalAngle2 + k * 2 * Math.PI;
        if (r1 >= -2 * Math.PI - 0.01 && r1 <= 2 * Math.PI + 0.01) roots.push(r1);
        if (Math.abs(Math.abs(m) - 1.0) > 1e-3) {
          if (r2 >= -2 * Math.PI - 0.01 && r2 <= 2 * Math.PI + 0.01) roots.push(r2);
        }
      }
    }
  } else if (type === 'cos x = m') {
    latexEq = '\\\\cos x = ' + m.toFixed(2);
    if (Math.abs(m) > 1.0) {
      hasRoots = false;
    } else {
      board.mLine.setPosition(JXG.COORDS_BY_USER, [m, -2], [m, 2]);
      board.mLine.setAttribute({ visible: true });

      principalAngle1 = Math.acos(m);
      principalAngle2 = -principalAngle1;

      var p1x = Math.cos(principalAngle1);
      var p1y = Math.sin(principalAngle1);
      var p2x = Math.cos(principalAngle2);
      var p2y = Math.sin(principalAngle2);

      board.P1.setAttribute({ fixed: false });
      board.P1.setPosition(JXG.COORDS_BY_USER, [p1x, p1y]);
      board.P1.setAttribute({ fixed: true, visible: true });
      board.rayOP1.setAttribute({ visible: true });

      drawArcHelper(board.arc1, 0, principalAngle1, 0.28, 20);
      board.arc1.setAttribute({ visible: true });

      // If m = 1 or m = -1, P1 and P2 overlap
      if (Math.abs(Math.abs(m) - 1.0) > 1e-3 && Math.abs(m - 0) > 1e-3) {
        board.P2.setAttribute({ fixed: false });
        board.P2.setPosition(JXG.COORDS_BY_USER, [p2x, p2y]);
        board.P2.setAttribute({ fixed: true, visible: true });
        board.rayOP2.setAttribute({ visible: true });

        drawArcHelper(board.arc2, principalAngle2, 0, 0.38, 20);
        board.arc2.setAttribute({ visible: true });
      }

      for (var k = -2; k <= 2; k++) {
        var r1 = principalAngle1 + k * 2 * Math.PI;
        var r2 = principalAngle2 + k * 2 * Math.PI;
        if (r1 >= -2 * Math.PI - 0.01 && r1 <= 2 * Math.PI + 0.01) roots.push(r1);
        if (Math.abs(Math.abs(m) - 1.0) > 1e-3) {
          if (r2 >= -2 * Math.PI - 0.01 && r2 <= 2 * Math.PI + 0.01) roots.push(r2);
        }
      }
    }
  } else if (type === 'tan x = m') {
    latexEq = '\\\\tan x = ' + m.toFixed(2);
    board.tanLine.setAttribute({ visible: true });
    
    board.T.setAttribute({ fixed: false });
    board.T.setPosition(JXG.COORDS_BY_USER, [1.0, m]);
    board.T.setAttribute({ fixed: true, visible: true });
    
    board.rayOTK.setPosition(JXG.COORDS_BY_USER, [0, 0], [1.0, m]);
    board.rayOTK.setAttribute({ visible: true });

    principalAngle1 = Math.atan(m);
    principalAngle2 = principalAngle1 + Math.PI;

    var p1x = Math.cos(principalAngle1);
    var p1y = Math.sin(principalAngle1);
    var p2x = Math.cos(principalAngle2);
    var p2y = Math.sin(principalAngle2);

    board.P1.setAttribute({ fixed: false });
    board.P1.setPosition(JXG.COORDS_BY_USER, [p1x, p1y]);
    board.P1.setAttribute({ fixed: true, visible: true });
    board.rayOP1.setAttribute({ visible: true });

    drawArcHelper(board.arc1, 0, principalAngle1, 0.28, 20);
    board.arc1.setAttribute({ visible: true });

    board.P2.setAttribute({ fixed: false });
    board.P2.setPosition(JXG.COORDS_BY_USER, [p2x, p2y]);
    board.P2.setAttribute({ fixed: true, visible: true });
    board.rayOP2.setAttribute({ visible: true });

    drawArcHelper(board.arc2, 0, principalAngle2, 0.38, 25);
    board.arc2.setAttribute({ visible: true });

    for (var k = -3; k <= 3; k++) {
      var r = principalAngle1 + k * Math.PI;
      if (r >= -2 * Math.PI - 0.01 && r <= 2 * Math.PI + 0.01) roots.push(r);
    }
  } else if (type === 'cot x = m') {
    latexEq = '\\\\cot x = ' + m.toFixed(2);
    board.cotLine.setAttribute({ visible: true });

    board.K.setAttribute({ fixed: false });
    board.K.setPosition(JXG.COORDS_BY_USER, [m, 1.0]);
    board.K.setAttribute({ fixed: true, visible: true });

    board.rayOTK.setPosition(JXG.COORDS_BY_USER, [0, 0], [m, 1.0]);
    board.rayOTK.setAttribute({ visible: true });

    principalAngle1 = Math.PI/2 - Math.atan(m);
    principalAngle2 = principalAngle1 + Math.PI;

    var p1x = Math.cos(principalAngle1);
    var p1y = Math.sin(principalAngle1);
    var p2x = Math.cos(principalAngle2);
    var p2y = Math.sin(principalAngle2);

    board.P1.setAttribute({ fixed: false });
    board.P1.setPosition(JXG.COORDS_BY_USER, [p1x, p1y]);
    board.P1.setAttribute({ fixed: true, visible: true });
    board.rayOP1.setAttribute({ visible: true });

    drawArcHelper(board.arc1, 0, principalAngle1, 0.28, 20);
    board.arc1.setAttribute({ visible: true });

    board.P2.setAttribute({ fixed: false });
    board.P2.setPosition(JXG.COORDS_BY_USER, [p2x, p2y]);
    board.P2.setAttribute({ fixed: true, visible: true });
    board.rayOP2.setAttribute({ visible: true });

    drawArcHelper(board.arc2, 0, principalAngle2, 0.38, 25);
    board.arc2.setAttribute({ visible: true });

    for (var k = -3; k <= 3; k++) {
      var r = principalAngle1 + k * Math.PI;
      if (r >= -2 * Math.PI - 0.01 && r <= 2 * Math.PI + 0.01) roots.push(r);
    }
  }

  // Remove duplicate roots and sort them
  roots = roots.filter(function(item, pos) { return roots.indexOf(item) === pos; });
  roots.sort(function(a, b) { return a - b; });

  // Update right board intersection points
  for (var i = 0; i < br.pts.length; i++) {
    br.pts[i].setAttribute({ visible: false });
  }

  if (hasRoots) {
    var numRoots = Math.min(roots.length, br.pts.length);
    for (var i = 0; i < numRoots; i++) {
      var rx = roots[i];
      var ry = m;
      br.pts[i].setAttribute({ fixed: false });
      br.pts[i].setPosition(JXG.COORDS_BY_USER, [rx, ry]);
      
      var fracStr = (rx / Math.PI).toFixed(2) + 'π';
      if (Math.abs(rx) < 0.01) fracStr = '0';
      else if (Math.abs(rx - Math.PI) < 0.01) fracStr = 'π';
      else if (Math.abs(rx + Math.PI) < 0.01) fracStr = '-π';
      else if (Math.abs(rx - 2*Math.PI) < 0.01) fracStr = '2π';
      else if (Math.abs(rx + 2*Math.PI) < 0.01) fracStr = '-2π';

      br.pts[i].setAttribute({ 
        fixed: true, 
        visible: true,
        name: fracStr
      });
    }
  }

  // Get readout strings
  var exactStr1 = getSpecialAngleStr(principalAngle1, type.slice(0, 3));
  var exactStr2 = getSpecialAngleStr(principalAngle2, type.slice(0, 3));

  var angleText1 = exactStr1 ? math(exactStr1) : (principalAngle1 * 180 / Math.PI).toFixed(1) + '°';
  var angleText2 = exactStr2 ? math(exactStr2) : (principalAngle2 * 180 / Math.PI).toFixed(1) + '°';

  var readoutRows = [
    { label: 'Phương trình:', value: math(latexEq), labelStyle: 'color: #ef4444; font-weight: bold;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 1.1rem;' },
  ];

  if (!hasRoots) {
    readoutRows.push({ label: 'Trạng thái nghiệm:', value: 'Vô nghiệm (vì |m| > 1)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px;' });
  } else {
    readoutRows.push({ label: 'Góc góc nghiệm x1:', value: angleText1 + ' (' + principalAngle1.toFixed(2) + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #34d399; font-weight: bold;' });
    if (type === 'sin x = m' || type === 'cos x = m') {
      if (Math.abs(Math.abs(m) - 1.0) > 1e-3) {
        readoutRows.push({ label: 'Góc góc nghiệm x2:', value: angleText2 + ' (' + principalAngle2.toFixed(2) + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8; font-weight: bold;' });
      }
    } else {
      readoutRows.push({ label: 'Chu kỳ nghiệm:', value: math('x = \\\\alpha + k\\\\pi'), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' });
    }

    // General formula display
    var formulaStr = '';
    if (type === 'sin x = m') {
      var aStr = exactStr1 ? exactStr1 : 'arcsin(' + m.toFixed(2) + ')';
      formulaStr = 'x = ' + aStr + ' + k2\\\\pi \\\\quad \\\\text{hoặc} \\\\quad x = \\\\pi - ' + aStr + ' + k2\\\\pi';
    } else if (type === 'cos x = m') {
      var aStr = exactStr1 ? exactStr1 : 'arccos(' + m.toFixed(2) + ')';
      formulaStr = 'x = \\\\pm ' + aStr + ' + k2\\\\pi';
    } else if (type === 'tan x = m') {
      var aStr = exactStr1 ? exactStr1 : 'arctan(' + m.toFixed(2) + ')';
      formulaStr = 'x = ' + aStr + ' + k\\\\pi';
    } else if (type === 'cot x = m') {
      var aStr = exactStr1 ? exactStr1 : 'arccot(' + m.toFixed(2) + ')';
      formulaStr = 'x = ' + aStr + ' + k\\\\pi';
    }
    readoutRows.push({ label: 'Nghệm tổng quát:', value: math(formulaStr + ' \\\\quad (k \\\\in \\\\mathbb{Z})'), labelStyle: 'color: #c084fc; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px; color: #e879f9; font-weight: bold;' });
  }

  showReadouts(readoutRows);
}
`,
  visualizationType: 'jsxgraph',
  config: {
    boardSize: { width: 600, height: 420 },
    showAxis: false,
    showGrid: false,
    theme: 'light',
    split: {
      enabled: true,
      leftBBox: [-1.4, 1.4, 1.4, -1.4],
      leftAxis: false,
      leftGrid: false,
      rightBBox: [-7.0, 2.5, 7.3, -2.5],
      rightAxis: false,
      rightGrid: true,
    }
  },
  controls: [
    { type: 'select', name: 'eqType', label: 'Dạng phương trình', defaultValue: 'sin x = m', options: ['sin x = m', 'cos x = m', 'tan x = m', 'cot x = m'] },
    { type: 'slider', name: 'mVal', label: 'Giá trị m', min: -2.0, max: 2.0, step: 0.1, defaultValue: 0.5 },
  ],
  mathContent: '\\\\begin{aligned} \\\\sin x = m &\\\\iff x = \\\\alpha + k2\\\\pi \\\\quad \\\\text{hoặc} \\\\quad x = \\\\pi - \\\\alpha + k2\\\\pi \\\\\\\\ \\\\cos x = m &\\\\iff x = \\\\pm \\\\alpha + k2\\\\pi \\\\\\\\ \\\\tan x = m &\\\\iff x = \\\\alpha + k\\\\pi \\\\\\\\ \\\\cot x = m &\\\\iff x = \\\\alpha + k\\\\pi \\\\end{aligned}',
  explanation: 'Nghiệm của phương trình lượng giác tương ứng với hoành độ giao điểm của đồ thị hàm lượng giác và đường thẳng nằm ngang y = m. Trên đường tròn lượng giác, nghiệm được biểu diễn bởi giao điểm của đường thẳng song song với các trục tương ứng (x = m hoặc y = m) với đường tròn đơn vị.',
  keyInsights: [
    '📌 Dạng sin x = m và cos x = m:',
    'Vô nghiệm nếu m > 1 hoặc m < -1.',
    'Có vô số nghiệm nếu -1 ≤ m ≤ 1, tuần hoàn chu kỳ 2π.',
    '📌 Dạng tan x = m và cot x = m:',
    'Luôn có nghiệm với mọi m ∈ ℝ, tuần hoàn chu kỳ π.'
  ],
  tags: ['phương trình lượng giác', 'nghiệm', 'sin', 'cos', 'tan', 'cot'],
  difficulty: 'basic',
  isPublished: true,
};
