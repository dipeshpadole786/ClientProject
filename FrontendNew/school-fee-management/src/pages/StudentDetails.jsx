import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi'
import DashboardLayout from '../layouts/DashboardLayout'
import Loading from '../components/Loading'
import { getStudentById, getPayments } from '../services/api'

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

function StudentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStudentById(id), getPayments()]).then(
      ([studentData, paymentData]) => {
        setStudent(studentData)
        setPayments(paymentData.filter((p) => p.studentId === Number(id)))
        setLoading(false)
      }
    )
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <Loading label="Loading student details..." />
      </DashboardLayout>
    )
  }

  if (!student) {
    return (
      <DashboardLayout>
        <p className="text-gray-500 text-sm">Student not found.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
        >
          <FiArrowLeft /> Back to Students
        </button>
        <button
          onClick={() => navigate(`/students/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <FiEdit2 size={14} /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {student.name}
          </h3>
          <DetailRow label="Roll Number" value={student.rollNumber} />
          <DetailRow label="Class" value={student.className} />
          <DetailRow label="Parent Name" value={student.parentName} />
          <DetailRow label="Phone Number" value={student.phone} />
          <DetailRow
            label="Total Fees"
            value={`₹${student.totalFees.toLocaleString()}`}
          />
          <DetailRow
            label="Amount Received"
            value={`₹${student.amountReceived.toLocaleString()}`}
          />
          <DetailRow
            label="Pending Amount"
            value={
              <span
                className={
                  student.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
                }
              >
                ₹{student.pendingAmount.toLocaleString()}
              </span>
            }
          />
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payment History
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No payments recorded for this student yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 px-3 font-medium">Amount</th>
                    <th className="py-2 px-3 font-medium">Transaction ID</th>
                    <th className="py-2 px-3 font-medium">Date</th>
                    <th className="py-2 px-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="py-2.5 px-3 text-green-600 font-medium">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">{p.transactionId}</td>
                      <td className="py-2.5 px-3">{p.paymentDate}</td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {p.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDetails
