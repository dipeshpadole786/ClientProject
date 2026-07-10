import { useLocation, useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi'
import Footer from '../components/Footer'
import { isAuthenticated } from '../services/api'

function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const authenticated = isAuthenticated()
  const goToDefault = authenticated ? '/dashboard' : '/login'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-2xl overflow-hidden">
          <div className="px-6 sm:px-10 py-10 sm:py-14 text-center relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-100 blur-3xl opacity-80" />
              <div className="absolute -bottom-16 -left-8 w-44 h-44 rounded-full bg-amber-100 blur-3xl opacity-70" />
            </div>

            <div className="relative">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center shadow-sm">
                <FiAlertTriangle className="text-red-500 text-3xl" />
              </div>

              <p className="mt-6 text-sm font-semibold tracking-[0.22em] text-primary-600 uppercase">
                Error 404
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                Page not found
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
                The location you opened does not exist or was moved. Check the URL and try again.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                <FiSearch className="text-primary-600" />
                <span className="font-medium">Requested path:</span>
                <code className="font-mono text-xs sm:text-sm text-gray-800 break-all">
                  {location.pathname}
                </code>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate(goToDefault, { replace: true })}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FiHome />
                  Go to {authenticated ? 'Dashboard' : 'Login'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <FiArrowLeft />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
