export default function RealtimeCard({ title, value, unit, icon }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold">{value} {unit}</h2>
      </div>
      <div className="text-3xl text-blue-500">{icon}</div>
    </div>
  );
}
