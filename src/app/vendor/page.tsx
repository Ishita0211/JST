"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';

export default function VendorPanel() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').eq('status', 'pending');
      if (data) setOrders(data);
    };
    fetchOrders();
    const channel = supabase.channel('realtime_orders').on('postgres_changes', 
      { event: 'INSERT', table: 'orders' }, (p) => setOrders(prev => [p.new, ...prev])).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const acceptOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'accepted' }).eq('id', id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">New Delivery Requests</h1>
      {orders.map(order => (
        <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between">
            <p className="text-xl font-bold">{order.quantity}L</p>
            <p className="text-cyan-600 font-bold text-lg">₹{order.total_price}</p>
          </div>
          <p className="text-sm text-slate-500">Floor {order.floor}</p>
          <button onClick={() => acceptOrder(order.id)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Check size={18} /> Accept
          </button>
        </div>
      ))}
    </main>
  );
}
