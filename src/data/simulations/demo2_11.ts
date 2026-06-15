export const demo2_11 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'ham-so-luong-giac',
  title: 'Ứng dụng thực tế của Hàm số lượng giác',
  description: 'Mô phỏng trực quan 3 ứng dụng thực tế của hàm số tuần hoàn: Dao động lò xo, mực nước thủy triều, và thời gian chiếu sáng của Mặt Trời.',
  order: 2,
  simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  board.right.suspendUpdate();

  // LEFT BOARD (board) - Physical Models
  // Spring Oscillation
  var springX = function(s) {
    var xCenter = 0.0;
    if (s < 0.08) return xCenter;
    if (s > 0.92) return xCenter;
    var amp = 0.3 * Math.sin(Math.PI * (s - 0.08) / 0.84);
    var numCoils = 12;
    return xCenter + amp * Math.sin(s * numCoils * 2 * Math.PI);
  };
  var springY = function(s) {
    var yMass = board.yMass_val || 0;
    var yAnchor = 2.0;
    return yAnchor - s * (yAnchor - yMass);
  };
  board.spring = board.create('curve', [springX, springY, 0, 1], { strokeColor: '#64748b', strokeWidth: 2, visible: false });

  // Mass block for spring
  board.massP1 = board.create('point', [function() { return -0.4; }, function() { return (board.yMass_val || 0) + 0.3; }], { visible: false, withLabel: false, name: '' });
  board.massP2 = board.create('point', [function() { return 0.4; }, function() { return (board.yMass_val || 0) + 0.3; }], { visible: false, withLabel: false, name: '' });
  board.massP3 = board.create('point', [function() { return 0.4; }, function() { return (board.yMass_val || 0) - 0.3; }], { visible: false, withLabel: false, name: '' });
  board.massP4 = board.create('point', [function() { return -0.4; }, function() { return (board.yMass_val || 0) - 0.3; }], { visible: false, withLabel: false, name: '' });
  board.massBlock = board.create('polygon', [board.massP1, board.massP2, board.massP3, board.massP4], { 
    fillColor: '#ef4444', fillOpacity: 0.8, 
    borders: { strokeColor: '#be185d', strokeWidth: 1.5 }, 
    vertices: { visible: false }, visible: false 
  });

  // Spring ceiling anchor
  board.ceilingP1 = board.create('point', [-0.6, 2.0], { visible: false, withLabel: false, name: '' });
  board.ceilingP2 = board.create('point', [0.6, 2.0], { visible: false, withLabel: false, name: '' });
  board.ceiling = board.create('segment', [board.ceilingP1, board.ceilingP2], { strokeColor: '#475569', strokeWidth: 3, visible: false });

  // Tidal Wave
  board.seaFloorP1 = board.create('point', [-1.8, -1.8], { visible: false, withLabel: false, name: '' });
  board.seaFloorP2 = board.create('point', [1.8, -1.8], { visible: false, withLabel: false, name: '' });
  board.seaFloor = board.create('segment', [board.seaFloorP1, board.seaFloorP2], { strokeColor: '#64748b', strokeWidth: 2, visible: false });

  board.seaP1 = board.create('point', [-1.8, -1.8], { visible: false, withLabel: false, name: '' });
  board.seaP2 = board.create('point', [1.8, -1.8], { visible: false, withLabel: false, name: '' });
  board.seaP3 = board.create('point', [1.8, function() { return board.yWater_val || -0.5; }], { visible: false, withLabel: false, name: '' });
  board.seaP4 = board.create('point', [-1.8, function() { return board.yWater_val || -0.5; }], { visible: false, withLabel: false, name: '' });
  board.seaWater = board.create('polygon', [board.seaP1, board.seaP2, board.seaP3, board.seaP4], { 
    fillColor: '#38bdf8', fillOpacity: 0.6, borders: { visible: false }, vertices: { visible: false }, visible: false 
  });

  board.rock1 = board.create('polygon', [[-1.6, -1.8], [-1.2, -1.1], [-0.8, -1.8]], { fillColor: '#94a3b8', fillOpacity: 0.8, borders: { strokeColor: '#64748b', strokeWidth: 1 }, vertices: { visible: false }, visible: false });
  board.rock2 = board.create('polygon', [[0.8, -1.8], [1.2, -0.9], [1.6, -1.8]], { fillColor: '#94a3b8', fillOpacity: 0.8, borders: { strokeColor: '#64748b', strokeWidth: 1 }, vertices: { visible: false }, visible: false });

  // Ship and cabin
  board.shipP1 = board.create('point', [function() { return -0.7; }, function() { return board.yWater_val || 0; }], { visible: false, withLabel: false, name: '' });
  board.shipP2 = board.create('point', [function() { return 0.7; }, function() { return board.yWater_val || 0; }], { visible: false, withLabel: false, name: '' });
  board.shipP3 = board.create('point', [function() { return 0.95; }, function() { return (board.yWater_val || 0) + 0.25; }], { visible: false, withLabel: false, name: '' });
  board.shipP4 = board.create('point', [function() { return -0.95; }, function() { return (board.yWater_val || 0) + 0.25; }], { visible: false, withLabel: false, name: '' });
  board.ship = board.create('polygon', [board.shipP1, board.shipP2, board.shipP3, board.shipP4], { 
    fillColor: '#fb923c', fillOpacity: 0.9, borders: { strokeColor: '#ea580c', strokeWidth: 1.5 }, vertices: { visible: false }, visible: false 
  });

  board.cabinP1 = board.create('point', [function() { return -0.4; }, function() { return (board.yWater_val || 0) + 0.25; }], { visible: false, withLabel: false, name: '' });
  board.cabinP2 = board.create('point', [function() { return 0.4; }, function() { return (board.yWater_val || 0) + 0.25; }], { visible: false, withLabel: false, name: '' });
  board.cabinP3 = board.create('point', [function() { return 0.4; }, function() { return (board.yWater_val || 0) + 0.45; }], { visible: false, withLabel: false, name: '' });
  board.cabinP4 = board.create('point', [function() { return -0.4; }, function() { return (board.yWater_val || 0) + 0.45; }], { visible: false, withLabel: false, name: '' });
  board.cabin = board.create('polygon', [board.cabinP1, board.cabinP2, board.cabinP3, board.cabinP4], { 
    fillColor: '#cbd5e1', fillOpacity: 0.8, borders: { strokeColor: '#64748b', strokeWidth: 1.0 }, vertices: { visible: false }, visible: false 
  });

  // Space simulation (Sunlight Hours / Earth orbit)
  board.sunPoint = board.create('point', [0, 0], { visible: false, withLabel: false, name: '', fixed: true });
  
  // Vector Sun Elements
  board.sunHalo = board.create('circle', [board.sunPoint, 0.45], { fillColor: '#fef08a', fillOpacity: 0.25, strokeColor: 'transparent', visible: false, fixed: true });
  board.sunBody = board.create('circle', [board.sunPoint, 0.25], { fillColor: '#fbbf24', fillOpacity: 0.95, strokeColor: '#d97706', strokeWidth: 1.5, visible: false, fixed: true });
  board.sunRays = [];
  for (var i = 0; i < 8; i++) {
    (function(angle) {
      var p1 = board.create('point', [
        function() { return 0.28 * Math.cos(angle); },
        function() { return 0.28 * Math.sin(angle); }
      ], { visible: false, withLabel: false, name: '' });
      var p2 = board.create('point', [
        function() { return 0.42 * Math.cos(angle); },
        function() { return 0.42 * Math.sin(angle); }
      ], { visible: false, withLabel: false, name: '' });
      var ray = board.create('segment', [p1, p2], { strokeColor: '#d97706', strokeWidth: 1.5, visible: false });
      board.sunRays.push(ray);
    })(i * Math.PI / 4);
  }

  board.sunLabel = board.create('text', [0, -0.75, 'Mặt Trời'], { 
    display: 'internal', fontSize: 10, color: '#ca8a04', fontWeight: 'bold', fixed: true, visible: false, anchorX: 'middle', anchorY: 'top'
  });

  // Orbit ellipse path
  board.orbitEllipse = board.create('ellipse', [[0, 0], [1.5, 0], [0, 1.1]], { strokeColor: '#cbd5e1', strokeWidth: 1.2, dash: 2, visible: false, fixed: true });

  board.earthPoint = board.create('point', [
    function() { return 1.5 * Math.cos(board.theta_val || 0); },
    function() { return 1.1 * Math.sin(board.theta_val || 0); }
  ], { visible: false, withLabel: false, name: '', fixed: true });

  // Vector Earth Elements
  board.earthHalo = board.create('circle', [board.earthPoint, 0.22], { fillColor: '#93c5fd', fillOpacity: 0.2, strokeColor: 'transparent', visible: false, fixed: true });
  board.earthBody = board.create('circle', [board.earthPoint, 0.15], { fillColor: '#3b82f6', fillOpacity: 0.95, strokeColor: '#1d4ed8', strokeWidth: 1.2, visible: false, fixed: true });
  
  board.earthLandPoint = board.create('point', [
    function() { return board.earthPoint.X() + 0.03; },
    function() { return board.earthPoint.Y() + 0.03; }
  ], { visible: false, withLabel: false, name: '' });
  board.earthLand = board.create('circle', [board.earthLandPoint, 0.06], { fillColor: '#10b981', fillOpacity: 0.85, strokeColor: 'transparent', visible: false, fixed: true });

  board.earthLabel = board.create('text', [
    function() { return board.earthPoint.X(); },
    function() { return board.earthPoint.Y() - 0.65; },
    'Trái Đất'
  ], { display: 'internal', fontSize: 10, color: '#1d4ed8', fontWeight: 'bold', fixed: true, visible: false, anchorX: 'middle', anchorY: 'top' });

  board.earthAxisP1 = board.create('point', [
    function() { return board.earthPoint.X() - 0.3 * Math.sin(23.5 * Math.PI / 180); },
    function() { return board.earthPoint.Y() - 0.3 * Math.cos(23.5 * Math.PI / 180); }
  ], { visible: false, withLabel: false, name: '' });
  board.earthAxisP2 = board.create('point', [
    function() { return board.earthPoint.X() + 0.3 * Math.sin(23.5 * Math.PI / 180); },
    function() { return board.earthPoint.Y() + 0.3 * Math.cos(23.5 * Math.PI / 180); }
  ], { visible: false, withLabel: false, name: '' });
  board.earthAxis = board.create('segment', [board.earthAxisP1, board.earthAxisP2], { strokeColor: '#ef4444', strokeWidth: 1.5, visible: false });


  // RIGHT BOARD (board.right) - Function Graphs
  var br = board.right;
  
  // Custom axes for graph
  br.customXAxis = br.create('axis', [[0, 0], [1, 0]], { ticks: { visible: false } });
  br.customYAxis = br.create('axis', [[0, 0], [0, 1]], { ticks: { visible: false } });

  br.customXTicks = br.create('ticks', [br.customXAxis, [Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI]], {
    drawLabels: true,
    labels: ['π/2', 'π', '3π/2', '2π'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 11, color: '#475569', fontWeight: 'bold' }
  });

  br.customYTicks = br.create('ticks', [br.customYAxis, [-1.0, 1.0]], {
    drawLabels: false
  });

  // Dynamic y-tick labels as text elements — always show actual amplitude
  br.yTickLabel1 = br.create('text', [-0.15, 1.0, '1.00'], { display: 'internal', fontSize: 10, color: '#475569', fontWeight: 'bold', fixed: true, anchorX: 'right' });
  br.yTickLabel2 = br.create('text', [-0.15, -1.0, '-1.00'], { display: 'internal', fontSize: 10, color: '#475569', fontWeight: 'bold', fixed: true, anchorX: 'right' });

  // Dynamic label for y-axis showing unit
  br.yAxisUnitLabel = br.create('text', [0.15, 1.3, 'y (m)'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });
  br.create('text', [6.8, 0.15, 't'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });

  br.G = br.create('point', [0, 0], { name: '', size: 5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true, withLabel: false });

  br.timeLine = br.create('line', [[function() { return br.G.X(); }, -5], [function() { return br.G.X(); }, 5]], { 
    strokeColor: 'rgba(99, 102, 241, 0.25)', strokeWidth: 1, dash: 2, straightFirst: true, straightLast: true 
  });

  br.P_trace_origin = br.create('point', [0, function() { return br.G.Y(); }], { visible: false });
  br.tracerLine = br.create('segment', [br.P_trace_origin, br.G], { strokeColor: 'rgba(239, 68, 68, 0.45)', strokeWidth: 1.5, dash: 3 });

  // All graph functions normalized to [-1, 1] range
  br.graph = br.create('functiongraph', [
    function(x) {
      var mode = board.currentMode || 'Dao động lò xo';
      if (mode === 'Dao động lò xo') {
        var w = board.w_spring || 3.0;
        return Math.sin(w * (x / 0.6));
      }
      if (mode === 'Mực nước thủy triều') {
        var t = x / 0.25;
        return Math.cos((2 * Math.PI / 12) * t);
      }
      if (mode === 'Giờ chiếu sáng mặt trời') {
        var d = x * 365.0 / 6.0;
        return Math.sin((2 * Math.PI / 365) * (d - 80));
      }
      return 0;
    }
  ], { strokeColor: '#6366f1', strokeWidth: 3, highlight: false });

  board.unsuspendUpdate();
  br.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  var mode = params.mode || 'Dao động lò xo';
  board.currentMode = mode;

  board.t_spring = params.t_spring !== undefined ? params.t_spring : 2.0;
  board.A_spring = params.A_spring !== undefined ? params.A_spring : 1.0;
  board.w_spring = params.w_spring !== undefined ? params.w_spring : 3.0;

  board.t_tide = params.t_tide !== undefined ? params.t_tide : 6.0;
  board.A_tide = params.A_tide !== undefined ? params.A_tide : 2.0;
  board.d_tide = params.d_tide !== undefined ? params.d_tide : 10.0;

  board.d_daylight = params.d_daylight !== undefined ? params.d_daylight : 172;
  board.A_daylight = params.A_daylight !== undefined ? params.A_daylight : 4.0;

  // Physical values for readouts
  board.yMass_val = board.A_spring * Math.sin(board.w_spring * board.t_spring);
  var h_tide = board.d_tide + board.A_tide * Math.cos((2 * Math.PI / 12) * board.t_tide);
  var L_daylight = 12.0 + board.A_daylight * Math.sin((2 * Math.PI / 365) * (board.d_daylight - 80));

  // Normalized value for graph G point (always [-1, 1])
  var isSpring = (mode === 'Dao động lò xo');
  var isTide = (mode === 'Mực nước thủy triều');
  var isDaylight = (mode === 'Giờ chiếu sáng mặt trời');

  if (isSpring) {
    board.yNorm_val = Math.sin(board.w_spring * board.t_spring);
  } else if (isTide) {
    board.yNorm_val = Math.cos((2 * Math.PI / 12) * board.t_tide);
  } else if (isDaylight) {
    board.yNorm_val = Math.sin((2 * Math.PI / 365) * (board.d_daylight - 80));
  } else {
    board.yNorm_val = 0;
  }

  // Explicitly update point G position on the graph board to bypass JSXGraph function evaluation lag
  var gx = 0;
  if (isSpring) gx = 0.6 * board.t_spring;
  else if (isTide) gx = 0.25 * board.t_tide;
  else if (isDaylight) gx = 6.0 * board.d_daylight / 365.0;
  var gy = board.yNorm_val;
  console.log('DEBUG demo2_11:', {
    isSpring: isSpring,
    t_spring: board.t_spring,
    gx: gx,
    gy: gy,
    G_defined: !!(board.right && board.right.G)
  });
  if (board.right && board.right.G) {
    board.right.G.setAttribute({ fixed: false });
    board.right.G.setPosition(JXG.COORDS_BY_USER, [gx, gy]);
    board.right.G.setAttribute({ fixed: true });
  }

  // yWater_val for left panel: depth sets base level, oscillation adds wave
  // d ranges 6-14 (center 10), map to visual offset: (d-10)*0.15
  // Oscillation amplitude: 0.5 * yNorm_val
  var depthOffset = (board.d_tide - 10.0) * 0.15;
  board.yWater_val = depthOffset + board.yNorm_val * 0.5;
  board.yDaylight_val = board.yNorm_val;

  board.theta_val = (2 * Math.PI / 365) * (board.d_daylight - 80);

  // y-tick labels update automatically via dynamic text elements

  board.spring.setAttribute({ visible: isSpring });
  board.massBlock.setAttribute({ visible: isSpring });
  board.ceiling.setAttribute({ visible: isSpring });
  board.ceilingP1.setAttribute({ visible: false });
  board.ceilingP2.setAttribute({ visible: false });

  // Keep spring points invisible
  board.massP1.setAttribute({ visible: false });
  board.massP2.setAttribute({ visible: false });
  board.massP3.setAttribute({ visible: false });
  board.massP4.setAttribute({ visible: false });

  board.seaFloor.setAttribute({ visible: isTide });
  board.seaFloorP1.setAttribute({ visible: false });
  board.seaFloorP2.setAttribute({ visible: false });
  board.seaWater.setAttribute({ visible: isTide });
  board.ship.setAttribute({ visible: isTide });
  board.cabin.setAttribute({ visible: isTide });
  board.rock1.setAttribute({ visible: isTide });
  board.rock2.setAttribute({ visible: isTide });

  // Keep tide points invisible
  board.seaP1.setAttribute({ visible: false });
  board.seaP2.setAttribute({ visible: false });
  board.seaP3.setAttribute({ visible: false });
  board.seaP4.setAttribute({ visible: false });
  board.shipP1.setAttribute({ visible: false });
  board.shipP2.setAttribute({ visible: false });
  board.shipP3.setAttribute({ visible: false });
  board.shipP4.setAttribute({ visible: false });
  board.cabinP1.setAttribute({ visible: false });
  board.cabinP2.setAttribute({ visible: false });
  board.cabinP3.setAttribute({ visible: false });
  board.cabinP4.setAttribute({ visible: false });

  // Toggle Space simulation elements
  board.orbitEllipse.setAttribute({ visible: isDaylight });
  board.sunHalo.setAttribute({ visible: isDaylight });
  board.sunBody.setAttribute({ visible: isDaylight });
  for (var i = 0; i < board.sunRays.length; i++) {
    board.sunRays[i].setAttribute({ visible: isDaylight });
  }
  board.sunLabel.setAttribute({ visible: isDaylight });

  board.earthHalo.setAttribute({ visible: isDaylight });
  board.earthBody.setAttribute({ visible: isDaylight });
  board.earthLand.setAttribute({ visible: isDaylight });
  board.earthLabel.setAttribute({ visible: isDaylight });
  board.earthAxis.setAttribute({ visible: isDaylight });

  // Force mathematical coordinate anchor points to stay 100% invisible
  board.sunPoint.setAttribute({ visible: false });
  board.earthPoint.setAttribute({ visible: false });
  board.earthAxisP1.setAttribute({ visible: false });
  board.earthAxisP2.setAttribute({ visible: false });
  board.earthLandPoint.setAttribute({ visible: false });

  // Update dynamic tick labels only if they change to prevent flickering
  var ampVal = 1.0;
  var unitStr = 'y (m)';
  if (isSpring) {
    ampVal = board.A_spring || 1.0;
    unitStr = 'y (m)';
  } else if (isTide) {
    ampVal = board.A_tide || 2.0;
    unitStr = 'h (m)';
  } else if (isDaylight) {
    ampVal = board.A_daylight || 4.0;
    unitStr = 'L (h)';
  }

  var ampStr = ampVal.toFixed(2);
  var negAmpStr = '-' + ampStr;

  if (board.right.yTickLabel1.text !== ampStr) {
    board.right.yTickLabel1.setText(ampStr);
  }
  if (board.right.yTickLabel2.text !== negAmpStr) {
    board.right.yTickLabel2.setText(negAmpStr);
  }
  if (board.right.yAxisUnitLabel.text !== unitStr) {
    board.right.yAxisUnitLabel.setText(unitStr);
  }

  if (isSpring) {
    showReadouts([
      { label: 'Chế độ:', value: 'Dao động lò xo', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
      { label: 'Thời gian t:', value: board.t_spring.toFixed(2) + ' s', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
      { label: 'Biên độ A:', value: board.A_spring.toFixed(2) + ' m', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' },
      { label: 'Tần số góc ω:', value: board.w_spring.toFixed(2) + ' rad/s', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #a78bfa;' },
      { label: 'Li độ y(t):', value: board.yMass_val.toFixed(2) + ' m', labelStyle: 'color: #ef4444;', valueStyle: 'color: #f87171; font-weight: bold; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px;' }
    ]);
  } else if (isTide) {
    showReadouts([
      { label: 'Chế độ:', value: 'Mực nước thủy triều', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
      { label: 'Thời điểm t:', value: board.t_tide.toFixed(2) + ' giờ', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
      { label: 'Biên độ A:', value: board.A_tide.toFixed(2) + ' m', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' },
      { label: 'Độ sâu trung bình d:', value: board.d_tide.toFixed(2) + ' m', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #a78bfa;' },
      { label: 'Mực nước h(t):', value: h_tide.toFixed(2) + ' m', labelStyle: 'color: #22c55e;', valueStyle: 'color: #4ade80; font-weight: bold; background: rgba(34, 197, 94, 0.15); padding: 2px 6px; border-radius: 4px;' }
    ]);
  } else if (isDaylight) {
    showReadouts([
      { label: 'Chế độ:', value: 'Giờ chiếu sáng Mặt Trời', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #818cf8; font-weight: bold;' },
      { label: 'Ngày trong năm d:', value: 'Ngày thứ ' + board.d_daylight, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #38bdf8;' },
      { label: 'Biên độ chênh lệch A:', value: board.A_daylight.toFixed(2) + ' giờ', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #fb923c;' },
      { label: 'Số giờ sáng L(d):', value: L_daylight.toFixed(2) + ' giờ', labelStyle: 'color: #eab308;', valueStyle: 'color: #facc15; font-weight: bold; background: rgba(234, 179, 8, 0.15); padding: 2px 6px; border-radius: 4px;' }
    ]);
  }
}
`,
  visualizationType: 'jsxgraph',
  config: {
    boardSize: { width: 600, height: 400 },
    showAxis: false,
    showGrid: false,
    theme: 'light',
    split: {
      enabled: true,
      leftBBox: [-2.0, 2.5, 2.0, -2.5],
      leftAxis: false,
      leftGrid: false,
      rightBBox: [-1.0, 2.5, 7.3, -2.5],
      rightAxis: false,
      rightGrid: true,
    }
  },
  controls: [
    { type: 'select', name: 'mode', label: 'Hiện tượng', defaultValue: 'Dao động lò xo', options: ['Dao động lò xo', 'Mực nước thủy triều', 'Giờ chiếu sáng mặt trời'] },
    { type: 'slider', name: 't_spring', label: 'Thời gian t (s)', min: 0, max: 10, step: 0.1, defaultValue: 2, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 'A_spring', label: 'Biên độ A (m)', min: 0.2, max: 1.5, step: 0.1, defaultValue: 1.0, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 'w_spring', label: 'Tần số góc ω (rad/s)', min: 1.0, max: 5.0, step: 0.1, defaultValue: 3.0, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 't_tide', label: 'Thời điểm t (giờ)', min: 0, max: 24, step: 0.5, defaultValue: 6.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'A_tide', label: 'Biên độ A (m)', min: 0.5, max: 3.5, step: 0.1, defaultValue: 2.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'd_tide', label: 'Độ sâu d (m)', min: 6, max: 14, step: 0.5, defaultValue: 10.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'd_daylight', label: 'Ngày thứ d', min: 1, max: 365, step: 5, defaultValue: 172, showIf: { control: 'mode', value: 'Giờ chiếu sáng mặt trời' } },
    { type: 'slider', name: 'A_daylight', label: 'Biên độ chênh lệch A (h)', min: 0, max: 6, step: 0.1, defaultValue: 4.0, showIf: { control: 'mode', value: 'Giờ chiếu sáng mặt trời' } },
  ],
  mathContent: '\\begin{aligned} y(t) &= A\\sin(\\omega t) \\\\ h(t) &= d + A\\cos\\left(\\frac{2\\pi}{12} t\\right) \\\\ L(d) &= 12 + A\\sin\\left(\\frac{2\\pi}{365} (d-80)\\right) \\end{aligned}',
  explanation: 'Trực quan hóa các hiện tượng tuần hoàn trong đời sống bằng các hàm số lượng giác sin và cos.',
  keyInsights: [
    '📖 Các ứng dụng thực tế phổ biến:',
    'Dao động lò xo: Chuyển động lên xuống của vật nặng móc vào lò xo tuân theo quy luật y(t) = A*sin(wt).',
    'Mực nước thủy triều: Chiều cao nước tại cảng biến thiên tuần hoàn theo thời gian trong ngày với chu kỳ 12 giờ.',
    'Thời gian chiếu sáng: Số giờ có ánh sáng mặt trời L(d) thay đổi tuần hoàn theo ngày d trong năm với chu kỳ 365 ngày.'
  ],
  tags: ['lượng giác', 'ứng dụng', 'lò xo', 'thủy triều', 'chu kỳ', 'toán 11'],
  difficulty: 'intermediate',
  isPublished: true,
};
