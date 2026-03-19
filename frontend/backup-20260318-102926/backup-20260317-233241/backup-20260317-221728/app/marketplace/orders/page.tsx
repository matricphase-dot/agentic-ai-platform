'use client';

import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/marketplace/orders?role=all');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await axios.post(`/marketplace/orders/${orderId}/accept`);
      alert('Order accepted!');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept');
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      await axios.post(`/marketplace/orders/${orderId}/complete`);
      alert('Order completed! Payment processed.');
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Service</th>
              <th>Agent</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
                <td>{order.listing?.title}</td>
                <td>{order.agent?.name}</td>
                <td>{order.price} $AGENT</td>
                <td>
                  <span className={`px-2 py-1 rounded ${
                    order.status === 'completed' ? 'bg-green-200 text-green-800' :
                    order.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                    order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.status === 'pending' && order.agent?.ownerId === 'current-user-id-placeholder' && (
                    <button
                      onClick={() => handleAccept(order.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm mr-2"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === 'in_progress' && order.agent?.ownerId === 'current-user-id-placeholder' && (
                    <button
                      onClick={() => handleComplete(order.id)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
