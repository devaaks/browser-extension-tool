import React from 'react';
import { TranscriptItem, formatTime } from '../utils/youtube';

interface TranscriptViewProps {
  transcript: TranscriptItem[];
  onTimeClick?: (time: number) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript, onTimeClick }) => {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No transcript available for this video.</p>
      </div>
    );
  }

  return (
    <div className="max-h-64 hidden-scrollbar">
      <div className="space-y-2 selectable-text">
        {transcript.map((item, index) => (
          <div 
            key={index}
            className="flex gap-3 p-2 hover:bg-gray-50 rounded text-sm cursor-pointer"
            onClick={() => onTimeClick?.(item.start)}
          >
            <span className="text-blue-600 font-mono text-xs flex-shrink-0 min-w-[40px]">
              {formatTime(item.start)}
            </span>
            <span className="text-gray-700 leading-relaxed">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptView;
