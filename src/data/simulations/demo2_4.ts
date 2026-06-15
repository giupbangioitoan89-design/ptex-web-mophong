export const demo2_4 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'gia-tri-luong-giac',
        title: 'Bảng dấu & Giá trị Lượng giác',
        description: 'Trực quan hóa giá trị Sin (tung độ), Cos (hoành độ), Tan và Cot. Xác định dấu (+/-) của chúng tùy thuộc vào phần tư (I, II, III, IV) trên đường tròn lượng giác.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  // Highlight Quadrants
  board.quad1 = board.create('polygon', [[0,0], [2.2, 0], [2.2, 2.2], [0, 2.2]], {
    fillColor: '#6366f1', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad2 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, 2.2], [0, 2.2]], {
    fillColor: '#10b981', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad3 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, -2.5], [0, -2.5]], {
    fillColor: '#f59e0b', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad4 = board.create('polygon', [[0,0], [2.2, 0], [2.2, -2.5], [0, -2.5]], {
    fillColor: '#f43f5e', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: 'O',
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'internal', fontSize: 14, offset: [-15, -15] }
  });

  // projection points
  board.H = board.create('point', [0, 0], {
    name: 'H',
    size: 4,
    fillColor: '#10b981',
    strokeColor: '#059669',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [-10, -15] }
  });

  board.K = board.create('point', [0, 0], {
    name: 'K',
    size: 4,
    fillColor: '#f43f5e',
    strokeColor: '#e11d48',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [-18, 0] }
  });

  // Target point P
  board.P = board.create('glider', [1, 0, board.circle], {
    name: 'P',
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'internal', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.P, 'angle');

  // Special axis boundary points with wider offsets to prevent overlapping with axes
  board.create('point', [1, 0], {
    name: "A(1;0)",
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [15, -15] }
  });
  board.create('point', [-1, 0], {
    name: "A'(-1;0)",
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [-75, -15] }
  });
  board.create('point', [0, 1], {
    name: "B(0;1)",
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [12, 18] }
  });
  board.create('point', [0, -1], {
    name: "B'(0;-1)",
    size: 2,
    fillColor: '#94a3b8',
    strokeColor: '#64748b',
    fixed: true,
    label: { display: 'internal', fontSize: 12, offset: [12, -20] }
  });

  // Dynamic label for current Quadrant - positioned at the bottom-left to prevent overlap with top controls panel
  board.quadText = board.create('text', [-1.9, -1.5, 'Góc phần tư I'], {
    display: 'html',
    cssStyle: 'font-weight: 800; font-size: 13px; color: #4f46e5; background: rgba(255, 255, 255, 0.9); border: 1.5px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: Inter, sans-serif;'
  });

  // Label Axis names
  board.create('text', [1.8, 0.1, math('\\text{trục cos}')], { display: 'html', fontSize: 13, color: '#059669' });
  board.create('text', [0.08, 1.8, math('\\text{trục sin}')], { display: 'html', fontSize: 13, color: '#e11d48' });

  // Radius line
  board.create('segment', [board.O, board.P], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // cos projection segment
  board.create('segment', [board.O, board.H], {
    strokeColor: '#10b981',
    strokeWidth: 3,
    highlight: false
  });

  // sin projection segment
  board.create('segment', [board.O, board.K], {
    strokeColor: '#f43f5e',
    strokeWidth: 3,
    highlight: false
  });

  // Dashed projections lines
  board.create('segment', [board.P, board.H], {
    dash: 2, strokeColor: '#94a3b8', strokeWidth: 1
  });
  board.create('segment', [board.P, board.K], {
    dash: 2, strokeColor: '#94a3b8', strokeWidth: 1
  });

  // Helper points and arc for angle
  board.arcStart = board.create('point', [0.3, 0], { visible: false, withLabel: false });
  board.arcEnd = board.create('point', [0.3, 0], { visible: false, withLabel: false });
  board.angleArc = board.create('arc', [board.O, board.arcStart, board.arcEnd], {
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    withLabel: false
  });

  // Create native sliders inside SVG
  board.sliderAngle = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.angle !== undefined ? params.angle : 45, 360, 'Góc', 5, '#fb923c');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.specialDeg !== undefined ? params.specialDeg : 2, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [-1.5, -1.5], [1.5, -1.5], 0, params.specialRad !== undefined ? params.specialRad : 2, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  updateSimulation(board, params);
}

