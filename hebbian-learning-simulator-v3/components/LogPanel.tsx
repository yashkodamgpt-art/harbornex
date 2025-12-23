
import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
  messages: string[];
}

const LogPanel: React.FC<LogPanelProps> = ({ messages }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col p-3 bg-black/50 rounded-lg shadow-inner h-32">
      <h2 className="text-sm font-semibold text-gray-400 mb-2 font-mono flex-shrink-0">Console Log</h2>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-1 text-xs">
        {messages.slice().reverse().map((msg, index) => (
          <p key={messages.length - 1 - index} className="font-mono text-gray-300 leading-tight">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
