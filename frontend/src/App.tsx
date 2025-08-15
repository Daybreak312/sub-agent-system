// frontend/src/App.tsx

import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import { PromptInput } from './components/PromptInput';
import { ChatContainer } from './components/ChatContainer';

interface Message {
  type: 'user' | 'agent';
  content: any;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);

    // 사용자 메시지 즉시 추가
    const userMessage: Message = {
      type: 'user',
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

      // 에이전트 응답 추가
      const agentMessage: Message = {
        type: 'agent',
        content: data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error:', error);
      // 에러 메시지를 에이전트 메시지로 추가
      const errorMessage: Message = {
        type: 'agent',
        content: { error: '요청 처리 중 오류가 발생했습니다.' },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ChatContainer messages={messages} />
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