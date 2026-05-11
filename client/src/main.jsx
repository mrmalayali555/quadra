import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import axios from 'axios'

// Configure axios with timeout
axios.defaults.timeout = 5000

// Apply saved theme before first paint to avoid flash
const saved = localStorage.getItem('theme') ?? 'dark'
document.documentElement.classList.add(saved)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
