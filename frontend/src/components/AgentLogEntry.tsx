// frontend/src/components/AgentLogEntry.tsx
import React from 'react';

interface AgentLogEntryProps {
  entry: {
    agent_name: string;
    reasoning: string;
    summation: string;
  };
  index: number;
}

const AgentLogEntry: React.FC<AgentLogEntryProps> = ({ entry, index }) => {
  return (
    <div style={{ marginBottom: '10px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
      <p><strong>{index + 1}. {entry.agent_name}</strong></p>
      <p style={{ fontSize: '0.9em', color: '#555' }}><strong>설명: </strong>{entry.reasoning}</p>
      <p style={{ fontSize: '0.9em', color: '#555' }}><strong>요약: </strong>{entry.summation}</p>
    </div>
  );
};

export default AgentLogEntry;
