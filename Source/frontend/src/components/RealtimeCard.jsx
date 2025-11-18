export default function RealtimeCard({ title, value, unit, icon, color = "from-blue-400 to-blue-600" }) {
  return (
    <div className={`bg-gradient-to-br ${color} shadow-lg p-6 rounded-2xl flex items-center justify-between transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}>
      <div className="text-white">
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <h2 className="text-3xl font-bold">{value} {unit}</h2>
      </div>
      <div className="text-5xl opacity-80">{icon}</div>
    </div>
  );
}
