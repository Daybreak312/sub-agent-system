import { css } from 'styled-components';

export const markdownStyles = css`
    /* 기본 텍스트 스타일 */
    font-size: 16px;
    line-height: 1.7;
    color: ${props => props.theme.colors.text};

    /* 모든 텍스트 요소에 기본 스타일 적용 */

    p, li, ul, ol, a, td, th, blockquote {
        font-size: 16px;
        line-height: 1.7;
    }

    /* 단락 스타일링 */

    p {
        margin: 0;

        & + p {
            margin-top: 1em;
        }
    }

    /* 제목 스타일링 */

    h1, h2, h3, h4, h5, h6 {
        color: ${props => props.theme.colors.primary};
        margin: 1.5em 0 0.7em 0;
        line-height: 1.4;

        &:first-child {
            margin-top: 0;
        }
    }

    h1 {
        font-size: 2em;
        font-weight: 600;
    }

    h2 {
        font-size: 1.75em;
        font-weight: 600;
    }

    h3 {
        font-size: 1.5em;
        font-weight: 600;
    }

    h4 {
        font-size: 1.25em;
        font-weight: 500;
    }

    h5, h6 {
        font-size: 1.1em;
        font-weight: 500;
    }

    /* 리스트 스타일링 */

    ul, ol {
        padding-left: 1.5em;
        margin: 0.7em 0;

        ul, ol {
            margin: 0.3em 0; /* 중첩된 리스트의 여백 조정 */
        }
    }

    li {
        margin: 0.3em 0;
    }

    /* 링크 스타일링 */

    a {
        color: ${props => props.theme.colors.primary};
        text-decoration: none;
        transition: all 0.2s ease;

        &:hover {
            text-decoration: underline;
            opacity: 0.8;
        }
    }

    /* 코드 스타일링 */

    code {
        font-family: 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
        background: ${props => props.theme.colors.glassBackground};
        color: ${props => props.theme.colors.text};
        padding: 0.2em 0.4em;
        border-radius: ${props => props.theme.borderRadius.squircle};
        font-size: 0.9em;
        border: 1px solid ${props => props.theme.colors.glassBorder};
    }

    pre {
        background: ${props => props.theme.colors.glassBackground};
        padding: 1.2em;
        border-radius: ${props => props.theme.borderRadius.squircle};
        overflow: hidden; /* 스크롤 숨기기 위해 수정 */
        margin: 1.5em 0;
        border: 1px solid ${props => props.theme.colors.glassBorder};
        backdrop-filter: blur(8px);
        position: relative;

        /* 가로 스크롤을 위한 내부 컨테이너 */

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border-radius: ${props => props.theme.borderRadius.squircle};
            box-shadow: inset 0 0 0 1px ${props => props.theme.colors.glassBorder};
        }

        /* 스크롤 가능한 내부 영역 */

        & > code {
            display: block;
            overflow-x: auto;
            background: none;
            padding: 0;
            border: none;
            font-size: 15px;
            line-height: 1.6;
            tab-size: 2;

            /* 선택 시 하이라이트 효과 */

            &::selection {
                background: ${props => props.theme.colors.primary}33;
            }
        }
    }

    /* p 태그 안의 인라인 코드 특별 스타일링 */

    p code {
        background: ${props => props.theme.colors.glassBackground};
        border: 1px solid ${props => props.theme.colors.glassBorder};
        white-space: nowrap;
    }

    /* 인용문 스타일링 */

    blockquote {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-left: 16px;
        margin: 1em 0;
        border-left: 2px solid ${props => props.theme.colors.primary}22;
        color: ${props => props.theme.colors.text};
        font-style: italic;

        /* 중첩된 인용문의 경우 스타일 차별화 */

        blockquote {
            border-left-color: ${props => props.theme.colors.secondary}22;
            margin: 0.5em 0;
        }

        /* 인용문 내부 마지막 요소의 마진 제거 */

        > *:last-child {
            margin-bottom: 0;
        }
    }

    /* 테이블 스타일링 */

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
    }

    th, td {
        border: 1px solid ${props => props.theme.colors.border};
        padding: 0.75em 1em;
    }

    th {
        background: ${props => props.theme.colors.background}66;
        font-weight: 500;
    }

    /* 이미지 스타일링 */

    img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 1em 0;
    }

    /* 구분선 스타일링 */

    hr {
        border: none;
        height: 1px;
        background: ${props => props.theme.colors.border};
        margin: 2em 0;
    }
`;
