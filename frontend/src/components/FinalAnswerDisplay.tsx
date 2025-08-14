// frontend/src/components/FinalAnswerDisplay.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FinalAnswerDisplayProps {
  answer: string;
}

const FinalAnswerDisplay: React.FC<FinalAnswerDisplayProps> = ({ answer }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
      <h3>최종 답변</h3>
      <ReactMarkdown>{answer}</ReactMarkdown>
    </div>
  );
};

export default FinalAnswerDisplay;
