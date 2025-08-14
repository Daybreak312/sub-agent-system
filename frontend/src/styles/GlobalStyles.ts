// frontend/src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    :root {
        font-family: ${props => props.theme.fonts.body};
        line-height: 1.7; /* 170% */
        font-weight: 400;

        color-scheme: dark;
        color: ${props => props.theme.colors.text};
        background-color: ${props => props.theme.colors.rootBackground};

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    body {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        min-width: 320px;
        min-height: 100vh;
        background-color: ${props => props.theme.colors.background};
        color: ${props => props.theme.colors.text};
    }

    p {
        font-size: 17px;
        line-height: 1.7;
    }

    a {
        font-weight: 500;
        color: ${props => props.theme.colors.primary};
        text-decoration: inherit;
    }

    a:hover {
        color: ${props => props.theme.colors.primaryHover};
    }

    h1 {
        font-size: 3.2em;
    }

    h2 {
        font-size: 2.5em;
    }

    h3 {
        font-size: 1.8em;
    }

    h1, h2, h3 {
        line-height: 1; /* 제목의 줄 간격은 본문보다 좁게 */
        padding-top: 1.5em; /* 폰트 사이즈의 1.5배 */
        padding-bottom: 0.5em; /* 하단 여백 */
    }

    button {
        border-radius: ${props => props.theme.borderRadius.default};
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: ${props => props.theme.colors.background};
        cursor: pointer;
        transition: border-color 0.25s;
        color: ${props => props.theme.colors.text};
    }

    button:hover {
        border-color: ${props => props.theme.colors.primary};
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }

    /* GlassCard 기본 스타일은 GlassCard.tsx에서 styled-component로 정의 */
    /* 기존 index.css의 .glass-effect는 제거 */

    /* 라이트 모드 관련 스타일 제거 */
    @media (prefers-color-scheme: light) {
        /* 이 부분은 theme.ts에서 다크 모드 기본값을 설정했으므로 필요시 별도 라이트 모드 테마를 정의 */
    }
`;

export default GlobalStyles;