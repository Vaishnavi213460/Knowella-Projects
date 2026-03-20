import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import CSVProcessor from './modules/csv-processor/CSVProcessor'
import RouteOptimizer from './modules/route-optimizer/RouteOptimizer'
import HotTopics from './modules/hot-topics/HotTopics'

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/csv" replace />} />
          <Route path="/csv" element={<CSVProcessor />} />
          <Route path="/routes" element={<RouteOptimizer />} />
          <Route path="/hot-topics" element={<HotTopics />} />
        </Routes>
      </main>
    </div>
  )
}