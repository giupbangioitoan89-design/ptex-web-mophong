export const demo2_14 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'gia-tri-luong-giac',
  title: 'Các Hệ thức lượng giác cơ bản',
  description: 'Khám phá sự liên hệ hình học của 4 hệ thức lượng giác cơ bản: sin²x + cos²x = 1, 1 + tan²x = 1/cos²x, 1 + cot²x = 1/sin²x, và tan x * cot x = 1 thông qua các đoạn thẳng trên đường tròn lượng giác.',
  order: 3,
  simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1.0], {
    strokeColor: '#94a3b8',
    strokeWidth: 2,
    highlight: false,
    fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: 'O', size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [-15, -15] }
  });

  // Boundary points
  board.A_pt = board.create('point', [1.0, 0], { name: 'A', size: 2.5, fillColor: '#64748b', strokeColor: '#475569', fixed: true, label: { fontSize: 12, offset: [8, -12] } });
  board.B_pt = board.create('point', [0, 1.0], { name: 'B', size: 2.5, fillColor: '#64748b', strokeColor: '#475569', fixed: true, label: { fontSize: 12, offset: [8, 12] } });

  // Glider M
  board.M = board.create('glider', [1.0, 0, board.circle], {
    name: 'M', size: 5, fillColor: '#6366f1', strokeColor: '#4f46e5',
    label: { display: 'html', fontSize: 13, color: '#4f46e5', offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');

  // Ray OM
  board.rayOM = board.create('line', [board.O, board.M], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 1, straightFirst: false, straightLast: true });

  // Projection H (for cos) on X axis
  board.H = board.create('point', [1.0, 0], { name: 'H', size: 3, fillColor: '#10b981', strokeColor: '#059669', fixed: true, label: { fontSize: 11, offset: [-5, -12] } });
  board.segOH = board.create('segment', [board.O, board.H], { strokeColor: '#10b981', strokeWidth: 3 });
  board.segHM = board.create('segment', [board.H, board.M], { strokeColor: '#ef4444', strokeWidth: 3 });
  board.segOM = board.create('segment', [board.O, board.M], { strokeColor: '#3b82f6', strokeWidth: 2 });
  board.triOHM = board.create('polygon', [board.O, board.H, board.M], { fillColor: '#3b82f6', fillOpacity: 0.15, borders: { visible: false }, vertices: { visible: false } });

  // Tangent Helper line (x = 1)
  board.tanLine = board.create('line', [[1.0, -2], [1.0, 2]], { strokeColor: '#cbd5e1', strokeWidth: 1, dash: 2 });
  board.T = board.create('point', [1.0, 0], { name: 'T', size: 4, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true, label: { fontSize: 12, offset: [10, 5] } });
  board.segAT = board.create('segment', [board.A_pt, board.T], { strokeColor: '#fb923c', strokeWidth: 3 });
  board.segOT = board.create('segment', [board.O, board.T], { strokeColor: '#8b5cf6', strokeWidth: 2.5 });
  board.triOAT = board.create('polygon', [board.O, board.A_pt, board.T], { fillColor: '#fb923c', fillOpacity: 0.15, borders: { visible: false }, vertices: { visible: false } });

  // Cotangent Helper line (y = 1)
  board.cotLine = board.create('line', [[-2, 1.0], [2, 1.0]], { strokeColor: '#cbd5e1', strokeWidth: 1, dash: 2 });
  board.K = board.create('point', [0, 1.0], { name: 'K', size: 4, fillColor: '#ec4899', strokeColor: '#be185d', fixed: true, label: { fontSize: 12, offset: [-12, 12] } });
  board.segBK = board.create('segment', [board.B_pt, board.K], { strokeColor: '#ec4899', strokeWidth: 3 });
  board.segOK = board.create('segment', [board.O, board.K], { strokeColor: '#06b6d4', strokeWidth: 2.5 });
  board.triOBK = board.create('polygon', [board.O, board.B_pt, board.K], { fillColor: '#ec4899', fillOpacity: 0.15, borders: { visible: false }, vertices: { visible: false } });

  // Angle slider inside board
  board.sliderAngle = createCustomSlider(board, [-1.8, -1.8], [1.8, -1.8], 0, params.angle !== undefined ? params.angle : 45, 360, 'Góc', 5, '#6366f1');
  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();

  var identity = params.identityType || 'sin²α + cos²α = 1';
  var mode = params.mode || 'Kéo tự do';
  var deg = 45;

  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 45;
    board.sliderAngle.setAttribute({ visible: true });
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) {
      board.sliderAngle.setValue(deg);
    }
  } else {
    // special angle select
    board.sliderAngle.setAttribute({ visible: false });
    var valMap = { '30°': 30, '45°': 45, '60°': 60, '120°': 120, '135°': 135, '150°': 150, '210°': 210, '225°': 225, '240°': 240, '300°': 300, '315°': 315, '330°': 330 };
    deg = valMap[params.specialAngle] || 45;
  }

  var rad = deg * Math.PI / 180;
  board.alpha_val = rad;

  // Position glider M
  var mx = Math.cos(rad);
  var my = Math.sin(rad);
  if (board.M && !board.M.isDragging) {
    board.M.setPosition(JXG.COORDS_BY_USER, [mx, my]);
  }

  // Update H point projection
  board.H.setAttribute({ fixed: false });
  board.H.setPosition(JXG.COORDS_BY_USER, [mx, 0]);
  board.H.setAttribute({ fixed: true });

  // Update T point (x = 1, y = tan α)
  var tanVal = Math.tan(rad);
  var tVisible = Math.abs(mx) > 1e-3 && Math.abs(tanVal) < 8.0;
  board.T.setAttribute({ fixed: false });
  board.T.setPosition(JXG.COORDS_BY_USER, [1.0, tanVal]);
  board.T.setAttribute({ fixed: true, visible: tVisible });

  // Update K point (x = cot α, y = 1)
  var cotVal = 1.0 / tanVal;
  var kVisible = Math.abs(my) > 1e-3 && Math.abs(cotVal) < 8.0;
  board.K.setAttribute({ fixed: false });
  board.K.setPosition(JXG.COORDS_BY_USER, [cotVal, 1.0]);
  board.K.setAttribute({ fixed: true, visible: kVisible });

  // Hide/Show elements based on selected identity type
  var isOHM = (identity === 'sin²α + cos²α = 1');
  var isOAT = (identity === '1 + tan²α = 1/cos²α');
  var isOBK = (identity === '1 + cot²α = 1/sin²α');
  var isProduct = (identity === 'tan α * cot α = 1');

  // Visibilities
  board.segOH.setAttribute({ visible: isOHM });
  board.segHM.setAttribute({ visible: isOHM });
  board.segOM.setAttribute({ visible: isOHM });
  board.triOHM.setAttribute({ visible: isOHM });

  board.tanLine.setAttribute({ visible: isOAT || isProduct });
  board.T.setAttribute({ visible: (isOAT || isProduct) && tVisible });
  board.segAT.setAttribute({ visible: (isOAT || isProduct) && tVisible });
  board.segOT.setAttribute({ visible: isOAT && tVisible });
  board.triOAT.setAttribute({ visible: isOAT && tVisible });

  board.cotLine.setAttribute({ visible: isOBK || isProduct });
  board.K.setAttribute({ visible: (isOBK || isProduct) && kVisible });
  board.segBK.setAttribute({ visible: (isOBK || isProduct) && kVisible });
  board.segOK.setAttribute({ visible: isOBK && kVisible });
  board.triOBK.setAttribute({ visible: isOBK && kVisible });

  // Update Readout values
  var readoutRows = [
    { label: 'Góc α:', value: deg.toFixed(1) + '°', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #a5b4fc; font-weight: bold;' }
  ];

  if (isOHM) {
    var cosSq = mx * mx;
    var sinSq = my * my;
    readoutRows.push(
      { label: 'cos α = x_M:', value: mx.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #10b981; font-weight: bold;' },
      { label: 'sin α = y_M:', value: my.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ef4444; font-weight: bold;' },
      { label: 'Hệ thức Pythagoras trong ΔOHM:', value: math('OH^2 + HM^2 = OM^2'), labelStyle: 'color: #a78bfa;', valueStyle: 'color: #c084fc; font-weight: bold;' },
      { label: 'Thay thế giá trị:', value: cosSq.toFixed(3) + ' + ' + sinSq.toFixed(3) + ' = 1.000', labelStyle: 'color: #f472b6;', valueStyle: 'color: #f43f5e; font-weight: bold; background: rgba(244, 63, 94, 0.15); padding: 2px 6px; border-radius: 4px;' }
    );
  } else if (isOAT) {
    if (!tVisible) {
      readoutRows.push({ label: 'Trạng thái:', value: 'Không xác định tại góc này (cos α = 0)', labelStyle: 'color: #ef4444;', valueStyle: 'color: #ef4444; font-weight: bold;' });
    } else {
      var tanSq = tanVal * tanVal;
      var secSq = 1.0 / (mx * mx);
      readoutRows.push(
        { label: 'tan α = AT:', value: tanVal.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
        { label: '1/cos α = OT:', value: (1.0/mx).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #8b5cf6; font-weight: bold;' },
        { label: 'Hệ thức Pythagoras trong ΔOAT:', value: math('OA^2 + AT^2 = OT^2'), labelStyle: 'color: #a78bfa;', valueStyle: 'color: #c084fc; font-weight: bold;' },
        { label: 'Thay thế giá trị:', value: '1.000 + ' + tanSq.toFixed(3) + ' = ' + secSq.toFixed(3), labelStyle: 'color: #f472b6;', valueStyle: 'color: #fb923c; font-weight: bold; background: rgba(251, 146, 60, 0.15); padding: 2px 6px; border-radius: 4px;' }
      );
    }
  } else if (isOBK) {
    if (!kVisible) {
      readoutRows.push({ label: 'Trạng thái:', value: 'Không xác định tại góc này (sin α = 0)', labelStyle: 'color: #ef4444;', valueStyle: 'color: #ef4444; font-weight: bold;' });
    } else {
      var cotSq = cotVal * cotVal;
      var cscSq = 1.0 / (my * my);
      readoutRows.push(
        { label: 'cot α = BK:', value: cotVal.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ec4899; font-weight: bold;' },
        { label: '1/sin α = OK:', value: (1.0/my).toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #06b6d4; font-weight: bold;' },
        { label: 'Hệ thức Pythagoras trong ΔOBK:', value: math('OB^2 + BK^2 = OK^2'), labelStyle: 'color: #a78bfa;', valueStyle: 'color: #c084fc; font-weight: bold;' },
        { label: 'Thay thế giá trị:', value: '1.000 + ' + cotSq.toFixed(3) + ' = ' + cscSq.toFixed(3), labelStyle: 'color: #f472b6;', valueStyle: 'color: #ec4899; font-weight: bold; background: rgba(236, 72, 153, 0.15); padding: 2px 6px; border-radius: 4px;' }
      );
    }
  } else if (isProduct) {
    if (!tVisible || !kVisible) {
      readoutRows.push({ label: 'Trạng thái:', value: 'Không xác định tại góc này', labelStyle: 'color: #ef4444;', valueStyle: 'color: #ef4444; font-weight: bold;' });
    } else {
      readoutRows.push(
        { label: 'tan α = AT:', value: tanVal.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c; font-weight: bold;' },
        { label: 'cot α = BK:', value: cotVal.toFixed(2), labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ec4899; font-weight: bold;' },
        { label: 'Nhân hai giá trị:', value: tanVal.toFixed(3) + ' * ' + cotVal.toFixed(3) + ' = 1.000', labelStyle: 'color: #a78bfa;', valueStyle: 'color: #2dd4bf; font-weight: bold; background: rgba(45, 212, 191, 0.15); padding: 2px 6px; border-radius: 4px;' }
      );
    }
  }

  showReadouts(readoutRows);
  board.unsuspendUpdate();
}
`,
  visualizationType: 'jsxgraph',
  config: {
    boardSize: { width: 600, height: 500 },
    boundingBox: [-2.2, 2.2, 2.2, -2.2],
    showAxis: true,
    showGrid: true,
    theme: 'light',
  },
  controls: [
    { type: 'select', name: 'identityType', label: 'Hệ thức lựa chọn', defaultValue: 'sin²α + cos²α = 1', options: ['sin²α + cos²α = 1', '1 + tan²α = 1/cos²α', '1 + cot²α = 1/sin²α', 'tan α * cot α = 1'] },
    { type: 'select', name: 'mode', label: 'Chế độ góc', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc đặc biệt'] },
    { type: 'select', name: 'specialAngle', label: 'Góc đặc biệt', defaultValue: '45°', options: ['30°', '45°', '60°', '120°', '135°', '150°', '210°', '225°', '240°', '300°', '315°', '330°'], showIf: { control: 'mode', value: 'Góc đặc biệt' } }
  ],
  mathContent: '\\\\begin{aligned} \\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha \u0026= 1 \\\\\\\\ 1 + \\\\tan^2 \\\\alpha \u0026= \\\\frac{1}{\\\\cos^2 \\\\alpha} \\\\\\\\ 1 + \\\\cot^2 \\\\alpha \u0026= \\\\frac{1}{\\\\sin^2 \\\\alpha} \\\\\\\\ \\\\tan \\\\alpha \\\\cdot \\\\cot \\\\alpha \u0026= 1 \\\\end{aligned}',
  explanation: 'Các hệ thức lượng giác cơ bản có thể được trực quan hóa cực kỳ sinh động trên đường tròn đơn vị. Sử dụng định lý Pythagoras trong các tam giác vuông tương ứng tạo bởi bán kính và các trục tiếp tuyến, ta dễ dàng chứng minh các hệ thức này dưới dạng hình học trực quan.',
  keyInsights: [
    '📌 Tam giác OHM chứng minh sin²α + cos²α = 1.',
    '📌 Tam giác OAT chứng minh 1 + tan²α = 1/cos²α (với T là giao điểm của tia OM và tiếp tuyến x=1).',
    '📌 Tam giác OBK chứng minh 1 + cot²α = 1/sin²α (với K là giao điểm của tia OM và tiếp tuyến y=1).',
    '📌 Tích tan α * cot α luôn bằng 1 khi góc α làm cho cả hai giá trị xác định.'
  ],
  tags: ['lượng giác', 'hệ thức lượng giác cơ bản', 'sin', 'cos', 'tan', 'cot'],
  difficulty: 'basic',
  isPublished: true,
};
