import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { getTeacherEmail } from '../services/api'

function Settings() {
  const [name, setName] = useState('Dipesh')
  const [email, setEmail] = useState(getTeacherEmail())
  const [schoolName, setSchoolName] = useState('Greenwood High School')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and school preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 max-w-lg space-y-5">
        {saved && (
          <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded-lg">
            Settings saved successfully.
          </div>
        )}

        <div>
          <label className="form-label">Teacher Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">School Name</label>
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>
    </DashboardLayout>
  )
}

export default Settings
