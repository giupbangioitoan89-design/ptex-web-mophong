export const demo2_6 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'cong-thuc-luong-giac',
        title: 'Công thức cộng lượng giác',
        description: 'Trực quan hóa công thức cộng lượng giác cho sin(a±b), cos(a±b), tan(a±b). Kéo thanh trượt thay đổi góc a, b để so sánh hai vế của công thức.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

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
  
  board.sliderA = createCustomSlider(board, [-1.5, -1.3], [1.5, -1.3], 0, params.a !== undefined ? params.a : 60, 360, 'Góc a', 5, '#fb923c');
  board.sliderB = createCustomSlider(board, [-1.5, -1.6], [1.5, -1.6], 0, params.b !== undefined ? params.b : 45, 360, 'Góc b', 5, '#10b981');
  
  board.U = board.create('point', [
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.cos(a); },
    function() { var a = board.sliderA.Value() * Math.PI / 180; return Math.sin(a); }
  ], {
    name: math('U(a)'), size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.V = board.create('point', [
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.cos(b); },
    function() { var b = board.sliderB.Value() * Math.PI / 180; return Math.sin(b); }
  ], {
    name: math('V(b)'), size: 4, fillColor: '#10b981', strokeColor: '#059669', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.W = board.create('point', [
    function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      var target = mode.includes('+') ? (a + b) : (a - b);
      return Math.cos(target);
    },
    function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      var a = board.sliderA.Value() * Math.PI / 180;
      var b = board.sliderB.Value() * Math.PI / 180;
      var target = mode.includes('+') ? (a + b) : (a - b);
      return Math.sin(target);
    }
  ], {
    name: function() {
      var mode = window.currentParams?.mode || 'cos(a-b)';
      return math(mode.includes('+') ? 'W(a+b)' : 'W(a-b)');
    }, size: 5, fillColor: '#c084fc', strokeColor: '#a855f7', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [10, 10] }
  });
  
  board.create('segment', [board.O, board.U], { strokeColor: '#fb923c', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.V], { strokeColor: '#10b981', strokeWidth: 1.5 });
  board.create('segment', [board.O, board.W], { strokeColor: '#c084fc', strokeWidth: 2, dash: 2 });
  
  board.sliderA.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'a', value: board.sliderA.Value() }, '*'); });
  board.sliderB.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'b', value: board.sliderB.Value() }, '*'); });
  
  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'cos(a-b)';
  var aDeg = params.a !== undefined ? params.a : 60;
  var bDeg = params.b !== undefined ? params.b : 45;
  
  if (board.sliderA && !board.sliderA.isDragging && Math.abs(board.sliderA.Value() - aDeg) > 1e-4) board.sliderA.setValue(aDeg);
  if (board.sliderB && !board.sliderB.isDragging && Math.abs(board.sliderB.Value() - bDeg) > 1e-4) board.sliderB.setValue(bDeg);
  
  var a = aDeg * Math.PI / 180;
  var b = bDeg * Math.PI / 180;
  
  var valLHS = 0;
  var valRHS = 0;
  var formulaLHS = '';
  var formulaRHS = '';
  
  if (mode === 'cos(a-b)') {
    valLHS = Math.cos(a - b);
    valRHS = Math.cos(a)*Math.cos(b) + Math.sin(a)*Math.sin(b);
    formulaLHS = 'cos(a - b)';
    formulaRHS = 'cos a cos b + sin a sin b';
  } else if (mode === 'cos(a+b)') {
    valLHS = Math.cos(a + b);
    valRHS = Math.cos(a)*Math.cos(b) - Math.sin(a)*Math.sin(b);
    formulaLHS = 'cos(a + b)';
    formulaRHS = 'cos a cos b - sin a sin b';
  } else if (mode === 'sin(a-b)') {
    valLHS = Math.sin(a - b);
    valRHS = Math.sin(a)*Math.cos(b) - Math.cos(a)*Math.sin(b);
    formulaLHS = 'sin(a - b)';
    formulaRHS = 'sin a cos b - cos a sin b';
  } else if (mode === 'sin(a+b)') {
    valLHS = Math.sin(a + b);
    valRHS = Math.sin(a)*Math.cos(b) + Math.cos(a)*Math.sin(b);
    formulaLHS = 'sin(a + b)';
    formulaRHS = 'sin a cos b + cos a sin b';
  }
  
  showReadouts([
    { label: 'Góc a:', value: aDeg.toFixed(2) + '°', labelStyle: 'color: #fdba74;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Góc b:', value: bDeg.toFixed(2) + '°', labelStyle: 'color: #86efac;', valueStyle: 'color: #10b981; font-weight: bold;' },
    { label: 'Công thức:', value: formulaLHS + ' = ' + formulaRHS, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-style: italic;' },
    { label: 'Vế trái (LHS):', value: valLHS.toFixed(2), labelStyle: 'color: #c084fc;', valueStyle: 'color: #a855f7; font-weight: bold;' },
    { label: 'Vế phải (RHS):', value: valRHS.toFixed(2), labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px;' }
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
          { type: 'select', name: 'mode', label: 'Công thức cộng', defaultValue: 'cos(a-b)', options: ['cos(a-b)', 'cos(a+b)', 'sin(a-b)', 'sin(a+b)'] },
          { type: 'slider', name: 'a', label: 'Góc a (độ)', min: 0, max: 360, step: 5, defaultValue: 60 },
          { type: 'slider', name: 'b', label: 'Góc b (độ)', min: 0, max: 360, step: 5, defaultValue: 45 },
        ],
        mathContent: '\\\\begin{aligned} \\\\cos(a \\\\pm b) &= \\\\cos a \\\\cos b \\\\mp \\\\sin a \\\\sin b \\\\\\\\ \\\\sin(a \\\\pm b) &= \\\\sin a \\\\cos b \\\\pm \\\\cos a \\\\sin b \\\\\\\\ \\\\tan(a \\\\pm b) &= \\\\frac{\\\\tan a \\\\pm \\\\tan b}{1 \\\\mp \\\\tan a \\\\tan b} \\\\end{aligned}',
        explanation: 'Công thức cộng lượng giác cho phép biến đổi các hàm lượng giác của tổng/hiệu thành tích và tổng của các góc thành phần. Đây là nền tảng để suy ra tất cả các nhóm công thức lượng giác khác.',
        keyInsights: [
          '📖 Thơ học công thức cộng dễ thuộc:',
          'Cos thì cos cos sin sin, coi chừng trái dấu: \\\\cos(a \\\\pm b) = \\\\cos a \\\\cos b \\\\mp \\\\sin a \\\\sin b',
          'Sin thì sin cos cos sin, cùng dấu vững tin: \\\\sin(a \\\\pm b) = \\\\sin a \\\\cos b \\\\pm \\\\cos a \\\\sin b',
          'Tan thì tan nọ tan kia, thương sầu cộng lại chia một trừ tích tan: \\\\tan(a \\\\pm b) = \\\\frac{\\\\tan a \\\\pm \\\\tan b}{1 \\\\mp \\\\tan a \\\\tan b}'
        ],
        tags: ['lượng giác', 'công thức lượng giác', 'công thức cộng', 'toán 11'],
        difficulty: 'intermediate',
        isPublished: true,
      };
