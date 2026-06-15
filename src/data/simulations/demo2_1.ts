export const demo2_1 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Đường tròn định hướng & Góc lượng giác',
        description: 'Khám phá khái niệm đường tròn định hướng, chiều quay lượng giác dương/âm và số đo của góc lượng giác dưới dạng tổng quát α = θ + k * 2π.',
        order: 1,
        simulationCode: `
function initSimulation(board, params) {
  // Axis labels
  board.create('text', [1.45, 0.1, math('cos')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorX: 'right' });
  board.create('text', [0.1, 1.45, math('sin')], { fontSize: 13, color: '#94a3b8', fixed: true, highlight: false, anchorY: 'top' });
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
    name: 'O',
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    label: { display: 'internal', fontSize: 14, offset: [-15, -15] }
  });

  // Start point A
  board.A = board.create('point', [1, 0], {
    name: 'A',
    size: 3,
    fillColor: '#10b981',
    strokeColor: '#059669',
    fixed: true,
    label: { display: 'internal', fontSize: 14, offset: [10, -10] }
  });

  // Target point M
  board.M = board.create('glider', [1, 0, board.circle], {
    name: 'M',
    size: 5,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    label: { display: 'internal', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'deg');

  // Radius line segment
  board.OM = board.create('segment', [board.O, board.M], {
    strokeColor: '#6366f1',
    strokeWidth: 2
  });

  // Helper variables for spiral curve
  board.radVal = 0;
  
  // Spiral arc to represent multiple turns
  board.spiral = board.create('curve', [
    function(t) {
      var r = 0.25 + 0.08 * (t / (2 * Math.PI));
      var angle = t * Math.sign(board.radVal);
      return r * Math.cos(angle);
    },
    function(t) {
      var r = 0.25 + 0.08 * (t / (2 * Math.PI));
      var angle = t * Math.sign(board.radVal);
      return r * Math.sin(angle);
    },
    0,
    function() { return Math.abs(board.radVal); }
  ], {
    strokeColor: function() { return board.radVal >= 0 ? '#10b981' : '#ef4444'; },
    strokeWidth: 2.5
  });

  // Spiral arrow head points
  board.arrowStart = board.create('point', [0, 0], { visible: false });
  board.arrowEnd = board.create('point', [0, 0], { visible: false });
  board.arrow = board.create('arrow', [board.arrowStart, board.arrowEnd], {
    strokeColor: function() { return board.radVal >= 0 ? '#10b981' : '#ef4444'; },
    strokeWidth: 2
  });

  // Create native sliders inside SVG
  board.sliderDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], -720, params.deg !== undefined ? params.deg : 120, 720, 'Góc', 10, '#6366f1');
  
  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecialDeg = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialDeg !== undefined ? params.specialDeg : 4, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecialRad = createCustomSlider(board, [-1.4, -1.35], [1.4, -1.35], 0, params.specialRad !== undefined ? params.specialRad : 4, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'deg', value: board.sliderDeg.Value() }, '*'); });
  board.sliderSpecialDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecialDeg.Value() }, '*'); });
  board.sliderSpecialRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecialRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var deg = 120;
  var idx = 4;
  
  board.sliderDeg.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecialDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecialRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });

  if (mode === 'Kéo tự do') {
    deg = params.deg !== undefined ? params.deg : 120;
    if (board.sliderDeg && !board.sliderDeg.isDragging && Math.abs(board.sliderDeg.Value() - deg) > 1e-4) board.sliderDeg.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecialDeg && !board.sliderSpecialDeg.isDragging && Math.abs(board.sliderSpecialDeg.Value() - idx) > 1e-4) board.sliderSpecialDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecialRad && !board.sliderSpecialRad.isDragging && Math.abs(board.sliderSpecialRad.Value() - idx) > 1e-4) board.sliderSpecialRad.setValue(idx);
  }

  var rad = deg * Math.PI / 180;
  board.radVal = rad;

  var px = Math.cos(rad);
  var py = Math.sin(rad);
  if (board.M && !board.M.isDragging) {
    board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
  }

  // Update arrow head positions
  var absRad = Math.abs(rad);
  if (absRad > 0.05) {
    var endR = 0.25 + 0.08 * (absRad / (2 * Math.PI));
    var arrowDx = 0.05 * Math.sin(rad);
    var arrowDy = -0.05 * Math.cos(rad);
    if (rad < 0) {
      arrowDx = -arrowDx;
      arrowDy = -arrowDy;
    }
    board.arrowStart.setPosition(JXG.COORDS_BY_USER, [endR * Math.cos(rad) - arrowDx * 0.5, endR * Math.sin(rad) - arrowDy * 0.5]);
    board.arrowEnd.setPosition(JXG.COORDS_BY_USER, [endR * Math.cos(rad) + arrowDx * 0.5, endR * Math.sin(rad) + arrowDy * 0.5]);
    board.arrow.setAttribute({ visible: true });
  } else {
    board.arrow.setAttribute({ visible: false });
  }

  var turns = Math.floor(deg / 360);
  var remainderDeg = ((deg % 360) + 360) % 360;
  var remainderRadStr = (remainderDeg / 180).toFixed(2) + 'π';
  if (remainderDeg === 0) remainderRadStr = '0';
  else if (remainderDeg === 180) remainderRadStr = 'π';
  
  var radText = '';
  if (mode === 'Góc radian đặc biệt') {
    var radLabels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
    radText = radLabels[idx] || '0';
  } else {
    var frac = deg / 180;
    if (frac === 0) radText = '0';
    else if (frac === 1) radText = 'π';
    else if (frac === -1) radText = '-π';
    else radText = frac.toFixed(2) + 'π';
  }

  var dirText = deg > 0 ? 'Dương (+)' : (deg < 0 ? 'Âm (-)' : 'Không quay');
  var dirColor = deg > 0 ? '#34d399' : (deg < 0 ? '#f87171' : '#cbd5e1');

  var normDeg = ((deg % 360) + 360) % 360;
  var quadText = '';
  if (normDeg === 0 || normDeg === 90 || normDeg === 180 || normDeg === 270) {
    quadText = 'Trục tọa độ';
  } else if (normDeg > 0 && normDeg < 90) {
    quadText = 'Phần tư I';
  } else if (normDeg > 90 && normDeg < 180) {
    quadText = 'Phần tư II';
  } else if (normDeg > 180 && normDeg < 270) {
    quadText = 'Phần tư III';
  } else if (normDeg > 270 && normDeg < 360) {
    quadText = 'Phần tư IV';
  }

  showReadouts([
    { label: 'Góc tổng quát α:', value: deg.toFixed(2) + '°', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-size: 0.85rem;' },
    { label: 'Số đo radian:', value: radText + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #c084fc;' },
    { label: 'Góc hình học:', value: remainderDeg.toFixed(2) + '° (' + remainderRadStr + ')', labelStyle: 'color: #38bdf8;', valueStyle: 'color: #7dd3fc;' },
    { label: 'Chiều quay:', value: dirText, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: ' + dirColor + '; background: ' + (deg > 0 ? 'rgba(52, 211, 153, 0.15)' : (deg < 0 ? 'rgba(248, 113, 113, 0.15)' : 'rgba(203, 213, 225, 0.15)')) + '; padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Số vòng k:', value: turns.toString(), labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; background: rgba(249, 115, 22, 0.15); padding: 2px 6px; border-radius: 4px; font-weight: bold;' },
    { label: 'Vị trí:', value: quadText, labelStyle: 'color: #c084fc;', valueStyle: 'color: #e879f9; font-weight: bold;' }
  ]);
  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.9, 1.8, -1.1],
          showAxis: true,
          showGrid: true,
          theme: 'light',
        },
        controls: [
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt'] },
          { type: 'slider', name: 'deg', label: 'Góc tự do (độ)', min: -720, max: 720, step: 10, defaultValue: 120, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: '\\alpha = \\theta + k \\cdot 2\\pi \\quad (k \\in \\mathbb{Z}, \\ 0 \\le \\theta < 2\\pi)',
        explanation: 'Một góc lượng giác có vô số số đo sai lệch nhau bội nguyên của $2\\pi$ (hoặc $360^\\circ$). Cung xoắn ốc trực quan hóa số vòng quay lượng giác (chiều quay ngược chiều kim đồng hồ là chiều dương, cùng chiều kim đồng hồ là chiều âm).',
        keyInsights: [
          'Chiều dương (+): màu xanh lá, quay ngược chiều kim đồng hồ',
          'Chiều âm (-): màu đỏ, quay cùng chiều kim đồng hồ',
          'Số vòng quay k = phần nguyên số đo chia 360°',
          'Các góc lượng giác có cùng điểm biểu diễn M thì sai khác nhau k * 360°',
        ],
        tags: ['lượng giác', 'đường tròn định hướng', 'góc lượng giác', 'số vòng quay'],
        difficulty: 'basic',
        isPublished: true,
      };
