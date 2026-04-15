"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleAuth = async (type: 'IN' | 'UP') => {
    const { error } = type === 'IN' 
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({ email, password: pass });
    if (error) alert(error.message);
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl w-full max-w-sm border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-center">Login to Jalsetu</h2>
        <input type="email" placeholder="Email" className="w-full p-4 rounded-xl border border-slate-200" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-4 rounded-xl border border-slate-200" onChange={e => setPass(e.target.value)} />
        <button onClick={() => handleAuth('IN')} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">Login</button>
        <button onClick={() => handleAuth('UP')} className="w-full text-slate-500 text-sm">Create account</button>
      </div>
    </div>
  );
}
