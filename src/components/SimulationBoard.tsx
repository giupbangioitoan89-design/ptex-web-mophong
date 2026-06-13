'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ISimulation } from '@/types';
import { DisplayMath, MathText } from '@/components/MathRenderer';

interface SimulationBoardProps {
  simulation: ISimulation;
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

  // Clear autoplay state when switching simulations
  useEffect(() => {
    setPlayingControl(null);
  }, [simulation]);

  // Autoplay effect for sliders
  useEffect(() => {
    if (!playingControl) return;
    const ctrl = simulation.controls.find(c => c.name === playingControl);
    if (!ctrl || ctrl.type !== 'slider') return;

    const min = ctrl.min ?? 0;
    const max = ctrl.max ?? 100;
    const step = ctrl.step ?? 1;

    const interval = setInterval(() => {
      setControlValues(prev => {
        const current = (prev[playingControl] as number) ?? ctrl.defaultValue;
        let next = current + step;
        if (next > max) {
          next = min;
        }
        return { ...prev, [playingControl]: next };
      });
    }, 85); // 12 fps autoplay (smooth and slow)

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
    /* Beautiful KaTeX overrides inside JSXGraph labels */
    .jxgbox .katex { font-size: 1.1rem !important; }
    .jxgbox .katex-display { margin: 0.5em 0; }
  </style>
</head>
<body>
  <div id="board" class="jxgbox"></div>
  <script>
    function math(latex) {
      try {
        return katex.renderToString(latex, { throwOnError: false });
      } catch (e) {
        return latex;
      }
    }

    var board = null;
    function render(params) {
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
                          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {ctrl.label}
                              <button
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
                              {ctrl.displayValues && typeof controlValues[ctrl.name] === 'number'
                                ? ctrl.displayValues[controlValues[ctrl.name] as number]
                                : typeof controlValues[ctrl.name] === 'number'
                                ? (controlValues[ctrl.name] as number).toFixed(
                                    ctrl.step && ctrl.step < 1 ? 1 : 0
                                  )
                                : String(controlValues[ctrl.name])}
                            </span>
                          </label>
                          <input
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
