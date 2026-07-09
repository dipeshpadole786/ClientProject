import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function StudentTable({ students, onDelete }) {
  const navigate = useNavigate()

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No students found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-3 px-4 font-medium">Roll No.</th>
            <th className="py-3 px-4 font-medium">Name</th>
            <th className="py-3 px-4 font-medium">Class</th>
            <th className="py-3 px-4 font-medium">Parent</th>
            <th className="py-3 px-4 font-medium">Phone</th>
            <th className="py-3 px-4 font-medium">Total Fees</th>
            <th className="py-3 px-4 font-medium">Pending</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4 font-medium text-gray-700">
                {student.rollNumber}
              </td>
              <td className="py-3 px-4">{student.name}</td>
              <td className="py-3 px-4">{student.className}</td>
              <td className="py-3 px-4">{student.parentName}</td>
              <td className="py-3 px-4">{student.phone}</td>
              <td className="py-3 px-4">₹{student.totalFees.toLocaleString()}</td>
              <td className="py-3 px-4">
                <span
                  className={
                    student.pendingAmount > 0
                      ? 'text-red-600 font-medium'
                      : 'text-green-600 font-medium'
                  }
                >
                  ₹{student.pendingAmount.toLocaleString()}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600"
                    title="View Details"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/students/${student.id}/edit`)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(student.id)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentTable
