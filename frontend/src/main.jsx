/**
 * main.jsx — Application Entry Point
 * ────────────────────────────────────
 * This is the very first file that runs when the React app starts.
 * It mounts the entire React component tree into the actual HTML page.
 *
 * Vite serves index.html, which has a <div id="root"> placeholder.
 * This file finds that div and injects the React app into it.
 *
 * React.StrictMode:
 *   A development-only wrapper that:
 *   - Double-invokes renders and effects to catch side effects
 *   - Warns about deprecated APIs
 *   - Has ZERO effect in production builds
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Global CSS: custom properties (colors, fonts), base resets

// Find the <div id="root"> in index.html and mount the full React app into it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
