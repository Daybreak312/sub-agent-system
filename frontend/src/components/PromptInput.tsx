import React from 'react';
import styled from 'styled-components';
import GlassCard from './GlassCard';

interface PromptInputProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const FixedContainer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  z-index: 1000;
  display: flex;
  gap: 24px; /* 12px에서 24px로 증가 */
  align-items: flex-end;
`;

const InputContainer = styled(GlassCard)`
  flex: 1;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 18px;
  transition: all 0.3s ease;
  min-height: 40px;
  display: flex;
  justify-content: center; /* align-items에서 변경 */

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  padding: 0;
  height: 24px;
  min-height: 24px;
  max-height: 150px;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  vertical-align: middle;

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SubmitButton = styled(GlassCard)`
  width: 60px; /* 42px * 1.5 = 63px */
  height: 60px; /* 42px * 1.5 = 63px */
  padding: 0;
  margin: 0 0 8px 0; 
  background: ${props => props.theme.colors.primary}44;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.primary}22;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.5rem; /* 화살표 크기도 키워줍니다 */

  &:hover {
    background: ${props => props.theme.colors.primary}66;
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.colors.disabled}44;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  loading,
  onPromptChange,
  onSubmit
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (prompt.trim() && !loading) {
        onSubmit();
      }
    }
  };

  const adjustTextAreaHeight = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const element = event.target;
    element.style.height = '24px'; // 리셋
    element.style.height = `${element.scrollHeight}px`;
    onPromptChange(event);
  };

  return (
    <FixedContainer>
      <InputContainer>
        <StyledTextArea
          placeholder="메시지를 입력하세요... (Enter로 전송, Shift + Enter로 줄바꿈)"
          value={prompt}
          onChange={adjustTextAreaHeight}
          onKeyPress={handleKeyPress}
          disabled={loading}
          rows={1}
        />
      </InputContainer>
      <SubmitButton
        as="button"
        onClick={onSubmit}
        disabled={loading || !prompt.trim()}
        aria-label="메시지 전송"
      >
        →
      </SubmitButton>
    </FixedContainer>
  );
};
