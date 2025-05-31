import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Aug', revenue: 4000 },
  { name: 'Jul', revenue: 3800 },
  { name: 'Jan', revenue: 2000 },
  { name: 'Sep', revenue: 2800 },
  { name: 'Dec', revenue: 5000 },
  { name: 'Oct', revenue: 3000 },
  { name: 'Nov', revenue: 3100 },
  { name: 'Apr', revenue: 2600 },
  { name: 'Mar', revenue: 1800 },
  { name: 'Feb', revenue: 1700 },
  { name: 'May', revenue: 2500 },
  { name: 'Jun', revenue: 3400 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-full">
      <h2 className="text-lg font-semibold mb-4">Recent Revenue</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#60A5FA" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">📅 Last 12 months</p>
    </div>
  );
}
