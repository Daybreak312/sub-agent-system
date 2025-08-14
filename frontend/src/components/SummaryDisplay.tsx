// frontend/src/components/SummaryDisplay.tsx
import React from 'react';

interface SummaryDisplayProps {
  summary: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
      <h3>요약</h3>
      <p>{summary}</p>
    </div>
  );
};

export default SummaryDisplay;
