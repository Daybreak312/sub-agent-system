// frontend/src/App.tsx

import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';

import AnswerChat from './components/AnswerChat';

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

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
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch response.');
      console.error('Frontend API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}> 
      <GlobalStyles /> 
      <div style={{ padding: theme.spacing.large, fontFamily: theme.fonts.body }}> 
        <h1>Local Agent Weaver</h1>
        <p>Ask your agent system a question:</p>

        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Enter your prompt here..."
          rows={5}
          style={{
            width: '100%',
            padding: theme.spacing.small,
            marginBottom: theme.spacing.small,
            border: `1px solid ${theme.colors.cardBorder}`,
            borderRadius: theme.borderRadius.default,
            backgroundColor: theme.colors.cardBackground, 
            color: theme.colors.text, 
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: `${theme.spacing.small} ${theme.spacing.medium}`,
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.default,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Thinking...' : 'Ask Agent'}
        </button>

        {error && (
          <div style={{ color: theme.colors.error, marginTop: theme.spacing.large, border: `1px solid ${theme.colors.error}`, padding: theme.spacing.small, borderRadius: theme.borderRadius.default }}>
            Error: {error}
          </div>
        )}

        {response && (
          <AnswerChat response={response} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
