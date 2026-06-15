export const demo2_15 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'gia-tri-luong-giac',
  title: 'Tính Giá trị lượng giác từ Giá trị cho trước',
  description: 'Mô phỏng giải đại số từng bước và trực quan hóa hình học khi biết trước 1 giá trị lượng giác (sin, cos, tan, cot) cùng góc phần tư. Kiểm tra tính tương thích và thể hiện dấu của các giá trị.',
  order: 4,
  simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();

  // Quadrant overlays for left board
  board.quad1 = board.create('polygon', [[0,0], [2.2, 0], [2.2, 2.2], [0, 2.2]], {
    fillColor: '#10b981', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad2 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, 2.2], [0, 2.2]], {
    fillColor: '#6366f1', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad3 = board.create('polygon', [[0,0], [-2.2, 0], [-2.2, -2.5], [0, -2.5]], {
    fillColor: '#f59e0b', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });
  board.quad4 = board.create('polygon', [[0,0], [2.2, 0], [2.2, -2.5], [0, -2.5]], {
    fillColor: '#f43f5e', fillOpacity: 0.01, borders: { visible: false }, vertices: { visible: false }
  });

  // Unit circle
  board.circle = board.create('circle', [[0,0], 1.0], {
    strokeColor: '#94a3b8', strokeWidth: 2, highlight: false, fixed: true
  });

  // Origin O
  board.O = board.create('point', [0, 0], {
    name: 'O', size: 3, fillColor: '#64748b', strokeColor: '#475569', fixed: true,
    label: { display: 'html', fontSize: 13, offset: [-15, -15] }
  });

  // Points on axes
  board.A_pt = board.create('point', [1.0, 0], { name: 'A', size: 2, fillColor: '#64748b', strokeColor: '#475569', fixed: true, visible: false });
  board.B_pt = board.create('point', [0, 1.0], { name: 'B', size: 2, fillColor: '#64748b', strokeColor: '#475569', fixed: true, visible: false });

  // Main point P
  board.P = board.create('point', [0, 0], {
    name: 'P', size: 5, fillColor: '#6366f1', strokeColor: '#4f46e5', fixed: true,
    label: { display: 'html', fontSize: 13, color: '#4f46e5', offset: [10, 10] }
  });

  // Projections
  board.H = board.create('point', [0, 0], { name: 'H', size: 3.5, fillColor: '#10b981', strokeColor: '#059669', fixed: true, label: { fontSize: 11, offset: [-5, -12] } });
  board.K = board.create('point', [0, 0], { name: 'K', size: 3.5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true, label: { fontSize: 11, offset: [-15, 8] } });

  // Segments
  board.segOP = board.create('segment', [board.O, board.P], { strokeColor: '#cbd5e1', strokeWidth: 1.5 });
  board.segPH = board.create('segment', [board.P, board.H], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 2 });
  board.segPK = board.create('segment', [board.P, board.K], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 2 });
  board.segOH = board.create('segment', [board.O, board.H], { strokeColor: '#10b981', strokeWidth: 3 });
  board.segOK = board.create('segment', [board.O, board.K], { strokeColor: '#ef4444', strokeWidth: 3 });

  // Tangents helpers
  board.tanLine = board.create('line', [[1.0, -2], [1.0, 2]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, dash: 1 });
  board.cotLine = board.create('line', [[-2, 1.0], [2, 1.0]], { strokeColor: '#cbd5e1', strokeWidth: 0.8, dash: 1 });
  board.T = board.create('point', [1.0, 0], { name: 'T', size: 3.5, fillColor: '#fb923c', strokeColor: '#ea580c', fixed: true, label: { fontSize: 11, offset: [10, 5] } });
  board.K_cot = board.create('point', [0, 1.0], { name: 'K_cot', size: 3.5, fillColor: '#ec4899', strokeColor: '#be185d', fixed: true, label: { fontSize: 11, offset: [-12, 12] } });
  board.segAT = board.create('segment', [board.A_pt, board.T], { strokeColor: '#fb923c', strokeWidth: 2.5 });
  board.segBK = board.create('segment', [board.B_pt, board.K_cot], { strokeColor: '#ec4899', strokeWidth: 2.5 });

  // Axis labels
  board.create('text', [1.9, 0.1, math('\\text{cos}')], { display: 'html', fontSize: 12, color: '#10b981' });
  board.create('text', [0.08, 1.9, math('\\text{sin}')], { display: 'html', fontSize: 12, color: '#ef4444' });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();

  var givenType = params.givenType || 'sin α';
  var quad = params.quadrant || 'Góc phần tư I';

  // Retrieve input values based on control visibility
  var val = 0.6;
  if (givenType === 'sin α' || givenType === 'cos α') {
    val = params.valSinCos !== undefined ? params.valSinCos : 0.6;
  } else {
    val = params.valTanCot !== undefined ? params.valTanCot : 1.5;
  }

  // Define signs for each quadrant
  // I: sin+, cos+, tan+, cot+
  // II: sin+, cos-, tan-, cot-
  // III: sin-, cos-, tan+, cot+
  // IV: sin-, cos+, tan-, cot-
  var isQuad1 = (quad === 'Góc phần tư I');
  var isQuad2 = (quad === 'Góc phần tư II');
  var isQuad3 = (quad === 'Góc phần tư III');
  var isQuad4 = (quad === 'Góc phần tư IV');

  // Set Quadrant overlay opacities
  board.quad1.setAttribute({ fillOpacity: isQuad1 ? 0.15 : 0.01 });
  board.quad2.setAttribute({ fillOpacity: isQuad2 ? 0.15 : 0.01 });
  board.quad3.setAttribute({ fillOpacity: isQuad3 ? 0.15 : 0.01 });
  board.quad4.setAttribute({ fillOpacity: isQuad4 ? 0.15 : 0.01 });

  // Compatibility checking
  var isValid = true;
  var errorMsg = '';

  if (givenType === 'sin α') {
    if (Math.abs(val) > 1.0) {
      isValid = false;
      errorMsg = 'Giá trị của sin α phải nằm trong đoạn [-1, 1]!';
    } else if ((isQuad1 || isQuad2) && val < 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', sin α phải không âm (≥ 0)!';
    } else if ((isQuad3 || isQuad4) && val > 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', sin α phải không dương (≤ 0)!';
    }
  } else if (givenType === 'cos α') {
    if (Math.abs(val) > 1.0) {
      isValid = false;
      errorMsg = 'Giá trị của cos α phải nằm trong đoạn [-1, 1]!';
    } else if ((isQuad1 || isQuad4) && val < 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', cos α phải không âm (≥ 0)!';
    } else if ((isQuad2 || isQuad3) && val > 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', cos α phải không dương (≤ 0)!';
    }
  } else if (givenType === 'tan α') {
    if ((isQuad1 || isQuad3) && val < 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', tan α phải không âm (≥ 0)!';
    } else if ((isQuad2 || isQuad4) && val > 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', tan α phải không dương (≤ 0)!';
    }
  } else if (givenType === 'cot α') {
    if ((isQuad1 || isQuad3) && val < 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', cot α phải không âm (≥ 0)!';
    } else if ((isQuad2 || isQuad4) && val > 0) {
      isValid = false;
      errorMsg = 'Ở ' + quad + ', cot α phải không dương (≤ 0)!';
    }
  }

  var readoutRows = [];

  if (!isValid) {
    // Hide geometry points
    board.P.setAttribute({ visible: false });
    board.H.setAttribute({ visible: false });
    board.K.setAttribute({ visible: false });
    board.T.setAttribute({ visible: false });
    board.K_cot.setAttribute({ visible: false });
    board.segOP.setAttribute({ visible: false });
    board.segPH.setAttribute({ visible: false });
    board.segPK.setAttribute({ visible: false });
    board.segOH.setAttribute({ visible: false });
    board.segOK.setAttribute({ visible: false });
    board.segAT.setAttribute({ visible: false });
    board.segBK.setAttribute({ visible: false });

    readoutRows.push(
      { label: 'Trạng thái:', value: 'Dữ liệu không tương thích', labelStyle: 'color: #ef4444; font-weight: bold;', valueStyle: 'color: #ef4444; font-weight: bold; background: rgba(239,68,68,0.15); padding: 4px 8px; border-radius: 4px;' },
      { label: 'Chi tiết lỗi:', value: errorMsg, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ef4444; font-style: italic;' }
    );
  } else {
    // Compute angle alpha and all trig values
    var rad = 0;
    var sinVal = 0, cosVal = 0, tanVal = 0, cotVal = 0;
    var signCos = 1, signSin = 1;

    // Define expected signs for cos and sin based on quadrant
    if (isQuad1) { signCos = 1; signSin = 1; }
    else if (isQuad2) { signCos = -1; signSin = 1; }
    else if (isQuad3) { signCos = -1; signSin = -1; }
    else if (isQuad4) { signCos = 1; signSin = -1; }

    var step1 = '', step2 = '', step3 = '', step4 = '';

    if (givenType === 'sin α') {
      sinVal = val;
      var cosSq = 1 - sinVal * sinVal;
      cosVal = signCos * Math.sqrt(cosSq);
      tanVal = sinVal / cosVal;
      cotVal = 1.0 / tanVal;

      rad = Math.asin(sinVal);
      if (isQuad2 || isQuad3) rad = Math.PI - rad;
      else if (isQuad4) rad = 2 * Math.PI + rad;

      step1 = '1. \\\\cos^2 \\\\alpha = 1 - \\\\sin^2 \\\\alpha = 1 - (' + sinVal.toFixed(2) + ')^2 = ' + cosSq.toFixed(4);
      var signText = signCos > 0 ? ' > 0' : ' < 0';
      var signChar = signCos > 0 ? '' : '-';
      step2 = '2. Vì \\\\alpha thuộc ' + quad + ' nên \\\\cos\\\\alpha' + signText + ' \\\\implies \\\\cos\\\\alpha = ' + signChar + '\\\\sqrt{' + cosSq.toFixed(4) + '} = ' + cosVal.toFixed(2);
      step3 = '3. \\\\tan\\\\alpha = \\\\frac{\\\\sin\\\\alpha}{\\\\cos\\\\alpha} = \\\\frac{' + sinVal.toFixed(2) + '}{' + cosVal.toFixed(2) + '} = ' + tanVal.toFixed(2);
      step4 = '4. \\\\cot\\\\alpha = \\\\frac{1}{\\\\tan\\\\alpha} = \\\\frac{1}{' + tanVal.toFixed(2) + '} = ' + cotVal.toFixed(2);

    } else if (givenType === 'cos α') {
      cosVal = val;
      var sinSq = 1 - cosVal * cosVal;
      sinVal = signSin * Math.sqrt(sinSq);
      tanVal = sinVal / cosVal;
      cotVal = 1.0 / tanVal;

      rad = Math.acos(cosVal);
      if (isQuad3 || isQuad4) rad = 2 * Math.PI - rad;

      step1 = '1. \\\\sin^2 \\\\alpha = 1 - \\\\cos^2 \\\\alpha = 1 - (' + cosVal.toFixed(2) + ')^2 = ' + sinSq.toFixed(4);
      var signText = signSin > 0 ? ' > 0' : ' < 0';
      var signChar = signSin > 0 ? '' : '-';
      step2 = '2. Vì \\\\alpha thuộc ' + quad + ' nên \\\\sin\\\\alpha' + signText + ' \\\\implies \\\\sin\\\\alpha = ' + signChar + '\\\\sqrt{' + sinSq.toFixed(4) + '} = ' + sinVal.toFixed(2);
      step3 = '3. \\\\tan\\\\alpha = \\\\frac{\\\\sin\\\\alpha}{\\\\cos\\\\alpha} = \\\\frac{' + sinVal.toFixed(2) + '}{' + cosVal.toFixed(2) + '} = ' + tanVal.toFixed(2);
      step4 = '4. \\\\cot\\\\alpha = \\\\frac{1}{\\\\tan\\\\alpha} = \\\\frac{1}{' + tanVal.toFixed(2) + '} = ' + cotVal.toFixed(2);

    } else if (givenType === 'tan α') {
      tanVal = val;
      cotVal = 1.0 / tanVal;
      var cosSq = 1.0 / (1.0 + tanVal * tanVal);
      cosVal = signCos * Math.sqrt(cosSq);
      sinVal = tanVal * cosVal;

      rad = Math.atan(tanVal);
      if (isQuad2 || isQuad3) rad = Math.PI + rad;
      else if (isQuad4) rad = 2 * Math.PI + rad;

      step1 = '1. \\\\cos^2 \\\\alpha = \\\\frac{1}{1+\\\\tan^2 \\\\alpha} = \\\\frac{1}{1+(' + tanVal.toFixed(2) + ')^2} = ' + cosSq.toFixed(4);
      var signText = signCos > 0 ? ' > 0' : ' < 0';
      var signChar = signCos > 0 ? '' : '-';
      step2 = '2. Vì \\\\alpha thuộc ' + quad + ' nên \\\\cos\\\\alpha' + signText + ' \\\\implies \\\\cos\\\\alpha = ' + signChar + '\\\\sqrt{' + cosSq.toFixed(4) + '} = ' + cosVal.toFixed(2);
      step3 = '3. \\\\sin\\\\alpha = \\\\tan\\\\alpha \\\\cdot \\\\cos\\\\alpha = ' + tanVal.toFixed(2) + ' \\\\cdot (' + cosVal.toFixed(2) + ') = ' + sinVal.toFixed(2);
      step4 = '4. \\\\cot\\\\alpha = \\\\frac{1}{\\\\tan\\\\alpha} = \\\\frac{1}{' + tanVal.toFixed(2) + '} = ' + cotVal.toFixed(2);

    } else if (givenType === 'cot α') {
      cotVal = val;
      tanVal = 1.0 / cotVal;
      var sinSq = 1.0 / (1.0 + cotVal * cotVal);
      sinVal = signSin * Math.sqrt(sinSq);
      cosVal = cotVal * sinVal;

      rad = Math.atan(1.0 / cotVal);
      if (isQuad2 || isQuad3) rad = Math.PI + rad;
      else if (isQuad4) rad = 2 * Math.PI + rad;

      step1 = '1. \\\\sin^2 \\\\alpha = \\\\frac{1}{1+\\\\cot^2 \\\\alpha} = \\\\frac{1}{1+(' + cotVal.toFixed(2) + ')^2} = ' + sinSq.toFixed(4);
      var signText = signSin > 0 ? ' > 0' : ' < 0';
      var signChar = signSin > 0 ? '' : '-';
      step2 = '2. Vì \\\\alpha thuộc ' + quad + ' nên \\\\sin\\\\alpha' + signText + ' \\\\implies \\\\sin\\\\alpha = ' + signChar + '\\\\sqrt{' + sinSq.toFixed(4) + '} = ' + sinVal.toFixed(2);
      step3 = '3. \\\\cos\\\\alpha = \\\\cot\\\\alpha \\\\cdot \\\\sin\\\\alpha = ' + cotVal.toFixed(2) + ' \\\\cdot (' + sinVal.toFixed(2) + ') = ' + cosVal.toFixed(2);
      step4 = '4. \\\\tan\\\\alpha = \\\\frac{1}{\\\\cot\\\\alpha} = \\\\frac{1}{' + cotVal.toFixed(2) + '} = ' + tanVal.toFixed(2);
    }

    // Set geometry points
    var px = Math.cos(rad);
    var py = Math.sin(rad);

    board.P.setAttribute({ fixed: false });
    board.P.setPosition(JXG.COORDS_BY_USER, [px, py]);
    board.P.setAttribute({ fixed: true, visible: true });

    board.H.setAttribute({ fixed: false });
    board.H.setPosition(JXG.COORDS_BY_USER, [px, 0]);
    board.H.setAttribute({ fixed: true, visible: true });

    board.K.setAttribute({ fixed: false });
    board.K.setPosition(JXG.COORDS_BY_USER, [0, py]);
    board.K.setAttribute({ fixed: true, visible: true });

    var tVisible = Math.abs(px) > 1e-3 && Math.abs(tanVal) < 8.0;
    board.T.setAttribute({ fixed: false });
    board.T.setPosition(JXG.COORDS_BY_USER, [1.0, tanVal]);
    board.T.setAttribute({ fixed: true, visible: tVisible });

    var kVisible = Math.abs(py) > 1e-3 && Math.abs(cotVal) < 8.0;
    board.K_cot.setAttribute({ fixed: false });
    board.K_cot.setPosition(JXG.COORDS_BY_USER, [cotVal, 1.0]);
    board.K_cot.setAttribute({ fixed: true, visible: kVisible });

    // Show visual segments
    board.segOP.setAttribute({ visible: true });
    board.segPH.setAttribute({ visible: true });
    board.segPK.setAttribute({ visible: true });
    board.segOH.setAttribute({ visible: true });
    board.segOK.setAttribute({ visible: true });
    board.segAT.setAttribute({ visible: tVisible });
    board.segBK.setAttribute({ visible: kVisible });

    var degText = (rad * 180 / Math.PI).toFixed(1) + '°';

    // Populate readout table
    readoutRows.push(
      { label: 'Góc α tính toán:', value: degText + ' (' + (rad/Math.PI).toFixed(2) + 'π rad)', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
      { label: '1. Tính cos α:', value: math(step2), labelStyle: 'color: #94a3b8;', valueStyle: 'color: #34d399; font-weight: bold;' },
      { label: '2. Tính sin α:', value: math(step2.indexOf('sin') !== -1 ? step2 : step1.indexOf('sin') !== -1 ? 'sin \\\\alpha = ' + sinVal.toFixed(2) : 'sin \\\\alpha = ' + sinVal.toFixed(2)), labelStyle: 'color: #94a3b8;', valueStyle: 'color: #ef4444; font-weight: bold;' },
      { label: '3. Tính tan α:', value: math(step3), labelStyle: 'color: #94a3b8;', valueStyle: 'color: #fb923c; font-weight: bold;' },
      { label: '4. Tính cot α:', value: math(step4), labelStyle: 'color: #94a3b8;', valueStyle: 'color: #ec4899; font-weight: bold;' },
      { label: 'Đáp số lượng giác:', value: 'cos=' + cosVal.toFixed(2) + '; sin=' + sinVal.toFixed(2) + '; tan=' + tanVal.toFixed(2) + '; cot=' + cotVal.toFixed(2), labelStyle: 'color: #a78bfa; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px; color: #c084fc; font-weight: bold; background: rgba(192,132,252,0.15); padding: 2px 6px; border-radius: 4px;' }
    );
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
    { type: 'select', name: 'givenType', label: 'Giá trị đã biết', defaultValue: 'sin α', options: ['sin α', 'cos α', 'tan α', 'cot α'] },
    { type: 'select', name: 'quadrant', label: 'Góc phần tư', defaultValue: 'Góc phần tư I', options: ['Góc phần tư I', 'Góc phần tư II', 'Góc phần tư III', 'Góc phần tư IV'] },
    
    // Dependent sliders
    { type: 'slider', name: 'valSinCos', label: 'Trị số sin/cos', min: -1.0, max: 1.0, step: 0.05, defaultValue: 0.60, showIf: { control: 'givenType', value: ['sin α', 'cos α'] } },
    { type: 'slider', name: 'valTanCot', label: 'Trị số tan/cot', min: -3.0, max: 3.0, step: 0.1, defaultValue: 1.50, showIf: { control: 'givenType', value: ['tan α', 'cot α'] } }
  ],
  mathContent: '\\\\sin^2 \\\\alpha + \\\\cos^2 \\\\alpha = 1 \\\\quad \\\\text{và} \\\\quad \\\\tan \\\\alpha \\\\cdot \\\\cot \\\\alpha = 1',
  explanation: 'Khi biết một giá trị lượng giác và góc phần tư của α, ta có thể tính được độc nhất 3 giá trị lượng giác còn lại dựa trên các hệ thức cơ bản. Dấu của các giá trị phụ thuộc vào việc điểm P thuộc phần tư nào trên đường tròn lượng giác.',
  keyInsights: [
    '📖 Công thức áp dụng chính:',
    '1. sin²α + cos²α = 1 để tìm sin từ cos (hoặc ngược lại), lưu ý lấy dấu dựa vào góc phần tư.',
    '2. tan α = sin α / cos α để tìm tan.',
    '3. cot α = 1 / tan α (hoặc cot α = cos α / sin α) để tìm cot.'
  ],
  tags: ['lượng giác', 'tính giá trị lượng giác', 'sin', 'cos', 'tan', 'cot', 'góc phần tư'],
  difficulty: 'intermediate',
  isPublished: true,
};
