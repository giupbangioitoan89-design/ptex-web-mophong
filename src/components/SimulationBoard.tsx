'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ISimulation } from '@/types';

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

  // Build the iframe HTML with JSXGraph/Plotly embedded
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
  <script src="https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fafbfc; overflow: hidden; }
    #board { width: 100%; height: 100vh; }
    .sim-formula { font-family: 'Inter', sans-serif; font-weight: 600; color: #4f46e5; }
  </style>
</head>
<body>
  <div id="board" class="jxgbox"></div>
  <script>
    var board = null;
    function render(params) {
      if (board) JXG.JSXGraph.freeBoard(board);
      board = JXG.JSXGraph.initBoard('board', {
        boundingbox: [${bbox.join(',')}],
        axis: ${config.showAxis},
        grid: ${config.showGrid},
        showCopyright: false,
        showNavigation: false,
        pan: { enabled: true },
        zoom: { enabled: true, wheel: true },
        keepAspectRatio: false,
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
    // Signal ready
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
  </script>
</body>
</html>`;
    }

    if (visualizationType === 'plotly') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
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
  </script>
</body>
</html>`;
    }

    // Custom / Canvas fallback
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
  </script>
</body>
</html>`;
  }, [simulation]);

  // Send params to iframe
  const sendParams = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_PARAMS', params: controlValues },
        '*'
      );
    }
  }, [controlValues]);

  // Listen for iframe ready
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

  // Re-send params when values change
  useEffect(() => {
    if (!isLoading) {
      sendParams();
    }
  }, [controlValues, isLoading, sendParams]);

  // Set iframe content via blob URL
  useEffect(() => {
    const html = buildIframeContent();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    return () => URL.revokeObjectURL(url);
  }, [buildIframeContent]);

  const handleControlChange = (name: string, value: number | string | boolean) => {
    setControlValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="sim-container">
      {/* Graph Board */}
      <div className="sim-board">
        {isLoading && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loading-pulse" style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tải mô phỏng...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            aspectRatio: `${simulation.config.boardSize.width}/${simulation.config.boardSize.height}`,
            border: 'none',
            display: isLoading ? 'none' : 'block',
          }}
          sandbox="allow-scripts"
          title={simulation.title}
        />
      </div>

      {/* Control Panel + Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {simulation.controls.length > 0 && (
          <div className="control-panel">
            <h3>⚙️ Điều chỉnh</h3>
            {simulation.controls.map((ctrl) => (
              <div key={ctrl.name} className="control-item">
                {ctrl.type === 'slider' && (
                  <>
                    <label>
                      {ctrl.label}
                      <span className="value">
                        {typeof controlValues[ctrl.name] === 'number'
                          ? (controlValues[ctrl.name] as number).toFixed(
                              ctrl.step && ctrl.step < 1 ? 1 : 0
                            )
                          : controlValues[ctrl.name]}
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
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Math Content */}
        {simulation.mathContent && (
          <div className="math-display">
            <div
              dangerouslySetInnerHTML={{
                __html: `<span class="katex-display" style="font-size: 1.3rem;">\\(${simulation.mathContent}\\)</span>`,
              }}
            />
          </div>
        )}

        {/* Key Insights */}
        {simulation.keyInsights.length > 0 && (
          <div className="insight-box">
            <h4>💡 Điểm chính</h4>
            <ul>
              {simulation.keyInsights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        {simulation.explanation && (
          <div className="insight-box" style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.15)' }}>
            <h4 style={{ color: '#4ade80' }}>📝 Giải thích</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {simulation.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
