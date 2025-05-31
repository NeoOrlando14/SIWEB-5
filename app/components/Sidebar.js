export default function Sidebar() {
  return (
    <div className="bg-blue-600 text-white w-64 h-screen p-6 flex flex-col">
      <div className="text-2xl font-bold mb-10">
        🌐 Acme
      </div>
      <nav className="flex flex-col gap-4 text-white">
        <a href="#" className="bg-blue-700 p-2 rounded">🏠 Home</a>
        <a href="#">🧾 Invoices</a>
        <a href="#">👥 Customers</a>
      </nav>
      <div className="mt-auto">
        <button className="text-white bg-red-500 p-2 mt-10 rounded w-full">⚡ Sign Out</button>
      </div>
    </div>
  );
}
