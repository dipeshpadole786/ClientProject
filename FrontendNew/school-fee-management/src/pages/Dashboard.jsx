import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import DashboardLayout from '../layouts/DashboardLayout'
import StatsCard from '../components/StatsCard'
import Loading from '../components/Loading'
import { getDashboardStats } from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of student fees and collections
        </p>
      </div>

      {loading ? (
        <Loading label="Loading dashboard stats..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<FiUsers />}
            label="Total Students"
            value={stats.totalStudents}
            accent="text-primary-600"
            bg="bg-primary-50"
          />
          <StatsCard
            icon={<FiDollarSign />}
            label="Total Fees"
            value={`₹${stats.totalFees.toLocaleString()}`}
            accent="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatsCard
            icon={<FiCheckCircle />}
            label="Amount Received"
            value={`₹${stats.totalReceived.toLocaleString()}`}
            accent="text-green-600"
            bg="bg-green-50"
          />
          <StatsCard
            icon={<FiAlertCircle />}
            label="Pending Amount"
            value={`₹${stats.totalPending.toLocaleString()}`}
            accent="text-red-600"
            bg="bg-red-50"
          />
        </div>
      )}
    </DashboardLayout>
  )
}

export default Dashboard
