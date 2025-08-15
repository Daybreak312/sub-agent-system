import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      rootBackground: string;
      text: string;
      textSecondary: string;
      primaryHover: string;
      border: string;
      glassBackground: string;
      glassBorder: string;
      glassShadow: string;
      cardBackground: string;
      cardBorder: string;
      logEntryBackground: string;
      logEntryBorder: string;
      error: string;
      disabled: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
    borderRadius: {
      default: string;
      card: string;
      squircle: string;
    };
    fonts: {
      body: string;
    };
    shadows: {
      default: string;
    };
  }
}
