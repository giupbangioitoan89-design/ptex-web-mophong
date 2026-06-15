export const demo2_3 = {
        grade: 11,
        chapterSlug: 'ham-so-luong-giac-pt-luong-giac',
        lessonSlug: 'goc-luong-giac-duong-tron',
        title: 'Tính độ dài cung tròn',
        description: 'Trực quan hóa công thức tính độ dài cung tròn l = R * a. Thay đổi bán kính R và số đo góc để quan sát cung được duỗi thẳng trên thước đo.',
        order: 3,
        simulationCode: `
function initSimulation(board, params) {
  board.suspendUpdate();
  var panel = document.getElementById('readout-panel');
  if (panel) {
    panel.style.left = 'auto';
    panel.style.right = '10px';
  }

  // Cache variables to prevent setBoundingBox looping & label flickering
  board.lastMode = '';
  board.lastWidth = 0;
  board.lastHeight = 0;

  // Origin O
  board.O = board.create('point', [
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
        var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
        var theta = deg * Math.PI / 180;
        return -1.0 + (R * theta) / 1.2;
      }
      return 0;
    },
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
        return -1.3 + R / 1.2;
      }
      return 0;
    }
  ], {
    name: math('O'),
    size: 3,
    fillColor: '#64748b',
    strokeColor: '#475569',
    fixed: true,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 14, offset: [-15, -15] }
  });

  // Point A
  board.A = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return board.O.X() + R / 1.2;
      }
      return R;
    },
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return board.O.Y();
      }
      return 0;
    }
  ], {
    name: math('A'),
    size: 3,
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    fixed: true,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 14, offset: [10, -10] }
  });

  // Circle
  board.circle = board.create('circle', [board.O, board.A], {
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#000000' : '#cbd5e1';
    },
    strokeWidth: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? 3.5 : 2;
    },
    highlight: false,
    fixed: true
  });

  // Point M
  board.M = board.create('glider', [0, 1.0, board.circle], {
    name: math('M'),
    size: 5,
    fillColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#ef4444' : '#6366f1';
    },
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#dc2626' : '#4f46e5';
    },
    label: { display: 'html', fontSize: 14, offset: [10, 10] }
  });
  registerDragSnapping(board, board.M, 'angle');

  // Segments representing Radius R
  board.radSeg = board.create('segment', [board.O, board.M], {
    strokeColor: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? '#ef4444' : '#6366f1';
    },
    strokeWidth: 2.5
  });
  board.aSeg = board.create('segment', [board.O, board.A], {
    strokeColor: '#6366f1',
    strokeWidth: 2.5,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Central angle arc
  board.angleArcStart = board.create('point', [0.2, 0], { visible: false, withLabel: false });
  board.angleArcEnd = board.create('point', [
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return 0.2 * Math.cos(rad);
    },
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return 0.2 * Math.sin(rad);
    }
  ], { visible: false, withLabel: false });
  board.angleArc = board.create('arc', [board.O, board.angleArcStart, board.angleArcEnd], {
    strokeColor: '#f59e0b',
    strokeWidth: 3,
    withLabel: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Arc curve
  board.arcCurve = board.create('curve', [
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return R * Math.cos(t);
    },
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return R * Math.sin(t);
    },
    0,
    function() {
      var x = board.M.X();
      var y = board.M.Y();
      var rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      return rad;
    }
  ], {
    strokeColor: '#10b981',
    strokeWidth: 4,
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    }
  });

  // Ruler Axis
  board.rulerLine = board.create('segment', [
    [-1.0, -1.3],
    [
      function() {
        var mode = window.currentParams?.mode || 'Kéo tự do';
        if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
          return 11.5;
        }
        return 4.0;
      },
      -1.3
    ]
  ], {
    strokeColor: '#cbd5e1',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });

  // Free mode ticks
  for (var tickX = -1.0; tickX <= 4.01; tickX += 0.5) {
    (function(tx) {
      var val = Math.round(tx + 1.0);
      var isInt = Math.abs(tx + 1.0 - val) < 0.01;
      board.create('segment', [[tx, -1.3], [tx, -1.38]], {
        strokeColor: '#64748b',
        strokeWidth: 1,
        fixed: true,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
        }
      });
      if (isInt) {
        board.create('text', [tx - 0.08, -1.6, math(val.toString())], {
          display: 'html',
          fontSize: 10,
          color: '#64748b',
          visible: function() {
            var mode = window.currentParams?.mode || 'Kéo tự do';
            return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
          }
        });
      }
    })(tickX);
  }

  // Rolling mode ticks (from 0 to 15 meters)
  for (var d = 0; d <= 15; d += 0.5) {
    (function(dist) {
      var tx = -1.0 + dist / 1.2;
      var isInt = Math.abs(dist - Math.round(dist)) < 0.01;
      var showLabel = isInt && (Math.round(dist) % 2 === 0);
      board.create('segment', [[tx, -1.3], [tx, -1.38]], {
        strokeColor: '#64748b',
        strokeWidth: 1,
        fixed: true,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
        }
      });
      if (showLabel) {
        board.create('text', [tx - 0.1, -1.6, math(Math.round(dist).toString())], {
          display: 'html',
          fontSize: 10,
          color: '#64748b',
          visible: function() {
            var mode = window.currentParams?.mode || 'Kéo tự do';
            return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
          }
        });
      }
    })(d);
  }

  // Label for ruler
  board.rulerLabel = board.create('text', [
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return 11.5;
      }
      return 4.0;
    },
    -2.1,
    function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        return 'Thước đo quãng đường s (m)';
      }
      return 'Thước đo duỗi thẳng cung tròn l (m)';
    }
  ], {
    display: 'html',
    anchorX: 'right',
    cssStyle: 'font-weight: 700; color: #0f172a; font-size: 13px; font-family: Inter, sans-serif;',
    highlight: false
  });

  // Unwrapped segment
  board.unwrappedStart = board.create('point', [-1.0, -1.3], { visible: false });
  board.unwrappedEnd = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
        var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
        var rad = deg * Math.PI / 180;
        var l = R * rad;
        return -1.0 + l / 1.2;
      } else {
        var x = board.M.X();
        var y = board.M.Y();
        var rad = Math.atan2(y, x);
        if (rad < 0) rad += 2 * Math.PI;
        var l = R * rad;
        return -1.0 + l;
      }
    },
    -1.3
  ], {
    name: math("M'"),
    size: 5,
    fillColor: '#10b981',
    strokeColor: '#059669',
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode !== 'Bánh xe lăn trên đường' && mode !== 'Xe đạp chạy trên đường');
    },
    label: { display: 'html', fontSize: 13, offset: [0, 10] }
  });

  board.unwrappedSeg = board.create('segment', [board.unwrappedStart, board.unwrappedEnd], {
    strokeColor: '#10b981',
    strokeWidth: 5,
    highlight: false
  });

  // Cycloid curve
  board.cycloidCurve = board.create('curve', [
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var xO = -1.0 + (R * t) / 1.2;
      return xO - (R / 1.2) * Math.sin(t);
    },
    function(t) {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var yO = -1.3 + R / 1.2;
      return yO - (R / 1.2) * Math.cos(t);
    },
    0,
    function() {
      var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
      return deg * Math.PI / 180;
    }
  ], {
    strokeColor: '#ef4444',
    strokeWidth: 3,
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
    }
  });

  // Back wheel spokes
  for (var i = 1; i < 8; i++) {
    (function(idx) {
      board.create('segment', [
        board.O,
        board.create('point', [
          function() {
            var x = board.M.X() - board.O.X();
            var y = board.M.Y() - board.O.Y();
            var r = Math.sqrt(x*x + y*y);
            var phi = Math.atan2(y, x) + idx * Math.PI / 4;
            return board.O.X() + 0.85 * r * Math.cos(phi);
          },
          function() {
            var x = board.M.X() - board.O.X();
            var y = board.M.Y() - board.O.Y();
            var r = Math.sqrt(x*x + y*y);
            var phi = Math.atan2(y, x) + idx * Math.PI / 4;
            return board.O.Y() + 0.85 * r * Math.sin(phi);
          }
        ], { visible: false, withLabel: false })
      ], {
        strokeColor: '#94a3b8',
        strokeWidth: 1.2,
        dash: 1,
        highlight: false,
        visible: function() {
          var mode = window.currentParams?.mode || 'Kéo tự do';
          return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
        }
      });
    })(i);
  }

  // Back Inner Rim
  board.backInnerRim = board.create('circle', [
    board.O,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var mode = window.currentParams?.mode || 'Kéo tự do';
      var scale = (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') ? 1.2 : 1.0;
      return 0.85 * (R / scale);
    }
  ], {
    strokeColor: '#64748b',
    strokeWidth: 1.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() {
      var mode = window.currentParams?.mode || 'Kéo tự do';
      return (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường');
    }
  });

  // Front wheel center
  board.Of = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return board.O.X() + 3.2 * (R / 1.2);
    },
    function() {
      return board.O.Y();
    }
  ], { visible: false, withLabel: false });

  // Front tire
  board.frontCircle = board.create('circle', [
    board.Of,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return R / 1.2;
    }
  ], {
    strokeColor: '#000000',
    strokeWidth: 3.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front Inner Rim
  board.frontInnerRim = board.create('circle', [
    board.Of,
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      return 0.85 * (R / 1.2);
    }
  ], {
    strokeColor: '#64748b',
    strokeWidth: 1.5,
    fillColor: 'transparent',
    highlight: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front hub
  board.frontHub = board.create('point', [
    function() { return board.Of.X(); },
    function() { return board.Of.Y(); }
  ], {
    name: '',
    size: 4,
    fillColor: '#475569',
    strokeColor: '#334155',
    fixed: true,
    withLabel: false,
    visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
  });

  // Front spokes
  for (var j = 0; j < 8; j++) {
    (function(idx) {
      board.create('segment', [
        board.Of,
        board.create('point', [
          function() {
            var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
            var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
            var theta = deg * Math.PI / 180;
            var phi = idx * Math.PI / 4 - theta;
            return board.Of.X() + 0.85 * (R / 1.2) * Math.cos(phi);
          },
          function() {
            var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
            var deg = window.currentParams?.rollAngle !== undefined ? window.currentParams.rollAngle : 90;
            var theta = deg * Math.PI / 180;
            var phi = idx * Math.PI / 4 - theta;
            return board.Of.Y() + 0.85 * (R / 1.2) * Math.sin(phi);
          }
        ], { visible: false, withLabel: false })
      ], {
        strokeColor: '#94a3b8',
        strokeWidth: 1.2,
        dash: 1,
        highlight: false,
        visible: function() { return (window.currentParams?.mode === 'Xe đạp chạy trên đường'); }
      });
    })(j);
  }

  // Bicycle Frame Elements
  var frameVisible = function() {
    var mode = window.currentParams?.mode || 'Kéo tự do';
    return mode === 'Xe đạp chạy trên đường';
  };

  board.bikeP = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 1.1 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() - 0.2 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeS = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 0.8 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() + 1.2 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeH = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.X() + 2.4 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.O.Y() + 1.4 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeStem = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeH.X() + 0.05 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeH.Y() + 0.25 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeBar = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeStem.X() - 0.2 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeStem.Y() + 0.05 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeSeatL = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.X() - 0.18 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.Y() + 0.1 * r;
    }
  ], { visible: false, withLabel: false });

  board.bikeSeatR = board.create('point', [
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.X() + 0.12 * r;
    },
    function() {
      var R = window.currentParams?.R !== undefined ? window.currentParams.R : 1.0;
      var r = R / 1.2;
      return board.bikeS.Y() + 0.08 * r;
    }
  ], { visible: false, withLabel: false });

  board.create('segment', [board.O, board.bikeP], { strokeColor: '#64748b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.O, board.bikeS], { strokeColor: '#64748b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeP, board.bikeS], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeP, board.bikeH], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeS, board.bikeH], { strokeColor: '#4f46e5', strokeWidth: 5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeH, board.Of], { strokeColor: '#64748b', strokeWidth: 4.5, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeSeatL, board.bikeSeatR], { strokeColor: '#1e293b', strokeWidth: 6, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeH, board.bikeStem], { strokeColor: '#1e293b', strokeWidth: 4, highlight: false, visible: frameVisible });
  board.create('segment', [board.bikeStem, board.bikeBar], { strokeColor: '#1e293b', strokeWidth: 5, highlight: false, visible: frameVisible });

  // Create native sliders inside SVG
  board.sliderR = createCustomSlider(board, [-1.2, -1.45], [0.3, -1.45], 0.8, params.R !== undefined ? params.R : 1.0, 1.2, 'Bán kính R', 0.01, '#6366f1');
  board.sliderAngle = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.angle !== undefined ? params.angle : 90, 360, 'Góc', 5, '#fb923c');
  board.sliderRollAngle = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.rollAngle !== undefined ? params.rollAngle : 90, 720, 'Góc quay', 5, '#fb923c');

  var specialDegVals = ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'];
  board.sliderSpecDeg = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.specialDeg !== undefined ? params.specialDeg : 4, 16, 'Góc đặc biệt', 1, '#fb923c', specialDegVals);
  
  var specialRadVals = ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'];
  board.sliderSpecRad = createCustomSlider(board, [1.0, -1.45], [3.5, -1.45], 0, params.specialRad !== undefined ? params.specialRad : 4, 16, 'Radian đặc biệt', 1, '#c084fc', specialRadVals);

  board.sliderR.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'R', value: board.sliderR.Value() }, '*'); });
  board.sliderAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'angle', value: board.sliderAngle.Value() }, '*'); });
  board.sliderRollAngle.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'rollAngle', value: board.sliderRollAngle.Value() }, '*'); });
  board.sliderSpecDeg.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialDeg', value: board.sliderSpecDeg.Value() }, '*'); });
  board.sliderSpecRad.on('drag', function() { window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: 'specialRad', value: board.sliderSpecRad.Value() }, '*'); });

  board.unsuspendUpdate();
  updateSimulation(board, params);
}

function updateSimulation(board, params) {
  board.suspendUpdate();
  var mode = params.mode || 'Kéo tự do';
  var R = params.R !== undefined ? params.R : 1.0;
  var deg = 90;
  var idx = 4;
  
  board.sliderAngle.setAttribute({ visible: mode === 'Kéo tự do' });
  board.sliderSpecDeg.setAttribute({ visible: mode === 'Góc độ đặc biệt' });
  board.sliderSpecRad.setAttribute({ visible: mode === 'Góc radian đặc biệt' });
  board.sliderRollAngle.setAttribute({ visible: (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') });

  if (board.sliderR && !board.sliderR.isDragging && Math.abs(board.sliderR.Value() - R) > 1e-4) board.sliderR.setValue(R);

  if (mode === 'Kéo tự do') {
    deg = params.angle !== undefined ? params.angle : 90;
    if (board.sliderAngle && !board.sliderAngle.isDragging && Math.abs(board.sliderAngle.Value() - deg) > 1e-4) board.sliderAngle.setValue(deg);
  } else if (mode === 'Góc độ đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialDeg !== undefined ? Math.round(params.specialDeg) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecDeg && !board.sliderSpecDeg.isDragging && Math.abs(board.sliderSpecDeg.Value() - idx) > 1e-4) board.sliderSpecDeg.setValue(idx);
  } else if (mode === 'Góc radian đặc biệt') {
    var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    idx = params.specialRad !== undefined ? Math.round(params.specialRad) : 4;
    deg = specialDegVals[idx] || 0;
    if (board.sliderSpecRad && !board.sliderSpecRad.isDragging && Math.abs(board.sliderSpecRad.Value() - idx) > 1e-4) board.sliderSpecRad.setValue(idx);
  } else {
    deg = params.rollAngle !== undefined ? params.rollAngle : 90;
    if (board.sliderRollAngle && !board.sliderRollAngle.isDragging && Math.abs(board.sliderRollAngle.Value() - deg) > 1e-4) board.sliderRollAngle.setValue(deg);
  }

  var rad = deg * Math.PI / 180;
  var l = R * rad;

  // Update dynamic bounding box with strict aspect-ratio enforcement, avoiding redundant setBoundingBox calls
  var w = board.canvasWidth;
  var h = board.canvasHeight;
  var ratio = w / h;

  var modeChanged = (board.lastMode !== mode);
  var sizeChanged = (board.lastWidth !== w || board.lastHeight !== h);

  if (modeChanged || sizeChanged) {
    board.lastMode = mode;
    board.lastWidth = w;
    board.lastHeight = h;

    if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
      var targetW = 14.0;
      var targetH = 3.9;
      if (targetW / targetH > ratio) {
        targetH = targetW / ratio;
      } else {
        targetW = targetH * ratio;
      }
      var xMin = 5.2 - targetW / 2;
      var xMax = 5.2 + targetW / 2;
      var yMin = -0.45 - targetH / 2;
      var yMax = -0.45 + targetH / 2;
      board.setBoundingBox([xMin, yMax, xMax, yMin], true);
    } else {
      var targetW = 6.0;
      var targetH = 3.9;
      if (targetW / targetH > ratio) {
        targetH = targetW / ratio;
      } else {
        targetW = targetH * ratio;
      }
      var xMin = 1.2 - targetW / 2;
      var xMax = 1.2 + targetW / 2;
      var yMin = -0.45 - targetH / 2;
      var yMax = -0.45 + targetH / 2;
      board.setBoundingBox([xMin, yMax, xMax, yMin], true);
    }
  }

  if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
    var xO = -1.0 + (R * rad) / 1.2;
    var yO = -1.3 + R / 1.2;
    var px = xO - (R / 1.2) * Math.sin(rad);
    var py = yO - (R / 1.2) * Math.cos(rad);
    if (board.M) {
      board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
    }
  } else {
    var px = R * Math.cos(rad);
    var py = R * Math.sin(rad);
    if (board.M && !board.M.isDragging) {
      board.M.setPosition(JXG.COORDS_BY_USER, [px, py]);
    }
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

  if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
    var turnsVal = deg / 360;
    var turnsStr = turnsVal.toFixed(2);
    if (Math.abs(turnsVal - Math.round(turnsVal)) < 0.01) {
      turnsStr = Math.round(turnsVal).toFixed(2);
    }
    
    // Check if exactly 1 or 2 turns to adapt formula names
    var calcLabel = 'Quãng đường s:';
    var formulaVal = 's = R × α';
    var calculationVal = R.toFixed(2) + ' × ' + rad.toFixed(2) + ' rad';
    if (deg === 360) {
      calcLabel = 'Chu vi bánh xe C:';
      formulaVal = 'C = 2πR';
      calculationVal = '2 × π × ' + R.toFixed(2);
    } else if (deg === 720) {
      calcLabel = 'Quãng đường (2 vòng):';
      formulaVal = 's = 2 × 2πR';
      calculationVal = '2 × 2 × π × ' + R.toFixed(2);
    }

    showReadouts([
      { label: 'Bán kính bánh xe R:', value: R.toFixed(2) + ' m', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
      { label: 'Góc quay α:', value: deg.toFixed(2) + '° (' + radText + ' rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
      { label: 'Số vòng quay:', value: turnsStr + ' vòng', labelStyle: 'color: #c084fc;', valueStyle: 'color: #e9d5ff; font-weight: bold;' },
      { label: 'Công thức:', value: formulaVal, labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
      { label: 'Tính toán:', value: calculationVal, labelStyle: 'color: #cbd5e1;', valueStyle: 'font-family: monospace; color: #cbd5e1;' },
      { label: calcLabel, value: l.toFixed(2) + ' m', labelStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; font-size: 0.95rem; background: rgba(52, 211, 153, 0.15); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
    ]);
  } else {
    showReadouts([
      { label: 'Bán kính R:', value: R.toFixed(2) + ' m', labelStyle: 'color: #818cf8;', valueStyle: 'color: #a5b4fc; font-weight: bold;' },
      { label: 'Số đo góc α:', value: deg.toFixed(2) + '° (' + radText + ' rad)', labelStyle: 'color: #fb923c;', valueStyle: 'color: #fdba74; font-weight: bold;' },
      { label: 'Công thức l:', value: 'l = R × α', labelStyle: 'color: #cbd5e1;', valueStyle: 'color: #f8fafc; font-style: italic;' },
      { label: 'Tính toán:', value: R.toFixed(2) + ' × ' + rad.toFixed(2) + ' rad', labelStyle: 'color: #cbd5e1;', valueStyle: 'font-family: monospace; color: #cbd5e1;' },
      { label: 'Độ dài cung l:', value: l.toFixed(2) + ' m', labelStyle: 'color: #34d399; font-weight: bold; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;', valueStyle: 'color: #34d399; font-weight: bold; font-size: 0.85rem; background: rgba(52, 211, 153, 0.15); padding: 3px 8px; border-radius: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 6px;' }
    ]);
  }

  board.unsuspendUpdate();
}
`,
        visualizationType: 'jsxgraph',
        config: {
          boardSize: { width: 600, height: 500 },
          boundingBox: [-1.8, 1.6, 4.4, -2.4],
          showAxis: false,
          showGrid: false,
          theme: 'light',
        },
        controls: [
          { type: 'slider', name: 'R', label: 'Bán kính R', min: 0.8, max: 1.2, step: 0.01, defaultValue: 1.0 },
          { type: 'select', name: 'mode', label: 'Chế độ điều chỉnh', defaultValue: 'Kéo tự do', options: ['Kéo tự do', 'Góc độ đặc biệt', 'Góc radian đặc biệt', 'Bánh xe lăn trên đường', 'Xe đạp chạy trên đường'] },
          { type: 'slider', name: 'angle', label: 'Góc tự do (độ)', min: 0, max: 360, step: 5, defaultValue: 90, showIf: { control: 'mode', value: 'Kéo tự do' } },
          { type: 'slider', name: 'rollAngle', label: 'Góc quay (độ)', min: 0, max: 720, step: 5, defaultValue: 90, showIf: { control: 'mode', value: ['Bánh xe lăn trên đường', 'Xe đạp chạy trên đường'] } },
          { type: 'slider', name: 'specialDeg', label: 'Góc độ đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc độ đặc biệt' }, displayValues: ['0°', '30°', '45°', '60°', '90°', '120°', '135°', '150°', '180°', '210°', '225°', '240°', '270°', '300°', '315°', '330°', '360°'] },
          { type: 'slider', name: 'specialRad', label: 'Góc radian đặc biệt', min: 0, max: 16, step: 1, defaultValue: 4, showIf: { control: 'mode', value: 'Góc radian đặc biệt' }, displayValues: ['0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '3π/4', '5π/6', 'π', '7π/6', '5π/4', '4π/3', '3π/2', '5π/3', '7π/4', '11π/6', '2π'] },
        ],
        mathContent: 'l = R \\cdot \\alpha \\quad (\\alpha \\text{ tính bằng radian})',
        explanation: 'Trên đường tròn bán kính R, cung tròn có số đo α radian sẽ có độ dài l bằng tích của R và α. Tính năng duỗi thẳng trực quan hóa cung tròn cong thành một đoạn thẳng thực tế để đo chính xác bằng thước mét.',
        keyInsights: [
          'Độ dài cung l tỉ lệ thuận với cả bán kính R và góc ở tâm α',
          'Bắt buộc phải đổi góc sang đơn vị Radian trước khi tính độ dài cung',
          'Khi R = 1, độ dài cung l bằng đúng số đo góc lượng giác α (tính bằng radian)',
        ],
        tags: ['lượng giác', 'độ dài cung', 'bán kính', 'radian'],
        difficulty: 'basic',
        isPublished: true,
      };
