import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
