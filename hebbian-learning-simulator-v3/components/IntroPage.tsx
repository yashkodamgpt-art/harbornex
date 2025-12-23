import React from 'react';

interface IntroPageProps {
  onStart: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-gray-200" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center bg-black/30 rounded-lg p-6 sm:p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
        
        <header className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Hebbian Learning Simulator
          </h1>
          <p className="text-lg text-gray-400 italic">
            "neurons that fire together, wire together"
          </p>
        </header>

        <main className="text-left space-y-4 text-gray-300 max-w-lg mb-8">
          <p>
            This is an interactive simulation of a simplified neural network. Explore how memories can form and be recalled through Hebbian learning.
          </p>
          
          <div>
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">Core Concepts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Create Associations:</strong>
                Select multiple neurons to link them.
                <ul className="list-['▸_'] list-inside pl-4 mt-1 space-y-1 text-gray-400">
                    <li>On touch devices, tap and hold multiple neurons at once.</li>
                    <li>On a computer, hold the <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> key and click on neurons.</li>
                </ul>
                <p className="mt-1">Connections are formed when you release your fingers or the <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> key.</p>
              </li>
              <li>
                <strong>Recall Memories:</strong> Later, tap and hold a single neuron from an associated group. If the connection is strong enough (W ≥ 5), the entire memory network will activate.
              </li>
              <li>
                <strong>Forgetting:</strong> Connections naturally decay after each event (or over time in ⏳ mode), simulating the process of forgetting.
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-cyan-400 mb-2">Special Modes</h2>
            <ul className="list-none space-y-2">
              <li><span className="inline-block w-6">⚡️</span> <strong>Turbo:</strong> Massively boosts learning for direct associations.</li>
              <li><span className="inline-block w-6">📡</span> <strong>Live Mode:</strong> Learning and recall occur in real-time as you press neurons, creating dynamic, cascading effects.</li>
              <li><span className="inline-block w-6">⏳</span> <strong>Time Mode:</strong> Memory decay is constant, happening over time instead of only after events.</li>
              <li><span className="inline-block w-6">✨</span> <strong>Zap:</strong> Activates all established memory networks at once to see the complete "mind state".</li>
            </ul>
          </div>
        </main>

        <footer className="w-full mt-auto">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-12 rounded-md hover:bg-blue-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg text-lg transform hover:scale-105"
          >
            Enter Simulation
          </button>
        </footer>

      </div>
    </div>
  );
};

export default IntroPage;
