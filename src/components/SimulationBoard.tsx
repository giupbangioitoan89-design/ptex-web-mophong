'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import type { ISimulation } from '@/types';
import { DisplayMath, MathText } from '@/components/MathRenderer';

interface SimulationBoardProps {
  simulation: ISimulation;
}


function parseStyle(styleStr?: string): React.CSSProperties {
  if (!styleStr) return {};
  const styles: Record<string, string> = {};
  styleStr.split(';').forEach(rule => {
    const [key, value] = rule.split(':');
    if (key && value) {
      const camelKey = key.trim().replace(/-./g, c => c.substr(1).toUpperCase());
      styles[camelKey] = value.trim();
    }
  });
  return styles as React.CSSProperties;
}

function getControlThemeColor(name: string): string {
  const n = name.toLowerCase();
  // Chasles sim: alpha → green (Ou→Ov arc), beta → orange (Ov→Ow arc)
  if (n === 'alpha' || n === 'angleu' || n === 'specialu' || n === 'degu') return '#10b981';
  if (n === 'beta' || n === 'anglev' || n === 'specialv') return '#f59e0b';
  if (n === 'anglew' || n === 'specialw') return '#6366f1';
  if (n === 'deg' || n === 'angle' || n === 'specialdeg' || n === 'specialrad') return '#818cf8';
  if (n === 'r' || n === 'a') return '#818cf8';
  if (n === 'b') return '#fb923c';
  if (n === 'c' || n === 'd') return '#c084fc';
  if (n === 'mode' || n === 'relation') return '#94a3b8';
  return '#6366f1';
}

function renderInsightItem(insight: string, index: number) {
  const isHeader = insight.startsWith('📖') || insight.startsWith('📌') || insight.startsWith('💡');
  if (isHeader) {
    const icon = insight.slice(0, 2);
    const text = insight.slice(2).trim();
    return (
      <li key={index} className="insight-header-item">
        <span className="insight-header-icon">{icon}</span>
        <span className="insight-header-text">{text}</span>
      </li>
    );
  }

  if (insight.includes(':')) {
    const [poem, formula] = insight.split(':');
    return (
      <li key={index} className="insight-poem-item">
        <div className="insight-poem-text">“ {poem.trim()} ”</div>
        <div className="insight-poem-formula">
          <MathText>{formula.trim()}</MathText>
        </div>
      </li>
    );
  }

  const lower = insight.toLowerCase();
  const isPoemLine = lower.startsWith('cos ') || lower.startsWith('sin ') || lower.startsWith('tan ') || 
                     lower.includes('bằng') || lower.includes('thì') || lower.includes('cộng') || lower.includes('trừ');
  if (isPoemLine && insight.length < 100 && !insight.includes('hạ bậc') && !insight.includes('tích phân')) {
    return (
      <li key={index} className="insight-poem-item alone">
        <div className="insight-poem-text">“ {insight.trim()} ”</div>
      </li>
    );
  }

  return (
    <li key={index} className="insight-general-item">
      <MathText>{insight}</MathText>
    </li>
  );
}

