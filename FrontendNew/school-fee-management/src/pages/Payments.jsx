import { useEffect, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import DashboardLayout from '../layouts/DashboardLayout'
import PaymentTable from '../components/PaymentTable'
import SearchBar from '../components/SearchBar'
import Loading from '../components/Loading'
import { getPayments, getStudents, addPayment } from '../services/api'

const emptyForm = {
  studentId: '',
  amount: '',
  transactionId: '',
  paymentDate: '',
  remarks: '',
}

function Payments() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([getPayments(), getStudents()]).then(([paymentData, studentData]) => {
      setPayments(paymentData)
      setStudents(studentData)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPayments = payments.filter((p) => {
    const query = search.toLowerCase()
    const matchesSearch =
      p.studentName.toLowerCase().includes(query) ||
      p.rollNumber.toLowerCase().includes(query) ||
      p.transactionId.toLowerCase().includes(query)
    const matchesDate = dateFilter ? p.paymentDate === dateFilter : true
    return matchesSearch && matchesDate
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await addPayment(form)
    setSaving(false)
    setShowModal(false)
    setForm(emptyForm)
    loadData()
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Payments</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and record fee payments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <FiPlus /> Add Payment
        </button>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, roll no. or transaction ID..."
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input sm:w-48"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Date
            </button>
          )}
        </div>

        {loading ? (
          <Loading label="Loading payments..." />
        ) : (
          <PaymentTable payments={filteredPayments} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Payment
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Student</label>
                <select
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNumber} — {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="form-label">Transaction ID</label>
                <input
                  name="transactionId"
                  value={form.transactionId}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  className="form-input"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Payments
