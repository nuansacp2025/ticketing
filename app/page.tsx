"use client";

import { useState, useEffect } from "react";
type Customer = {
  id: string;
  email: string;
  ticketIds: string[];
};
export default function Home() {
const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch("/api/getAllCustomers"); // protected endpoint
      if (!res.ok) {
        setError("Unauthorized or failed to fetch");
        return;
      }
      const data = await res.json();
      setCustomers(data);
    }

    fetchCustomers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customer List</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="p-2 border rounded">
            <strong>{c.email}</strong> – {c.ticketIds.length} ticket(s)
          </li>
        ))}
      </ul>
    </div>
  );
}
