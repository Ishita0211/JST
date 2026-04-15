"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateTotal, PRICING } from '@/lib/constants';
import { Droplets, Navigation, CheckCircle2 } from 'lucide-react';

export default function JalsetuApp() {
  const [qty, setQty] = useState(20);
  const [floor, setFloor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'accepted'>('idle');

  const total = calculateTotal(qty, floor);

  useEffect(() => {
    if (!orderId) return;
    const channel = supabase.channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', table: 'orders', filter: `id=eq.${orderId}` }, 
      (payload) => {
        if (payload.new.status === 'accepted') setStatus('accepted');
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const handleOrder = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = '/login';

    const { data, error } = await supabase.from('orders').insert([{
      customer_id: user.id, quantity: qty, floor: floor, total_price: total
    }]).select().single();

    if (!error) { setOrderId(data.id); setStatus('searching'); }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto min-h-screen p-6">
      <header className="py-8"><h1 className="text-2xl font-bold">jalsetu<span className="text-cyan-600">.</span></h1></header>

      {status === 'searching' ? (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-4">
          <div className="animate-bounce bg-cyan-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto"><Droplets className="text-cyan-600" /></div>
          <h2 className="font-bold">Searching for Vendor...</h2>
        </div>
      ) : status === 'accepted' ? (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-4">
          <CheckCircle2 size={48} className="text-green-500 mx-auto" />
          <h2 className="font-bold">Order Confirmed!</h2>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Volume</h3>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 40].map(v => (
                <button key={v} onClick={() => setQty(v)} className={`p-4 rounded-2xl border-2 transition-all ${qty === v ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-white bg-white text-slate-500'}`}>
                  <p className="font-bold text-lg">{v}L</p><p className="text-[10px]">₹{PRICING[v as keyof typeof PRICING]}</p>
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Floor</h3>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100">
              {[0, 1, 2, 3, 4].map(f => (
                <button key={f} onClick={() => setFloor(f)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${floor === f ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
                  {f === 0 ? 'G' : f}
                </button>
              ))}
            </div>
          </section>
          <button onClick={handleOrder} disabled={loading} className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-cyan-100 flex items-center justify-center gap-2">
            <Navigation size={18} /> Order Now • ₹{total}
          </button>
        </div>
      )}
    </main>
  );
}
