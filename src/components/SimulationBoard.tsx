'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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
  if (n.includes('u') || n.includes('deg') || n === 'angle' || n === 'r') {
    return '#818cf8'; // Indigo-400 (Primary)
  }
  if (n.includes('v') || n.includes('relation') || n === 'a' || n === 'b') {
    return '#fb923c'; // Orange-400 (Secondary)
  }
  if (n.includes('w') || n === 'c' || n === 'd') {
    return '#c084fc'; // Purple-400 (Third)
  }
  return '#6366f1'; // Default Indigo
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
  const [controlsOpen, setControlsOpen] = useState(false);

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
    const intervalTime = isDiscrete ? 600 : 30; // 600ms for discrete concepts, 30ms for continuous motion
    
    const tick = () => {
      setControlValues(prev => {
        // Force type-safety cast to number to prevent string concatenation bugs
        const current = Number(prev[playingControl] ?? ctrl.defaultValue);
        
        let next;
        if (isDiscrete) {
          // Discrete step
          const step = Number(ctrl.step ?? 1);
          next = current + step;
          if (next > max) {
            next = min;
          }
        } else {
          // Continuous smooth animation
          // A full sweep from min to max should take about 12-15 seconds (400 frames)
          const range = max - min;
          const autoStep = range / 400;
          next = current + autoStep;
          if (next > max) {
            next = min;
          }
        }
        return { ...prev, [playingControl]: next };
      });
    };

    // Run first frame immediately to prevent UI freeze delay
    tick();
    
    const interval = setInterval(tick, intervalTime);

    return () => clearInterval(interval);
  }, [playingControl, simulation.controls]);

  const buildIframeContent = useCallback(() => {
    const { config, visualizationType } = simulation;
    const bbox = config.boundingBox || [-6, 6, 6, -6];

    if (visualizationType === 'jsxgraph') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraph.css">
  <script src="https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js"><\/script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fafbfc; overflow: hidden; }
    #board { width: 100%; height: 100vh; touch-action: none; }
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
  </style>
</head>
<body>
  <div id="board" class="jxgbox"></div>
  <script>
    function showReadouts(rows) {
      window.parent.postMessage({ type: 'SHOW_READOUTS', rows: rows }, '*');
    }
    window.showReadouts = showReadouts;

    function math(latex) {
      try {
        return katex.renderToString(latex, { throwOnError: false });
      } catch (e) {
        return latex;
      }
    }

    /* =============================================================
     * INTERACTION GUARD — The core fix for drag feedback loops.
     * 
     * Problem: User drags element → iframe posts value to React →
     * React sends UPDATE_PARAMS back → updateSimulation calls
     * setPosition/setValue → overrides drag position → stuck.
     *
     * Solution: While pointer is down on the board, queue all
     * incoming UPDATE_PARAMS. Apply them only after release.
     * JSXGraph handles dragging 100% natively with zero interference.
     * ============================================================= */
    var _pointerDown = false;
    var _pendingParams = null;

    document.addEventListener('mousedown', function() {
      _pointerDown = true;
    }, true);
    document.addEventListener('touchstart', function() {
      _pointerDown = true;
    }, { capture: true, passive: true });

    function _onPointerRelease() {
      _pointerDown = false;
      if (_pendingParams) {
        var p = _pendingParams;
        _pendingParams = null;
        render(p);
      }
    }

    window.addEventListener('mouseup', _onPointerRelease);
    window.addEventListener('touchend', _onPointerRelease);
    window.addEventListener('touchcancel', _onPointerRelease);

    /* =============================================================
     * DRAG SNAPPING — posts angle values to React during drag
     * ============================================================= */
    function registerDragSnapping(board, point, sliderName) {
      point.on('drag', function() {
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
     * CUSTOM SLIDER — creates JSXGraph sliders with drag handlers
     * ============================================================= */
    function createCustomSlider(board, p1, p2, min, start, max, label, step, color, displayValues) {
      color = color || '#6366f1';
      var s = board.create('slider', [p1, p2, [min, start, max]], {
        name: label,
        snapWidth: step,
        size: 4,
        strokeColor: '#cbd5e1',
        fillColor: color,
        highlightFillColor: color,
        highlightStrokeColor: color,
        point1: { visible: true, size: 1.5, strokeColor: '#cbd5e1', fillColor: '#cbd5e1', fixed: true },
        point2: { visible: true, size: 1.5, strokeColor: '#cbd5e1', fillColor: '#cbd5e1', fixed: true },
        baseline: { strokeColor: '#cbd5e1', strokeWidth: 3, fixed: true },
        highline: { strokeColor: color, strokeWidth: 4, fixed: true },
        label: {
          fontSize: 12,
          color: '#475569',
          strokeColor: 'none',
          offset: [-15, 12],
          formatter: function() {
            var val = s.Value();
            if (displayValues && displayValues.length > 0) {
              var idx = Math.min(displayValues.length - 1, Math.max(0, Math.round(val)));
              return label + ': ' + displayValues[idx];
            }
            return label + ': ' + val.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0);
          }
        }
      });
      return s;
    }
    window.createCustomSlider = createCustomSlider;

    /* =============================================================
     * BOARD INIT & RENDER
     * ============================================================= */
    var board = null;
    window.currentParams = null;

    function render(params) {
      window.currentParams = params;
      if (board && typeof updateSimulation === 'function') {
        try {
          updateSimulation(board, params);
          board.update();
        } catch (e) {
          console.error('Update error:', e);
        }
        return;
      }

      if (board) JXG.JSXGraph.freeBoard(board);
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
      try {
        ${simulation.simulationCode}
        initSimulation(board, params);
      } catch(e) {
        console.error('Simulation error:', e);
      }
    }

    /* =============================================================
     * MESSAGE HANDLER — Queues params during interaction
     * ============================================================= */
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'UPDATE_PARAMS') {
        if (_pointerDown) {
          /* Pointer is down — user is dragging something.
             Store params for later, DON'T call render().
             This prevents setPosition/setValue from fighting the drag. */
          _pendingParams = e.data.params;
          window.currentParams = e.data.params;
          return;
        }
        render(e.data.params);
      } else if (e.data && e.data.type === 'RELEASE_DRAG') {
        /* Parent detected mouseup/touchend outside iframe */
        _onPointerRelease();
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
  }, [buildIframeContent]);
  const handleControlChange = (name: string, value: number | string | boolean) => {
    setControlValues(prev => ({ ...prev, [name]: value }));
    // Reset play state if mode changes to avoid ghost autoplay
    if (name === 'mode') {
      setPlayingControl(null);
    }
  };

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
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                flex: 1,
                minHeight: '360px',
                border: 'none',
              }}
              sandbox="allow-scripts allow-same-origin"
              title={simulation.title}
            />

            {/* Integrated compact controls block inside graph box */}
            {simulation.controls.length > 0 && (
              !controlsOpen ? (
                <button
                  type="button"
                  onClick={() => setControlsOpen(true)}
                  className="control-panel-toggle-btn"
                  title="Mở bảng điều chỉnh"
                >
                  <span>⚙️</span>
                  <span>Điều chỉnh</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
                </button>
              ) : (
                <div className="board-control-panel">
                  {/* Expanded Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '6px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>⚙️</span> Điều chỉnh
                    </span>
                    <button
                      type="button"
                      onClick={() => setControlsOpen(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'color 0.2s'
                      }}
                      title="Ẩn bảng điều chỉnh"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                    >
                      ▲ Ẩn
                    </button>
                  </div>
                  <div className="control-list-horizontal">
                    {simulation.controls.map((ctrl) => {
                      if (ctrl.showIf) {
                        const dependVal = controlValues[ctrl.showIf.control];
                        if (dependVal !== ctrl.showIf.value) {
                          return null;
                        }
                      }
                      const themeColor = getControlThemeColor(ctrl.name);
                      const themeColorLight = themeColor + '20'; // 12% opacity hex representation
                      return (
                        <div 
                          key={ctrl.name} 
                          className="control-item"
                          style={{
                            '--control-theme-color': themeColor,
                            '--control-theme-color-light': themeColorLight
                          } as React.CSSProperties}
                        >
                          {ctrl.type === 'slider' && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '20px',
                              padding: '4px 10px 4px 12px',
                              height: '32px',
                              width: '100%'
                            }}>
                              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {ctrl.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPlayingControl(prev => prev === ctrl.name ? null : ctrl.name)}
                                className={`play-btn ${playingControl === ctrl.name ? 'playing' : ''}`}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: '0.8rem', padding: '0 2px',
                                  display: 'inline-flex', alignItems: 'center',
                                  transition: 'color 0.2s', color: playingControl === ctrl.name ? 'var(--control-theme-color)' : '#94a3b8'
                                }}
                                title={playingControl === ctrl.name ? "Tạm dừng chạy tự động" : "Chạy tự động"}
                              >
                                {playingControl === ctrl.name ? '⏸' : '▶'}
                              </button>
                              <span 
                                className="value" 
                                style={{ 
                                  fontWeight: 700, 
                                  fontVariantNumeric: 'tabular-nums',
                                  color: 'var(--control-theme-color, #818cf8)',
                                  background: 'var(--control-theme-color-light, rgba(99, 102, 241, 0.12))',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  marginLeft: 'auto'
                                }}
                              >
                                {ctrl.displayValues && ctrl.displayValues.length > 0 && typeof controlValues[ctrl.name] === 'number'
                                  ? ctrl.displayValues[controlValues[ctrl.name] as number]
                                  : typeof controlValues[ctrl.name] === 'number'
                                  ? (controlValues[ctrl.name] as number).toFixed(
                                      ctrl.step && ctrl.step < 1 ? 1 : 0
                                    )
                                  : String(controlValues[ctrl.name])}
                              </span>
                            </div>
                          )}
                          {ctrl.type === 'checkbox' && (
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', height: '32px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                              <input
                                type="checkbox"
                                checked={controlValues[ctrl.name] as boolean}
                                onChange={(e) =>
                                  handleControlChange(ctrl.name, e.target.checked)
                                }
                              />
                              {ctrl.label}
                            </label>
                          )}
                          {ctrl.type === 'select' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '32px' }}>
                              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, whiteSpace: 'nowrap' }}>{ctrl.label}</label>
                              <select
                                value={controlValues[ctrl.name] as string}
                                onChange={(e) =>
                                  handleControlChange(ctrl.name, e.target.value)
                                }
                                style={{
                                  background: 'rgba(15, 23, 42, 0.6)',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  borderRadius: '6px',
                                  color: '#f8fafc',
                                  padding: '2px 8px',
                                  fontSize: '0.78rem',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  height: '26px'
                                }}
                              >
                                {ctrl.options?.map((opt) => (
                                  <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
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
                {simulation.keyInsights.map((insight, i) => (
                  <li key={i}><MathText>{insight}</MathText></li>
                ))}
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
    </div>
  );
}
