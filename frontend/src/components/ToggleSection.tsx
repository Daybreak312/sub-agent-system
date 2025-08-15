import React, {useState, type ReactNode} from 'react';
import styled from 'styled-components';

interface ToggleSectionProps {
    label: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    leftPadding?: string;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ToggleButton = styled.button<{ isExpanded: boolean }>`
    background: none;
    border: none;
    color: ${props => props.theme.colors.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 0;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    text-align: left;

    /* 화살표와 텍스트 사이의 공간을 자동으로 설정 */

    &:hover {
        opacity: 0.8;
    }
`;

const Label = styled.span`
    margin: 0;
`;

const Arrow = styled.div<{ isExpanded: boolean }>`
    width: 6px;
    height: 6px;
    border-right: 2px solid ${props => props.theme.colors.primary};
    border-bottom: 2px solid ${props => props.theme.colors.primary};
    transform: rotate(${props => props.isExpanded ? '45deg' : '-45deg'});
    transition: transform 0.2s ease;
    margin-top: ${props => props.isExpanded ? '-2px' : '-1px'};
`;

const Content = styled.div<{ isExpanded: boolean; leftPadding: string }>`
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    max-height: ${props => props.isExpanded ? '2000px' : '0'};
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transition: all 0.3s ease-in-out;
    padding-left: ${props => props.leftPadding};
`;

export const ToggleSection: React.FC<ToggleSectionProps> = ({
                                                                label,
                                                                children,
                                                                defaultExpanded = false,
                                                                leftPadding = '20px'
                                                            }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <Container>
            <ToggleButton
                onClick={() => setIsExpanded(!isExpanded)}
                isExpanded={isExpanded}
            >
                <Label>{label}</Label>
                <Arrow isExpanded={isExpanded}/>
            </ToggleButton>

            <Content isExpanded={isExpanded} leftPadding={leftPadding}>
                {children}
            </Content>
        </Container>
    );
};