function updateSimulation(board, params) {
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

  var px = Math.cos(angle);
  var py = Math.sin(angle);

  if (board.P && !board.P.isDragging) {
    board.P.setPosition(JXG.COORDS_BY_USER, [px, py]);
  }
  board.H.setAttribute({ fixed: false });
  board.H.setPosition(JXG.COORDS_BY_USER, [board.P.X(), 0]);
  board.H.setAttribute({ fixed: true });

  board.K.setAttribute({ fixed: false });
  board.K.setPosition(JXG.COORDS_BY_USER, [0, board.P.Y()]);
  board.K.setAttribute({ fixed: true });

  // Update angle arc
  board.arcEnd.setPosition(JXG.COORDS_BY_USER, [0.3 * px, 0.3 * py]);
  if (Math.abs(angle) > 0.01) {
    board.angleArc.setAttribute({ visible: true });
  } else {
    board.angleArc.setAttribute({ visible: false });
  }

  // Determine active quadrant and update polygon shading
  var normDeg = ((deg % 360) + 360) % 360;
  var activeQuad = 0;
  var quadLabel = 'Trục tọa độ';
  if (normDeg > 0 && normDeg < 90) { activeQuad = 1; quadLabel = 'Phần tư I'; }
  else if (normDeg > 90 && normDeg < 180) { activeQuad = 2; quadLabel = 'Phần tư II'; }
  else if (normDeg > 180 && normDeg < 270) { activeQuad = 3; quadLabel = 'Phần tư III'; }
  else if (normDeg > 270 && normDeg < 360) { activeQuad = 4; quadLabel = 'Phần tư IV'; }

  board.quad1.setAttribute({ fillOpacity: activeQuad === 1 ? 0.15 : 0.01 });
  board.quad2.setAttribute({ fillOpacity: activeQuad === 2 ? 0.15 : 0.01 });
  board.quad3.setAttribute({ fillOpacity: activeQuad === 3 ? 0.15 : 0.01 });
  board.quad4.setAttribute({ fillOpacity: activeQuad === 4 ? 0.15 : 0.01 });

  var targetQuadText = 'Nằm trên trục';
  if (activeQuad === 1) targetQuadText = 'Góc phần tư I';
  else if (activeQuad === 2) targetQuadText = 'Góc phần tư II';
  else if (activeQuad === 3) targetQuadText = 'Góc phần tư III';
  else if (activeQuad === 4) targetQuadText = 'Góc phần tư IV';

  if (board.quadText.text !== targetQuadText) {
    board.quadText.setText(targetQuadText);
  }

  // Radian Text
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

  // Calculate Tan and Cot values and signs
  var showTan = (normDeg !== 90 && normDeg !== 270);
  var showCot = (normDeg !== 0 && normDeg !== 180 && normDeg !== 360);
  
  var tanVal = showTan ? Math.tan(angle) : null;
  var cotVal = showCot ? (1 / Math.tan(angle)) : null;

  function getSignHtml(val) {
    if (val === null) return '<span style="color: #cbd5e1; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">K.Xác định</span>';
    if (Math.abs(val) < 1e-4) return '<span style="color: #cbd5e1; background: rgba(255, 255, 255, 0.08); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">0 (trục)</span>';
    return val > 0 
      ? '<span style="color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">+ (Dương)</span>' 
      : '<span style="color: #f87171; background: rgba(248, 113, 113, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">- (Âm)</span>';
  }

  var sinValStr = py.toFixed(2) + ' &nbsp; ' + getSignHtml(py);
  var cosValStr = px.toFixed(2) + ' &nbsp; ' + getSignHtml(px);
  var tanValStr = showTan ? tanVal.toFixed(2) + ' &nbsp; ' + getSignHtml(tanVal) : getSignHtml(null);
  var cotValStr = showCot ? cotVal.toFixed(2) + ' &nbsp; ' + getSignHtml(cotVal) : getSignHtml(null);

  showReadouts([
    { label: 'Góc α:', value: deg.toFixed(2) + '° (' + radText + ' rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
    { label: 'Vị trí P:', value: quadLabel, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #e2e8f0; font-weight: bold;' },
    { label: 'cos α (hoành độ P):', value: cosValStr, labelStyle: 'color: #cbd5e1; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 8px; color: #34d399; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(52, 211, 153, 0.2);' },
    { label: 'sin α (tung độ P):', value: sinValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(248, 113, 113, 0.2);' },
    { label: 'tan α (sin/cos):', value: tanValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(249, 115, 22, 0.2);' },
    { label: 'cot α (cos/sin):', value: cotValStr, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #2dd4bf; font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 6px rgba(45, 212, 191, 0.2);' }
  ]);
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-2.1, 1.75, 2.1, -1.75],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 45, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 2, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: 'P(x_P; y_P) = (\\cos \\alpha; \\sin \\alpha) \\quad \\text{và dấu phụ thuộc phần tư}',
        explanation: 'Trục hoành Ox là trục côsin, trục tung Oy là trục sin. Đường tròn lượng giác được chia làm 4 phần tư: Phần tư I (x > 0, y > 0), Phần tư II (x < 0, y > 0), Phần tư III (x < 0, y < 0), và Phần tư IV (x > 0, y < 0). Dấu của các giá trị lượng giác phụ thuộc hoàn toàn vào vị trí của điểm M.',
        keyInsights: [
          'Phần tư I (0° đến 90°): tất cả đều Dương (+)',
          'Phần tư II (90° đến 180°): sin Dương (+), còn lại đều Âm (-)',
          'Phần tư III (180° đến 270°): sin/cos Âm (-), tan/cot Dương (+)',
          'Phần tư IV (270° đến 360°): cos Dương (+), còn lại đều Âm (-)',
        ],
        tags: ['lượng giác', 'bảng dấu', 'sin', 'cos', 'tan', 'cot'],
        difficulty: 'basic',
        isPublished: true,
      };
