import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { DemoProvider } from './providers/DemoProvider';

// Import helper functions for development (available in browser console)
import './utils/adminHelpers';
import './utils/seedData';

// import { TempoDevtools } from 'tempo-devtools';
// TempoDevtools.init(); // Disabled - not using Tempo

const basename = import.meta.env.BASE_URL;
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <DemoProvider>
              <App />
            </DemoProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
