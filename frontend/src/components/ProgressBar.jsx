import React, { useEffect, useState } from 'react';

const ProgressBar = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + Math.floor(Math.random() * 8) + 4; // Start fast
          if (prev < 60) return prev + Math.floor(Math.random() * 4) + 2; // Medium speed
          if (prev < 92) return prev + Math.floor(Math.random() * 2) + 1; // Slow down near the end
          return prev; // Stay at 92-95% until complete
        });
      }, 300);
    } else {
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  return (
    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
      <div
        className="h-full brand-gradient rounded-full transition-all duration-300 ease-out"
        style={{ width: `${isLoading ? progress : 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;
