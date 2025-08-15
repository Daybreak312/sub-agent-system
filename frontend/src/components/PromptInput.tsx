import React, {useEffect, useRef} from 'react';
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
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    max-width: 1200px;
    z-index: 1000;
    display: flex;
    gap: 24px; /* 12px에서 24px로 증가 */
    align-items: flex-end;
    background: none;
`;

const InputContainer = styled(GlassCard)`
    flex: 1;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 18px;
    transition: all 0.3s ease;
    display: flex;
    align-items: flex-start;

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
    min-height: 40px;
    max-height: 150px;
    margin-bottom: 0.6rem;
    overflow-y: hidden;
    transition: all 0.2s ease;

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        if (!element) return;

        // 스크롤 높이를 측정하기 전에 높이를 자동으로 조절
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
        onPromptChange(event);
    };

    // 프롬프트가 비워질 때 높이 리셋
    useEffect(() => {
        if (!prompt && textareaRef.current) {
            textareaRef.current.style.height = '24px';
        }
    }, [prompt]);

    return (
        <FixedContainer>
            <InputContainer>
                <StyledTextArea
                    ref={textareaRef}
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
