
import React, { useRef, useLayoutEffect, useState } from 'react';
import Neuron from './Neuron';
import { NUM_NEURONS } from '../constants';
import { NeuronState, Connection } from '../App';

interface NeuronBoardProps {
  neuronStates: NeuronState[];
  onNeuronPress: (id: number) => void;
  connections: Connection[];
  weights: number[][];
}

const NeuronBoard: React.FC<NeuronBoardProps> = ({ neuronStates, onNeuronPress, connections, weights }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const neuronRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

  useLayoutEffect(() => {
    const calculatePositions = () => {
      if (!boardRef.current) return;
      const boardRect = boardRef.current.getBoundingClientRect();
      const newPositions = neuronRefs.current.map(ref => {
        if (!ref) return { x: 0, y: 0 };
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.left - boardRect.left + rect.width / 2,
          y: rect.top - boardRect.top + rect.height / 2,
        };
      });
      setPositions(newPositions);
    };

    const timeoutId = setTimeout(calculatePositions, 50);

    window.addEventListener('resize', calculatePositions);
    const observer = new ResizeObserver(calculatePositions);
    if(boardRef.current) observer.observe(boardRef.current);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculatePositions);
      if(boardRef.current) observer.unobserve(boardRef.current);
    };
  }, []);

  return (
    <div
      ref={boardRef}
      className="relative p-2 bg-black/30 rounded-lg"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-6 gap-4 sm:gap-5">
        {Array.from({ length: NUM_NEURONS }).map((_, index) => (
          <Neuron
            key={index}
            ref={(el) => (neuronRefs.current[index] = el)}
            id={index}
            state={neuronStates[index]}
            onPress={onNeuronPress}
          />
        ))}
      </div>
      {positions.length > 0 && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
          {/* Render unlit background connections */}
          {weights.map((row, i) =>
            row.map((weight, j) => {
              if (weight > 0 && j > i) {
                 const pos1 = positions[i];
                 const pos2 = positions[j];
                 if (!pos1 || !pos2) return null;

                 const isStrong = weight >= 5;
                 const strokeColor = isStrong ? '#4B5563' : '#ef4444'; // gray-600 for strong, red-500 for weak
                 const strokeOpacity = isStrong ? '0.4' : '0.25';
                
                return (
                  <line
                    key={`unlit-${i}-${j}`}
                    x1={pos1.x} y1={pos1.y}
                    x2={pos2.x} y2={pos2.y}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeOpacity={strokeOpacity}
                  />
                );
              }
              return null;
            })
          )}

          {/* Render active connections (pressed or recalled) on top */}
          {connections.map((conn, i) => {
            if (!positions[conn.from] || !positions[conn.to]) return null;
            
            const pos1 = positions[conn.from];
            const pos2 = positions[conn.to];
            const color = conn.type === 'pressed' ? '#FBBF24' : '#4ADE80';
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;

            return (
              <g key={`active-${conn.from}-${conn.to}-${i}`}>
                <line
                  x1={pos1.x} y1={pos1.y}
                  x2={pos2.x} y2={pos2.y}
                  stroke={color}
                  strokeWidth="2.5"
                  strokeOpacity="0.8"
                />
                <text
                  x={midX}
                  y={midY - 5}
                  fill={color}
                  fontSize="10"
                  textAnchor="middle"
                  className="font-mono font-bold"
                  style={{ paintOrder: 'stroke', stroke: '#000000', strokeWidth: '3px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}
                >
                  W={conn.weight.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default NeuronBoard;
