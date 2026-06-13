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
    #board { width: 100%; height: 100vh; }
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
    /* Hardware acceleration rules to completely prevent HTML labels flickering during movement */
    .jxgbox div, .jxgbox .jxglabel {
      -webkit-backface-visibility: hidden !important;
      backface-visibility: hidden !important;
      will-change: transform, left, top !important;
      transform: translate3d(0,0,0) !important;
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

    function registerDragSnapping(board, point, sliderName) {
      point.on('drag', function() {
        var x = point.X();
        var y = point.Y();
        var rad = Math.atan2(y, x);
        var deg = rad * 180 / Math.PI;
        if (deg < 0) deg += 360;
        
        var params = window.currentParams || {};
        var mode = params.mode || 'Kéo tự do';
        
        var targetSlider = '';
        if (sliderName === 'angleU') {
          targetSlider = (mode === 'Góc độ đặc biệt' || mode === 'Góc radian đặc biệt') ? 'specialU' : 'angleU';
        } else if (sliderName === 'angleV') {
          targetSlider = (mode === 'Góc độ đặc biệt' || mode === 'Góc radian đặc biệt') ? 'specialV' : 'angleV';
        } else if (sliderName === 'angleW') {
          targetSlider = (mode === 'Góc độ đặc biệt' || mode === 'Góc radian đặc biệt') ? 'specialW' : 'angleW';
        } else {
          targetSlider = (mode === 'Góc độ đặc biệt') ? 'specialDeg' : 'specialRad';
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
          
          var snapRad = val * Math.PI / 180;
          point.setPosition(JXG.COORDS_BY_USER, [Math.cos(snapRad), Math.sin(snapRad)]);
          board.update();
          
          window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: sliderName, value: val }, '*');
        } else if (mode === 'Góc độ đặc biệt' || mode === 'Góc radian đặc biệt') {
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
          
          var snapDeg = specialDegVals[closestIdx];
          var snapRad = snapDeg * Math.PI / 180;
          point.setPosition(JXG.COORDS_BY_USER, [Math.cos(snapRad), Math.sin(snapRad)]);
          board.update();
          
          window.parent.postMessage({ type: 'UPDATE_CONTROL_VALUE', name: targetSlider, value: closestIdx }, '*');
        }
      });
    }
    window.registerDragSnapping = registerDragSnapping;

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
        pan: { enabled: true },
        zoom: { enabled: true, wheel: true },
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
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'UPDATE_PARAMS') {
        render(e.data.params);
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
        {/* Left Column: Board */}
        <div className="sim-board-column">
          <div className="sim-board" style={{ position: 'relative' }}>
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
                height: '100%',
                border: 'none',
              }}
              sandbox="allow-scripts"
              title={simulation.title}
            />
          </div>
        </div>

        {/* Right Column: Controls */}
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

          {simulation.controls.length > 0 && (
            <div className="control-panel">
              <h3>⚙️ Điều chỉnh tham số</h3>
              <div className="control-list">
                {simulation.controls.map((ctrl) => {
                  if (ctrl.showIf) {
                    const dependVal = controlValues[ctrl.showIf.control];
                    if (dependVal !== ctrl.showIf.value) {
                      return null;
                    }
                  }
                  return (
                    <div key={ctrl.name} className="control-item">
                      {ctrl.type === 'slider' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <label htmlFor={ctrl.name} style={{ cursor: 'pointer' }}>{ctrl.label}</label>
                              <button
                                type="button"
                                onClick={() => setPlayingControl(prev => prev === ctrl.name ? null : ctrl.name)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: '0.85rem', padding: '0 4px',
                                  color: playingControl === ctrl.name ? 'var(--color-primary-light)' : 'var(--text-muted)',
                                  transition: 'color 0.2s',
                                  display: 'inline-flex', alignItems: 'center'
                                }}
                                title={playingControl === ctrl.name ? "Tạm dừng chạy tự động" : "Chạy tự động chậm"}
                              >
                                {playingControl === ctrl.name ? '⏸' : '▶'}
                              </button>
                            </span>
                            <span className="value">
                              {ctrl.displayValues && ctrl.displayValues.length > 0 && typeof controlValues[ctrl.name] === 'number'
                                ? ctrl.displayValues[controlValues[ctrl.name] as number]
                                : typeof controlValues[ctrl.name] === 'number'
                                ? (controlValues[ctrl.name] as number).toFixed(
                                    ctrl.step && ctrl.step < 1 ? 1 : 0
                                  )
                                : String(controlValues[ctrl.name])}
                            </span>
                          </div>
                          <input
                            id={ctrl.name}
                            type="range"
                            min={ctrl.min}
                            max={ctrl.max}
                            step={ctrl.step}
                            value={controlValues[ctrl.name] as number}
                            onChange={(e) =>
                              handleControlChange(ctrl.name, parseFloat(e.target.value))
                            }
                          />
                        </>
                      )}
                      {ctrl.type === 'checkbox' && (
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <>
                          <label>{ctrl.label}</label>
                          <select
                            value={controlValues[ctrl.name] as string}
                            onChange={(e) =>
                              handleControlChange(ctrl.name, e.target.value)
                            }
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                            }}
                          >
                            {ctrl.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  );
                })}
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
