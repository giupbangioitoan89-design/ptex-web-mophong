export const demo2_13 = {
  grade: 11,
  chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
  lessonSlug: 'phuong-trinh-luong-giac',
  title: 'Ứng dụng Thực tế của Phương trình Lượng giác',
  description: 'Trực quan hóa quá trình giải phương trình lượng giác để tìm thời điểm đặc trưng trong thực tế: Lò xo qua li độ y0, nước triều đạt độ sâu h0, và ngày có L0 giờ sáng.',
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

  // Spring Target displacement line on physical board
  board.springTargetLine = board.create('segment', [[-1.8, function() { return board.y0_spring_val || 0.5; }], [1.8, function() { return board.y0_spring_val || 0.5; }]], {
    strokeColor: '#f43f5e', strokeWidth: 1.5, dash: 2, visible: false, name: 'y0', withLabel: true,
    label: { color: '#e11d48', fontSize: 10, offset: [10, 10] }
  });

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

  // Tide Target Water line
  board.tideTargetLine = board.create('segment', [[-1.8, function() { return board.yTargetWater_val || 0; }], [1.8, function() { return board.yTargetWater_val || 0; }]], {
    strokeColor: '#f43f5e', strokeWidth: 1.5, dash: 2, visible: false, name: 'h0', withLabel: true,
    label: { color: '#e11d48', fontSize: 10, offset: [10, 10] }
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

  // Daylight Target hours line (represented on the orbit as a target latitude or y-plane height)
  board.daylightTargetLine = board.create('segment', [[-1.8, function() { return board.yTargetDaylight_val || 0; }], [1.8, function() { return board.yTargetDaylight_val || 0; }]], {
    strokeColor: '#f43f5e', strokeWidth: 1.5, dash: 2, visible: false, name: 'L0', withLabel: true,
    label: { color: '#e11d48', fontSize: 10, offset: [10, 10] }
  });


  // RIGHT BOARD (board.right) - Function Graphs
  var br = board.right;
  
  // Custom axes for graph
  br.customXAxis = br.create('axis', [[0, 0], [1, 0]], { ticks: { visible: false } });
  br.customYAxis = br.create('axis', [[0, 0], [0, 1]], { ticks: { visible: false } });

  // Custom ticks for the three modes
  br.ticksSpring = br.create('ticks', [br.customXAxis, [0.6*2, 0.6*4, 0.6*6, 0.6*8, 0.6*10]], {
    drawLabels: true,
    labels: ['2s', '4s', '6s', '8s', '10s'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 10, color: '#475569', fontWeight: 'bold' }
  });
  br.ticksTide = br.create('ticks', [br.customXAxis, [0.25*6, 0.25*12, 0.25*18, 0.25*24]], {
    drawLabels: true,
    labels: ['6h', '12h', '18h', '24h'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 10, color: '#475569', fontWeight: 'bold' }
  });
  br.ticksDaylight = br.create('ticks', [br.customXAxis, [6*90/365, 6*180/365, 6*270/365, 6*360/365]], {
    drawLabels: true,
    labels: ['90d', '180d', '270d', '360d'],
    label: { display: 'internal', offset: [-5, -12], fontSize: 10, color: '#475569', fontWeight: 'bold' }
  });

  // Dynamic y-tick labels as text elements
  br.yTickLabel1 = br.create('text', [-0.15, 1.0, '1.00'], { display: 'internal', fontSize: 10, color: '#475569', fontWeight: 'bold', fixed: true, anchorX: 'right' });
  br.yTickLabel2 = br.create('text', [-0.15, -1.0, '-1.00'], { display: 'internal', fontSize: 10, color: '#475569', fontWeight: 'bold', fixed: true, anchorX: 'right' });
  br.yTickLabelMid = br.create('text', [-0.15, 0.0, '0.00'], { display: 'internal', fontSize: 10, color: '#475569', fontWeight: 'bold', fixed: true, anchorX: 'right' });

  // Dynamic label for y-axis showing unit
  br.yAxisUnitLabel = br.create('text', [0.15, 1.3, 'y (m)'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });
  br.create('text', [6.8, 0.15, 't'], { display: 'internal', fontSize: 10, color: '#475569', fixed: true });

  // Current indicator point G on the graph
  br.G = br.create('point', [0, 0], { name: '', size: 5, fillColor: '#3b82f6', strokeColor: '#1d4ed8', fixed: true, withLabel: false });

  br.timeLine = br.create('line', [[function() { return br.G.X(); }, -5], [function() { return br.G.X(); }, 5]], { 
    strokeColor: 'rgba(99, 102, 241, 0.25)', strokeWidth: 1, dash: 2, straightFirst: true, straightLast: true 
  });

  br.P_trace_origin = br.create('point', [0, function() { return br.G.Y(); }], { visible: false });
  br.tracerLine = br.create('segment', [br.P_trace_origin, br.G], { strokeColor: 'rgba(59, 130, 246, 0.45)', strokeWidth: 1.5, dash: 3 });

  // Target displacement horizontal line on graph
  br.targetLine = br.create('line', [[0, 0], [1, 0]], { strokeColor: '#f43f5e', strokeWidth: 1.8, dash: 2 });
  br.targetLabel = br.create('text', [6.1, 0.2, 'y0'], { fontSize: 10, color: '#e11d48', fixed: true });

  // Function Graph
  br.graph = br.create('functiongraph', [
    function(x) {
      var mode = board.currentMode || 'Dao động lò xo';
      if (mode === 'Dao động lò xo') {
        var w = board.w_spring || 3.0;
        var t = x / 0.6;
        return Math.sin(w * t);
      }
      if (mode === 'Mực nước thủy triều') {
        var t = x / 0.25;
        return Math.cos((Math.PI / 6) * t);
      }
      if (mode === 'Giờ chiếu sáng mặt trời') {
        var d = x * 365.0 / 6.0;
        return Math.sin((2 * Math.PI / 365) * (d - 80));
      }
      return 0;
    }
  ], { strokeColor: '#6366f1', strokeWidth: 3, highlight: false });

  // Intersection points pool (max 16 points)
  br.pts = [];
  for (var i = 0; i < 16; i++) {
    var p = br.create('point', [0, 0], {
      name: '', size: 5, fillColor: '#ef4444', strokeColor: '#b91c1c', fixed: true, visible: false,
      label: { display: 'internal', fontSize: 10, offset: [-15, 15], color: '#be185d', fontWeight: 'bold' }
    });
    br.pts.push(p);
  }

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
  board.y0_spring = params.y0_spring !== undefined ? params.y0_spring : 0.5;

  board.t_tide = params.t_tide !== undefined ? params.t_tide : 6.0;
  board.A_tide = params.A_tide !== undefined ? params.A_tide : 2.0;
  board.d_tide = params.d_tide !== undefined ? params.d_tide : 10.0;
  board.h0_tide = params.h0_tide !== undefined ? params.h0_tide : 11.0;

  board.d_daylight = params.d_daylight !== undefined ? params.d_daylight : 172;
  board.A_daylight = params.A_daylight !== undefined ? params.A_daylight : 4.0;
  board.L0_daylight = params.L0_daylight !== undefined ? params.L0_daylight : 14.0;

  var isSpring = (mode === 'Dao động lò xo');
  var isTide = (mode === 'Mực nước thủy triều');
  var isDaylight = (mode === 'Giờ chiếu sáng mặt trời');

  // 1. Calculate physical positions
  board.yMass_val = board.A_spring * Math.sin(board.w_spring * board.t_spring);
  var h_tide = board.d_tide + board.A_tide * Math.cos((Math.PI / 6) * board.t_tide);
  var L_daylight = 12.0 + board.A_daylight * Math.sin((2 * Math.PI / 365) * (board.d_daylight - 80));

  // Normalized values for tracer point G
  if (isSpring) {
    board.yNorm_val = Math.sin(board.w_spring * board.t_spring);
  } else if (isTide) {
    board.yNorm_val = Math.cos((Math.PI / 6) * board.t_tide);
  } else if (isDaylight) {
    board.yNorm_val = Math.sin((2 * Math.PI / 365) * (board.d_daylight - 80));
  } else {
    board.yNorm_val = 0;
  }

  // Update G position
  var gx = 0;
  if (isSpring) gx = 0.6 * board.t_spring;
  else if (isTide) gx = 0.25 * board.t_tide;
  else if (isDaylight) gx = 6.0 * board.d_daylight / 365.0;
  var gy = board.yNorm_val;

  if (board.right && board.right.G) {
    board.right.G.setAttribute({ fixed: false });
    board.right.G.setPosition(JXG.COORDS_BY_USER, [gx, gy]);
    board.right.G.setAttribute({ fixed: true });
  }

  // Left board physical configurations
  var depthOffset = (board.d_tide - 10.0) * 0.15;
  board.yWater_val = depthOffset + board.yNorm_val * 0.5;
  board.theta_val = (2 * Math.PI / 365) * (board.d_daylight - 80);

  // 2. Solve equations and set target levels
  var targetNormVal = 0;
  var roots = [];
  var hasRoots = false;
  var eqLaTeX = '';
  var formulaLaTeX = '';

  if (isSpring) {
    targetNormVal = board.y0_spring / board.A_spring;
    board.y0_spring_val = board.y0_spring;
    
    eqLaTeX = board.A_spring.toFixed(2) + '\\\\sin(' + board.w_spring.toFixed(2) + ' t) = ' + board.y0_spring.toFixed(2);
    
    if (Math.abs(targetNormVal) <= 1.0) {
      hasRoots = true;
      var alpha = Math.asin(targetNormVal);
      // Solve in [0, 10]
      for (var k = -5; k <= 15; k++) {
        var t1 = (alpha + 2 * Math.PI * k) / board.w_spring;
        var t2 = (Math.PI - alpha + 2 * Math.PI * k) / board.w_spring;
        if (t1 >= 0 && t1 <= 10) roots.push(t1);
        if (t2 >= 0 && t2 <= 10) roots.push(t2);
      }
      var alphaStr = alpha.toFixed(3);
      formulaLaTeX = 't = \\\\frac{' + alphaStr + ' + k2\\\\pi}{' + board.w_spring.toFixed(2) + '} \\\\quad \\\\text{hoặc} \\\\quad t = \\\\frac{\\\\pi - ' + alphaStr + ' + k2\\\\pi}{' + board.w_spring.toFixed(2) + '}';
    } else {
      formulaLaTeX = '\\\\text{Vô nghiệm vì } |y_0| > A';
    }
  } else if (isTide) {
    targetNormVal = (board.h0_tide - board.d_tide) / board.A_tide;
    board.yTargetWater_val = depthOffset + targetNormVal * 0.5;

    eqLaTeX = board.d_tide.toFixed(2) + ' + ' + board.A_tide.toFixed(2) + '\\\\cos\\\\left(\\\\frac{\\\\pi}{6} t\\\\right) = ' + board.h0_tide.toFixed(2);

    if (Math.abs(targetNormVal) <= 1.0) {
      hasRoots = true;
      var alpha = Math.acos(targetNormVal);
      // Solve in [0, 24]
      for (var k = -5; k <= 10; k++) {
        var t1 = (alpha + 2 * Math.PI * k) * 6 / Math.PI;
        var t2 = (-alpha + 2 * Math.PI * k) * 6 / Math.PI;
        if (t1 >= 0 && t1 <= 24) roots.push(t1);
        if (t2 >= 0 && t2 <= 24) roots.push(t2);
      }
      var alphaStr = alpha.toFixed(3);
      formulaLaTeX = 't = \\\\frac{6}{\\\\pi}\\\\left(\\\\pm ' + alphaStr + ' + k2\\\\pi\\\\right)';
    } else {
      formulaLaTeX = '\\\\text{Vô nghiệm vì } |h_0 - d| > A';
    }
  } else if (isDaylight) {
    targetNormVal = (board.L0_daylight - 12.0) / board.A_daylight;
    board.yTargetDaylight_val = 1.1 * targetNormVal;

    eqLaTeX = '12 + ' + board.A_daylight.toFixed(2) + '\\\\sin\\\\left(\\\\frac{2\\\\pi}{365}(d - 80)\\\\right) = ' + board.L0_daylight.toFixed(2);

    if (Math.abs(targetNormVal) <= 1.0) {
      hasRoots = true;
      var alpha = Math.asin(targetNormVal);
      // Solve in [1, 365]
      for (var k = -5; k <= 5; k++) {
        var d1 = 80 + (alpha + 2 * Math.PI * k) * 365 / (2 * Math.PI);
        var d2 = 80 + (Math.PI - alpha + 2 * Math.PI * k) * 365 / (2 * Math.PI);
        if (d1 >= 1 && d1 <= 365) roots.push(d1);
        if (d2 >= 1 && d2 <= 365) roots.push(d2);
      }
      var alphaStr = alpha.toFixed(3);
      formulaLaTeX = 'd = 80 + \\\\frac{365}{2\\\\pi}\\\\left(' + alphaStr + ' + k2\\\\pi\\\\right) \\\\quad \\\\text{hoặc} \\\\quad d = 80 + \\\\frac{365}{2\\\\pi}\\\\left(\\\\pi - ' + alphaStr + ' + k2\\\\pi\\\\right)';
    } else {
      formulaLaTeX = '\\\\text{Vô nghiệm vì } |L_0 - 12| > A';
    }
  }

  // Filter unique roots and sort
  roots = roots.filter(function(v, i, self) {
    return self.findIndex(function(x) { return Math.abs(x - v) < 1e-4; }) === i;
  });
  roots.sort(function(a, b) { return a - b; });

  // 3. Update right board target line & label
  var br = board.right;
  br.targetLine.setPosition(JXG.COORDS_BY_USER, [0, targetNormVal], [1, targetNormVal]);
  var labelText = '';
  if (isSpring) labelText = 'y0 = ' + board.y0_spring.toFixed(2) + 'm';
  else if (isTide) labelText = 'h0 = ' + board.h0_tide.toFixed(2) + 'm';
  else if (isDaylight) labelText = 'L0 = ' + board.L0_daylight.toFixed(2) + 'h';
  br.targetLabel.setText(labelText);
  br.targetLabel.setPosition(JXG.COORDS_BY_USER, [6.1, targetNormVal + 0.1]);

  // Update Y-Ticks labels based on physical scale
  var topVal = 1.0;
  var midVal = 0.0;
  var botVal = -1.0;
  var unitStr = 'y (m)';

  if (isSpring) {
    topVal = board.A_spring;
    midVal = 0;
    botVal = -board.A_spring;
    unitStr = 'y (m)';
  } else if (isTide) {
    topVal = board.d_tide + board.A_tide;
    midVal = board.d_tide;
    botVal = board.d_tide - board.A_tide;
    unitStr = 'h (m)';
  } else if (isDaylight) {
    topVal = 12.0 + board.A_daylight;
    midVal = 12.0;
    botVal = 12.0 - board.A_daylight;
    unitStr = 'L (h)';
  }

  if (br.yTickLabel1.text !== topVal.toFixed(2)) br.yTickLabel1.setText(topVal.toFixed(2));
  if (br.yTickLabel2.text !== botVal.toFixed(2)) br.yTickLabel2.setText(botVal.toFixed(2));
  if (br.yTickLabelMid.text !== midVal.toFixed(2)) br.yTickLabelMid.setText(midVal.toFixed(2));
  if (br.yAxisUnitLabel.text !== unitStr) br.yAxisUnitLabel.setText(unitStr);

  // 4. Update graph intersection points
  for (var i = 0; i < br.pts.length; i++) {
    br.pts[i].setAttribute({ visible: false });
  }

  if (hasRoots) {
    var numRoots = Math.min(roots.length, br.pts.length);
    for (var i = 0; i < numRoots; i++) {
      var rVal = roots[i];
      var rx = 0;
      var nameStr = '';
      if (isSpring) {
        rx = 0.6 * rVal;
        nameStr = rVal.toFixed(2) + 's';
      } else if (isTide) {
        rx = 0.25 * rVal;
        nameStr = rVal.toFixed(1) + 'h';
      } else if (isDaylight) {
        rx = 6.0 * rVal / 365.0;
        nameStr = 'Ngày ' + Math.round(rVal);
      }

      br.pts[i].setAttribute({ fixed: false });
      br.pts[i].setPosition(JXG.COORDS_BY_USER, [rx, targetNormVal]);
      br.pts[i].setAttribute({ fixed: true, visible: true, name: nameStr });
    }
  }

  // 5. Left board element toggling
  board.spring.setAttribute({ visible: isSpring });
  board.massBlock.setAttribute({ visible: isSpring });
  board.ceiling.setAttribute({ visible: isSpring });
  board.springTargetLine.setAttribute({ visible: isSpring });
  
  board.seaFloor.setAttribute({ visible: isTide });
  board.seaWater.setAttribute({ visible: isTide });
  board.ship.setAttribute({ visible: isTide });
  board.cabin.setAttribute({ visible: isTide });
  board.rock1.setAttribute({ visible: isTide });
  board.rock2.setAttribute({ visible: isTide });
  board.tideTargetLine.setAttribute({ visible: isTide });

  // Toggling orbit space elements
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
  board.daylightTargetLine.setAttribute({ visible: isDaylight });

  // Toggle X ticks visibility
  br.ticksSpring.setAttribute({ visible: isSpring });
  br.ticksTide.setAttribute({ visible: isTide });
  br.ticksDaylight.setAttribute({ visible: isDaylight });

  // 6. Display Readouts
  var readoutRows = [
    { label: 'Phương trình:', value: math(eqLaTeX), labelStyle: 'color: #ef4444; font-weight: bold;', valueStyle: 'color: #f87171; font-weight: 800; font-size: 1.1rem;' },
  ];

  if (!hasRoots) {
    var reason = '';
    if (isSpring) reason = '(|y0| > biên độ A)';
    else if (isTide) reason = '(|h0 - d| > biên độ A)';
    else if (isDaylight) reason = '(|L0 - 12| > biên độ chênh lệch A)';
    readoutRows.push({ label: 'Trạng thái:', value: 'Vô nghiệm ' + reason, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px;' });
  } else {
    var rootsStr = '';
    if (isSpring) {
      rootsStr = roots.map(function(r) { return r.toFixed(2) + ' s'; }).join('; ');
    } else if (isTide) {
      rootsStr = roots.map(function(r) { return r.toFixed(1) + ' giờ'; }).join('; ');
    } else if (isDaylight) {
      rootsStr = roots.map(function(r) { return 'Ngày thứ ' + Math.round(r); }).join('; ');
    }
    readoutRows.push({ label: 'Thời điểm thỏa mãn:', value: rootsStr, labelStyle: 'color: #22c55e;', valueStyle: 'color: #4ade80; font-weight: bold; background: rgba(34, 197, 94, 0.15); padding: 2px 6px; border-radius: 4px;' });
  }

  readoutRows.push({ label: 'Công thức giải:', value: math(formulaLaTeX), labelStyle: 'color: #c084fc; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;', valueStyle: 'border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px; color: #e879f9; font-weight: bold;' });

  // Add current position info
  if (isSpring) {
    readoutRows.push({ label: 'Thời gian hiện tại t:', value: board.t_spring.toFixed(2) + ' s (Li độ: ' + board.yMass_val.toFixed(2) + ' m)', labelStyle: 'color: #94a3b8;', valueStyle: 'color: #38bdf8;' });
  } else if (isTide) {
    readoutRows.push({ label: 'Thời điểm hiện tại t:', value: board.t_tide.toFixed(2) + ' h (Mực nước: ' + h_tide.toFixed(2) + ' m)', labelStyle: 'color: #94a3b8;', valueStyle: 'color: #38bdf8;' });
  } else if (isDaylight) {
    readoutRows.push({ label: 'Ngày hiện tại d:', value: 'Ngày thứ ' + board.d_daylight + ' (Giờ sáng: ' + L_daylight.toFixed(2) + ' h)', labelStyle: 'color: #94a3b8;', valueStyle: 'color: #38bdf8;' });
  }

  showReadouts(readoutRows);
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
    { type: 'select', name: 'mode', label: 'Bài toán thực tế', defaultValue: 'Dao động lò xo', options: ['Dao động lò xo', 'Mực nước thủy triều', 'Giờ chiếu sáng mặt trời'] },
    
    // Spring controls
    { type: 'slider', name: 't_spring', label: 'Thời gian t (s)', min: 0, max: 10, step: 0.1, defaultValue: 2, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 'A_spring', label: 'Biên độ A (m)', min: 0.5, max: 1.5, step: 0.1, defaultValue: 1.0, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 'w_spring', label: 'Tần số góc ω (rad/s)', min: 1.0, max: 5.0, step: 0.1, defaultValue: 3.0, showIf: { control: 'mode', value: 'Dao động lò xo' } },
    { type: 'slider', name: 'y0_spring', label: 'Li độ mục tiêu y0 (m)', min: -1.5, max: 1.5, step: 0.05, defaultValue: 0.5, showIf: { control: 'mode', value: 'Dao động lò xo' } },

    // Tide controls
    { type: 'slider', name: 't_tide', label: 'Thời điểm t (giờ)', min: 0, max: 24, step: 0.5, defaultValue: 6.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'A_tide', label: 'Biên độ A (m)', min: 0.5, max: 3.5, step: 0.1, defaultValue: 2.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'd_tide', label: 'Độ sâu d (m)', min: 6.0, max: 14.0, step: 0.5, defaultValue: 10.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },
    { type: 'slider', name: 'h0_tide', label: 'Độ sâu yêu cầu h0 (m)', min: 5.0, max: 18.0, step: 0.1, defaultValue: 11.0, showIf: { control: 'mode', value: 'Mực nước thủy triều' } },

    // Daylight controls
    { type: 'slider', name: 'd_daylight', label: 'Ngày thứ d', min: 1, max: 365, step: 5, defaultValue: 172, showIf: { control: 'mode', value: 'Giờ chiếu sáng mặt trời' } },
    { type: 'slider', name: 'A_daylight', label: 'Biên độ lệch A (h)', min: 0.5, max: 6.0, step: 0.1, defaultValue: 4.0, showIf: { control: 'mode', value: 'Giờ chiếu sáng mặt trời' } },
    { type: 'slider', name: 'L0_daylight', label: 'Số giờ sáng yêu cầu L0 (h)', min: 6.0, max: 18.0, step: 0.1, defaultValue: 14.0, showIf: { control: 'mode', value: 'Giờ chiếu sáng mặt trời' } },
  ],
  mathContent: '\\begin{aligned} \\text{Dao động lò xo:} & \\quad A\\sin(\\omega t) = y_0 \\\\ \\text{Mực nước triều:} & \\quad d + A\\cos\\left(\\frac{\\pi}{6}t\\right) = h_0 \\\\ \\text{Giờ chiếu sáng:} & \\quad 12 + A\\sin\\left(\\frac{2\\pi}{365}(d-80)\\right) = L_0 \\end{aligned}',
  explanation: 'Giải phương trình lượng giác tương ứng với việc tìm giao điểm của đồ thị mô tả hiện tượng vật lý với đường thẳng mục tiêu (như li độ đích y0, mực nước yêu cầu h0, hay thời gian sáng L0). Các mốc thời điểm này được tự động tính toán và đánh dấu màu đỏ trên đồ thị.',
  keyInsights: [
    '📌 Phương pháp giải phương trình lượng giác trong đời sống:',
    '1. Chuyển đổi bài toán thực tế thành dạng phương trình lượng giác cơ bản.',
    '2. Tìm các giá trị t hoặc d trong khoảng xác định thực tế (ví dụ: ngày t ∈ [0, 24], năm d ∈ [1, 365]).',
    '3. Xác định xem các mốc thời điểm đó có thỏa mãn các ràng buộc bổ sung (như tàu chỉ cập cảng an toàn khi nước sâu hơn h0) hay không.'
  ],
  tags: ['phương trình lượng giác', 'ứng dụng thực tế', 'dao động lò xo', 'thủy triều', 'mặt trời', 'toán 11'],
  difficulty: 'intermediate',
  isPublished: true,
};
