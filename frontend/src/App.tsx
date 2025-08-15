// frontend/src/App.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import styled from 'styled-components';

import AnswerChat from './components/AnswerChat';
import { PromptInput } from './components/PromptInput';
import { UserMessage } from './components/UserMessage';

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  padding-bottom: 120px; /* 하단 입력창을 위한 여백 */
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const ChatHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 8px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.1);
  margin: 16px 0;
`;

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'agent';
    content: any;
    timestamp: Date;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    // 사용자 메시지 즉시 추가
    const userMessage = {
      type: 'user' as const,
      content: prompt.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt(''); // 입력창 초기화

    try {
      const response = await fetch('http://localhost:3000/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('서버 요청에 실패했습니다.');
      }

      const data = await response.json();
      setResponse(data);

      // 에이전트 응답 추가
      const agentMessage = {
        type: 'agent' as const,
        content: data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ChatContainer>
        <ChatHeader>
          <h1>Local Agent Weaver</h1>
          <p>Ask your agent system a question:</p>
        </ChatHeader>

        <MessagesContainer>
          {messages.map((message, index) => (
            <div key={index}>
              {message.type === 'user' ? (
                <UserMessage
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ) : (
                <AnswerChat response={message.content} />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      </ChatContainer>

      <PromptInput
        prompt={prompt}
        loading={loading}
        onPromptChange={handlePromptChange}
        onSubmit={handleSubmit}
      />
    </ThemeProvider>
  );
}

export default App;