
import React from 'react';

const Explanation: React.FC = () => {
  return (
    <div className="max-w-xs p-3 bg-gray-800/60 rounded-md text-gray-300 text-xs shadow-lg backdrop-blur-sm border border-gray-600/50">
      <p>
        Press multiple neurons together to make them learn an association. Later,
        press any one of them to recall the whole group.
      </p>
    </div>
  );
};

export default Explanation;
