// frontend/src/App.tsx

import React, { useState } from 'react';
import './App.css'; // Assuming default Vite CSS

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<any>(null); // To store the JSON response
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null); // Clear previous response

    try {
      const res = await fetch('http://localhost:3000/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.message || 'Unknown error');
      }

      const data = await res.json();
      setResponse(data); // Store the full JSON response
    } catch (err: any) {
      setError(err.message || 'Failed to fetch response.');
      console.error('Frontend API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Local Agent Weaver</h1>
      <p>Ask your agent system a question:</p>

      <textarea
        value={prompt}
        onChange={handlePromptChange}
        placeholder="Enter your prompt here..."
        rows={5}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Thinking...' : 'Ask Agent'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '20px', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>Agent Response:</h2>
          {response.final_user_answer && (
            <div>
              <h3>Final Answer:</h3>
              <p>{response.final_user_answer}</p>
            </div>
          )}
          {response.agent_chain_log && response.agent_chain_log.length > 0 && (
            <div>
              <h3>Agent Chain Log:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#e9e9e9', padding: '10px', borderRadius: '4px' }}>
                {JSON.stringify(response.agent_chain_log, null, 2)}
              </pre>
            </div>
          )}
          {response.final_answer_summary && (
            <div>
              <h3>Summary:</h3>
              <p>{response.final_answer_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;