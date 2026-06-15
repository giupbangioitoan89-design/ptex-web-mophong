export const demo2_2 = {
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
    name: 'O', size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'internal', fontSize: 14, offset: [-15, -15] }
  });

  // Points U, V, W
  board.U = board.create('point', [1, 0], {
    name: 'U', size: 5, fillColor: '#10b981', strokeColor: '#059669',
    label: { display: 'internal', fontSize: 14, offset: [10, 10] }
  });
  board.V = board.create('point', [0, 1], {
    name: 'V', size: 5, fillColor: '#f59e0b', strokeColor: '#d97706',
    label: { display: 'internal', fontSize: 14, offset: [-15, 15] }
  });
  board.W = board.create('point', [0, -1], {
    name: 'W', size: 5, fillColor: '#6366f1', strokeColor: '#4f46e5',
    label: { display: 'internal', fontSize: 14, offset: [10, -10] }
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
  board.lblAlpha = board.create('text', [0.2, 0.2, '\\u03b1'], { display: 'internal', fontSize: 13, color: '#10b981', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });
  board.lblBeta = board.create('text', [0.2, 0.2, '\\u03b2'], { display: 'internal', fontSize: 13, color: '#f59e0b', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });
  board.lblGamma = board.create('text', [0.2, 0.2, '\\u03b3'], { display: 'internal', fontSize: 13, color: '#6366f1', fixed: true, highlight: false, anchorX: 'middle', anchorY: 'middle' });

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

  function fmtDeg(d) { return (d >= 0 ? '+' : '') + d.toFixed(2) + '\\u00b0'; }
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
      };
