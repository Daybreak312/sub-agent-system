import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import reactLogo from '../assets/react.svg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 24px;
  opacity: 0.8;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const Title = styled.h1<{ textLength: number }>`
  color: ${props => props.theme.colors.primary};
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}, 
    ${props => props.theme.colors.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  width: fit-content;

  &::before {
    content: '|';
    position: absolute;
    right: -0.2em;
    color: ${props => props.theme.colors.primary};
    -webkit-text-fill-color: ${props => props.theme.colors.primary};
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const AnimatedTitle: React.FC = () => {
  const fullText = 'Local Agent Weaver';
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (displayText.length === fullText.length) return;

    const timeoutId = setTimeout(() => {
      setDisplayText(fullText.slice(0, displayText.length + 1));
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [displayText]);

  return (
    <Title textLength={displayText.length}>
      {displayText || '\u00A0'}
    </Title>
  );
};

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
`;

export const EmptyState = () => {
  return (
    <Container>
      <Logo src={reactLogo} alt="Local Agent Weaver Logo" />
      <AnimatedTitle />
      <Subtitle>
        독립적인 다중 에이전트 플랫폼에 오신 것을 환영합니다.
        아래 입력창에 메시지를 입력하여 에이전트들과 대화를 시작해보세요.
      </Subtitle>
    </Container>
  );
};
