import { NavLink } from 'react-router-dom'
import { FileSpreadsheet, MapPin, Flame } from 'lucide-react'

const links = [
  { to: '/csv',        icon: FileSpreadsheet, label: 'CSV Processor' },
  { to: '/routes',     icon: MapPin,          label: 'Route Optimizer' },
  { to: '/hot-topics', icon: Flame,           label: 'Hot Topics' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Smart Toolkit</h1>
        <p className="text-xs text-gray-400 mt-1">3-in-1 React App</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}