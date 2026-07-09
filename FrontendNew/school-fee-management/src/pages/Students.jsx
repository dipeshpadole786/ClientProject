import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import DashboardLayout from '../layouts/DashboardLayout'
import StudentTable from '../components/StudentTable'
import SearchBar from '../components/SearchBar'
import Loading from '../components/Loading'
import { getStudents, deleteStudent } from '../services/api'

function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadStudents = () => {
    setLoading(true)
    getStudents().then((data) => {
      setStudents(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this student? This action cannot be undone.'
    )
    if (!confirmed) return

    await deleteStudent(id)
    loadStudents()
  }

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query)
    )
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Students</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage student records and fee details
          </p>
        </div>
        <button
          onClick={() => navigate('/students/add')}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <FiPlus /> Add Student
        </button>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by roll number or name..."
          />
        </div>

        {loading ? (
          <Loading label="Loading students..." />
        ) : (
          <StudentTable students={filteredStudents} onDelete={handleDelete} />
        )}
      </div>
    </DashboardLayout>
  )
}

export default Students
