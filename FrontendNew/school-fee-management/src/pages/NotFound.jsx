import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import Footer from '../components/Footer'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <FiAlertTriangle className="text-primary-600 text-4xl mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800">404 — Page Not Found</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          The page you are looking for does not exist.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
