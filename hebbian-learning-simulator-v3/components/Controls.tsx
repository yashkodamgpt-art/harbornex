import React from 'react';

interface ControlsProps {
    onReset: () => void;
    learningRate: number;
    setLearningRate: (rate: number) => void;
    isTurboOn: boolean;
    onToggleTurbo: () => void;
    isLiveModeOn: boolean;
    onToggleLiveMode: () => void;
    isTimeModeOn: boolean;
    onToggleTimeMode: () => void;
    decayRate: number;
    setDecayRate: (rate: number) => void;
    onZap: () => void;
    onBack: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onReset, learningRate, setLearningRate, isTurboOn, onToggleTurbo, isLiveModeOn, onToggleLiveMode, isTimeModeOn, onToggleTimeMode, decayRate, setDecayRate, onZap, onBack }) => {
    const turboButtonClasses = isTurboOn 
        ? 'bg-yellow-500 text-gray-900 ring-2 ring-yellow-400 shadow-[0_0_10px_2px_rgba(250,204,21,0.5)]'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600';

    const liveButtonClasses = isLiveModeOn
        ? 'bg-cyan-500 text-gray-900 ring-2 ring-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.5)]'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600';

    const timeButtonClasses = isTimeModeOn
        ? 'bg-purple-500 text-gray-900 ring-2 ring-purple-400 shadow-[0_0_10px_2px_rgba(192,132,252,0.5)]'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
        
    return (
        <div className="p-3 bg-black/30 rounded-lg flex items-center justify-between gap-x-6 gap-y-3 flex-wrap">
            <div className="flex items-center gap-2">
                 <button
                    onClick={onReset}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md text-sm"
                >
                    Reset Memory
                </button>
                <button
                    onClick={onToggleTurbo}
                    title="Toggle Turbo Learning Rate (Direct Excitation Only)"
                    aria-pressed={isTurboOn}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-400 ${turboButtonClasses}`}
                >
                    ⚡️
                </button>
                <button
                    onClick={onToggleLiveMode}
                    title="Toggle Live Learning & Recall Mode"
                    aria-pressed={isLiveModeOn}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 ${liveButtonClasses}`}
                >
                    📡
                </button>
                <button
                    onClick={onToggleTimeMode}
                    title="Toggle Time-based Decay"
                    aria-pressed={isTimeModeOn}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-400 ${timeButtonClasses}`}
                >
                    ⏳
                </button>
                 <button
                    onClick={onZap}
                    title="Zap Active Networks (W >= 5)"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-400 bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                    ✨
                </button>
                <button
                    onClick={onBack}
                    title="Back to Intro"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400 bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                    ↩️
                </button>
            </div>
            <div className="flex-grow flex flex-col gap-2" style={{minWidth: '280px'}}>
                {/* Learning Rate Slider */}
                <div className="flex-grow flex items-center gap-3 text-sm">
                    <label htmlFor="learning-rate" className="text-gray-400 whitespace-nowrap">Learning Rate η</label>
                    <input
                        id="learning-rate"
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={learningRate}
                        onChange={e => setLearningRate(parseFloat(e.target.value))}
                        className="flex-grow"
                    />
                    <span className="font-mono w-8 text-center text-yellow-400">{learningRate.toFixed(1)}</span>
                </div>
                {/* Decay Rate Slider */}
                <div className="flex-grow flex items-center gap-3 text-sm">
                    <label htmlFor="decay-rate" className="text-gray-400 whitespace-nowrap">Decay Rate &nbsp; &nbsp;δ</label>
                    <input
                        id="decay-rate"
                        type="range"
                        min="0"
                        max="0.2"
                        step="0.01"
                        value={decayRate}
                        onChange={e => setDecayRate(parseFloat(e.target.value))}
                        className="flex-grow"
                    />
                    <span className="font-mono w-8 text-center text-gray-300">{decayRate.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default Controls;