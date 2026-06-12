import React, { useEffect, useRef } from 'react';
import type { MetricEvent } from '../types';

interface TrackerProps {
  onEvent: (event: MetricEvent) => void;
  currentQuestionNumber: number;
}

const Tracker: React.FC<TrackerProps> = ({ onEvent, currentQuestionNumber }) => {
  const focusLostCount = useRef<number>(0);

  const currentQuestionRef = useRef(currentQuestionNumber);
  useEffect(() => {
    currentQuestionRef.current = currentQuestionNumber;
  }, [currentQuestionNumber]);

  useEffect(() => {
    // 1. Metric: Tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        focusLostCount.current += 1;
        onEvent({
          eventType: 'tab-switch',
          details: `User left the examination tab on question ${currentQuestionRef.current}. Total switches recorded: ${focusLostCount.current}`,
          timestamp: new Date()
        });
      }
    };

    // 2. Metric: Text copying
    const handleCopy = () => {
      const selectedText = window.getSelection()?.toString() || "Unknown text fragment";
      onEvent({
        eventType: 'copy-paste',
        details: `User copied text fragment on question ${currentQuestionRef.current}: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`,
        timestamp: new Date()
      });
    };

    // 3. Metric: Context menu invocation
    const handleContextMenu = () => {
      const selectedText = window.getSelection()?.toString() || "";
      const hasSelection = selectedText.trim().length > 0;
      
      const details = hasSelection 
        ? `Context menu opened on question ${currentQuestionRef.current} with active text selection: "${selectedText.substring(0, 30)}"`
        : `Context menu opened on question ${currentQuestionRef.current} with no active selection`;

      onEvent({
        eventType: 'context-menu',
        details: `${hasSelection ? '[w-selection]' : '[no-selection]'} ${details}`,
        timestamp: new Date()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onEvent]);

  return null;
};

export default Tracker;