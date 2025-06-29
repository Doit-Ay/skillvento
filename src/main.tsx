import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (!rootElement) {
  console.error('Root element not found');
} else {
  // Create root and render app
  const root = createRoot(rootElement);
  
  // Disable React.StrictMode in production to prevent double rendering
  const AppWithStrictMode = import.meta.env.DEV ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  );
  
  root.render(AppWithStrictMode);
}