export const demo2_9 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Biến đổi tổng thành tích',
        description: 'Trực quan hình học chứng minh công thức biến đổi tổng/hiệu lượng giác thành tích thông qua phép cộng vectơ và trung điểm dây cung.',
        order: 4,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.currentMode = params.mode || 'cos u + cos v';

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
    name: math('U'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.V = board.create('point', [
    function() { var v = board.sliderV.Value() * Math.PI / 180; return Math.cos(v); },
    function() { var v = board.sliderV.Value() * Math.PI / 180; return Math.sin(v); }
  ], {
    name: math('V'), size: 4, fillColor: '#10b981', strokeColor: '#059669', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] },
    visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; }
  });
  
  board.create('segment', [board.O, board.U], { strokeColor: 'rgba(251, 146, 60, 0.4)', strokeWidth: 1.2 });
  board.create('segment', [board.O, board.V], { strokeColor: 'rgba(16, 185, 129, 0.4)', strokeWidth: 1.2, visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; } });

  // Vneg (opposite of V for difference)
  board.Vneg = board.create('point', [
    function() { var v = board.sliderV.Value() * Math.PI / 180; return -Math.cos(v); },
    function() { var v = board.sliderV.Value() * Math.PI / 180; return -Math.sin(v); }
  ], {
    name: math('-V'), size: 4, fillColor: '#059669', strokeColor: '#047857', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [-15, -15] },
    visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; }
  });
  board.create('segment', [board.O, board.Vneg], { strokeColor: 'rgba(5, 150, 105, 0.4)', strokeWidth: 1.2, dash: 1, visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; } });

  // Sum Vector S = U + V
  board.S = board.create('point', [
    function() { return board.U.X() + board.V.X(); },
    function() { return board.U.Y() + board.V.Y(); }
  ], {
    name: math('U+V'), size: 5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [12, 12] },
    visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; }
  });
  board.create('segment', [board.U, board.S], { strokeColor: 'rgba(239, 68, 68, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; } });
  board.create('segment', [board.V, board.S], { strokeColor: 'rgba(239, 68, 68, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; } });
  board.create('segment', [board.O, board.S], { strokeColor: '#ef4444', strokeWidth: 2.2, visible: function() { return board.currentMode === 'cos u + cos v' || board.currentMode === 'sin u + sin v'; } });

  // Difference Vector D = U - V = U + Vneg
  board.D = board.create('point', [
    function() { return board.U.X() + board.Vneg.X(); },
    function() { return board.U.Y() + board.Vneg.Y(); }
  ], {
    name: math('U-V'), size: 5, fillColor: '#c084fc', strokeColor: '#a855f7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [12, 12] },
    visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; }
  });
  board.create('segment', [board.U, board.D], { strokeColor: 'rgba(192, 132, 252, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; } });
  board.create('segment', [board.Vneg, board.D], { strokeColor: 'rgba(192, 132, 252, 0.25)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; } });
  board.create('segment', [board.O, board.D], { strokeColor: '#c084fc', strokeWidth: 2.2, visible: function() { return board.currentMode === 'cos u - cos v' || board.currentMode === 'sin u - sin v'; } });

  // Projections on X-axis (for cos u + cos v, cos u - cos v)
  board.Sx_x = board.create('point', [function() { return board.S.X(); }, 0], {
    name: math('cos\\\\,u+cos\\\\,v'), size: 4, fillColor: '#ef4444', strokeColor: '#b91c1c',
    label: { display: 'html', fontSize: 11, offset: [-35, -18] },
    visible: function() { return board.currentMode === 'cos u + cos v'; }
  });
  board.Dx_x = board.create('point', [function() { return board.D.X(); }, 0], {
    name: math('cos\\\\,u-cos\\\\,v'), size: 4, fillColor: '#c084fc', strokeColor: '#a855f7',
    label: { display: 'html', fontSize: 11, offset: [-35, -18] },
    visible: function() { return board.currentMode === 'cos u - cos v'; }
  });

  // Projection dashed lines for X-axis
  board.create('segment', [board.S, board.Sx_x], { strokeColor: 'rgba(239, 68, 68, 0.35)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u + cos v'; } });
  board.create('segment', [board.D, board.Dx_x], { strokeColor: 'rgba(192, 132, 252, 0.35)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'cos u - cos v'; } });

  // Projections on Y-axis (for sin u + sin v, sin u - sin v)
  board.Sy_y = board.create('point', [0, function() { return board.S.Y(); }], {
    name: math('sin\\\\,u+sin\\\\,v'), size: 4, fillColor: '#ef4444', strokeColor: '#b91c1c',
    label: { display: 'html', fontSize: 11, offset: [-110, 0] },
    visible: function() { return board.currentMode === 'sin u + sin v'; }
  });
  board.Dy_y = board.create('point', [0, function() { return board.D.Y(); }], {
    name: math('sin\\\\,u-sin\\\\,v'), size: 4, fillColor: '#c084fc', strokeColor: '#a855f7',
    label: { display: 'html', fontSize: 11, offset: [-110, 0] },
    visible: function() { return board.currentMode === 'sin u - sin v'; }
  });

  // Projection dashed lines for Y-axis
  board.create('segment', [board.S, board.Sy_y], { strokeColor: 'rgba(239, 68, 68, 0.35)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin u + sin v'; } });
  board.create('segment', [board.D, board.Dy_y], { strokeColor: 'rgba(192, 132, 252, 0.35)', strokeWidth: 1, dash: 2, visible: function() { return board.currentMode === 'sin u - sin v'; } });

  // Highlight segment of result on axes
  board.segResultSx = board.create('segment', [board.O, board.Sx_x], {
    strokeColor: '#f43f5e', strokeWidth: 4,
    visible: function() { return board.currentMode === 'cos u + cos v'; }
  });
  board.segResultDx = board.create('segment', [board.O, board.Dx_x], {
    strokeColor: '#a855f7', strokeWidth: 4,
    visible: function() { return board.currentMode === 'cos u - cos v'; }
  });
  board.segResultSy = board.create('segment', [board.O, board.Sy_y], {
    strokeColor: '#f43f5e', strokeWidth: 4,
    visible: function() { return board.currentMode === 'sin u + sin v'; }
  });
  board.segResultDy = board.create('segment', [board.O, board.Dy_y], {
    strokeColor: '#a855f7', strokeWidth: 4,
    visible: function() { return board.currentMode === 'sin u - sin v'; }
  });

  board.sliderU.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'u', value: board.sliderU.Value() }, '*'); });
  board.sliderV.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'v', value: board.sliderV.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos u + cos v';
  board.currentMode = mode;
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
    { label: 'Góc u:', value: uDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc v:', value: vDeg.toFixed(2) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
    { label: 'Góc trung bình (u+v)/2:', value: avgDeg.toFixed(2) + '°', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
    { label: 'Góc bán hiệu (u-v)/2:', value: diffDeg.toFixed(2) + '°', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
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
        mathContent: '\\\\begin{aligned} \\\\cos u + \\\\cos v &= 2\\\\cos\\\\frac{u+v}{2}\\\\cos\\\\frac{u-v}{2} \\\\\\\\ \\\\cos u - \\\\cos v &= -2\\\\sin\\\\frac{u+v}{2}\\\\sin\\\\frac{u-v}{2} \\\\\\\\ \\\\sin u + \\\\sin v &= 2\\\\sin\\\\frac{u+v}{2}\\\\cos\\\\frac{u-v}{2} \\\\\\\\ \\\\sin u - \\\\sin v &= 2\\\\cos\\\\frac{u+v}{2}\\\\sin\\\\frac{u-v}{2} \\\\end{aligned}',
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
      };
