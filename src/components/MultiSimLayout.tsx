'use client';

import { useState } from 'react';
import type { ISimulation } from '@/types';
import SimulationBoard from './SimulationBoard';

interface MultiSimLayoutProps {
  simulations: ISimulation[];
}

export default function MultiSimLayout({ simulations }: MultiSimLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!simulations || simulations.length === 0) {
    return null;
  }

  if (simulations.length === 1) {
    return <SimulationBoard simulation={simulations[0]} />;
  }

  return (
    <div className="multi-sim-container">
      {/* Sleek Tab Selector */}
      <div className="multi-sim-tabs">
        {simulations.map((sim, index) => {
          const isActive = index === activeIndex;
          const vizLabel = sim.visualizationType === 'plotly' ? '3D' : '2D';
          const diffLabels = {
            basic: 'Cơ bản',
            intermediate: 'Trung bình',
            advanced: 'Nâng cao',
          };
          return (
            <button
              key={sim._id || index}
              onClick={() => setActiveIndex(index)}
              className={`multi-sim-tab-btn ${isActive ? 'active' : ''}`}
            >
              <div className="tab-header-row">
                <span className="tab-index" style={{
                  background: isActive ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#fff' : 'var(--text-muted)'
                }}>
                  {index + 1}
                </span>
                <span className="tab-title">{sim.title}</span>
              </div>
              <div className="tab-badges">
                <span className={`tab-badge viz ${sim.visualizationType}`}>
                  {vizLabel}
                </span>
                <span className={`tab-badge diff ${sim.difficulty}`}>
                  {diffLabels[sim.difficulty] || sim.difficulty}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Simulation Description */}
      {simulations[activeIndex].description && (
        <p className="active-sim-desc">
          💡 {simulations[activeIndex].description}
        </p>
      )}

      {/* Active Simulation Board */}
      <div className="active-sim-board-wrapper">
        <SimulationBoard
          key={simulations[activeIndex]._id || activeIndex}
          simulation={simulations[activeIndex]}
        />
      </div>
    </div>
  );
}