export default function SimulationBoard({ simulation }: SimulationBoardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [controlValues, setControlValues] = useState<Record<string, number | string | boolean>>(() => {
    const defaults: Record<string, number | string | boolean> = {};
    for (const c of simulation.controls) {
      defaults[c.name] = c.defaultValue;
    }
    return defaults;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [playingControl, setPlayingControl] = useState<string | null>(null);
  const [readoutRows, setReadoutRows] = useState<any[]>([]);


  // Clear autoplay state and readouts when switching simulations
  useEffect(() => {
    setPlayingControl(null);
    setReadoutRows([]);
  }, [simulation]);

  // Autoplay effect for sliders
  useEffect(() => {
    if (!playingControl) return;
    const ctrl = simulation.controls.find(c => c.name === playingControl);
    if (!ctrl || ctrl.type !== 'slider') return;

    const min = Number(ctrl.min ?? 0);
    const max = Number(ctrl.max ?? 100);
    
    // Check if it's a discrete selection slider (has displayValues)
    const isDiscrete = !!(ctrl.displayValues && ctrl.displayValues.length > 0);

    if (isDiscrete) {
      // For discrete concepts (like specific angles/states), use a fixed 600ms interval for readability
      const tick = () => {
        setControlValues(prev => {
          const current = Number(prev[playingControl] ?? ctrl.defaultValue);
          const step = Number(ctrl.step ?? 1);
          let next = current + step;
          if (next > max) {
            next = min;
          }
          return { ...prev, [playingControl]: next };
        });
      };
      
      tick();
      const interval = setInterval(tick, 600);
      return () => clearInterval(interval);
    } else {
      // For continuous motion, use requestAnimationFrame for maximum smoothness synced to the screen's refresh rate
      let animationFrameId: number;
      let lastTime = performance.now();

      const loop = (time: number) => {
        let delta = time - lastTime;
        lastTime = time;
        
        // Clamp delta to maximum 100ms to prevent giant jumps when tab wakes up from background
        if (delta > 100) delta = 100;

        setControlValues(prev => {
          const current = Number(prev[playingControl] ?? ctrl.defaultValue);
          const range = max - min;
          // A full sweep from min to max should take about 12 seconds (12000ms)
          const step = (range / 12000) * delta;
          let next = current + step;
          if (next > max) {
            next = min;
          }
          return { ...prev, [playingControl]: next };
        });

        animationFrameId = requestAnimationFrame(loop);
      };

      animationFrameId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingControl]);

  const buildIframeContent = useCallback(() => {
    const { config, visualizationType } = simulation;
    const bbox = config.boundingBox || [-6, 6, 6, -6];

    if (visualizationType === 'jsxgraph') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'IFRAME_ERROR',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error ? error.stack : ''
      }, '*');
    };
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraph.css">
  <script src="https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js"><\/script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #fafbfc; }
    #board { width: 100%; height: 100%; touch-action: none; }
    .sim-formula { font-family: 'Inter', sans-serif; font-weight: 600; color: #4f46e5; }
    .sim-readout {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      color: #334155;
      background: rgba(255, 255, 255, 0.9);
      border: 1.5px solid rgba(226, 232, 240, 0.9);
      border-radius: 6px;
      padding: 4px 8px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    /* Beautiful KaTeX overrides inside JSXGraph labels */
    .jxgbox .katex { font-size: 1.1rem !important; }
    .jxgbox .katex-display { margin: 0.5em 0; }
    /* Disable pointer events on SVG text inside JSXGraph to prevent internal labels from blocking point dragging */
    .jxgbox text {
      pointer-events: none !important;
    }
    /* Split layout — side-by-side (default) */
    .split-container { display: flex; width: 100%; height: 100%; gap: 8px; padding: 8px; background: #fafbfc; }
    .split-left { flex: 4; height: 100%; border-radius: 10px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: #ffffff; }
    .split-right { flex: 6; height: 100%; border-radius: 10px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: #ffffff; }
    /* Split layout — overlay mode (small circle in top-left corner) */
    .split-overlay { position: relative; width: 100%; height: 100%; background: #fafbfc; }
    .split-overlay .split-left {
      position: absolute !important; bottom: 4px !important; left: 4px !important; width: 100px !important; height: 100px !important;
      z-index: 10 !important; border-radius: 8px; border: 1.5px solid rgba(99,102,241,0.25);
      background: rgba(255,255,255,0.95); box-shadow: 0 1px 6px rgba(0,0,0,0.08);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .split-overlay .split-left:hover {
      opacity: 0.15;
      transform: scale(0.98);
    }
    .split-overlay .split-right { position: relative; width: 100%; height: 100%; z-index: 1; }
  </style>
</head>
<body>
  ${config.split?.enabled
    ? config.split?.leftOverlay
      ? '<div class="split-overlay"><div id="board-right" class="jxgbox split-right"></div><div id="board-left" class="jxgbox split-left"></div></div>'
      : '<div class="split-container"><div id="board-left" class="jxgbox split-left"></div><div id="board-right" class="jxgbox split-right"></div></div>'
    : '<div id="board" class="jxgbox"></div>'}
  <script>
    function showReadouts(rows) {
      window.parent.postMessage({ type: 'SHOW_READOUTS', rows: rows }, '*');
    }
    window.showReadouts = showReadouts;

    function math(latex) {
      if (latex) {
        latex = latex.split('\\\\\\\\').join('\\\\');
      }
      try {
        return katex.renderToString(latex, { throwOnError: false });
      } catch (e) {
        return latex;
      }
    }

    /* =============================================================
     * PER-ELEMENT isDragging TRACKING
     *
     * Key insight: The simulation code already has checks like
     *   if (!board.sliderA.isDragging) board.sliderA.setValue(...)
     *   if (!board.M.isDragging) board.M.setPosition(...)
     *
     * We just need isDragging to be TRUE on the element being
     * dragged, and FALSE on everything else. This way:
     *   - Dragging slider A → A.isDragging=true → skip A.setValue
     *     but M.isDragging=false → DO call M.setPosition ✅
     *   - Dragging point M → M.isDragging=true → skip M.setPosition
     *     but sliderDeg.isDragging=false → DO call sliderDeg.setValue ✅
     *   - showReadouts() always runs → real-time readout updates ✅
     *
     * Previous approach was broken because:
     * 1. board.on('update') was overriding isDragging based on
     *    board.draggedObject which doesn't match for sliders
     * 2. Queuing UPDATE_PARAMS blocked readout updates entirely
     * ============================================================= */

    function _clearAllDragging() {
      if (typeof board !== 'undefined' && board && board.objects) {
        for (var id in board.objects) {
          if (board.objects.hasOwnProperty(id) && board.objects[id]) {
            board.objects[id].isDragging = false;
          }
        }
      }
      if (typeof window !== 'undefined' && window.boardRight && window.boardRight.objects) {
        for (var id in window.boardRight.objects) {
          if (window.boardRight.objects.hasOwnProperty(id) && window.boardRight.objects[id]) {
            window.boardRight.objects[id].isDragging = false;
          }
        }
      }
    }

    window.addEventListener('mouseup', _clearAllDragging);
    window.addEventListener('touchend', _clearAllDragging);
    window.addEventListener('touchcancel', _clearAllDragging);

    /* =============================================================
     * DRAG SNAPPING — posts angle values to React during drag
     * ============================================================= */
    function registerDragSnapping(board, point, sliderName) {
      point.isDragging = false;
      point.on('down', function() {
        var params = window.currentParams || {};
        var mode = params.mode || 'Kéo tự do';
        if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
          point.isDragging = false;
          return;
        }
        point.isDragging = true;
      });
      point.on('drag', function() {
        var params = window.currentParams || {};
        var mode = params.mode || 'Kéo tự do';
        if (mode === 'Bánh xe lăn trên đường' || mode === 'Xe đạp chạy trên đường') {
          point.isDragging = false;
          return;
        }
        point.isDragging = true;
        var x = point.X();
        var y = point.Y();
        var rad = Math.atan2(y, x);
        var deg = rad * 180 / Math.PI;
        if (deg < 0) deg += 360;
        
        var params = window.currentParams || {};
        var mode = params.mode || 'Kéo tự do';
        
        var targetSlider = sliderName;
        if (mode === 'Góc độ đặc biệt' || mode === 'Góc radian đặc biệt') {
          if (sliderName === 'angleU') targetSlider = 'specialU';
          else if (sliderName === 'angleV') targetSlider = 'specialV';
          else if (sliderName === 'angleW') targetSlider = 'specialW';
          else targetSlider = (mode === 'Góc độ đặc biệt') ? 'specialDeg' : 'specialRad';
        }
        
        if (mode === 'Kéo tự do') {
          var val = Math.round(deg);
          if (sliderName === 'deg') {
            var currentVal = params.deg !== undefined ? params.deg : 120;
            var currentTurns = Math.floor(currentVal / 360);
            var targetVal = currentTurns * 360 + val;
            if (Math.abs(targetVal - currentVal) > 180) {
              if (targetVal < currentVal) targetVal += 360;
              else targetVal -= 360;
            }
            val = Math.max(-720, Math.min(720, targetVal));
            val = Math.round(val / 10) * 10;
          } else if (sliderName === 'angle' || sliderName === 'angleU' || sliderName === 'angleV' || sliderName === 'angleW') {
            val = Math.round(val / 5) * 5;
          }
          window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: sliderName, value: val }, '*');
        } else {
          var specialDegVals = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
          var closestIdx = 0;
          var minDiff = 360;
          for (var i = 0; i < specialDegVals.length; i++) {
            var diff = Math.abs(deg - specialDegVals[i]);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = i;
            }
          }
          window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: targetSlider, value: closestIdx }, '*');
        }
      });
    }
    window.registerDragSnapping = registerDragSnapping;

    /* =============================================================
     * CUSTOM SLIDER — with per-element isDragging tracking
     * ============================================================= */
    function createCustomSlider(board, p1, p2, min, start, max, label, step, color, displayValues) {
      color = color || '#6366f1';
      /* Create slider but HIDDEN — the web overlay handles the UI.
         The slider object still exists for simulation code to read/write values. */
      var s = board.create('slider', [p1, p2, [min, start, max]], {
        name: label,
        snapWidth: step,
        visible: false,
        withTicks: false,
        size: 0,
        strokeColor: 'transparent',
        fillColor: 'transparent',
        highlightFillColor: 'transparent',
        highlightStrokeColor: 'transparent',
        point1: { visible: false, fixed: true },
        point2: { visible: false, fixed: true },
        baseline: { visible: false, strokeColor: 'transparent', fixed: true },
        highline: { visible: false, strokeColor: 'transparent', fixed: true },
        ticks: { visible: false, strokeColor: 'transparent' },
        label: { visible: false }
      });
      /* Track isDragging on the slider itself.
         JSXGraph sliders are composite: the draggable knob is a sub-point.
         We track on the slider so the simulation isDragging check works. */
      s.isDragging = false;
      s.on('down', function() { s.isDragging = true; });
      s.on('drag', function() { s.isDragging = true; });
      return s;
    }
    window.createCustomSlider = createCustomSlider;

    /* =============================================================
     * BOARD INIT & RENDER — always runs, isDragging prevents conflicts
     * ============================================================= */
    var board = null;
    window.currentParams = null;

    function render(params) {
      window.currentParams = params;
      if (board && typeof updateSimulation === 'function') {
        try {
          updateSimulation(board, params);
          board.update();
          if (board.right) {
            board.right.update();
          }
        } catch (e) {
          console.error('Update error:', e);
        }
        return;
      }

      if (board) JXG.JSXGraph.freeBoard(board);
      if (window.boardRight) JXG.JSXGraph.freeBoard(window.boardRight);

      var splitEnabled = ${!!config.split?.enabled};
      if (splitEnabled) {
        board = JXG.JSXGraph.initBoard('board-left', {
          boundingbox: [${(config.split?.leftBBox || [-1.5, 1.5, 1.5, -1.5]).join(',')}],
          axis: ${!!config.split?.leftAxis},
          grid: ${!!config.split?.leftGrid},
          showCopyright: false,
          showNavigation: false,
          pan: { enabled: false },
          zoom: { enabled: false, wheel: false },
          keepAspectRatio: true,
          keepaspectratio: true,
          resize: { enabled: true, throttle: 200 }
        });
        window.boardRight = JXG.JSXGraph.initBoard('board-right', {
          boundingbox: [${(config.split?.rightBBox || [-0.5, 2.5, 7.5, -2.5]).join(',')}],
          axis: ${!!config.split?.rightAxis},
          grid: ${!!config.split?.rightGrid},
          showCopyright: false,
          showNavigation: false,
          pan: { enabled: false },
          zoom: { enabled: false, wheel: false },
          keepAspectRatio: false,
          keepaspectratio: false,
          resize: { enabled: true, throttle: 200 }
        });
        board.right = window.boardRight;
      } else {
        board = JXG.JSXGraph.initBoard('board', {
          boundingbox: [${bbox.join(',')}],
          axis: ${config.showAxis},
          grid: ${config.showGrid},
          showCopyright: false,
          showNavigation: false,
          pan: { enabled: false },
          zoom: { enabled: false, wheel: false },
          keepAspectRatio: true,
          keepaspectratio: true,
          resize: { enabled: true, throttle: 200 }
        });
      }

      board.on('up', _clearAllDragging);
      if (splitEnabled) {
        window.boardRight.on('up', _clearAllDragging);
      }

      try {
        ${simulation.simulationCode}
        initSimulation(board, params);
      } catch(e) {
        console.error('Simulation error:', e);
      }
    }

    /* =============================================================
     * MESSAGE HANDLER — Always render (no more queuing).
     * isDragging on each element prevents position overrides
     * while letting readouts and other elements update freely.
     * ============================================================= */
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'UPDATE_PARAMS') {
        render(e.data.params);
      } else if (e.data && e.data.type === 'RELEASE_DRAG') {
        _clearAllDragging();
        if (window.currentParams) render(window.currentParams);
      }
    });

    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  <\/script>
</body>
</html>`;
    }

    if (visualizationType === 'plotly') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fafbfc; overflow: hidden; }
    #chart { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    function render(params) {
      try {
        ${simulation.simulationCode}
        initSimulation(document.getElementById('chart'), params);
      } catch(e) { console.error('Simulation error:', e); }
    }
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'UPDATE_PARAMS') render(e.data.params);
    });
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  <\/script>
</body>
</html>`;
    }

    // Canvas fallback
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fafbfc; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas" width="${config.boardSize.width}" height="${config.boardSize.height}"></canvas>
  <script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    function render(params) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try {
        ${simulation.simulationCode}
        initSimulation(ctx, canvas, params);
      } catch(e) { console.error('Simulation error:', e); }
    }
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'UPDATE_PARAMS') render(e.data.params);
    });
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  <\/script>
</body>
</html>`;
  }, [simulation]);

  const sendParams = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_PARAMS', params: controlValues },
        '*'
      );
    }
  }, [controlValues]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'IFRAME_READY') {
        setIsLoading(false);
        sendParams();
      } else if (e.data?.type === 'UPDATE_CONTROL_VALUE') {
        const { name, value } = e.data;
        setControlValues(prev => ({ ...prev, [name]: value }));
      } else if (e.data?.type === 'SHOW_READOUTS') {
        setReadoutRows(e.data.rows || []);
      } else if (e.data?.type === 'IFRAME_ERROR') {
        console.error('[Iframe Error]', e.data.message, 'at', e.data.source, 'line', e.data.lineno, 'col', e.data.colno, '\nStack:', e.data.error);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [sendParams]);

  useEffect(() => {
    const handleRelease = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'RELEASE_DRAG' }, '*');
      }
    };
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);
    return () => {
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) sendParams();
  }, [controlValues, isLoading, sendParams]);

  useEffect(() => {
    const html = buildIframeContent();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation._id, simulation.title]);
  const handleControlChange = (name: string, value: number | string | boolean) => {
    setControlValues(prev => ({ ...prev, [name]: value }));
    // Reset play state if mode changes to avoid ghost autoplay
    if (name === 'mode') {
      setPlayingControl(null);
    }
  };

  const infoSection = useMemo(() => {
    return (
      <div className="sim-layout-info">
        {/* Math Formula Display */}
        {simulation.mathContent && (
          <div className="math-display">
            <DisplayMath>{simulation.mathContent}</DisplayMath>
          </div>
        )}

        {/* Info Panels */}
        <div className="sim-info-grid">
          {/* Key Insights */}
          {simulation.keyInsights.length > 0 && (
            <div className="insight-box">
              <h4>💡 Điểm chính</h4>
              <ul>
                {simulation.keyInsights.map((insight, i) => renderInsightItem(insight, i))}
              </ul>
            </div>
          )}

          {/* Explanation */}
          {simulation.explanation && (
            <div className="insight-box explanation">
              <h4>📝 Giải thích</h4>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <MathText>{simulation.explanation}</MathText>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {simulation.tags && simulation.tags.length > 0 && (
          <div className="tag-list">
            {simulation.tags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}
      </div>
    );
  }, [simulation]);

  return (
    <div className="sim-wrapper">
      {/* ===== Upper Row: Board & Controls side-by-side on desktop ===== */}
      <div className="sim-layout-main">
        {/* Left Column: Board (with integrated compact controls at bottom) */}
        <div className="sim-board-column">
          <div className="sim-board" style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {isLoading && (
              <div className="loading-board" style={{
                position: 'absolute',
                inset: 0,
                background: '#fafbfc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div className="spinner" />
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Đang tải mô phỏng...</p>
              </div>
            )}

            {/* Control bar ABOVE the iframe — no longer overlays the content */}
            {simulation.controls.length > 0 && (
              <div className="glass-control-bar">
                {simulation.controls.map((ctrl) => {
                  if (ctrl.showIf) {
                    const dependVal = controlValues[ctrl.showIf.control];
                    if (Array.isArray(ctrl.showIf.value)) {
                      if (!ctrl.showIf.value.includes(dependVal)) {
                        return null;
                      }
                    } else if (dependVal !== ctrl.showIf.value) {
                      return null;
                    }
                  }
                  const themeColor = getControlThemeColor(ctrl.name);
                  return (
                    <div
                      key={ctrl.name}
                      className="glass-control-item"
                      style={{ '--ctrl-color': themeColor } as React.CSSProperties}
                    >
                      {ctrl.type === 'slider' && (
                        <div className="glass-slider-row" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                          <span className="glass-slider-label">{ctrl.label}</span>
                          <button
                            type="button"
                            onClick={() => setPlayingControl(prev => prev === ctrl.name ? null : ctrl.name)}
                            className={`glass-play-btn ${playingControl === ctrl.name ? 'active' : ''}`}
                            title={playingControl === ctrl.name ? 'Tạm dừng' : 'Chạy tự động'}
                          >
                            {playingControl === ctrl.name ? '⏸' : '▶'}
                          </button>
                          <span className="glass-slider-value">
                            {ctrl.displayValues && ctrl.displayValues.length > 0 && typeof controlValues[ctrl.name] === 'number'
                              ? ctrl.displayValues[controlValues[ctrl.name] as number]
                              : typeof controlValues[ctrl.name] === 'number'
                              ? (controlValues[ctrl.name] as number).toFixed(2)
                              : String(controlValues[ctrl.name])}
                          </span>
                          <input
                            type="range"
                            min={ctrl.min ?? 0}
                            max={ctrl.max ?? 100}
                            step={ctrl.step ?? 1}
                            value={Number(controlValues[ctrl.name] ?? ctrl.defaultValue)}
                            onChange={(e) => handleControlChange(ctrl.name, Number(e.target.value))}
                            className="glass-range"
                          />
                        </div>
                      )}
                      {ctrl.type === 'checkbox' && (
                        <label className="glass-checkbox">
                          <input
                            type="checkbox"
                            checked={controlValues[ctrl.name] as boolean}
                            onChange={(e) => handleControlChange(ctrl.name, e.target.checked)}
                          />
                          <span>{ctrl.label}</span>
                        </label>
                      )}
                      {ctrl.type === 'select' && (
                        <div className="glass-select-row">
                          <label>{ctrl.label}</label>
                          <select
                            value={controlValues[ctrl.name] as string}
                            onChange={(e) => handleControlChange(ctrl.name, e.target.value)}
                            className="glass-select"
                          >
                            {ctrl.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Iframe sits below controls — full view, nothing overlaid */}
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                flex: 1,
                minHeight: '300px',
                border: 'none',
              }}
              sandbox="allow-scripts allow-same-origin"
              title={simulation.title}
            />
          </div>
        </div>

        {/* Right Column: Controls Column now only holds the Readout Stats Panel */}
        <div className="sim-controls-column">
          {readoutRows.length > 0 && (
            <div className="readout-panel-react">
              <h3>📊 Thông số mô phỏng</h3>
              <div className="readout-list-react">
                {readoutRows.map((row, idx) => (
                  <div key={idx} className="readout-row-react">
                    <span className="readout-label-react" style={parseStyle(row.labelStyle)}>
                      {row.label}
                    </span>
                    <span 
                      className="readout-value-react" 
                      style={parseStyle(row.valueStyle)}
                      dangerouslySetInnerHTML={{ __html: row.value }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Lower Section: Full-Width Math, Insights & Explanation ===== */}
      {infoSection}
    </div>
  );
}
