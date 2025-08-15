import React from 'react';
import styled, { keyframes } from 'styled-components';
import reactLogo from '../assets/react.svg';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  display: inline-flex;
  align-items: center;
`;

const SpinningLogo = styled.img`
  width: 24px;
  height: 24px;
  animation: ${rotate} 2s linear infinite;
`;

export const LoadingDots: React.FC = () => {
  return (
    <Container>
      <SpinningLogo src={reactLogo} alt="Loading..." />
    </Container>
  );
};
