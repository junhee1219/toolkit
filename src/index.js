import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
        <App />
);

