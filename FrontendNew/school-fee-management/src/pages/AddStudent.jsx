import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { addStudent } from '../services/api'

const initialForm = {
  rollNumber: '',
  name: '',
  className: '',
  parentName: '',
  phone: '',
  totalFees: '',
  amountReceived: '',
  transactionId: '',
  paymentDate: '',
  remarks: '',
}

function AddStudent() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const pendingAmount =
    Number(form.totalFees || 0) - Number(form.amountReceived || 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    await addStudent({
      ...form,
      totalFees: Number(form.totalFees),
      amountReceived: Number(form.amountReceived),
    })

    setSaving(false)
    navigate('/students')
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Student</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to register a new student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 max-w-3xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Roll Number</label>
            <input
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Student Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Class</label>
            <input
              name="className"
              value={form.className}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. 10th A"
              required
            />
          </div>
          <div>
            <label className="form-label">Parent Name</label>
            <input
              name="parentName"
              value={form.parentName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Total Fees (₹)</label>
            <input
              type="number"
              name="totalFees"
              value={form.totalFees}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>
          <div>
            <label className="form-label">Amount Received (₹)</label>
            <input
              type="number"
              name="amountReceived"
              value={form.amountReceived}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>
          <div>
            <label className="form-label">Pending Amount (₹)</label>
            <input
              value={isNaN(pendingAmount) ? 0 : pendingAmount}
              readOnly
              className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="form-label">Transaction ID</label>
            <input
              name="transactionId"
              value={form.transactionId}
              onChange={handleChange}
              className="form-input"
              placeholder="Optional"
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
            />
          </div>
        </div>

        <div>
          <label className="form-label">Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            className="form-input"
            rows="3"
            placeholder="Optional notes"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Student'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}

export default AddStudent
