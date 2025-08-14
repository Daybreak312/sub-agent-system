// frontend/src/styles/theme.ts

const theme = {
    colors: {
        background: '#1a1a1a', // 바디 배경색
        rootBackground: '#242424', // 루트 요소 배경색
        text: 'rgba(255, 255, 255, 0.87)', // 기본 텍스트 색상
        primary: '#007bff', // 버튼 등 주요 요소 색상
        primaryHover: '#0056b3',
        border: 'rgba(255, 255, 255, 0.1)', // 유리 효과 테두리
        glassBackground: 'rgba(255, 255, 255, 0.05)', // 유리 효과 배경
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassShadow: 'rgba(0, 0, 0, 0.2)',
        cardBackground: '#2a2a2a', // 카드 및 입력 필드 배경색 (어둡게 조정)
        cardBorder: '#444444', // 카드 테두리 (어둡게 조정)
        logEntryBackground: '#3a3a3a', // 로그 항목 배경 (어둡게 조정)
        logEntryBorder: '#555555', // 로그 항목 테두리 (어둡게 조정)
        error: '#ff6b6b', // 오류 메시지 색상
    },
    fonts: {
        body: 'Arial, sans-serif',
    },
    spacing: {
        small: '16px',   // 8px -> 16px (2배)
        medium: '30px',  // 15px -> 30px (2배)
        large: '40px',   // 20px -> 40px (2배)
        xl: '6rem',      // 2rem -> 6rem (3배)
    },
    borderRadius: {
        default: '4px',
        card: '15px',
        squircle: '20px',
    },
    shadows: {
        default: '0 4px 30px rgba(0, 0, 0, 0.2)',
    },
};

export default theme;

export type Theme = typeof theme;