function StatsCard({ icon, label, value, accent = 'text-primary-600', bg = 'bg-primary-50' }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg} ${accent} text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default StatsCard
