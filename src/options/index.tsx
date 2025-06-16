import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from './Options';
import '../styles/globals.css';

const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}