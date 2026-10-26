import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Upload from './pages/Upload'
import DataOverview from './pages/DataOverview'
import Segmentation from './pages/Segmentation'
import Insights from './pages/Insights'
import Dashboard from './pages/Dashboard'
import Feedback from './pages/Feedback'
import About from './pages/About'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/upload"      element={<Upload />} />
        <Route path="/overview"    element={<DataOverview />} />
        <Route path="/segmentation" element={<Segmentation />} />
        <Route path="/insights"    element={<Insights />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/feedback"    element={<Feedback />} />
        <Route path="/about"       element={<About />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
