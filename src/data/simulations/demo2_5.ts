export const demo2_5 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'gia-tri-luong-giac',
        title: 'Góc liên quan đặc biệt (Tính đối xứng)',
        description: 'Trực quan hóa sự liên hệ lượng giác của các cặp góc có tính chất đối xứng đặc biệt: Đối nhau, Bù nhau, Phụ nhau, và Hơn kém π.',
        order: 2,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Start point A
  board.create('point', [1, 0], {
    name: math("A(1;0)"),
    size: 2.5,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'html', fontSize: 12, offset: [8, -12] }
  });

  // Primary Point M
  board.M = board.create('glider', [1, 0, board.circle], {
    name: math('M(\\\\alpha)'),
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 13, color: '#4f46e5', offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');
  
  // Ray OM
  board.OM = board.create('segment', [board.O, board.M], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // Symmetric Point M'
  board.MPrime = board.create('point', [1, 0], {
    name: math("M'(-\\\\alpha)"),
    size: 5,
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    fixed: true,
    label: { display: 'html', fontSize: 13, color: '#d97706', offset: [10, -15] }
  });
  
  // Ray OM'
  board.OMPrime = board.create('segment', [board.O, board.MPrime], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    dash: 1
  });

  // Symmetry guide lines
  board.guideSeg = board.create('segment', [board.M, board.MPrime], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1.5,
    dash: 2
  });

  // Projections for M on axes
  board.Hx = board.create('point', [
    function() { return board.M.X(); },
    0
  ], {
    name: '',
    size: 4,
    fillColor: '#34d399',
    strokeColor: '#10b981',
    visible: true,
    fixed: true
  });
  
  board.Ky = board.create('point', [
    0,
    function() { return board.M.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#f87171',
    strokeColor: '#f43f5e',
    visible: true,
    fixed: true
  });

  // Projections for M' on axes
  board.HPrimeX = board.create('point', [
    function() { return board.MPrime.X(); },
    0
  ], {
    name: '',
    size: 4,
    fillColor: '#34d399',
    strokeColor: '#10b981',
    visible: true,
    fixed: true
  });

  board.KPrimeY = board.create('point', [
    0,
    function() { return board.MPrime.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#f87171',
    strokeColor: '#f43f5e',
    visible: true,
    fixed: true
  });

  // Dashed lines representing Cos projection (green-teal)
  board.cosSegM = board.create('segment', [board.M, board.Hx], {
    strokeColor: '#34d399', strokeWidth: 1.2, dash: 2, highlight: false
  });
  board.cosSegMPrime = board.create('segment', [board.MPrime, board.HPrimeX], {
    strokeColor: '#34d399', strokeWidth: 1.2, dash: 2, highlight: false
  });

  // Dashed lines representing Sin projection (rose-red)
  board.sinSegM = board.create('segment', [board.M, board.Ky], {
    strokeColor: '#f87171', strokeWidth: 1.2, dash: 2, highlight: false
  });
  board.sinSegMPrime = board.create('segment', [board.MPrime, board.KPrimeY], {
    strokeColor: '#f87171', strokeWidth: 1.2, dash: 2, highlight: false
  });

  // Line y = x for complementary angles (phụ nhau)
  board.lineYX = board.create('line', [[-2, -2], [2, 2]], {
    strokeColor: '#94a3b8',
    strokeWidth: 1.2,
    dash: 3,
    visible: false
  });

  // Line y = -x for reference if needed
  board.lineNegYX = board.create('line', [[-2, 2], [2, -2]], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1,
    dash: 3,
    visible: false
  });

  // Create native sliders inside SVG
  board.sliderAngle = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.angle !== undefined ? params.angle : 45, 360, 'Góc', 5, '#fb923c');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialDeg !== undefined ? params.specialDeg : 2, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialRad !== undefined ? params.specialRad : 2, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var relation = params.relation || 'Góc đối nhau (α và -α)';
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;
  var idx = 2;
  
  board.sliderAngle.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });

  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) board.sliderAngle.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecDeg && !board.sliderSpecDeg.isDragging && Math.abs(board.sliderSpecDeg.Value() - idx) > 1e-4) board.sliderSpecDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 2;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecRad && !board.sliderSpecRad.isDragging && Math.abs(board.sliderSpecRad.Value() - idx) > 1e-4) board.sliderSpecRad.setValue(idx);
  }

  var angle = deg * Math.PI / 180;
  var mx = Math.cos(angle);
  var my = Math.sin(angle);
  if (board.M && !board.M.isDragging) {
    board.M.setPosition(JXG.COORDS_BY_USER, [mx, my]);
  }

  // Determine M' based on relation
  var symAngle = 0;
  var relationLabel = '';
  var latexM = 'M(\\\\alpha)';
  var latexMPrime = "M'(\\\\beta)";

  if (relation === 'Góc đối nhau (α và -α)') {
    symAngle = -angle;
    relationLabel = 'Đối nhau (α và -α)';
    latexMPrime = "M'(-\\\\alpha)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#f43f5e', dash: 2 });
  } else if (relation === 'Góc bù nhau (α và π - α)') {
    symAngle = Math.PI - angle;
    relationLabel = 'Bù nhau (α và π - α)';
    latexMPrime = "M'(\\\\pi - \\\\alpha)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#10b981', dash: 2 });
  } else if (relation === 'Góc phụ nhau (α và π/2 - α)') {
    symAngle = Math.PI / 2 - angle;
    relationLabel = 'Phụ nhau (α và π/2 - α)';
    latexMPrime = "M'(\\\\pi/2 - \\\\alpha)";
    board.lineYX.setAttribute({ visible: true });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#f59e0b', dash: 2 });
  } else if (relation === 'Góc hơn kém π (α và π + α)') {
    symAngle = angle + Math.PI;
    relationLabel = 'Hơn kém π (α và π + α)';
    latexMPrime = "M'(\\\\alpha + \\\\pi)";
    board.lineYX.setAttribute({ visible: false });
    board.lineNegYX.setAttribute({ visible: false });
    board.guideSeg.setAttribute({ strokeColor: '#8b5cf6', dash: 2 });
  }

  var px = Math.cos(symAngle);
  var py = Math.sin(symAngle);
  board.MPrime.setAttribute({ fixed: false });
  board.MPrime.setPosition(JXG.COORDS_BY_USER, [px, py]);
  board.MPrime.setAttribute({ fixed: true });

  // Set nice labels (only update if relation changed to prevent DOM reflow flickering)
  if (board.currentRelation !== relation) {
    board.currentRelation = relation;
    var newNameMPrime = math(latexMPrime);
    if (board.MPrime.label) {
      board.MPrime.label.setText(newNameMPrime);
    } else {
      board.MPrime.setName(newNameMPrime);
    }
  }

  // Format radian texts
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else radText = frac.toFixed(2) + 'π';
  }

  var symDeg = Math.round(symAngle * 180 / Math.PI);
  // Normalize symDeg for display range
  while (symDeg <= -180) symDeg += 360;
  while (symDeg > 180) symDeg -= 360;

  var symRadText = '';
  var symFrac = symDeg / 180;
  if (symFrac === 0) symRadText = '0';
  else if (symFrac === 1) symRadText = 'π';
  else if (symFrac === -1) symRadText = '-π';
  else if (Number.isInteger(symFrac * 6)) {
    var num = Math.round(symFrac * 6);
    var den = 6;
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    var g = Math.abs(gcd(num, den));
    num = num / g;
    den = den / g;
    var sign = num < 0 ? '-' : '';
    num = Math.abs(num);
    if (den === 1) {
      symRadText = sign + (num === 1 ? '' : num) + 'π';
    } else {
      symRadText = sign + (num === 1 ? '' : num) + 'π/' + den;
    }
  } else {
    symRadText = symFrac.toFixed(2) + 'π';
  }

  // Set formulas
  var fSin = '', fCos = '', fTan = '', fCot = '';
  if (relation === 'Góc đối nhau (α và -α)') {
    fCos = math('\\\\cos(-\\\\alpha) = \\\\cos\\\\alpha');
    fSin = math('\\\\sin(-\\\\alpha) = -\\\\sin\\\\alpha');
    fTan = math('\\\\tan(-\\\\alpha) = -\\\\tan\\\\alpha');
    fCot = math('\\\\cot(-\\\\alpha) = -\\\\cot\\\\alpha');
  } else if (relation === 'Góc bù nhau (α và π - α)') {
    fCos = math('\\\\cos(\\\\pi - \\\\alpha) = -\\\\cos\\\\alpha');
    fSin = math('\\\\sin(\\\\pi - \\\\alpha) = \\\\sin\\\\alpha');
    fTan = math('\\\\tan(\\\\pi - \\\\alpha) = -\\\\tan\\\\alpha');
    fCot = math('\\\\cot(\\\\pi - \\\\alpha) = -\\\\cot\\\\alpha');
  } else if (relation === 'Góc phụ nhau (α và π/2 - α)') {
    fCos = math('\\\\cos(\\\\pi/2 - \\\\alpha) = \\\\sin\\\\alpha');
    fSin = math('\\\\sin(\\\\pi/2 - \\\\alpha) = \\\\cos\\\\alpha');
    fTan = math('\\\\tan(\\\\pi/2 - \\\\alpha) = \\\\cot\\\\alpha');
    fCot = math('\\\\cot(\\\\pi/2 - \\\\alpha) = \\\\tan\\\\alpha');
  } else if (relation === 'Góc hơn kém π (α và π + α)') {
    fCos = math('\\\\cos(\\\\alpha + \\\\pi) = -\\\\cos\\\\alpha');
    fSin = math('\\\\sin(\\\\alpha + \\\\pi) = -\\\\sin\\\\alpha');
    fTan = math('\\\\tan(\\\\alpha + \\\\pi) = \\\\tan\\\\alpha');
    fCot = math('\\\\cot(\\\\alpha + \\\\pi) = \\\\cot\\\\alpha');
  }

  showReadouts([
    { label: 'Góc ban đầu α:', value: deg.toFixed(2) + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
    { label: 'Mối liên hệ:', value: relationLabel, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-weight: bold; background: rgba(99, 102, 241, 0.15); padding: 2px 6px; border-radius: 4px;' },
    { label: 'Góc liên kết β:', value: symDeg.toFixed(2) + '° (' + symRadText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
    { label: 'Liên hệ Côsin:', value: fCos, labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px; color: #34d399; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(52, 211, 153, 0.3);' },
    { label: 'Liên hệ Sin:', value: fSin, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(248, 113, 113, 0.3);' },
    { label: 'Liên hệ Tang/Cot:', value: fTan + ' &nbsp;|&nbsp; ' + fCot, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: 800; font-size: 1.05rem; text-shadow: 0 0 8px rgba(249, 115, 22, 0.3);' }
  ]);

  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.5, 1.8, -1.5],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'relation', label: 'Liên hệ đối xứng', defaultValue: 'Góc đối nhau (α và -α)', options: ['Góc đối nhau (α và -α)', 'Góc bù nhau (α và π - α)', 'Góc phụ nhau (α và π/2 - α)', 'Góc hơn kém π (α và π + α)'] },
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 45, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: '\\cos(-\\alpha) = \\cos\\alpha, \\ \\sin(\\pi-\\alpha) = \\sin\\alpha, \\ \\cos(\\pi/2-\\alpha) = \\sin\\alpha',
        explanation: 'Các góc liên quan đặc biệt có mối liên hệ hình học đối xứng rất đẹp trên đường tròn lượng giác: đối xứng qua trục Ox (góc đối), qua Oy (góc bù), qua đường phân giác y = x (góc phụ), hoặc qua tâm O (góc hơn kém π).',
        keyInsights: [
          'Góc đối nhau (α và -α): Đối xứng qua trục hoành Ox. Chỉ có Côsin bằng nhau (cos đối).',
          'Góc bù nhau (α và π - α): Đối xứng qua trục tung Oy. Chỉ có Sin bằng nhau (sin bù).',
          'Góc phụ nhau (α và π/2 - α): Đối xứng qua phân giác y = x. Giá trị lượng giác chéo nhau (phụ chéo).',
          'Góc hơn kém π (α và π + α): Đối xứng qua gốc tọa độ O. Chỉ có Tang và Côtang bằng nhau.',
        ],
        tags: ['lượng giác', 'đối xứng', 'góc lượng giác', 'liên hệ đặc biệt'],
        difficulty: 'intermediate',
        isPublished: true,
      };
