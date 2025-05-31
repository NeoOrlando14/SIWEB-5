const invoices = [
  { name: "Delba de Oliveira", email: "delba@oliveira.com", amount: "$8,000.00" },
  { name: "Neo", email: "orlandoneo@orban.com", amount: "$800.00" },
  { name: "Neo", email: "orlandoneo@orban.com", amount: "$80.00" },
  { name: "Neo", email: "orlandoneo@orban.com", amount: "$345.77" },
  { name: "Lee Robinson", email: "lee@robinson.com", amount: "$542.46" },
  { name: "Evil Rabbit", email: "evil@rabbit.com", amount: "$6.66" },
  { name: "Amy Burns", email: "amy@burns.com", amount: "$12.50" },
  { name: "Michael Novotny", email: "michael@novotny.com", amount: "$325.45" },
];

export default function LatestInvoices() {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-full">
      <h2 className="text-lg font-semibold mb-4">Latest Invoices</h2>
      <ul className="divide-y divide-gray-200">
        {invoices.map((invoice, idx) => (
          <li key={idx} className="py-2 flex justify-between">
            <div>
              <p className="font-semibold">{invoice.name}</p>
              <p className="text-sm text-gray-500">{invoice.email}</p>
            </div>
            <p className="font-medium">{invoice.amount}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
