// frontend/src/App.tsx

import React from 'react';
import {ThemeProvider} from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import {ChatPage} from './pages/ChatPage';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles/>
            <ChatPage/>
        </ThemeProvider>
    );
}

export default App;