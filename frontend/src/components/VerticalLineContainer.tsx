import styled from 'styled-components';

interface VerticalLineContainerProps {
  lineColor?: string;  // 세로선 색상을 커스터마이징할 수 있도록
  spacing?: string;    // 패딩값을 조절할 수 있도록
}

export const VerticalLineContainer = styled.div<VerticalLineContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: ${props => props.spacing || '16px'};
  border-left: 2px solid ${props =>
      props.lineColor ||
      `${props.theme.colors.primary}22`
  };
  margin: 8px 0;
`;
