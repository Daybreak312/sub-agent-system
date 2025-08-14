// frontend/src/components/GlassCard.tsx
import React from 'react';
import styled from 'styled-components';
import { Squircle } from '@squircle-js/react';
import theme from '../styles/theme'; // theme 임포트

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StyledGlassCard = styled(Squircle)`
  background-color: ${props => props.theme.colors.glassBackground};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.glassBorder};
  box-shadow: ${props => props.theme.shadows.default};
  border-radius: ${props => props.theme.borderRadius.card}; 
  
  padding: ${props => props.theme.spacing.large};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
`;

const GlassCard: React.FC<GlassCardProps> = ({ children, className, style }) => {
  return (
    <StyledGlassCard
      cornerRadius={parseInt(theme.borderRadius.squircle)} 
      cornerSmoothing={1}
      className={className}
      style={style}
    >
      {children}
    </StyledGlassCard>
  );
};

export default GlassCard;
