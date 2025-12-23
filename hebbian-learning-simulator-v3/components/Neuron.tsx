import React from 'react';
import { NeuronState } from '../App';

interface NeuronProps {
  id: number;
  state: NeuronState;
  onPress: (id: number) => void;
}

const Neuron = React.forwardRef<HTMLButtonElement, NeuronProps>(({ id, state, onPress }, ref) => {
  const stateClasses = {
    idle: 'bg-gray-800/80 ring-gray-700 hover:bg-gray-700/80',
    pressed: 'bg-yellow-400/90 shadow-[0_0_12px_4px_rgba(250,204,21,0.6)] scale-110 ring-2 ring-yellow-300',
    recalled: 'bg-green-400/90 shadow-[0_0_12px_4px_rgba(74,222,128,0.6)] scale-110 ring-2 ring-green-300',
  };

  const textClasses = {
    idle: 'text-gray-400',
    pressed: 'text-gray-900 font-bold',
    recalled: 'text-gray-900 font-bold',
  };

  return (
    <button
      ref={ref}
      type="button"
      onMouseDown={() => onPress(id)}
      onTouchStart={(e) => {
        e.preventDefault();
        onPress(id);
      }}
      aria-label={`Neuron ${id}`}
      aria-pressed={state !== 'idle'}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-150 ease-in-out focus:outline-none select-none ring-1 z-10 ${stateClasses[state]}`}
    >
      <span className={`text-sm sm:text-base font-mono transition-colors ${textClasses[state]}`}>
        {id}
      </span>
    </button>
  );
});

export default Neuron;