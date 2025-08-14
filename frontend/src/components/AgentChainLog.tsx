// frontend/src/components/AgentChainLog.tsx
import React, { useState } from 'react';
import AgentLogEntry from './AgentLogEntry'; // Import the sub-component

interface AgentChainLogProps {
  log: any[]; // AgentChainLogEntry[]
  reasoning: string; // overall_reasoning
}

const AgentChainLog: React.FC<AgentChainLogProps> = ({ log, reasoning }) => {
  const [showLog, setShowLog] = useState<boolean>(false);

  return (
    <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
      <h3 
        onClick={() => setShowLog(prev => !prev)} 
        style={{ cursor: 'pointer', color: '#007bff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>에이전트 체인 로그</span>
        <span>{showLog ? '▲' : '▼'}</span>
      </h3>
      {showLog && (
        <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '5px' }}>
          <p><strong>계획 설명: </strong>{reasoning}</p>
          {log.map((entry: any, index: number) => (
            <AgentLogEntry key={index} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentChainLog;
