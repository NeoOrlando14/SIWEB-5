export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        {icon} {title}
      </div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  );
}
