'use client';

import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import Link from 'next/link';

export default function MyFranchisesPage() {
  const [franchises, setFranchises] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [franchisesRes, salesRes] = await Promise.all([
        axios.get('/franchise/my-franchises'),
        axios.get('/franchise/my-sales'),
      ]);
      setFranchises(franchisesRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Franchises</h1>

      <h2 className="text-2xl font-semibold mb-4">Purchased</h2>
      {franchises.length === 0 ? (
        <p>You haven't purchased any franchises yet.</p>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr>
              <th>Blueprint</th>
              <th>Purchase Price</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Royalties Paid</th>
            </tr>
          </thead>
          <tbody>
            {franchises.map((f: any) => (
              <tr key={f.id}>
                <td>{f.blueprint?.name}</td>
                <td>{f.purchasePrice} $AGENT</td>
                <td>{f.agent?.name}</td>
                <td>{f.status}</td>
                <td>{f.totalRoyaltyPaid} $AGENT</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-2xl font-semibold mb-4">Sold (from my blueprints)</h2>
      {sales.length === 0 ? (
        <p>No one has purchased your blueprints yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Blueprint</th>
              <th>Buyer</th>
              <th>Purchase Price</th>
              <th>Royalties Earned</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((f: any) => (
              <tr key={f.id}>
                <td>{f.blueprint?.name}</td>
                <td>{f.owner?.name}</td>
                <td>{f.purchasePrice} $AGENT</td>
                <td>{f.totalRoyaltyPaid} $AGENT</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
