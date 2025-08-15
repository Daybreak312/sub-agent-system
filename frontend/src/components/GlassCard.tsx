// frontend/src/components/GlassCard.tsx
import React, {type ReactNode} from 'react';
import styled from 'styled-components';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

const Container = styled.div`
    background: ${props => props.theme.colors.glassBackground};
    border: 1px solid ${props => props.theme.colors.glassBorder};
    border-radius: ${props => props.theme.borderRadius.squircle};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: ${props => props.theme.colors.primary}22;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }
`;

export const GlassCard: React.FC<GlassCardProps> = ({children, className}) => {
    return (
        <Container className={className}>
            {children}
        </Container>
    );
};

export default GlassCard;
