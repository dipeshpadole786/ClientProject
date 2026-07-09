import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { logout, getTeacherEmail } from '../services/api'

function Navbar({ onMenuClick }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-primary-600"
          aria-label="Toggle menu"
        >
          <FiMenu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          School Fee Management
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
          <FiUser className="text-primary-600" />
          <span>{getTeacherEmail()}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
