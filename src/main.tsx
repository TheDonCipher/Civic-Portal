import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';
import './lib/i18n'; // Import to initialize i18next configuration
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { DemoProvider } from './providers/DemoProvider';

// Import security utilities
import { generateCSPHeader } from './lib/security/enhancedSecurity';

// Import helper functions for development (available in browser console)
import './utils/adminHelpers';
import './utils/seedData';

// import { TempoDevtools } from 'tempo-devtools';
// TempoDevtools.init(); // Disabled - not using Tempo

// Configure Content Security Policy
const cspMeta = document.createElement('meta');
cspMeta.httpEquiv = 'Content-Security-Policy';
cspMeta.content = generateCSPHeader();
document.head.appendChild(cspMeta);

// Add additional security headers via meta tags
const xFrameOptions = document.createElement('meta');
xFrameOptions.httpEquiv = 'X-Frame-Options';
xFrameOptions.content = 'SAMEORIGIN';
document.head.appendChild(xFrameOptions);

const xContentTypeOptions = document.createElement('meta');
xContentTypeOptions.httpEquiv = 'X-Content-Type-Options';
xContentTypeOptions.content = 'nosniff';
document.head.appendChild(xContentTypeOptions);

const basename = import.meta.env.BASE_URL;
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        }
      >
        <BrowserRouter basename={basename}>
          <ThemeProvider defaultTheme="light">
            <AuthProvider>
              <DemoProvider>
                <App />
              </DemoProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </React.Suspense>
    </React.StrictMode>
  );
}
